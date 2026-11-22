// Spec 0015 · El asistente del portafolio: recibe la conversación, aplica los candados y
// transmite la respuesta de Claude por eventos (SSE). La llave vive solo aquí.
import Anthropic from '@anthropic-ai/sdk';
import { getStore } from '@netlify/blobs';
import type { Config, Context } from '@netlify/functions';
import { randomUUID } from 'node:crypto';
import { LIMITES, firmar, huella, origenPermitido, validar } from '../../lib/candados.ts';
import { conocimiento } from '../../lib/conocimiento.ts';
import { FUERA_DE_TEMA, MODELO, REGLAS } from '../../lib/reglas.ts';
import { API_ANTHROPIC, VARIABLE_LLAVE } from '../../lib/llave.ts';

const json = (datos: unknown, estado: number, cabeceras: Record<string, string>) =>
  new Response(JSON.stringify(datos), { status: estado, headers: { ...cabeceras, 'content-type': 'application/json; charset=utf-8' } });

export default async (req: Request, context: Context) => {
  const origen = req.headers.get('origin');
  const desarrollo = Netlify.env.get('ASISTENTE_DESARROLLO') === '1';
  const permitido = origenPermitido(origen, desarrollo);
  const cabeceras: Record<string, string> = {
    'access-control-allow-origin': permitido ? origen! : 'https://edreirbs.github.io',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '7200',
    vary: 'Origin',
    'cache-control': 'no-store',
  };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cabeceras });
  // FR-0015-17
  if (!permitido) return json({ error: 'origen' }, 403, cabeceras);
  if (req.method !== 'POST') return json({ error: 'metodo' }, 405, cabeceras);

  // FR-0015-18: una variable propia, no la ANTHROPIC_API_KEY que Netlify comparte entre sitios,
  // para que el gasto caiga en el espacio de trabajo con límite de USD 1.
  const clave = Netlify.env.get(VARIABLE_LLAVE);
  if (!clave) return json({ error: 'sin-llave' }, 503, cabeceras);

  // El navegador manda text/plain para evitar la petición previa de CORS; el cuerpo es JSON.
  let cuerpo: unknown;
  try {
    const texto = await req.text();
    if (texto.length > 64_000) return json({ error: 'formato' }, 413, cabeceras);
    cuerpo = JSON.parse(texto);
  } catch {
    return json({ error: 'formato' }, 400, cabeceras);
  }
  const v = validar(cuerpo, clave);
  if (!v.ok) return json({ error: v.codigo }, 400, cabeceras);

  // FR-0015-16 y 19: cuotas del día con una clave nueva por pregunta (sin leer y reescribir
  // contadores) y una huella que no guarda la IP.
  const dia = new Date().toISOString().slice(0, 10);
  const yo = huella(context.ip ?? 'sin-ip', dia, clave);
  const cuotas = getStore({ name: 'asistente-cuotas', consistency: 'strong' });
  try {
    const { blobs } = await cuotas.list({ prefix: `${dia}/` });
    if (blobs.length >= LIMITES.porDiaTotal) return json({ error: 'limite-dia' }, 429, cabeceras);
    if (blobs.filter((b) => b.key.startsWith(`${dia}/${yo}/`)).length >= LIMITES.porDiaVisitante) {
      return json({ error: 'limite-visitante' }, 429, cabeceras);
    }
    await cuotas.set(`${dia}/${yo}/${randomUUID()}`, '1');
  } catch (e) {
    console.error('cuotas', (e as Error).name);
    return json({ error: 'servicio' }, 503, cabeceras);
  }

  let saber: string;
  try {
    saber = await conocimiento();
  } catch (e) {
    console.error('conocimiento', (e as Error).message);
    return json({ error: 'servicio' }, 503, cabeceras);
  }

  // La dirección va explícita: así una ANTHROPIC_BASE_URL heredada no desvía las llamadas.
  const cliente = new Anthropic({ apiKey: clave, baseURL: API_ANTHROPIC, maxRetries: 1 });
  const codificador = new TextEncoder();
  const evento = (nombre: string, datos: unknown) => codificador.encode(`event: ${nombre}\ndata: ${JSON.stringify(datos)}\n\n`);

  const cuerpoSSE = new ReadableStream<Uint8Array>({
    async start(control) {
      // FR-0015-13: sin herramientas. Las reglas y el conocimiento van en caché.
      const flujo = cliente.messages.stream({
        model: MODELO,
        max_tokens: 1024,
        output_config: { effort: 'low' },
        system: [
          { type: 'text', text: REGLAS },
          { type: 'text', text: `<conocimiento>\n${saber}\n</conocimiento>`, cache_control: { type: 'ephemeral' } },
        ],
        messages: v.mensajes,
      });
      req.signal.addEventListener('abort', () => flujo.abort());
      let texto = '';
      try {
        for await (const ev of flujo) {
          if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') {
            texto += ev.delta.text;
            control.enqueue(evento('t', { t: ev.delta.text }));
          }
        }
        const final = await flujo.finalMessage();
        // El filtro de seguridad del modelo cuenta como fuera de tema (FR-0015-11).
        if (final.stop_reason === 'refusal' || !texto.trim()) {
          texto = FUERA_DE_TEMA;
          control.enqueue(evento('reemplazo', { t: texto }));
        }
        texto = texto.slice(0, LIMITES.caracteresRespuesta);
        control.enqueue(evento('fin', { firma: firmar(texto, clave), corte: final.stop_reason === 'max_tokens' }));
      } catch (e) {
        if (!req.signal.aborted) {
          const codigo =
            e instanceof Anthropic.RateLimitError ? 'saturado' : e instanceof Anthropic.APIError ? 'servicio' : 'red';
          console.error('anthropic', codigo, e instanceof Anthropic.APIError ? e.status : '');
          control.enqueue(evento('error', { codigo }));
        }
      } finally {
        control.close();
      }
    },
  });

  return new Response(cuerpoSSE, {
    headers: { ...cabeceras, 'content-type': 'text/event-stream; charset=utf-8', 'x-accel-buffering': 'no' },
  });
};

export const config: Config = {
  path: '/api/asistente',
  // FR-0015-16: seis preguntas por minuto por visitante.
  rateLimit: { windowLimit: 6, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};

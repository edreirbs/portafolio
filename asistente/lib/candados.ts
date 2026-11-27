// Spec 0015 · Candados del servidor: qué se acepta, de dónde y cuántas veces.
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const LIMITES = {
  /** FR-0015-16 */
  caracteres: 500,
  turnos: 12,
  porDiaVisitante: 15,
  porDiaTotal: 40,
  /** Una respuesta firmada nunca pasa de esto (≈ 120 palabras más las ligas). */
  caracteresRespuesta: 4000,
} as const;

/** FR-0015-17: el sitio publicado. El dominio propio queda listo para la spec 0011. */
export const ORIGENES = ['https://portafolio.edreirobles.com', 'https://edreirbs.github.io', 'https://edreirobles.com', 'https://www.edreirobles.com'];

export type Rol = 'usuario' | 'asistente';
export interface Mensaje {
  rol: Rol;
  texto: string;
  firma?: string;
}

export type Validacion =
  | { ok: true; mensajes: { role: 'user' | 'assistant'; content: string }[] }
  | { ok: false; codigo: 'formato' | 'largo' | 'turnos' | 'firma' };

/** FR-0015-14: cada respuesta del asistente va firmada; un historial alterado se rechaza. */
export function firmar(texto: string, clave: string): string {
  const llave = createHash('sha256').update(`firma-asistente:${clave}`).digest();
  return createHmac('sha256', llave).update(texto).digest('base64url');
}

function firmaValida(texto: string, firma: string | undefined, clave: string): boolean {
  if (!firma) return false;
  const esperada = Buffer.from(firmar(texto, clave));
  const recibida = Buffer.from(firma);
  return esperada.length === recibida.length && timingSafeEqual(esperada, recibida);
}

/** Valida el cuerpo que manda el navegador y lo convierte al formato de la API. */
export function validar(cuerpo: unknown, clave: string): Validacion {
  if (!cuerpo || typeof cuerpo !== 'object' || !Array.isArray((cuerpo as { mensajes?: unknown }).mensajes)) {
    return { ok: false, codigo: 'formato' };
  }
  const lista = (cuerpo as { mensajes: unknown[] }).mensajes;
  if (lista.length === 0 || lista.length % 2 === 0) return { ok: false, codigo: 'formato' };
  if ((lista.length + 1) / 2 > LIMITES.turnos) return { ok: false, codigo: 'turnos' };
  const mensajes: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const [i, m] of lista.entries()) {
    if (!m || typeof m !== 'object') return { ok: false, codigo: 'formato' };
    const { rol, texto, firma } = m as Partial<Mensaje>;
    const esperado: Rol = i % 2 === 0 ? 'usuario' : 'asistente';
    if (rol !== esperado || typeof texto !== 'string') return { ok: false, codigo: 'formato' };
    const limpio = texto.trim();
    if (!limpio) return { ok: false, codigo: 'formato' };
    if (rol === 'usuario') {
      if (limpio.length > LIMITES.caracteres) return { ok: false, codigo: 'largo' };
    } else {
      if (texto.length > LIMITES.caracteresRespuesta) return { ok: false, codigo: 'formato' };
      if (!firmaValida(texto, typeof firma === 'string' ? firma : undefined, clave)) return { ok: false, codigo: 'firma' };
    }
    mensajes.push({ role: rol === 'usuario' ? 'user' : 'assistant', content: rol === 'usuario' ? limpio : texto });
  }
  return { ok: true, mensajes };
}

/**
 * FR-0015-19: huella anónima del visitante para las cuotas del día. Cambia cada día y
 * depende de la llave, así que no se puede cruzar con nada ni volver a la IP.
 */
export function huella(ip: string, dia: string, clave: string): string {
  return createHash('sha256').update(`${dia}:${ip}:${clave}`).digest('hex').slice(0, 32);
}

export function origenPermitido(origen: string | null, desarrollo: boolean): boolean {
  if (!origen) return false;
  if (ORIGENES.includes(origen)) return true;
  return desarrollo && /^http:\/\/localhost:\d+$/.test(origen);
}

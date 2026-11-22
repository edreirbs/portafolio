// Spec 0015 · FR-0015-10: el sitio pregunta si el asistente está listo antes de mostrar el botón.
// No llama a Claude ni cuenta cuotas; solo dice si hay llave configurada.
import type { Config } from '@netlify/functions';
import { origenPermitido } from '../../lib/candados.ts';
import { VARIABLE_LLAVE } from '../../lib/llave.ts';

export default async (req: Request) => {
  const origen = req.headers.get('origin');
  const permitido = origenPermitido(origen, Netlify.env.get('ASISTENTE_DESARROLLO') === '1');
  return new Response(JSON.stringify({ listo: permitido && Boolean(Netlify.env.get(VARIABLE_LLAVE)) }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': permitido ? origen! : 'https://edreirbs.github.io',
      vary: 'Origin',
      'cache-control': 'public, max-age=60',
    },
  });
};

export const config: Config = { path: '/api/estado', method: 'GET' };

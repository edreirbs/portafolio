// Spec 0015 · FR-0015-10: el sitio pregunta si el asistente está listo antes de mostrar el botón.
// No llama a Claude ni cuenta cuotas; solo dice si hay credencial y si el asistente está activado.
import type { Config } from '@netlify/functions';
import { origenPermitido } from '../../lib/candados.ts';
import { ACTIVO, credencial } from '../../lib/llave.ts';

export default async (req: Request) => {
  const origen = req.headers.get('origin');
  const permitido = origenPermitido(origen, Netlify.env.get('ASISTENTE_DESARROLLO') === '1');
  // FR-0015-20: el botón aparece solo con credencial y con el asistente activado tras la batería de trampas.
  const listo = permitido && ACTIVO && credencial((n) => Netlify.env.get(n)) !== null;
  return new Response(JSON.stringify({ listo }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': permitido ? origen! : 'https://portafolio.edreirobles.com',
      vary: 'Origin',
      'cache-control': 'public, max-age=60',
    },
  });
};

export const config: Config = { path: '/api/estado', method: 'GET' };

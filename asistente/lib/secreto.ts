// Spec 0015 · FR-0015-14 y 19: secreto para firmar respuestas y para las huellas del día.
// Lo genera el servidor la primera vez y vive solo en Netlify Blobs: nadie lo ve ni lo escribe.
import { randomBytes } from 'node:crypto';
import { getStore } from '@netlify/blobs';

let copia: string | null = null;

export async function secreto(): Promise<string> {
  if (copia) return copia;
  const almacen = getStore({ name: 'asistente-config', consistency: 'strong' });
  let valor: string | null = await almacen.get('secreto-firma', { type: 'text' });
  if (!valor) {
    await almacen.set('secreto-firma', randomBytes(32).toString('base64url'), { onlyIfNew: true });
    valor = await almacen.get('secreto-firma', { type: 'text' });
  }
  if (!valor) throw new Error('sin secreto');
  copia = valor;
  return valor;
}

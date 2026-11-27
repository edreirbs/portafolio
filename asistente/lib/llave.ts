// Spec 0015 · FR-0015-18: con qué credencial se habla con Claude y cuánto se permite gastar.

/** La llave propia de Edrei, si un día la guarda en las variables del sitio (marcada secreta). */
export const VARIABLE_LLAVE = 'ASISTENTE_ANTHROPIC_API_KEY';
/** La API de Anthropic directa, para la llave propia. */
export const API_ANTHROPIC = 'https://api.anthropic.com';

/**
 * FR-0015-20: el botón del sitio solo aparece con el asistente activado. Se activó el 2026-11-27,
 * después de que la batería de trampas pasara completa contra el servidor publicado.
 */
export const ACTIVO = true;

export type Fuente = 'propia' | 'netlify';
export interface Credencial {
  apiKey: string;
  baseURL: string;
  fuente: Fuente;
}

/**
 * Primero la llave propia (gasto en el espacio de trabajo de Edrei con su límite). Si no hay,
 * el AI Gateway de Netlify, que inyecta ANTHROPIC_API_KEY y ANTHROPIC_BASE_URL en las funciones
 * y cobra en créditos del equipo de Netlify.
 */
export function credencial(env: (nombre: string) => string | undefined): Credencial | null {
  const propia = env(VARIABLE_LLAVE);
  if (propia) return { apiKey: propia, baseURL: API_ANTHROPIC, fuente: 'propia' };
  const llave = env('ANTHROPIC_API_KEY');
  const url = env('ANTHROPIC_BASE_URL');
  if (llave && url) return { apiKey: llave, baseURL: url, fuente: 'netlify' };
  return null;
}

/**
 * FR-0015-16: topes del día. Con el AI Gateway son más bajos porque los créditos del plan
 * gratuito de Netlify los comparten todos los sitios del equipo.
 */
export function topes(fuente: Fuente) {
  return fuente === 'propia' ? { porDiaTotal: 40, porDiaVisitante: 15 } : { porDiaTotal: 20, porDiaVisitante: 10 };
}

// Spec 0009: las fechas se escriben en el idioma de la página.
export type Idioma = 'es' | 'en';

const MESES: Record<Idioma, string[]> = {
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};
const HOY: Record<Idioma, string> = { es: 'hoy', en: 'present' };

/** "2022-06" → "jun 2022" */
export function mes(valor: string, idioma: Idioma = 'es'): string {
  if (!/^\d{4}-\d{2}$/.test(valor)) return valor;
  const [a, m] = valor.split('-');
  return `${MESES[idioma][Number(m) - 1]} ${a}`;
}

export function anio(valor: string): string {
  return valor.slice(0, 4);
}

export function periodo(desde: string, hasta?: string, idioma: Idioma = 'es'): string {
  if (!hasta) return mes(desde, idioma);
  return `${mes(desde, idioma)} – ${hasta === 'hoy' || hasta === 'vigente' ? HOY[idioma] : mes(hasta, idioma)}`;
}

export function periodoAnios(desde: string, hasta?: string, idioma: Idioma = 'es'): string {
  const a = anio(desde);
  if (!hasta) return a;
  if (hasta === 'hoy' || hasta === 'vigente' || hasta === 'en curso') return `${a} – ${HOY[idioma]}`;
  const b = anio(hasta);
  return a === b ? a : `${a} – ${b}`;
}

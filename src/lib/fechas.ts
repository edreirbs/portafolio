const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** "2022-06" → "jun 2022" */
export function mes(valor: string): string {
  if (!/^\d{4}-\d{2}$/.test(valor)) return valor;
  const [a, m] = valor.split('-');
  return `${MESES[Number(m) - 1]} ${a}`;
}

export function anio(valor: string): string {
  return valor.slice(0, 4);
}

export function periodo(desde: string, hasta?: string): string {
  if (!hasta) return mes(desde);
  return `${mes(desde)} – ${hasta === 'hoy' || hasta === 'vigente' ? 'hoy' : mes(hasta)}`;
}

export function periodoAnios(desde: string, hasta?: string): string {
  const a = anio(desde);
  if (!hasta) return a;
  if (hasta === 'hoy' || hasta === 'vigente' || hasta === 'en curso') return `${a} – hoy`;
  const b = anio(hasta);
  return a === b ? a : `${a} – ${b}`;
}

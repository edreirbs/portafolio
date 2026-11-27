// Spec 0015 · FR-0015-12: el único conocimiento del asistente es lo publicado en el portafolio.
// La compilación del sitio genera el archivo; aquí se lee y se guarda unos minutos en memoria.

const FUENTE = 'https://portafolio.edreirobles.com/conocimiento.txt';
const VIGENCIA = 10 * 60 * 1000;

let copia: { texto: string; hasta: number } | null = null;

export async function conocimiento(): Promise<string> {
  if (copia && copia.hasta > Date.now()) return copia.texto;
  const r = await fetch(FUENTE, { signal: AbortSignal.timeout(5000) });
  if (!r.ok) {
    if (copia) return copia.texto;
    throw new Error(`conocimiento ${r.status}`);
  }
  const texto = (await r.text()).slice(0, 120_000);
  copia = { texto, hasta: Date.now() + VIGENCIA };
  return texto;
}

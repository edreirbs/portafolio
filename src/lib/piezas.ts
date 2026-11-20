import { getCollection, type CollectionEntry } from 'astro:content';
import { SALAS, type Sala } from './salas';

export type Pieza = CollectionEntry<'piezas'>;

/** Piezas visibles, validadas entre sí (FR-0002-03 y FR-0002-05). Un error detiene la compilación. */
export async function piezas(): Promise<Pieza[]> {
  const todas = await getCollection('piezas');
  const vistos = new Map<string, string>();
  for (const p of todas) {
    const previo = vistos.get(p.data.catalogo);
    if (previo) throw new Error(`Número de catálogo repetido ${p.data.catalogo}: ${previo} y ${p.id}`);
    vistos.set(p.data.catalogo, p.id);
  }
  const visibles = todas.filter((p) => p.data.visible);
  const destacadas = visibles.filter((p) => p.data.destacada);
  if (destacadas.length > 6) {
    throw new Error(`Hay ${destacadas.length} piezas destacadas; el máximo es 6 (FR-0002-05): ${destacadas.map((p) => p.id).join(', ')}`);
  }
  return visibles.sort((a, b) => a.data.orden - b.data.orden || b.data.fecha.localeCompare(a.data.fecha));
}

export async function porSala(): Promise<Record<Sala, Pieza[]>> {
  const todas = await piezas();
  return Object.fromEntries(SALAS.map((s) => [s, todas.filter((p) => p.data.sala === s)])) as Record<Sala, Pieza[]>;
}

/** Dos piezas relacionadas: primero por materiales compartidos, luego por sala (FR-0005-04). */
export function relacionadas(pieza: Pieza, todas: Pieza[], n = 2): Pieza[] {
  const mats = new Set(pieza.data.materiales.map((m) => m.toLowerCase()));
  return todas
    .filter((p) => p.id !== pieza.id)
    .map((p) => ({
      p,
      score:
        p.data.materiales.filter((m) => mats.has(m.toLowerCase())).length * 2 + (p.data.sala === pieza.data.sala ? 1 : 0),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.p.data.orden - b.p.data.orden)
    .slice(0, n)
    .map((x) => x.p);
}

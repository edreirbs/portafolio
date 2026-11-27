// Spec 0014 · Todo lo que muestra la portada, en un solo lugar: la vista clásica, el gabinete 3D
// y el conocimiento del asistente (spec 0015) salen de aquí.
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { piezas, type Pieza } from './piezas';
import { SECCIONES, seccionDe, type Seccion } from './secciones';

export type Registro = CollectionEntry<'registro'>;

/** Del empleo más reciente al más antiguo. */
export async function registroOrdenado(): Promise<Registro[]> {
  const ultimo = (r: Registro) => r.data.puestos.map((p) => (p.hasta === 'hoy' ? '9999-99' : p.hasta)).sort().at(-1)!;
  const primero = (r: Registro) => r.data.puestos.map((p) => p.desde).sort()[0]!;
  return (await getCollection('registro')).sort(
    (a, b) => ultimo(b).localeCompare(ultimo(a)) || primero(b).localeCompare(primero(a)),
  );
}

export async function portafolio() {
  const perfil = (await getEntry('perfil', 'edrei'))!.data;
  const todas = await piezas();
  const porSeccion = Object.fromEntries(SECCIONES.map((s) => [s, todas.filter((p) => seccionDe(p) === s)])) as Record<
    Seccion,
    Pieza[]
  >;
  // Títulos: los grados del más reciente al más antiguo; las distinciones al final.
  porSeccion.titulos.sort(
    (a, b) => Number(a.data.sala === 'mirabilia') - Number(b.data.sala === 'mirabilia') || b.data.fecha.localeCompare(a.data.fecha),
  );
  const registro = await registroOrdenado();
  const articulos = (await getCollection('articulos')).map((a) => a.data).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const recursos = (await getCollection('recursos')).map((r) => r.data).sort((a, b) => a.orden - b.orden);

  // FR-0014-02: una sección sin contenido no aparece.
  const tiene: Record<Seccion, boolean> = {
    proyectos: porSeccion.proyectos.length > 0,
    titulos: porSeccion.titulos.length > 0,
    certificaciones: porSeccion.certificaciones.some((p) => p.data.evidencia.some((e) => e.url)),
    experiencia: registro.length + porSeccion.experiencia.length > 0,
    publicaciones: porSeccion.publicaciones.length + articulos.length + recursos.length > 0,
    contacto: perfil.contacto.length > 0,
  };
  const visibles = SECCIONES.filter((s) => tiene[s]);
  const linkedin = perfil.contacto.find((c) => c.etiqueta === 'LinkedIn') ?? perfil.contacto[0]!;
  return { perfil, todas, porSeccion, registro, articulos, recursos, visibles, linkedin };
}

export type Portafolio = Awaited<ReturnType<typeof portafolio>>;

// Spec 0009 · Los textos de la interfaz en español e inglés. El contenido de cada pieza vive en
// sus datos (campo `en`), nunca aquí.
import { INFO_SECCION, type Seccion } from './secciones';
import type { Idioma } from './fechas';
import type { Pieza } from './piezas';

export type { Idioma };

const SECCION_EN: Record<Seccion, { nombre: string; corto: string; descripcion: string }> = {
  proyectos: { nombre: 'Projects', corto: 'Projects', descripcion: 'Products, agents and simulations I built with AI, with their code or demo.' },
  titulos: { nombre: 'Degrees and awards', corto: 'Education', descripcion: 'Academic degrees and distinctions, with their institution and dates.' },
  certificaciones: { nombre: 'Certifications and courses', corto: 'Certifications', descripcion: 'Certifications and courses with a verification link.' },
  experiencia: { nombre: 'Experience', corto: 'Experience', descripcion: 'Career in education, learning design and AI, from most recent to oldest.' },
  publicaciones: { nombre: 'Publications', corto: 'Publications', descripcion: 'Academic and popular-science writing on AI and learning.' },
  contacto: { nombre: 'Links and contact', corto: 'Contact', descripcion: 'Where to find me and how to reach me.' },
};

export function infoSeccion(s: Seccion, idioma: Idioma = 'es') {
  return idioma === 'en' ? SECCION_EN[s] : INFO_SECCION[s];
}

export const UI = {
  es: {
    saltar: 'Saltar al contenido',
    inicio: 'Inicio:',
    principal: 'Principal',
    cv: 'CV',
    ver3d: 'Ver en 3D',
    ficha: 'Ficha rápida',
    otroIdioma: { texto: 'English', hreflang: 'en', ruta: 'en/' },
    redes: 'Redes',
    actualizado: 'Catálogo actualizado el',
    construido: 'Construido con',
    verCodigo: 'Ver el código y las specs',
    cerrar: 'Cerrar',
  },
  en: {
    saltar: 'Skip to content',
    inicio: 'Home:',
    principal: 'Main',
    cv: 'CV (Spanish)',
    ver3d: 'See in 3D',
    ficha: 'Quick view',
    otroIdioma: { texto: 'Español', hreflang: 'es', ruta: '' },
    redes: 'Links',
    actualizado: 'Catalog updated on',
    construido: 'Built with',
    verCodigo: 'See the code and the specs',
    cerrar: 'Close',
  },
} as const;

export function fechaLarga(d: Date, idioma: Idioma = 'es'): string {
  return new Intl.DateTimeFormat(idioma === 'en' ? 'en-US' : 'es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Monterrey',
  }).format(d);
}

/** El texto de una pieza en el idioma pedido. Falla la compilación si falta la traducción. */
export function textoPieza(p: Pieza, idioma: Idioma = 'es') {
  const d = p.data;
  const origen = d.otorgante ?? d.institucion ?? d.procedencia;
  if (idioma === 'es') return { titulo: d.titulo, subtitulo: d.subtitulo, resumen: d.resumen, procedencia: origen };
  if (!d.en) throw new Error(`Spec 0009: la pieza "${p.id}" no tiene su versión en inglés (campo en).`);
  return { titulo: d.en.titulo ?? d.titulo, subtitulo: d.en.subtitulo, resumen: d.en.resumen, procedencia: d.en.procedencia ?? origen };
}

/** Las ligas de evidencia con su etiqueta en el idioma pedido. */
export function ligasPieza(p: Pieza, idioma: Idioma = 'es', max = 2) {
  return p.data.evidencia
    .filter((e): e is typeof e & { url: string } => Boolean(e.url))
    .slice(0, max)
    .map((e) => ({ url: e.url, etiqueta: idioma === 'en' ? (e.etiqueta_en ?? e.etiqueta) : e.etiqueta }));
}

/** Las redes se llaman igual en los dos idiomas, salvo el sitio web. */
export function etiquetaRed(etiqueta: string, idioma: Idioma = 'es'): string {
  return idioma === 'en' && etiqueta === 'Sitio web' ? 'Website' : etiqueta;
}

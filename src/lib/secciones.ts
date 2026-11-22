// Spec 0014 · Las secciones profesionales del portafolio, en orden de lectura.
import type { Pieza } from './piezas';

export const SECCIONES = ['proyectos', 'titulos', 'certificaciones', 'experiencia', 'publicaciones', 'contacto'] as const;
export type Seccion = (typeof SECCIONES)[number];

export const INFO_SECCION: Record<Seccion, { nombre: string; corto: string; descripcion: string }> = {
  proyectos: {
    nombre: 'Proyectos',
    corto: 'Proyectos',
    descripcion: 'Productos, agentes y simulaciones que construí con IA, con su código o su demo.',
  },
  titulos: {
    nombre: 'Títulos y diplomas',
    corto: 'Formación',
    descripcion: 'Grados académicos y distinciones, con su institución y sus fechas.',
  },
  certificaciones: {
    nombre: 'Certificaciones y cursos',
    corto: 'Certificaciones',
    descripcion: 'Certificaciones y cursos con liga de verificación.',
  },
  experiencia: {
    nombre: 'Experiencia',
    corto: 'Experiencia',
    descripcion: 'Trayectoria en educación, diseño de aprendizaje e IA, de lo más reciente a lo más antiguo.',
  },
  publicaciones: {
    nombre: 'Publicaciones',
    corto: 'Publicaciones',
    descripcion: 'Artículos académicos y de divulgación sobre IA y aprendizaje.',
  },
  contacto: {
    nombre: 'Redes y contacto',
    corto: 'Contacto',
    descripcion: 'Dónde encontrarme y cómo escribirme.',
  },
};

/** A qué sección pertenece una pieza, según su sala en el catálogo (spec 0014, tabla de secciones). */
export function seccionDe(p: Pieza): Seccion {
  switch (p.data.sala) {
    case 'artificialia':
    case 'exotica':
      return 'proyectos';
    case 'naturalia':
      return p.data.grado === 'articulo' ? 'publicaciones' : 'titulos';
    case 'mirabilia':
      return 'titulos';
    case 'scientifica':
      return 'certificaciones';
    case 'theatrum':
      return 'experiencia';
  }
}

/** Ancla de una sección en la portada. */
export const ancla = (s: Seccion) => `#${s}`;

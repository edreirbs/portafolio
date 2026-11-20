// Spec 0001 · las salas del gabinete, en orden de recorrido.
export const SALAS = ['artificialia', 'theatrum', 'scientifica', 'naturalia', 'mirabilia', 'exotica'] as const;
export type Sala = (typeof SALAS)[number];

export const SIGLAS: Record<Sala, string> = {
  artificialia: 'AF',
  theatrum: 'TH',
  scientifica: 'SC',
  naturalia: 'NA',
  mirabilia: 'MI',
  exotica: 'EX',
};

export const INFO: Record<Sala, { nombre: string; tema: string; descripcion: string }> = {
  artificialia: {
    nombre: 'Artificialia',
    tema: 'Proyectos',
    descripcion: 'Obras hechas por la mano humana: productos, sistemas y experimentos construidos con IA.',
  },
  theatrum: {
    nombre: 'Theatrum',
    tema: 'Docencia y conferencias',
    descripcion: 'El teatro donde se enseñaba: cursos, talleres y conferencias en Latinoamérica.',
  },
  scientifica: {
    nombre: 'Scientifica',
    tema: 'Certificaciones',
    descripcion: 'Instrumentos calibrados del saber: certificaciones y cursos verificables.',
  },
  naturalia: {
    nombre: 'Naturalia',
    tema: 'Formación e investigación',
    descripcion: 'El origen: grados académicos, tesis y publicaciones.',
  },
  mirabilia: {
    nombre: 'Mirabilia',
    tema: 'Reconocimientos',
    descripcion: 'Maravillas: premios, distinciones y hitos.',
  },
  exotica: {
    nombre: 'Exotica',
    tema: 'Curiosidades',
    descripcion: 'Lo traído de lejos: simulaciones, preguntas raras y experimentos.',
  },
};

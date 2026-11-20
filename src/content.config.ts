import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { SALAS, SIGLAS } from './lib/salas';

const mes = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Usa el formato AAAA-MM');
const slugDeArchivo = ({ entry }: { entry: string }) => entry.replace(/^.*\//, '').replace(/\.md$/, '');

// Spec 0002 · la cédula
const piezas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/piezas', generateId: slugDeArchivo }),
  schema: ({ image }) =>
    z
      .object({
        catalogo: z.string().regex(/^(AF|SC|NA|TH|MI|EX)-\d{4}-\d{3}$/, 'Usa el formato SIGLA-AAAA-NNN'),
        titulo: z.string().min(1),
        subtitulo: z.string().min(1).max(110),
        sala: z.enum(SALAS),
        fecha: mes,
        fecha_fin: z.union([mes, z.literal('vigente'), z.literal('en curso')]).optional(),
        procedencia: z.string().min(1),
        materiales: z.array(z.string()).default([]),
        resumen: z.string().min(1).max(260),
        cifras: z
          .array(z.object({ valor: z.string(), etiqueta: z.string(), fuente: z.string() }))
          .default([]),
        evidencia: z
          .array(
            z.object({
              tipo: z.enum(['demo', 'codigo', 'credencial', 'documento', 'video', 'prensa', 'testimonio']),
              url: z.url().optional(),
              etiqueta: z.string(),
            }),
          )
          .min(1, 'Toda pieza necesita al menos una evidencia (constitución, art. II)'),
        imagen: z.object({ src: image(), alt: z.string().min(1) }).optional(),
        ejemplar: z.object({ poster: image(), nombre: z.string(), alt: z.string() }).optional(),
        destacada: z.boolean().default(false),
        orden: z.number().default(99),
        visible: z.boolean().default(true),
        revisada: mes,
        // Artificialia
        rol: z.string().optional(),
        estado: z.enum(['activo', 'terminado', 'archivado']).optional(),
        // Naturalia
        institucion: z.string().optional(),
        grado: z.enum(['bachillerato', 'licenciatura', 'maestria', 'doctorado', 'articulo', 'otro']).optional(),
        campo: z.string().optional(),
        tesis: z.string().optional(),
        distinciones: z.string().optional(),
        // Mirabilia
        otorgante: z.string().optional(),
        alcance: z.enum(['internacional', 'nacional', 'institucional']).optional(),
      })
      .superRefine((p, ctx) => {
        const sigla = p.catalogo.slice(0, 2);
        if (sigla !== SIGLAS[p.sala]) {
          ctx.addIssue({
            code: 'custom',
            path: ['catalogo'],
            message: `Una pieza de ${p.sala} usa la sigla ${SIGLAS[p.sala]}, no ${sigla}`,
          });
        }
        // FR-0002-04: Naturalia y Mirabilia pueden respaldarse con documentos sin liga pública.
        const conLiga = p.evidencia.some((e) => e.url);
        if (!conLiga && p.sala !== 'naturalia' && p.sala !== 'mirabilia') {
          ctx.addIssue({
            code: 'custom',
            path: ['evidencia'],
            message: 'Esta sala necesita al menos una evidencia con liga pública',
          });
        }
      }),
});

const perfil = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/perfil', generateId: slugDeArchivo }),
  schema: z.object({
    nombre: z.string(),
    titulo: z.string(),
    promesa: z.string(),
    pruebas: z.array(z.object({ texto: z.string(), fuente: z.string() })).length(3),
    resumen: z.string(),
    ubicacion: z.string(),
    contacto: z.array(z.object({ etiqueta: z.string(), url: z.url() })).min(1),
    idiomas: z.array(z.object({ idioma: z.string(), nivel: z.string() })),
    competencias: z.array(z.string()),
  }),
});

const registro = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/registro', generateId: slugDeArchivo }),
  schema: z.object({
    organizacion: z.string(),
    lugar: z.string().optional(),
    puestos: z
      .array(z.object({ puesto: z.string(), desde: mes, hasta: z.union([mes, z.literal('hoy')]) }))
      .min(1),
    alcance: z.string().optional(),
    logros: z.array(z.string()).default([]),
  }),
});

export const collections = { piezas, perfil, registro };

# 0002 · Modelo de contenido: la cédula

| Campo | Valor |
|---|---|
| Estado | Aprobada |
| Fase | F0 |
| Depende de | 0000 (art. II, IV), 0001 |
| Creada | 2026-11-20 |

## Por qué

En un museo, la cédula es lo que convierte un objeto en una pieza: dice qué es, de dónde
viene y por qué importa. En el portafolio, la cédula es el **esquema de datos** de cada
proyecto, certificación o estudio. Si el esquema es bueno, agregar contenido es trivial y el
sitio, el Acervo y el CV salen de la misma fuente.

## Requisitos

| ID | Requisito | Prioridad |
|---|---|---|
| FR-0002-01 | Cada pieza DEBE ser un archivo Markdown con encabezado YAML en `src/content/piezas/<sala>/<slug>.md`. El cuerpo es el texto largo de la vitrina. | Debe |
| FR-0002-02 | El encabezado DEBE validarse contra el esquema en cada build; un error detiene la publicación y dice qué campo falla. | Debe |
| FR-0002-03 | El número de catálogo DEBE tener la forma `SIGLA-AAAA-NNN` (`AF-2026-001`) y ser único. | Debe |
| FR-0002-04 | Toda pieza pública DEBE tener al menos una evidencia. Fuera de Naturalia y Mirabilia, al menos una DEBE tener liga pública; en esas dos salas basta un documento (un acta, un diploma, un reconocimiento). | Debe |
| FR-0002-05 | Como máximo seis piezas pueden tener `destacada: true`. | Debe |
| FR-0002-06 | Una credencial con `vence` en el pasado DEBE mostrarse como vencida automáticamente. | Debe |
| FR-0002-07 | Las piezas con `visible: false` NO DEBEN aparecer en el sitio, el Acervo, el CV ni el mapa del sitio. | Debe |
| FR-0002-08 | Una serie (varias piezas pequeñas parecidas) DEBE poder representarse como una pieza con `serie:` que lista sus elementos. | Debe |

## Campos comunes

| Campo | Tipo | Obligatorio | Ejemplo |
|---|---|---|---|
| `catalogo` | texto | sí | `AF-2026-001` |
| `titulo` | texto | sí | `Tracky` |
| `subtitulo` | texto ≤ 90 car. | sí | `Grabadora de juntas y organizador de tareas para personas con TDAH` |
| `sala` | `artificialia` · `scientifica` · `naturalia` · `theatrum` · `mirabilia` · `exotica` | sí | `artificialia` |
| `fecha` | AAAA-MM | sí | `2026-11` |
| `fecha_fin` | AAAA-MM o `vigente` | no | `vigente` |
| `procedencia` | texto | sí | `Proyecto personal` · `Universidad Panamericana` · `Coursera` |
| `materiales` | lista | sí | `[Supabase, PostgreSQL, Claude API, Whisper, PWA]` |
| `resumen` | texto ≤ 220 car. | sí | Lo que es y por qué importa, en una o dos frases |
| `cifras` | lista de `{valor, etiqueta, fuente}` | no | `{valor: "1,408", etiqueta: "neuronas simuladas", fuente: repo}` |
| `evidencia` | lista de `{tipo, url, etiqueta}` | sí (ver FR-0002-04) | `{tipo: demo, url: …}` |
| `imagen` | ruta + `alt` | no | `./tracky.png` |
| `destacada` | booleano | no | `true` |
| `orden` | número | no | `1` |
| `visible` | booleano | no (por defecto `true`) | `false` |
| `revisada` | AAAA-MM | sí | `2026-11` |

Tipos de evidencia: `demo`, `codigo`, `credencial`, `documento`, `video`, `prensa`, `testimonio`.

## Campos por sala

| Sala | Campos extra |
|---|---|
| **Artificialia** | `rol` (qué hizo Edrei), `estado` (`activo` · `terminado` · `archivado`), `problema`, `resultado` |
| **Scientifica** | `emisor`, `tipo` (`certificacion` · `curso` · `diplomado` · `especializacion`), `horas`, `credencial_id`, `vence` |
| **Naturalia** | `institucion`, `grado` (`licenciatura` · `maestria` · `doctorado` · `otro`), `campo`, `distinciones`, `tesis` |
| **Theatrum** | `institucion`, `formato` (`curso` · `taller` · `conferencia` · `mentoria`), `audiencia`, `participantes`, `sesiones` |
| **Mirabilia** | `otorgante`, `alcance` (`internacional` · `nacional` · `institucional`) |
| **Exotica** | `pregunta` (la curiosidad que lo originó) |

La experiencia laboral no es una pieza: vive en `src/content/registro/` como entradas de
trayectoria (`organizacion`, `puesto`, `desde`, `hasta`, `logros`), porque es la línea de
tiempo que conecta las piezas, no un objeto exhibido.

## Ejemplo

```markdown
---
catalogo: AF-2026-001
titulo: Tracky
subtitulo: Grabadora de juntas y organizador de tareas para personas con TDAH
sala: artificialia
fecha: 2026-11
fecha_fin: vigente
procedencia: Proyecto personal
rol: Producto, arquitectura y desarrollo
estado: activo
materiales: [PWA, Netlify Functions, Supabase, PostgreSQL, RLS, Claude API, Whisper]
resumen: >-
  Graba cualquier junta, la transcribe en tu propia computadora y la resume con Claude.
  Convierte tareas terminadas en monedas canjeables por tiempo libre.
cifras:
  - { valor: "5", etiqueta: "specs implementadas", fuente: repo }
evidencia:
  - { tipo: codigo, url: "https://github.com/edreirbs/tracky", etiqueta: "Ver código" }
destacada: true
orden: 2
revisada: 2026-11
---

## El problema
…
```

## Criterios de aceptación

- **Dado** un archivo sin `evidencia` en Artificialia, **cuando** corre el build,
  **entonces** falla con un mensaje que nombra el archivo y el campo.
- **Dado** siete piezas con `destacada: true`, **cuando** corre el build, **entonces** falla.
- **Dado** una certificación con `vence: 2025-06`, **cuando** se publica en 2026, **entonces**
  aparece marcada como vencida y sin sello "Verificable".

## No-objetivos

- Editar contenido desde el navegador.
- Traducción automática; el inglés tiene su propia spec.

## Preguntas abiertas

Ninguna que bloquee. Se ajustará al cargar el contenido real de Edrei.

## Cambios

| Fecha | Cambio |
|---|---|
| 2026-11-20 | Creada. |
| 2026-11-20 | FR-0002-04: Mirabilia también admite documentos sin liga pública. Se agregan `ejemplar` (Vestíbulo), `grado: articulo` y `fecha_fin: en curso`. Implementada en `src/content.config.ts`. |

# Specs

## Ciclo de vida de una spec

| Estado | Significa |
|---|---|
| **Borrador** | Claude la está escribiendo. |
| **En aclaración** | Tiene `[NECESITA ACLARACIÓN]` que solo Edrei puede resolver. |
| **Aprobada** | Sin dudas abiertas. Ya se puede planear y construir. |
| **En construcción** | Hay `plan.md` y `tasks.md`; el trabajo avanza en una rama. |
| **Hecha** | Fusionada y publicada; sus criterios de aceptación se verificaron. |

Una spec se aprueba cuando Edrei responde sus aclaraciones o dice "va". Silencio no es
aprobación, salvo en la constitución (ver su sección de gobierno).

## Backlog

| ID | Título | Estado | Fase |
|---|---|---|---|
| [0000](0000-constitucion.md) | Constitución | Aprobada | F0 |
| [0001](0001-gabinete/spec.md) | El Gabinete: concepto y experiencia | En aclaración | F0 |
| [0002](0002-modelo-de-contenido/spec.md) | Modelo de contenido: la cédula | Borrador | F0 |
| 0003 | Ficha rápida (modo reclutador) y CV | Pendiente | F1 |
| 0004 | Vestíbulo | Pendiente | F1 |
| 0005 | Sala Artificialia (proyectos) | Pendiente | F1 |
| 0006 | Salas Scientifica y Naturalia (credenciales y estudios) | Pendiente | F2 |
| 0007 | Theatrum, Mirabilia, Exotica y Registro | Pendiente | F2 |
| 0008 | Acervo: índice, filtros y búsqueda | Pendiente | F2 |
| 0009 | Versión en inglés | Pendiente | F3 |
| 0010 | SEO, imágenes OG, analítica y rendimiento | Pendiente | F3 |
| 0011 | Lanzamiento | Pendiente | F4 |

## Decisiones pendientes

Las responde Edrei. Cada una bloquea lo que dice la última columna.

| ID | Pregunta | Propuesta de Claude | Bloquea |
|---|---|---|---|
| D-1 | ¿A qué puestos o clientes apunta el portafolio? | Perfil híbrido: construye con IA, la enseña y la lleva a organizaciones. | Textos de 0001 y 0004 |
| D-2 | ¿Idiomas? | Español primero; inglés en F3. | 0009 |
| D-3 | ¿URL? | Renombrar este repo a `edreirbs.github.io` para que la liga sea la raíz; dominio propio después. | 0011 |
| D-4 | ¿Qué repos privados se pueden mostrar? | Como caso de estudio, sin código ni datos de clientes. | 0005 |
| D-5 | ¿Qué contacto es público? | LinkedIn y un correo dedicado; nada de teléfono. | 0003, 0004 |
| D-6 | ¿Retrato o ilustración? | Retrato real tratado como grabado, para que encaje con el gabinete. | 0004 |
| D-7 | ¿La mosca de "Mátala si puedes" es el ejemplar vivo del Vestíbulo? | Sí, en versión ligera que carga al final. | 0004 |

## Decisiones tomadas

| Fecha | Decisión | Dónde |
|---|---|---|
| 2026-11-20 | Claude crea ramas, commits y PRs y los fusiona sin pedir permiso. | `CLAUDE.md` |
| 2026-11-20 | Stack: Astro estático + colecciones con esquema + GitHub Actions a Pages. | [ADR-0001](../docs/adr/0001-stack-astro-github-pages.md) |

## Cómo darme una spec

No hace falta formato. Si quieres ser preciso, esto basta:

> **Quiero** que las certificaciones tengan un sello de lacre.
> **Para** que el reclutador sepa cuáles puede verificar.
> **Debe** ligar a la credencial oficial. **No debe** aparecer si no hay liga.

Claude responde con la spec formal y solo pregunta lo que no puede decidir solo.

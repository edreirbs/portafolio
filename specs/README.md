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
| [0002](0002-modelo-de-contenido/spec.md) | Modelo de contenido: la cédula | Aprobada | F0 |
| [0003](0003-ficha-rapida/spec.md) | Ficha rápida (modo reclutador) y CV | Hecha | F1 |
| [0004](0004-vestibulo/spec.md) | Vestíbulo · [plan](0004-vestibulo/plan.md) y [tareas](0004-vestibulo/tasks.md) de la F1 | Hecha | F1 |
| [0005](0005-artificialia/spec.md) | Sala Artificialia (proyectos) | Hecha | F1 |
| 0006 | Salas Scientifica y Naturalia (credenciales y estudios) | Pendiente | F2 |
| 0007 | Theatrum, Mirabilia, Exotica y Registro | Pendiente | F2 |
| 0008 | Acervo: índice, filtros y búsqueda | Pendiente | F2 |
| 0009 | Versión en inglés | Pendiente | F3 |
| 0010 | SEO, imágenes OG, analítica y rendimiento | Pendiente | F3 |
| 0011 | Lanzamiento | Pendiente | F4 |
| [0012](0012-gabinete-3d/spec.md) | El gabinete en 3D · [plan](0012-gabinete-3d/plan.md) | Hecha (prototipo) | F2 |

## Decisiones pendientes

Las responde Edrei. Cada una bloquea lo que dice la última columna.

| ID | Pregunta | Propuesta de Claude | Bloquea |
|---|---|---|---|
| D-2 | ¿Idiomas? | Español primero; inglés en F3. | 0009 |
| D-3 | ¿URL? | El dominio propio `edreirobles.com` (hoy en Google Sites) apunta al gabinete; sus recursos migran como piezas. | 0011 |
| D-4 | ¿Qué repos privados se pueden mostrar? | Como caso de estudio, sin código ni datos de clientes. | 0005 |
| D-5 | ¿Qué contacto es público? | LinkedIn y un correo dedicado; nada de teléfono. | 0003, 0004 |
| D-6 | ¿Retrato o ilustración? | Retrato real tratado como grabado, para que encaje con el gabinete. | 0004 |
| D-7 | ¿La mosca de "Mátala si puedes" es el ejemplar vivo del Vestíbulo? | Sí, en versión ligera que carga al final. | 0004 |
| D-9 | ¿Se citan las recomendaciones públicas de LinkedIn? | Sí, con nombre y cargo. | 0007 |
| D-10 | ¿Se publican los proyectos del programa de Agentic AI? | Sí, en GitHub, marcados como "proyecto del programa". | 0005 |
| D-11 | ¿El gabinete 3D es la portada del sitio? | Sí, con la versión clásica como respaldo y ficha rápida, una vez medido en un teléfono real. | 0012 |

## Decisiones tomadas

| Fecha | Decisión | Dónde |
|---|---|---|
| 2026-11-20 | Claude crea ramas, commits y PRs y los fusiona sin pedir permiso. | `CLAUDE.md` |
| 2026-11-20 | Alcance: solo lo personal. Nada del trabajo institucional del empleo actual de Edrei: ni sus proyectos, plataformas, métricas ni presentaciones internas. | Constitución, art. VIII |
| 2026-11-20 | **D-1 · Posicionamiento directivo.** Título: "Estratega de IA para el aprendizaje". Promesa: "Diseño y dirijo la adopción de IA en universidades y empresas: de la visión al impacto medible." Pruebas: doctorando en Ciencias (IPN), más de 10 años en educación, ponente en 4 países. | 0001, 0004 |
| 2026-11-20 | **D-8 · Empleo actual.** Aparece con puesto, institución, fechas y una frase de alcance general. Sin proyectos, plataformas, cifras ni presentaciones internas. | Constitución, art. VIII |
| 2026-11-20 | **Gabinete 3D**: mundo navegable de explorador del siglo XIX con Three.js y modelos CC0; el 2D queda como respaldo y ficha rápida. | [ADR-0002](../docs/adr/0002-gabinete-3d-threejs.md), spec 0012 |
| 2026-11-20 | Stack: Astro estático + colecciones con esquema + GitHub Actions a Pages. | [ADR-0001](../docs/adr/0001-stack-astro-github-pages.md) |

## Cómo darme una spec

No hace falta formato. Si quieres ser preciso, esto basta:

> **Quiero** que las certificaciones tengan un sello de lacre.
> **Para** que el reclutador sepa cuáles puede verificar.
> **Debe** ligar a la credencial oficial. **No debe** aparecer si no hay liga.

Claude responde con la spec formal y solo pregunta lo que no puede decidir solo.

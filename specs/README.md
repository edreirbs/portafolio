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
| [0007](0007-conferencias/spec.md) | Conferencias y docencia con evidencia | Hecha | F2 |
| 0008 | Acervo: índice, filtros y búsqueda | Pendiente | F2 |
| 0009 | Versión en inglés | Pendiente | F3 |
| [0010](0010-seo/spec.md) | Imagen al compartir, buscadores y analítica | Hecha | F3 |
| 0011 | Lanzamiento | Pendiente | F4 |
| [0012](0012-gabinete-3d/spec.md) | El gabinete en 3D · [plan](0012-gabinete-3d/plan.md) | Hecha (prototipo) | F2 |
| [0013](0013-experiencia-gabinete/spec.md) | Experiencia del gabinete 3D | Hecha | F2 |
| [0014](0014-portafolio-profesional/spec.md) | Portafolio profesional dentro del gabinete · [plan](0014-portafolio-profesional/plan.md) | Hecha | F2 |
| [0015](0015-asistente/spec.md) | Asistente del portafolio · [plan](0015-asistente/plan.md) · [ADR-0003](../docs/adr/0003-asistente-netlify-claude.md) | Hecha | F2 |
| [0016](0016-proyectos-al-centro/spec.md) | Proyectos al centro: todos los que valen la pena, sin adornos | Hecha | F2 |

## Decisiones pendientes

Ninguna. Edrei delegó todas las decisiones el 2026-11-27; quedan registradas abajo.

## Decisiones tomadas

| Fecha | Decisión | Dónde |
|---|---|---|
| 2026-11-21 | **D-11 · El gabinete 3D es la portada.** Las secciones profesionales viven dentro del 3D; la vista clásica es la misma página cuando el navegador no puede con el 3D o el visitante la elige. | Spec 0014 |
| 2026-11-21 | **Redes publicadas:** LinkedIn, GitHub, YouTube, X y edreirobles.com. | Spec 0014 |
| 2026-11-21 | **Asistente:** Claude Haiku 5.5, límite de USD 1 al mes, servidor en Netlify. | Spec 0015, ADR-0003 |
| 2026-11-27 | **D-2 · Idiomas:** español; el inglés llega con la spec 0009. El asistente ya responde en el idioma de quien pregunta. | 0009 |
| 2026-11-27 | **D-3 · URL:** se queda `edreirbs.github.io/portafolio` hasta que el dominio `edreirobles.com` se apunte al sitio desde su registrador. | 0011 |
| 2026-11-27 | **D-4 · Repos privados:** solo *Lexi*, con su app en línea como evidencia y sin código. Los demás no se muestran. | 0016 |
| 2026-11-27 | **D-5 · Contacto público:** LinkedIn y las redes; sin correo ni teléfono. | 0003, 0014 |
| 2026-11-27 | **D-6 · Retrato:** sin retrato por ahora. | 0004 |
| 2026-11-27 | **D-7 · Ejemplar vivo:** sí, la mosca de *Mátala si puedes* en la vista clásica. | 0004 |
| 2026-11-27 | **D-9 · Recomendaciones de LinkedIn:** no se citan, porque son datos de otras personas. | 0007 |
| 2026-11-27 | **D-10 · Programa de Agentic AI:** sus proyectos entran cuando estén en GitHub, marcados como proyecto del programa. | 0005 |
| 2026-11-27 | **D-12 · Repos dudosos:** `mapa-red-funciones-ia`, `entrevista` y `cerebro-CREA` quedan fuera. | 0016 |
| 2026-11-27 | **Publicaciones:** se quedan el artículo académico y los artículos de divulgación. | 0014 |
| 2026-11-27 | **Certificaciones:** siguen fuera mientras no tengan liga pública de verificación. | 0006 |
| 2026-11-27 | **Proyectos al centro:** todos los proyectos que valen la pena y ningún objeto de adorno en el gabinete. | Spec 0016 |
| 2026-11-27 | **Asistente conectado por Claude:** usa el AI Gateway de Netlify mientras no exista la llave propia, con topes diarios más bajos. | Spec 0015, ADR-0003 |
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

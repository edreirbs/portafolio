# ADR-0001 · Astro estático en GitHub Pages

| Campo | Valor |
|---|---|
| Estado | Aceptada |
| Fecha | 2026-11-20 |
| Specs | 0000 (art. IV, V, IX), 0002 |

## Contexto

El portafolio tendrá entre 50 y 100 piezas de seis tipos, cada una validada contra un esquema
(spec 0002). Tiene que publicarse en GitHub Pages, cargar rápido en móvil, funcionar sin
JavaScript y mantenerse con un archivo por pieza. Algunas piezas son interactivas (la mosca,
la búsqueda).

## Decisión

- **Astro**, en modo estático, en su versión estable al momento de implementar.
- **Colecciones de contenido** con esquema Zod: la cédula de la spec 0002 se vuelve código que
  valida cada archivo en el build.
- **CSS propio** con variables para los tokens de diseño. Sin framework de UI.
- **Islas** solo donde hace falta interacción (ejemplar vivo, búsqueda, interruptor de Ficha
  rápida). Todo lo demás es HTML sin JavaScript.
- **Pagefind** para la búsqueda del Acervo: índice estático, sin servidor.
- **GitHub Actions** compila y publica en Pages en cada fusión a `main`. Los PR corren el
  build, la validación de contenido, la revisión de ligas y Lighthouse CI.

## Alternativas descartadas

| Opción | Por qué no |
|---|---|
| Un solo HTML a mano | Es lo que funciona en proyectos chicos, pero no valida esquemas ni escala a 100 piezas con un CV derivado. |
| Next.js | Pensado para servidor; en export estático carga más JavaScript del necesario. |
| Jekyll | Nativo de Pages, pero sin tipos ni validación de contenido, y con Ruby de por medio. |
| Hugo | Muy rápido, pero sus plantillas complican las islas interactivas. |

## Consecuencias

- Agregar una pieza es agregar un archivo; si el esquema falla, el PR no pasa.
- El sitio cumple el presupuesto de JavaScript sin esfuerzo especial.
- Hace falta activar Pages con fuente **GitHub Actions** en la configuración del repo; eso lo
  hace Edrei una vez (Settings → Pages).

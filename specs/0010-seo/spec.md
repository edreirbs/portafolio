# 0010 · Imagen al compartir, buscadores y analítica

| Campo | Valor |
|---|---|
| Estado | Hecha |
| Fase | F3 |
| Depende de | 0014 |
| Creada | 2026-11-27 |

## Por qué

Cuando un reclutador pega la liga del portafolio en LinkedIn o WhatsApp, no salía imagen. Es lo
primero que ve. Edrei dio permiso (2026-11-27) para hacerlo todo.

## Requisitos

| ID | Requisito | Prioridad |
|---|---|---|
| FR-0010-01 | Toda página DEBE tener imagen al compartir (Open Graph y tarjeta grande de X) con su texto alternativo. La portada usa una imagen del gabinete con el nombre, el título y la promesa de Edrei. | Debe |
| FR-0010-02 | Una pieza con imagen DEBE compartirse con su propia imagen. | Debe |
| FR-0010-03 | La portada DEBE describir a Edrei con datos estructurados (`schema.org/Person`) sacados del perfil: nombre, título, redes, competencias e idiomas. | Debe |
| FR-0010-04 | El sitio DEBE publicar un mapa (`sitemap.xml`) con la portada, el CV y cada pieza. | Debe |
| FR-0010-05 | **Sin analítica.** Ningún contador de visitas ni cookie de terceros: protege a quien visita y no gasta presupuesto de JavaScript. | Debe |

## Cómo se regenera la imagen

La imagen de la portada (`public/og-portafolio.jpg`, 1200 × 630) se generó con Playwright a partir
de la vista *Proyectos* del gabinete, sin interfaz, con el texto del perfil encima. Si cambia el
título o la promesa, se vuelve a generar.

## Cambios

| Fecha | Cambio |
|---|---|
| 2026-11-27 | Creada y hecha. Decisión: sin analítica. |

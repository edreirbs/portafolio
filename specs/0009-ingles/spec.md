# 0009 · Versión en inglés

| Campo | Valor |
|---|---|
| Estado | Hecha |
| Fase | F3 |
| Depende de | 0002, 0014, 0015 |
| Creada | 2026-11-27 |

## Por qué

Muchos reclutadores de IA y tecnología educativa leen en inglés. La decisión D-2 dejó el
inglés para esta spec, y Edrei dio permiso (2026-11-27) para decidir y publicar.

## Decisiones

| Decisión | Motivo |
|---|---|
| Una portada en inglés en `/en/`, en la vista clásica. | Es lo que lee un reclutador. Traducir el gabinete 3D (texturas, placas, notas) cuesta mucho y suma poco. |
| Sin páginas de detalle en inglés. | En inglés, cada tarjeta trae su resumen y el título liga directo a la evidencia. |
| El CV imprimible, los artículos de LinkedIn y los recursos abiertos se quedan en español y se marcan así. | Son documentos escritos en español. |

## Requisitos

| ID | Requisito | Prioridad |
|---|---|---|
| FR-0009-01 | `/en/` DEBE mostrar las mismas secciones y la misma evidencia que la portada en español. | Debe |
| FR-0009-02 | Los textos en inglés DEBEN vivir en los datos: campo `en` en cada pieza, registro y perfil, `etiqueta_en` en la evidencia y `titulo_en` y `descripcion_en` en los recursos. | Debe |
| FR-0009-03 | La compilación DEBE fallar si una pieza visible no tiene su versión en inglés. | Debe |
| FR-0009-04 | Cada portada DEBE ligar a la otra desde la cabecera y anunciarse con `hreflang` (es-MX, en y x-default), en el `<head>` y en el mapa del sitio. | Debe |
| FR-0009-05 | La página en inglés DEBE declarar `lang="en"`, y los bloques en español dentro de ella, `lang="es"`. | Debe |
| FR-0009-06 | El asistente DEBE mostrar su interfaz en el idioma de la página: saludo, preguntas sugeridas, aviso y errores. Responde en el idioma de la pregunta. | Debe |
| FR-0009-07 | Las fechas DEBEN escribirse en el idioma de la página ("Sep 2024 – present"). | Debe |
| FR-0009-08 | Ninguna traducción agrega logros, cifras ni afirmaciones que no estén en el original. | Debe |

## Cómo sabremos que funcionó

- `/en/` pasa axe sin errores en claro y oscuro, en escritorio y teléfono.
- Lighthouse en `/en/`: 95 o más en rendimiento, accesibilidad, buenas prácticas y SEO.

## Cambios

| Fecha | Cambio |
|---|---|
| 2026-11-27 | Creada, aprobada y hecha con permiso de Edrei para decidir y publicar. |

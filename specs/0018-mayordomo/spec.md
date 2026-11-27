# 0018 · El mayordomo del gabinete

| Campo | Valor |
|---|---|
| Estado | Hecha |
| Fase | F2 |
| Depende de | 0013, 0014, 0015 |
| Creada | 2026-11-27 |

## Por qué

Edrei pidió (2026-11-27) tres cosas:

1. Arreglar un error: al tocar la mesa del explorador, la cámara no se acercaba a ella.
2. Que el asistente se sienta como un chatbot de burbuja.
3. Que su ícono sea un asistente de explorador y que viva en el 3D: un mayordomo tecnológico que
   siempre está ahí.

## Requisitos

| ID | Requisito | Prioridad |
|---|---|---|
| FR-0018-01 | Tocar la mesa del explorador DEBE acercar la cámara a la mesa, con su propia vista. La panorámica del estudio sigue siendo el inicio. | Debe |
| FR-0018-02 | El asistente DEBE abrirse desde una burbuja redonda y flotante, presente en todas las páginas, en las dos vistas y en los dos idiomas. Su ícono es un mayordomo autómata de explorador: bombín, monóculo y pajarita. | Debe |
| FR-0018-03 | En pantallas anchas, el chat DEBE abrirse como una ventana anclada a la burbuja; en el teléfono, como hoja completa. La burbuja alterna entre abrir y cerrar. | Debe |
| FR-0018-04 | Las respuestas DEBEN mostrarse en globos con el avatar del mayordomo, y mientras llega la respuesta, un indicador de "escribiendo". | Debe |
| FR-0018-05 | La primera vez en la visita, un globo breve DEBERÍA invitar a preguntar. Se cierra solo o con un toque, y no vuelve en esa visita. | Debería |
| FR-0018-06 | En el gabinete 3D, un mayordomo autómata de latón DEBE estar junto a la mesa del explorador, siempre visible. Respira, mueve la cabeza y le brillan los ojos; al tocarlo hace una reverencia y abre el chat. Sustituye al teléfono. | Debe |
| FR-0018-07 | Si el servidor del asistente no responde, la burbuja DEBE abrir el chat con el aviso que ofrece el CV y LinkedIn (FR-0015-10). | Debe |
| FR-0018-08 | Con *reducir movimiento*, el mayordomo no se anima y la ventana aparece sin transición. La burbuja, la ventana y los globos cumplen WCAG 2.2 AA. | Debe |
| FR-0018-09 | Las reglas del servidor no cambian: el mayordomo es la cara del asistente, no otra persona. | Debe |

## No-objetivos

- Cambiar las reglas o el modelo del asistente (spec 0015).
- Un personaje que hable con voz o camine por el estudio.

## Cambios

| Fecha | Cambio |
|---|---|
| 2026-11-27 | Creada y aprobada a pedido de Edrei. |
| 2026-11-27 | Hecha. La mesa tiene su vista; el mayordomo vive junto a ella; el chat es de burbuja en español e inglés. axe sin fallas en 12 combinaciones (clásica, inglés en teléfono y 3D; claro y oscuro; con invitación y con el chat abierto). Lighthouse 99 / 100 / 96 / 100. |

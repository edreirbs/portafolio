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
| FR-0018-06 | En el gabinete 3D, un mayordomo autómata DEBE acompañar al visitante. Es un humanoide de metal (latón, cobre y acero pavonado), de proporciones humanas y estética steampunk elegante: rostro esculpido con monóculo y bigote, chistera con gafas, frac, chaleco de damasco, ventanilla con engranes en el pecho y caldera a la espalda. Respira, mira al visitante y le brillan los ojos; al tocarlo hace una reverencia y abre el chat. Sustituye al teléfono. | Debe |
| FR-0018-07 | Si el servidor del asistente no responde, la burbuja DEBE abrir el chat con el aviso que ofrece el CV y LinkedIn (FR-0015-10). | Debe |
| FR-0018-08 | Con *reducir movimiento*, el mayordomo no se anima y la ventana aparece sin transición. La burbuja, la ventana y los globos cumplen WCAG 2.2 AA. | Debe |
| FR-0018-09 | Las reglas del servidor no cambian: el mayordomo es la cara del asistente, no otra persona. | Debe |
| FR-0018-10 | Cuando el visitante se mueve, el mayordomo DEBE caminar hacia donde va, con un paso animado (piernas, brazo libre y faldones), rodeando los muebles. | Debe |
| FR-0018-11 | Cuando el visitante se detiene, el mayordomo DEBE quedarse a su lado, a la orilla izquierda del encuadre y de cuerpo entero, mirándolo. Girar la vista no lo mueve. | Debe |
| FR-0018-12 | NUNCA DEBE quedar atorado ni plantarse frente al visitante: si su lugar ideal no cabe, busca el lugar libre más cercano; en un rincón estrecho, se queda detrás del visitante. | Debe |

## No-objetivos

- Cambiar las reglas o el modelo del asistente (spec 0015).
- Un personaje que hable con voz.

## Cambios

| Fecha | Cambio |
|---|---|
| 2026-11-27 | Creada y aprobada a pedido de Edrei. |
| 2026-11-27 | Hecha. La mesa tiene su vista; el mayordomo vive junto a ella; el chat es de burbuja en español e inglés. axe sin fallas en 12 combinaciones (clásica, inglés en teléfono y 3D; claro y oscuro; con invitación y con el chat abierto). Lighthouse 99 / 100 / 96 / 100. |
| 2026-11-27 | Edrei pidió que el mayordomo lo siga y que sea humanoide, de metal, detallado y elegante. FR-0018-06 cambia; entran FR-0018-10 a 12. Se probó en siete recorridos: llega a su lugar en todos. Con movimiento reducido aparece a tu lado sin caminar. axe sin fallas en el 3D. El 3D pesa 191 KB gzip (presupuesto: 250). |

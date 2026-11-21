# 0013 · Experiencia del gabinete 3D

| Campo | Valor |
|---|---|
| Estado | Hecha |
| Fase | F2 |
| Depende de | 0012 |
| Creada | 2026-11-21 |

## Por qué

Edrei probó el gabinete publicado (2026-11-21) y señaló tres problemas:

1. **No se entiende qué hacer:** casi todo es decoración muda.
2. **Hay mucho texto en pantalla:** placa, índice largo, pista y créditos a la vez.
3. **El arrastre va al revés:** arrastrar a la derecha giraba la mirada a la derecha, así que la
   escena se iba contra la mano.

Pidió además mejorar la experiencia en general.

## Requisitos

| ID | Requisito | Prioridad |
|---|---|---|
| FR-0013-01 | El arrastre DEBE "agarrar el mundo": la escena sigue a la mano, como en un visor de 360°, con inercia que se detiene suave. | Debe |
| FR-0013-02 | **Todo objeto visible del estudio DEBE responder:** muestra su nombre al pasar o tocar, y al elegirlo hace algo (se mueve, cambia la luz, acerca la cámara, abre la biblioteca o abre la cédula de una pieza). | Debe |
| FR-0013-03 | El nombre, la nota y la acción de cada objeto DEBEN venir de `src/content/curiosidades.yaml`, no del código. | Debe |
| FR-0013-04 | Unas **marcas doradas** discretas DEBEN señalar los objetos interactivos que están a la vista. Son botones: se enfocan con teclado y anuncian el nombre del objeto. | Debe |
| FR-0013-05 | **Menos texto:** la placa DEBE plegarse a una etiqueta compacta en cuanto el visitante empieza a explorar, y desplegarse a petición. No se pliega sola: quien la está leyendo no la pierde. El índice completo DEBE vivir detrás de un botón *Mapa*. Abajo solo DEBEN quedar la estación actual, anterior y siguiente. | Debe |
| FR-0013-06 | Una **guía de primera visita** DEBE mostrar, con un dibujo y una línea, cómo mirar y qué tocar. Desaparece con la primera interacción y no vuelve en ese navegador. | Debe |
| FR-0013-07 | Hacer clic o tocar el piso DEBE llevar la cámara hasta ese punto, dentro del salón. | Debe |
| FR-0013-08 | La rueda del ratón o el pellizco DEBEN acercar y alejar la vista. | Debe |
| FR-0013-09 | Fuera del centro DEBE haber un botón *Volver al centro* siempre visible. | Debe |
| FR-0013-10 | Los libros DEBEN abrir la **biblioteca de divulgación**: los 19 artículos de Edrei con liga a cada uno, desde `src/content/articulos.json`. | Debe |
| FR-0013-11 | Elegir una pieza DEBERÍA animar su objeto (la campana se levanta, la medalla gira) además de abrir su cédula. | Debería |

## Criterios de aceptación

- **Dado** el centro del estudio, **cuando** se arrastra hacia la derecha, **entonces** la
  escena se mueve hacia la derecha.
- **Dado** el globo, **cuando** se elige, **entonces** gira y aparece su nota.
- **Dado** el estudio recién abierto, **cuando** el visitante arrastra por primera vez,
  **entonces** la placa se pliega y la guía desaparece.
- **Dado** un clic en el piso, **cuando** la cámara llega, **entonces** está en ese punto y
  sigue dentro del salón.
- **Dado** los libros, **cuando** se eligen, **entonces** se abre la biblioteca con 19 ligas.
- **Dado** un usuario de teclado, **cuando** recorre las marcas con Tab y pulsa Enter,
  **entonces** el objeto hace su acción.

## Cambios

| Fecha | Cambio |
|---|---|
| 2026-11-21 | Creada a partir de la prueba de Edrei del gabinete publicado. |
| 2026-11-21 | FR-0013-05: la placa ya no se pliega sola a los 8 s; solo al empezar a explorar. |
| 2026-11-21 | Implementada. Pruebas: 24 de 24 de comportamiento; axe sin violaciones en inicio, mapa, cédula y biblioteca, en tema claro y oscuro; respaldo sin WebGL. |

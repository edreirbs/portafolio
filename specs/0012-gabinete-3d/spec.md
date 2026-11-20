# 0012 · El gabinete en 3D

| Campo | Valor |
|---|---|
| Estado | Hecha (prototipo en `/explorar/`) |
| Fase | F2 |
| Depende de | 0000 (art. I, V, VI enmendados), 0001, 0002 |
| Plan | [plan.md](plan.md) · [tasks.md](tasks.md) · [créditos](../../docs/creditos.md) |
| Creada | 2026-11-20 |

## Por qué

Edrei pidió (2026-11-20) que el gabinete **se vea y se recorra**: un pequeño mundo en 3D que
el visitante explora libremente, eligiendo qué pieza mirar, con el aire de los gabinetes de
curiosidades de los exploradores del siglo XIX.

Es la diferencia entre *contar* que Edrei es curioso y *dejar que lo compruebes*. Ningún
portafolio de un directivo de educación se parece a esto, y esa sorpresa es el gancho.

## La escena

El **estudio de un explorador**: un salón de madera oscura con muros verde botella,
alfombra, vigas, candelabro y lámparas de aceite. Cada sala del gabinete es una **estación**
con su mueble, sus objetos y una placa de latón.

| Estación | Mueble | Objetos |
|---|---|---|
| Artificialia | Alacena victoriana con vitrina | La mosca bajo campana de cristal · reloj de bolsillo (Tracky) · pila de periódicos (Content Agents) |
| Naturalia | Gabinete gótico | Diplomas enmarcados, libros |
| Mirabilia | Baúl de explorador | Medalla sobre cojín de terciopelo |
| Theatrum | Pedestal | Busto de mármol |
| Scientifica | Cajonera de boticario | Microscopio, brújula, binoculares |
| Exotica | Mesa auxiliar | Concha *Lambis*, ballena de bronce, porcelana |
| Centro | Mesa del explorador | Globo terráqueo, mapa, lámpara de aceite, sillón |

## Historias

- Como **visitante**, quiero recorrer el estudio y acercarme a lo que me llame la atención,
  para descubrir a Edrei a mi ritmo.
- Como **headhunter**, quiero ver nombre, título y contacto desde el primer segundo, y salir
  a la ficha rápida cuando quiera, sin perderme en el mundo 3D.
- Como **persona con teléfono o sin WebGL**, quiero el gabinete en 2D, completo y rápido.

## Requisitos

| ID | Requisito | Prioridad |
|---|---|---|
| FR-0012-01 | DEBE existir una escena 3D del estudio con las seis estaciones y el centro. | Debe |
| FR-0012-02 | El visitante DEBE poder mirar alrededor arrastrando (ratón o dedo) y con las flechas del teclado. | Debe |
| FR-0012-03 | Al elegir una estación (clic en el mueble o en el índice), la cámara DEBE viajar hasta ella. | Debe |
| FR-0012-04 | Al elegir un objeto que representa una pieza, DEBE abrirse su cédula con título, resumen, evidencias y liga a su vitrina. | Debe |
| FR-0012-05 | Las estaciones sin piezas DEBEN decir "En montaje" en su placa. | Debe |
| FR-0012-06 | Una **placa permanente** DEBE mostrar nombre, título, promesa, *Ficha rápida* y *CV* desde el primer pintado (constitución, art. I). | Debe |
| FR-0012-07 | Un **índice de estaciones** en HTML DEBE permitir recorrer todo con teclado y lector de pantalla. | Debe |
| FR-0012-08 | Qué objeto representa cada pieza DEBE venir del archivo de la pieza (campo `objeto`), no del código. | Debe |
| FR-0012-09 | Sin WebGL, con `prefers-reduced-data` o si el 3D no carga en 10 segundos, DEBE mostrarse el gabinete 2D. | Debe |
| FR-0012-10 | Con `prefers-reduced-motion`, los viajes de cámara DEBEN ser cortes, sin animación. | Debe |
| FR-0012-11 | Los modelos y texturas DEBEN ser originales o de dominio público (CC0), con créditos visibles. | Debe |
| FR-0012-12 | La escena DEBERÍA cargar por partes: primero el salón, luego los muebles, luego los objetos. | Debería |
| FR-0012-13 | Caminar libremente (teclas WASD) PODRÍA agregarse después. | Podría |

## Criterios de aceptación

- **Dado** un navegador con WebGL, **cuando** se abre el gabinete, **entonces** el nombre y
  el título se leen antes de que termine de cargar la escena.
- **Dado** el índice de estaciones, **cuando** se elige *Artificialia* con el teclado,
  **entonces** la cámara viaja a la alacena y el foco pasa a sus piezas.
- **Dado** un clic en la campana de cristal, **cuando** se abre la cédula, **entonces** dice
  *Mátala si puedes* y liga a `/piezas/matala-si-puedes/`.
- **Dado** un navegador sin WebGL, **cuando** se abre el gabinete, **entonces** se ve la
  versión 2D sin errores.

## No-objetivos

- Multijugador, avatares o física.
- Fotorrealismo a costa del peso: la escena tiene presupuesto (art. V).

## Preguntas abiertas

- ¿El gabinete 3D pasa a ser la portada? Propuesta: sí, en cuanto Edrei vea el prototipo en
  `/explorar/` y lo apruebe.

## Cambios

| Fecha | Cambio |
|---|---|
| 2026-11-20 | Creada a partir de la petición de Edrei. |
| 2026-11-20 | Implementada y publicada en `/explorar/`; la portada clásica lleva a ella. |

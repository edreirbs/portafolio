# 0014 · Plan técnico

## Una página, dos vistas

- `src/pages/index.astro` pinta la versión clásica completa (portada y seis secciones) y monta
  encima `Gabinete3D.astro` en el slot `capa` del layout.
- Un script en línea en `<head>` decide la vista antes de pintar (`html[data-vista]`):
  `?vista=` o la elección guardada mandan; si no hay elección, el 3D solo se abre con WebGL por
  hardware (sin `failIfMajorPerformanceCaveat`, sin SwiftShader ni llvmpipe), sin ahorro de datos
  y con al menos 2 GB de memoria.
- En `data-vista="3d"` la cabecera, la portada y el pie se ocultan, y cada `section.sp` se vuelve
  un panel fijo que se abre con `data-abierta`. El HTML es el mismo: lo que lee el buscador, el
  lector de pantalla y el visitante sin JavaScript.
- three.js se importa de forma dinámica solo en la vista 3D: la vista clásica no lo descarga.

## Datos

- `src/lib/secciones.ts`: nombres, orden y `seccionDe(pieza)` (sala → sección).
- `src/lib/portafolio.ts`: perfil, piezas por sección, registro ordenado, artículos y secciones
  visibles. Lo usan la portada, el gabinete y, en la spec 0015, el conocimiento del asistente.

## Gabinete

- Estaciones por sección; los atriles se generan solo para secciones visibles.
- Muebles nuevos en código: `correspondencia` (sobres lacrados por red) y `bitacora` (atril con
  la trayectoria). La medalla pasa a la consola de los diplomas; la revista y los libros, al baúl.
- Con un panel abierto, `camera.setViewOffset` corre la escena a la izquierda para que el mueble
  quede a la vista.
- `/explorar/` y las salas viejas son páginas de redirección (`Redireccion.astro`).

# Plan técnico · Gabinete 3D

Sigue el [ADR-0002](../../docs/adr/0002-gabinete-3d-threejs.md).

| Tema | Decisión |
|---|---|
| Motor | Three.js como módulo cargado después del primer pintado, solo en `/explorar/`. |
| Modelos | Poly Haven (CC0) optimizados con glTF Transform: texturas WebP de 512 a 1024 px, geometría *meshopt*. En `public/gabinete/modelos/`. |
| Objetos propios | Campana con la mosca, periódicos, globo, mapa, diplomas y medalla, modelados en código con texturas dibujadas en *canvas* (sin descargas). |
| Luz | Tono fílmico ACES, luces cálidas de lámpara, un mapa de entorno procedural para reflejos del latón y el vidrio. |
| Navegación | Cámara con mirada libre (arrastre o flechas) y viajes animados entre estaciones. |
| Interfaz | HTML encima del lienzo: placa, índice de estaciones, cédula y créditos. Todo operable con teclado. |
| Datos | La página incrusta un JSON con las piezas visibles (título, resumen, evidencias, objeto). |
| Respaldo | Si no hay WebGL o el 3D falla, se muestra el gabinete 2D. |
| Presupuesto | JS de la escena ≤ 250 KB gzip; modelos y texturas ≤ 5 MB, cargados por partes. |

# Tareas · Gabinete 3D

| # | Tarea | Requisitos | Estado |
|---|---|---|---|
| T01 | Modelos CC0 de Poly Haven optimizados (21 modelos, 4.3 MB) | FR-0012-11 | ☑ |
| T02 | Texturas de piso y lambrín (180 KB) y texturas dibujadas en código | FR-0012-11 | ☑ |
| T03 | Salón: muros, lambrín, vigas, alfombra, luces de lámpara | FR-0012-01 | ☑ |
| T04 | Objetos propios: campana con mosca, periódicos, globo, carta, diplomas, revista, medalla | FR-0012-01, 08 | ☑ |
| T05 | Seis estaciones con atril y placa; "En montaje" donde no hay piezas | FR-0012-01, 05 | ☑ |
| T06 | Mirada libre (arrastre y flechas) y viajes entre estaciones | FR-0012-02, 03 | ☑ |
| T07 | Cédula al elegir una pieza, con liga a su vitrina | FR-0012-04 | ☑ |
| T08 | Placa permanente con nombre, título, promesa, pruebas y accesos | FR-0012-06 | ☑ |
| T09 | Índice de estaciones y piezas operable con teclado | FR-0012-07 | ☑ |
| T10 | Campo `objeto` en la cédula | FR-0012-08 | ☑ |
| T11 | Respaldo 2D sin WebGL, con ahorro de datos o si tarda | FR-0012-09 | ☑ |
| T12 | Cortes de cámara con movimiento reducido | FR-0012-10 | ☑ |
| T13 | Carga por partes: el salón se ve mientras llegan los muebles | FR-0012-12 | ☑ |
| T14 | Caminar con WASD | FR-0012-13 | ☐ (futuro) |

## Medición (2026-11-20)

| Concepto | Resultado | Presupuesto |
|---|---|---|
| JavaScript de la escena | 172 KB gzip | ≤ 250 KB |
| Modelos y texturas | 4.5 MB | ≤ 5 MB |
| Accesibilidad (axe 4.13, claro y oscuro) | 0 violaciones | 0 |
| Pruebas de comportamiento | 10 de 10 (clic real en la campana, teclado, Escape, respaldo sin WebGL) | — |
| Portada clásica tras agregar la entrada al 3D | Lighthouse 100/100/100/100, LCP 1.7 s | ≥ 95, ≤ 2.0 s |

El puntaje de rendimiento de Lighthouse para la página 3D no se reporta: el entorno de
medición no tiene GPU y emula WebGL en el procesador, lo que vuelve inútil la cifra. Hay que
medirlo en un dispositivo real antes del lanzamiento (spec 0011).

# Tareas · Fase 1

| # | Tarea | Requisitos | Estado |
|---|---|---|---|
| T01 | Proyecto Astro con TypeScript estricto, `base` y `site` | ADR-0001 | ☑ |
| T02 | Esquema de la cédula en `content.config.ts` (piezas, perfil, registro) | FR-0002-01 a 08 | ☑ |
| T03 | Tokens de diseño, tipografías propias, temas claro y oscuro | FR-0001-42 | ☑ |
| T04 | Layout base: cabecera, menú textual, pie con fecha | FR-0001-04, FR-0004-06 | ☑ |
| T05 | Interruptor Ficha rápida con memoria y respaldo sin JavaScript | FR-0003-01, 02, 05 | ☑ |
| T06 | Contenido: perfil y trayectoria | FR-0004-02, FR-0003-03 | ☑ |
| T07 | Contenido: las 3 piezas de la F1 con capturas | FR-0005-05, 06 | ☑ |
| T08 | Vestíbulo: título, promesa, pruebas y acciones | FR-0004-01 | ☑ |
| T09 | Vitrina principal y plano del gabinete | FR-0004-03, 04 | ☑ |
| T10 | Ejemplar vivo bajo demanda | FR-0004-05 | ☑ |
| T11 | Sala Artificialia | FR-0005-01 | ☑ |
| T12 | Vitrina de pieza con evidencias y relacionadas | FR-0005-02 a 04 | ☑ |
| T13 | `/cv` imprimible | FR-0003-03, 04, 07 | ☑ |
| T14 | Página 404 | — | ☑ |
| T15 | Movimiento reducido y foco visible | FR-0001-41, FR-0001-04 | ☑ |
| T16 | `ci.yml`: check, build, ligas | Constitución, art. V | ☑ |
| T17 | `deploy.yml`: publicación en Pages | ADR-0001 | ☑ |
| T18 | Medición: Lighthouse, axe, peso de JavaScript, prueba en 375 × 667 | FR-0004-07 | ☑ |

## Medición final (2026-11-20)

| Página | Rendimiento | Accesibilidad | Buenas prácticas | SEO | LCP |
|---|---|---|---|---|---|
| Vestíbulo | 99 | 100 | 100 | 100 | 2.0 s |
| Artificialia | 99 | 100 | 100 | 100 | 2.0 s |
| Mátala si puedes | 99 | 100 | 100 | 100 | 2.0 s |
| Maestría | 100 | 100 | 100 | 100 | 1.7 s |
| CV | 100 | 100 | 100 | 100 | 1.7 s |

Lighthouse 13.5 en móvil (4G simulado). axe 4.13: cero violaciones WCAG 2.2 AA en 10 páginas,
tema claro y oscuro. JavaScript externo: 0 KB (solo tres scripts en línea de menos de 1 KB).
Peso total del Vestíbulo: 197 KB.

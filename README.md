# Portafolio · Gabinete de curiosidades

El portafolio profesional de Edrei Robles, pensado como una *Wunderkammer* contemporánea:
cada proyecto, certificación, curso o estudio es una **pieza catalogada** con su cédula
museográfica, en una sala que le corresponde. Un sitio que se recorre con curiosidad y que,
aun así, un reclutador entiende en diez segundos.

**Estado:** publicado en **https://portafolio.edreirobles.com/**. La portada es el gabinete
3D con las secciones del portafolio (proyectos, títulos, experiencia, publicaciones y redes); si
el navegador no puede con el 3D, la misma página se ve en su versión clásica.

## Cómo trabajamos (spec-driven development)

```
Edrei da una spec ──▶ spec formal ──▶ plan técnico ──▶ tareas ──▶ código en rama ──▶ PR ──▶ main ──▶ GitHub Pages
  (por chat, en       specs/NNNN/     plan.md         tasks.md                      (Claude
   lenguaje natural)  spec.md                                                    fusiona)
```

1. **Tú** describes lo que quieres, como te salga: "quiero que las certificaciones tengan un sello".
2. **Claude** lo convierte en requisitos numerados (`FR-…`) con criterios de aceptación, en
   `specs/`. Lo ambiguo queda marcado como `[NECESITA ACLARACIÓN]` y se pregunta.
3. Con la spec aprobada se escribe el plan técnico y la lista de tareas.
4. Se construye en una rama, se abre un Pull Request que cita los requisitos que cumple y
   se fusiona a `main`. GitHub Actions publica.

Nada se programa sin spec. Toda pieza que se muestra tiene evidencia.

## Mapa del repositorio

| Ruta | Qué es |
|---|---|
| `CLAUDE.md` | Reglas de la casa para agentes y humanos. Punto de entrada. |
| `specs/README.md` | El proceso, el backlog de specs y las decisiones pendientes. |
| `specs/0000-constitucion.md` | Los principios no negociables del portafolio. |
| `specs/0001-gabinete/` | El concepto: salas, recorrido, modo reclutador, dirección visual. |
| `specs/0002-modelo-de-contenido/` | La cédula: qué datos tiene cada pieza y cómo se valida. |
| `docs/adr/` | Decisiones de arquitectura (stack, gabinete 3D, asistente). |
| `src/content/` | **El contenido**: perfil, trayectoria y una pieza por archivo. |
| `src/` (resto) | El sitio en Astro: páginas, componentes y estilos. |
| `src/lib/secciones.ts` | Las secciones de la portada y qué sala del catálogo va en cada una. |
| `src/gabinete/` | El gabinete 3D en Three.js: escena, objetos propios y texturas dibujadas en código. |
| `src/asistente/`, `asistente/` | El asistente: la conversación en el navegador y su servidor en Netlify ([spec 0015](specs/0015-asistente/spec.md)). |
| `public/gabinete/` | Modelos y texturas CC0 optimizados ([créditos](docs/creditos.md)). |
| `contenido/curaduria.md` | **Lista maestra**: todo lo que se exhibe, por sala, con evidencia y estado. |
| `contenido/inventario.md` | Inventario de repos con sala y veredicto de curaduría. |
| `contenido/intake.md` | Lo que Claude necesita de ti, por prioridad. |

## Fases

| Fase | Entrega | Estado |
|---|---|---|
| **F0 · Fundación** | Constitución, concepto, modelo de contenido, inventario, intake | ● hecha |
| **F1 · Rebanada vertical** | Stack + despliegue + Vestíbulo + Sala de proyectos con 3 piezas reales + Ficha rápida, **publicado** | ● hecha |
| **F2 · Colección completa** | Todas las salas, certificaciones, estudios, docencia, trayectoria | ○ |
| **F3 · Pulido** | Microinteracciones, imágenes OG por pieza, inglés, CV en PDF generado | ○ |
| **F4 · Lanzamiento** | Dominio, auditoría Lighthouse y accesibilidad, analítica, anuncio | ○ |

## Agregar una pieza (cinco minutos)

1. Copia una pieza parecida de `src/content/piezas/<sala>/` y renómbrala: el nombre del
   archivo es su dirección (`tracky.md` → `/piezas/tracky/`).
2. Llena la cédula: número de catálogo, título, fecha, procedencia y **al menos una
   evidencia**. El esquema completo está en `src/content.config.ts` (spec 0002).
3. Abre un PR. Si falta un dato, la compilación falla y dice qué archivo y qué campo.
4. Al fusionar a `main`, el sitio se publica solo. La pieza aparece en su sala, en el plano,
   en la vitrina (si es `destacada: true`) y en el CV.

## Desarrollo

Requiere Node 22.

```bash
npm ci
```

```bash
npm run dev
```

```bash
npm run verifica
```

`verifica` corre lo mismo que la integración continua: tipos y esquema de contenido,
compilación y revisión de ligas internas.

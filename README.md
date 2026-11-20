# Portafolio · Gabinete de curiosidades

El portafolio profesional de Edrei Robles, pensado como una *Wunderkammer* contemporánea:
cada proyecto, certificación, curso o estudio es una **pieza catalogada** con su cédula
museográfica, en una sala que le corresponde. Un sitio que se recorre con curiosidad y que,
aun así, un reclutador entiende en diez segundos.

**Estado:** Fase 0 · Fundación. El sitio todavía no está publicado.

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
| `docs/adr/` | Decisiones de arquitectura (stack, despliegue). |
| `contenido/inventario.md` | Inventario de repos con sala y veredicto de curaduría. |
| `contenido/intake.md` | Lo que Claude necesita de ti, por prioridad. |

## Fases

| Fase | Entrega | Estado |
|---|---|---|
| **F0 · Fundación** | Constitución, concepto, modelo de contenido, inventario, intake | ◐ en curso |
| **F1 · Rebanada vertical** | Stack + despliegue + Vestíbulo + Sala de proyectos con 3 piezas reales + Ficha rápida, **publicado** | ○ |
| **F2 · Colección completa** | Todas las salas, certificaciones, estudios, docencia, trayectoria | ○ |
| **F3 · Pulido** | Microinteracciones, imágenes OG por pieza, inglés, CV en PDF generado | ○ |
| **F4 · Lanzamiento** | Dominio, auditoría Lighthouse y accesibilidad, analítica, anuncio | ○ |

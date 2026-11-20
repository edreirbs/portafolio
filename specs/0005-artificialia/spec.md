# 0005 · Sala Artificialia

| Campo | Valor |
|---|---|
| Estado | Hecha |
| Fase | F1 |
| Depende de | 0001 (FR-0001-20 a 24), 0002, `contenido/inventario.md`, D-10 |
| Plan | [0004/plan.md](../0004-vestibulo/plan.md) |
| Creada | 2026-11-20 |

## Por qué

Un comité directivo quiere ver criterio, no solo código: qué problema se eligió, qué se
decidió y qué resultó. Artificialia exhibe los proyectos con ese formato, y es la primera
sala que se abre al público.

## Requisitos

| ID | Requisito | Prioridad |
|---|---|---|
| FR-0005-01 | `/artificialia` DEBE listar las piezas de la sala como cédulas: número de catálogo, nombre, subtítulo, año, materiales y una imagen. | Debe |
| FR-0005-02 | Cada pieza DEBE tener su vitrina en `/piezas/<slug>` con la cédula completa y las secciones *El problema*, *Lo que hice*, *Cómo está hecho* y *Qué resultó*. | Debe |
| FR-0005-03 | Las evidencias DEBEN ser botones claros: *Ver en vivo*, *Ver código*. | Debe |
| FR-0005-04 | Cada vitrina DEBERÍA enlazar a dos piezas relacionadas. | Debería |
| FR-0005-05 | Las imágenes DEBEN ser capturas reales de cada proyecto o, sin demo, un diagrama de su arquitectura. Todas con texto alternativo. | Debe |
| FR-0005-06 | Todo dato de una pieza DEBE poder rastrearse a su repositorio o a su demo. Nada de cifras inventadas. | Debe |

## Piezas de la F1

| Catálogo | Pieza | Evidencia |
|---|---|---|
| AF-2026-001 | *Mátala si puedes*: una mosca que aprende de ti | Demo en vivo · código |
| AF-2026-002 | Tracky | Código |
| AF-2026-003 | Content Agents | Demo en vivo · código |

El resto de las piezas de `inventario.md` y `curaduria.md` entra en la F2.

## Criterios de aceptación

- **Dado** el archivo de una pieza sin evidencia, **cuando** se compila, **entonces** la
  compilación falla y dice qué archivo y qué campo.
- **Dado** `/piezas/tracky`, **cuando** se abre, **entonces** se ven las cuatro secciones y
  el botón *Ver código* lleva al repositorio.

## Cambios

| Fecha | Cambio |
|---|---|
| 2026-11-20 | Creada. |
| 2026-11-20 | Aprobada por Edrei e implementada en la F1. |

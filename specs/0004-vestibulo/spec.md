# 0004 · Vestíbulo

| Campo | Valor |
|---|---|
| Estado | Hecha |
| Fase | F1 |
| Depende de | 0000, 0001 (FR-0001-10 a 12), D-1, D-6, D-7 |
| Plan | [plan.md](plan.md) · [tasks.md](tasks.md) |
| Creada | 2026-11-20 |

## Por qué

El Vestíbulo decide si el visitante se queda. Tiene que decir en diez segundos quién es
Edrei y para qué puesto, y después invitar a recorrer el gabinete.

## Requisitos

| ID | Requisito | Prioridad |
|---|---|---|
| FR-0004-01 | Sin desplazarse, en un teléfono de 375 × 667 y en escritorio, DEBEN verse: el título **Estratega de IA para el aprendizaje**, el nombre, la promesa, la línea de pruebas y tres acciones: *Recorrer el gabinete*, *Ficha rápida* y *Contactar*. | Debe |
| FR-0004-02 | El título, la promesa y las pruebas DEBEN salir del archivo de perfil en `src/content/`, no del código. | Debe |
| FR-0004-03 | Debajo DEBE estar la **vitrina principal**: hasta seis piezas destacadas, cada una con número de catálogo, nombre, subtítulo y sala. | Debe |
| FR-0004-04 | DEBE existir el **plano del gabinete**: las salas con su número de piezas. Las salas aún vacías se muestran como *En montaje*, sin liga. | Debe |
| FR-0004-05 | El **ejemplar vivo** DEBERÍA ser la mosca de *Mátala si puedes*: primero una imagen fija con el botón *Despertar al ejemplar*; la simulación solo se carga al pulsarlo. | Debería |
| FR-0004-06 | El pie DEBE mostrar la fecha de la última actualización del sitio. | Debe |
| FR-0004-07 | La página DEBE cumplir los presupuestos del artículo V de la constitución. | Debe |

## Criterios de aceptación

- **Dado** un teléfono de 375 × 667, **cuando** carga la página, **entonces** el título,
  el nombre, la promesa, las pruebas y las tres acciones se ven sin desplazarse.
- **Dado** que nadie pulsa *Despertar al ejemplar*, **cuando** se mide la carga,
  **entonces** la simulación de la mosca no se descargó.
- **Dado** que una pieza cambia a `destacada: true`, **cuando** se publica, **entonces**
  aparece en la vitrina principal.

## No-objetivos

- Retrato. Llega cuando se decida D-6; mientras tanto, un monograma tipográfico.

## Preguntas abiertas

- **D-7:** se construyó con la mosca como ejemplar vivo; se cambia editando el campo `ejemplar` de otra pieza.

## Cambios

| Fecha | Cambio |
|---|---|
| 2026-11-20 | Creada. |
| 2026-11-20 | Aprobada por Edrei e implementada en la F1. |

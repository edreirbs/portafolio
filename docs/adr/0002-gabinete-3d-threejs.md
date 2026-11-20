# ADR-0002 · Gabinete 3D con Three.js y modelos CC0

| Campo | Valor |
|---|---|
| Estado | Aceptada |
| Fecha | 2026-11-20 |
| Specs | 0012, constitución art. V y VI |

## Contexto

Edrei pidió que el gabinete sea un mundo 3D navegable con estética de explorador del siglo
XIX. El sitio ya es estático en Astro y tiene presupuestos de rendimiento estrictos.

## Decisión

- **Three.js**, cargado como isla solo en la página del gabinete 3D y después del primer
  pintado. Es el motor que Edrei ya usa en *Mátala si puedes*.
- **Modelos de Poly Haven** (CC0) optimizados con glTF Transform; los objetos que
  representan piezas propias se modelan en código para que sean únicos.
- **Navegación por estaciones** con mirada libre, en lugar de caminar en primera persona:
  funciona igual con ratón, dedo y teclado, y no marea.
- **El 2D se queda** como respaldo, ficha rápida, CV y versión que indexan los buscadores.

## Alternativas descartadas

| Opción | Por qué no |
|---|---|
| React Three Fiber | Agrega React solo para la escena; más peso sin beneficio aquí. |
| Babylon.js | Más pesado; el equipo ya conoce Three.js. |
| Spline o editores visuales | Escena cerrada fuera del repo y difícil de alimentar con el contenido. |
| Caminar con WASD | Excluye a móvil y a teclado; se deja como mejora futura. |

## Consecuencias

- La página del gabinete 3D tiene su propio presupuesto de peso (art. V).
- Cada pieza nueva puede tener un objeto en la escena con el campo `objeto` de su cédula.

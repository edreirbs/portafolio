# 0016 · Proyectos al centro: todos los que valen la pena, sin adornos

| Campo | Valor |
|---|---|
| Estado | Hecha |
| Fase | F2 |
| Depende de | 0002, 0005, 0014 |
| Creada | 2026-11-27 |

## Por qué

Edrei pidió (2026-11-27) que el portafolio muestre **todos sus proyectos que valgan la pena**,
revisando a fondo su GitHub, y que el gabinete no tenga objetos ni información que no sirvan para
mostrarlos: "no quiero objetos nada más porque estén ahí".

## Requisitos

| ID | Requisito | Prioridad |
|---|---|---|
| FR-0016-01 | *Proyectos* DEBE incluir cada proyecto público, personal y con algo que mostrar (demo, código o material), con su evidencia. | Debe |
| FR-0016-02 | NO se exhiben: repos institucionales del empleo actual, forks, plantillas sin contenido propio, utilidades menores, repos con datos de otras personas ni repos privados sin permiso de Edrei. Los dudosos se le preguntan. | Debe |
| FR-0016-03 | El gabinete 3D NO DEBE tener objetos de adorno: cada objeto visible sostiene un proyecto, una sección o el asistente. Las notas de los adornos se quitan. | Debe |
| FR-0016-04 | Cada proyecto DEBE tener su lugar en el 3D: los de la alacena como objetos, y los demás como cuadros con su captura y su placa en el muro de la alacena, de modo que los proyectos se vean juntos desde *Proyectos*. | Debe |
| FR-0016-05 | Tocar un cuadro o pulsar *Mirar en el gabinete* DEBE llevar la cámara de frente al cuadro y abrir su cédula. | Debe |

## Curaduría (2026-11-27)

| Repo | Veredicto |
|---|---|
| `entrenamiento-redes-neuronales`, `tracky`, `conten-agents` | Ya exhibidos. |
| `second-brain` | **Nuevo:** *Cerebro*. |
| `claude-for-business` | **Nuevo:** curso y cuadernillo. |
| `plantilla-*-s7`, `junta-atn`, `registro-junta`, `comprobador-s7`, `ejemplo-s7-edrei`, `s7-demo-edrei` | **Nuevo:** una sola pieza, *Kit de práctica: Claude Code en la nube*. |
| `DCL`, `teorema-limite-central`, `nobel-fisica-2023` | **Nuevo:** una sola pieza, *Simulaciones para enseñar física*. |
| `lexi` (privado) | **Nuevo:** *Lexi*, con la app en línea como evidencia y sin código. |
| *Radar Laboral* (app publicada en su Netlify) | **Nuevo:** con la app en línea como evidencia. |
| *De 0 a 100 con Claude gratis* (página publicada en su Netlify) | **Nuevo** en Experiencia, como taller propio. |
| `mapa-red-funciones-ia` | Fuera: no se puede descartar que sea institucional. |
| `entrevista`, `cerebro-CREA` | Fuera: son de otro equipo y otra organización. |
| `mda`, `herramientas-vertical`, `herramientas_horizontal` | Fuera: institucionales. |
| `gym-app` | Fuera: trae datos de otra persona. |
| `qr`, `graph`, `chatbot-amira`, `cv-nao`, `editor-texto-linkedin`, `link-whisper-edreirobles`, `mas`, `simulacion-mas` | Fuera: utilidades menores, plantillas o repos sin contenido. |
| Forks y `portafolio` | Fuera. |
| Demás repos privados | Fuera: notas personales, facturación ligada al empleo, pruebas o material ya cubierto por el kit. |

## Cómo sabremos que funcionó

- Desde *Proyectos* en el 3D se ven los siete proyectos a la vez: tres en la alacena y cuatro
  cuadros a sus lados.
- Ningún objeto del gabinete es solo decoración.
- axe sin errores y Lighthouse móvil ≥ 95 en la vista clásica.

## Cambios

| Fecha | Cambio |
|---|---|
| 2026-11-27 | Creada y hecha a pedido de Edrei. Se quitan 16 modelos de adorno: los modelos del 3D bajan de 4.3 MB a 1.4 MB. |
| 2026-11-27 | Edrei delegó todas las decisiones. Entran *Lexi*, *Radar Laboral* y el taller *De 0 a 100 con Claude gratis*; los dudosos quedan fuera. Los seis cuadros van en una sola fila para que los nueve proyectos se vean juntos. |

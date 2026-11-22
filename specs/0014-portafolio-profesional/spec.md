# 0014 · Portafolio profesional dentro del gabinete

| Campo | Valor |
|---|---|
| Estado | Hecha |
| Fase | F2 |
| Depende de | 0002, 0012, 0013 |
| Creada | 2026-11-22 |

## Por qué

Edrei pidió (2026-11-21) que el sitio sea un portafolio profesional con lo que tiene todo
portafolio: **proyectos, títulos y diplomas, experiencia relevante y redes sociales**. Las
salas con nombres en latín (Artificialia, Naturalia…) dan carácter, pero un reclutador no
sabe dónde buscar.

También decidió que **el gabinete 3D sigue siendo la portada** (cierra D-11). Las secciones
profesionales viven dentro del 3D, con nombres claros, y la versión clásica queda como
respaldo para quien no puede o no quiere ver el 3D.

## Historias

- Como **reclutador**, quiero ver en segundos las secciones de siempre (proyectos, formación,
  experiencia, contacto) para evaluar a Edrei sin aprender a usar el gabinete.
- Como **visitante curioso**, quiero recorrer el estudio en 3D y que cada mueble me lleve a una
  parte del portafolio.
- Como **visitante con un teléfono modesto o sin WebGL**, quiero el mismo contenido en una
  página clásica que cargue rápido.

## Secciones

| Sección | Contenido | Mueble en el 3D |
|---|---|---|
| Proyectos | Piezas de Artificialia y Exotica | Alacena victoriana (al fondo) |
| Títulos y diplomas | Grados de Naturalia y distinciones de Mirabilia | Pared de diplomas y consola (izquierda) |
| Certificaciones y cursos | Piezas de Scientifica con liga de verificación | Cajonera de instrumentos (derecha) |
| Experiencia | El Registro completo y las conferencias de Theatrum | Bitácora sobre un atril (izquierda, al frente) |
| Publicaciones | Artículos académicos de Naturalia y los artículos de divulgación | Baúl con revista y libros (derecha, al fondo) |
| Redes y contacto | LinkedIn, GitHub, YouTube, X, sitio web y CV | Correspondencia sobre la mesa central |

## Requisitos

| ID | Requisito | Prioridad |
|---|---|---|
| FR-0014-01 | La portada (`/`) DEBE ser el gabinete 3D cuando el navegador puede mostrarlo bien (WebGL sin advertencia de bajo rendimiento y sin ahorro de datos), y la versión clásica en otro caso. | Debe |
| FR-0014-02 | El contenido DEBE organizarse en las seis secciones de la tabla, con esos nombres. Una sección sin piezas con evidencia NO DEBE aparecer. | Debe |
| FR-0014-03 | En el 3D, un **menú de secciones** DEBE estar siempre a la vista (barra arriba en pantallas anchas, botón *Secciones* abajo en el teléfono). Elegir una sección DEBE llevar la cámara a su mueble y abrir su panel. | Debe |
| FR-0014-04 | El panel de cada sección DEBE listar todo su contenido con su evidencia, sin tener que encontrar los objetos. Una pieza del panel DEBERÍA poder señalarse en la escena (*Mirar en el gabinete*). | Debe |
| FR-0014-05 | Cada sección DEBE tener su mueble en el 3D (tabla de arriba), con placa de latón y marca dorada. Tocar el mueble DEBE abrir su panel. | Debe |
| FR-0014-06 | La **versión clásica** DEBE ser la misma página (`/`), con las mismas secciones en orden, legible sin JavaScript. Un interruptor DEBE pasar de una vista a la otra y recordar la elección. | Debe |
| FR-0014-07 | *Redes y contacto* DEBE mostrar LinkedIn, GitHub, YouTube, X y el sitio web de Edrei, más el CV. Las mismas redes DEBEN estar en el pie de la versión clásica. | Debe |
| FR-0014-08 | *Experiencia* DEBE mostrar los nueve registros en línea de tiempo, del más reciente al más antiguo. El empleo actual DEBE mostrar solo puesto, institución, fechas y su frase de alcance (constitución, art. VIII). | Debe |
| FR-0014-09 | Las direcciones viejas (`/explorar/` y las salas) DEBEN llevar a su sección en la portada. Las páginas de pieza y el CV se quedan. | Debe |
| FR-0014-10 | Un enlace a `/#seccion` DEBE abrir esa sección, en cualquiera de las dos vistas. | Debe |
| FR-0014-11 | En la versión clásica se DEBEN cumplir los presupuestos de la constitución (Lighthouse ≥ 95 en móvil, LCP ≤ 2.0 s, JS inicial ≤ 60 KB). El 3D carga después del primer pintado y respeta su propio presupuesto (JS ≤ 250 KB, modelos ≤ 5 MB). | Debe |

## Criterios de aceptación

- **Dado** un navegador con WebGL, **cuando** se abre `/`, **entonces** aparece el estudio en
  3D con el menú de secciones visible.
- **Dado** el 3D, **cuando** se elige *Experiencia*, **entonces** la cámara viaja a la bitácora y
  se abre un panel con los nueve registros.
- **Dado** un navegador sin WebGL o con JavaScript apagado, **cuando** se abre `/`, **entonces**
  se leen las seis secciones en una sola página.
- **Dado** el 3D, **cuando** se pulsa *Vista clásica*, **entonces** se ve la versión clásica y
  así se queda en las siguientes visitas, hasta pulsar *Ver en 3D*.
- **Dado** `/artificialia/`, **cuando** se abre, **entonces** lleva a `/#proyectos`.

## No-objetivos

- Contenido nuevo: las certificaciones siguen esperando sus ligas de verificación y las
  conferencias sus constancias.
- El asistente (spec 0015).

## Cómo sabremos que funcionó

- Prueba automática: cada sección se abre desde el menú en el 3D y desde `/#seccion`.
- Lighthouse en móvil ≥ 95 en la versión clásica; sin errores de axe en las dos vistas.

## Cambios

| Fecha | Cambio |
|---|---|
| 2026-11-22 | Creada a partir del pedido de Edrei del 2026-11-21. Aprobada en el chat ("1 si", "5 sigue siendo principal"). |
| 2026-11-22 | Hecha y publicada (PR 8). La vista automática también descarta el WebGL por software (SwiftShader, llvmpipe) y los equipos con menos de 2 GB de memoria. |

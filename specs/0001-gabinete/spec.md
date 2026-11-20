# 0001 · El Gabinete: concepto y experiencia

| Campo | Valor |
|---|---|
| Estado | En aclaración |
| Fase | F0 |
| Depende de | 0000, D-1, D-6, D-7 |
| Creada | 2026-11-20 |

## Por qué

Un reclutador ve cientos de portafolios idénticos: foto, tres tarjetas de proyecto, barra de
habilidades. Se olvidan antes de cerrar la pestaña.

El perfil de Edrei es **amplio**: construye productos con IA (Tracky, Content Agents), hace
divulgación científica interactiva (una mosca con 1,408 neuronas simuladas), diseña material
docente (Claude for Business en la Universidad Panamericana) y trabaja en IA educativa. En un
portafolio convencional esa amplitud se lee como dispersión. En un **gabinete de
curiosidades** se lee como lo que es: una colección coherente de alguien curioso que termina
lo que empieza.

Las *Wunderkammern* de los siglos XVI y XVII ordenaban el mundo en cinco familias de objetos.
El sitio toma esa taxonomía y la usa como arquitectura de información.

## Las salas

| Sala | En el gabinete histórico | En el portafolio | Sigla |
|---|---|---|---|
| **Vestíbulo** | La entrada | Quién es Edrei en una frase, tres cifras, tres accesos y el ejemplar vivo | — |
| **Artificialia** | Obras hechas por la mano humana | Proyectos de software y producto | AF |
| **Scientifica** | Instrumentos de medición | Certificaciones y cursos: instrumentos calibrados del saber | SC |
| **Naturalia** | Especímenes de la naturaleza | Formación académica: el origen | NA |
| **Theatrum** | El teatro anatómico, donde se enseñaba | Docencia, talleres y conferencias | TH |
| **Mirabilia** | Maravillas | Reconocimientos, premios, hitos y prensa | MI |
| **Exotica** | Lo traído de lejos | Experimentos, simulaciones y curiosidades | EX |
| **Registro** | El libro de adquisiciones | La trayectoria, en orden cronológico | — |
| **Despacho del curador** | Donde se escribe el catálogo | Sobre Edrei y contacto | — |

Además existe el **Acervo**: el índice completo de piezas, con filtros y búsqueda. Ahí cabe
todo; las salas exhiben lo curado.

## Recorridos

Tres personas visitan el gabinete. El diseño atiende a las tres sin obligar a ninguna a
recorrer lo que no necesita.

| Persona | Tiempo | Quiere | Camino |
|---|---|---|---|
| **Reclutador** | 10–60 s | Saber si encaja con la vacante y cómo contactar | Vestíbulo → Ficha rápida → CV |
| **Líder técnico** | 5–10 min | Profundidad: arquitectura, decisiones, código | Vestíbulo → Artificialia → vitrina de una pieza → repo |
| **Cliente o colaborador** | 2–5 min | Ver qué sabe hacer y si lo ha enseñado | Vestíbulo → Theatrum o Artificialia → Despacho |

## Historias

- Como **reclutador**, quiero ver rol, fortalezas y contacto sin hacer clic, para decidir en
  segundos si sigo leyendo.
- Como **reclutador**, quiero una vista sobria que pueda imprimir o reenviar, para pasarla al
  hiring manager.
- Como **líder técnico**, quiero abrir una pieza y ver el problema, la arquitectura, las
  decisiones y el código, para juzgar el criterio de ingeniería.
- Como **visitante curioso**, quiero que recorrer el sitio sea memorable, para recordarlo y
  compartirlo.
- Como **Edrei**, quiero agregar una certificación en un minuto, para que el portafolio no se
  quede viejo.

## Requisitos

### Estructura y navegación

| ID | Requisito | Prioridad |
|---|---|---|
| FR-0001-01 | El sitio DEBE organizarse en las salas de la tabla anterior, cada una con URL propia (`/artificialia`, `/scientifica`…). | Debe |
| FR-0001-02 | Cada pieza DEBE tener una URL estable que se pueda compartir (`/piezas/tracky`). | Debe |
| FR-0001-03 | DEBE existir un **plano del gabinete**: un mapa visual de las salas que sirve de navegación principal y muestra cuántas piezas hay en cada una. | Debe |
| FR-0001-04 | DEBE existir un menú textual equivalente al plano, para teclado, lectores de pantalla y móvil. | Debe |
| FR-0001-05 | El **Acervo** DEBE listar todas las piezas públicas con filtros por sala, material (tecnología) y año. | Debe |
| FR-0001-06 | El Acervo DEBERÍA tener búsqueda de texto sin servidor. | Debería |

### Vestíbulo

| ID | Requisito | Prioridad |
|---|---|---|
| FR-0001-10 | Sin desplazarse, en móvil y escritorio, el Vestíbulo DEBE mostrar nombre, rol, propuesta de valor en una frase, tres cifras con fuente y tres accesos: *Recorrer el gabinete*, *Ficha rápida*, *Descargar CV*. | Debe |
| FR-0001-11 | El Vestíbulo DEBERÍA mostrar un **ejemplar vivo**: una pieza interactiva que se mueve (propuesta: la mosca de *Mátala si puedes*), cargada después del contenido. | Debería |
| FR-0001-12 | El Vestíbulo DEBE mostrar la vitrina principal con hasta seis piezas destacadas. | Debe |

### La vitrina (vista de una pieza)

| ID | Requisito | Prioridad |
|---|---|---|
| FR-0001-20 | Cada pieza DEBE presentarse con su **cédula**: número de catálogo, nombre, fecha, procedencia, materiales y descripción breve (spec 0002). | Debe |
| FR-0001-21 | Las piezas de Artificialia DEBEN tener las secciones *El problema*, *Lo que hice*, *Cómo está hecho* y *Qué resultó*. | Debe |
| FR-0001-22 | Cada pieza DEBE mostrar sus evidencias como acciones claras: *Ver en vivo*, *Ver código*, *Verificar credencial*, *Ver documento*. | Debe |
| FR-0001-23 | Las credenciales con liga de verificación DEBEN llevar un **sello de lacre** "Verificable" que abre la liga oficial. Sin liga, no hay sello. | Debe |
| FR-0001-24 | Cada pieza DEBERÍA enlazar a dos piezas relacionadas por material o sala. | Debería |

### Ficha rápida

| ID | Requisito | Prioridad |
|---|---|---|
| FR-0001-30 | DEBE existir un interruptor global **Ficha rápida** que "enciende la luz de trabajo": cambia a una vista sobria, de una columna, sin adornos, con el mismo contenido. Se recuerda entre páginas. | Debe |
| FR-0001-31 | DEBE existir `/cv`: un currículum imprimible generado desde los mismos datos de las piezas. | Debe |
| FR-0001-32 | El CV DEBERÍA descargarse en PDF, generado en el build. | Debería |

### Calidad

| ID | Requisito | Prioridad |
|---|---|---|
| FR-0001-40 | Todo el sitio DEBE cumplir los presupuestos del artículo V de la constitución. | Debe |
| FR-0001-41 | Toda animación DEBE desactivarse con `prefers-reduced-motion`. | Debe |
| FR-0001-42 | El sitio DEBE tener tema claro y oscuro con contraste AA en ambos. | Debe |
| FR-0001-43 | Cada página DEBE tener título, descripción e imagen para compartir propios. | Debe |

## Criterios de aceptación

- **Dado** un reclutador en un teléfono, **cuando** abre la página de inicio, **entonces** ve
  nombre, rol, propuesta de valor, tres cifras y el botón de contacto sin desplazarse.
- **Dado** cualquier página, **cuando** se activa *Ficha rápida*, **entonces** el contenido
  aparece en una columna sobria y la preferencia se mantiene al navegar.
- **Dado** que Edrei agrega un archivo de certificación con liga de verificación, **cuando**
  se fusiona el PR, **entonces** la pieza aparece en Scientifica, en el Acervo y en el CV, con
  sello, sin tocar código.
- **Dado** un usuario de teclado, **cuando** recorre el plano del gabinete con Tab,
  **entonces** cada sala es alcanzable y tiene un foco visible.
- **Dado** JavaScript desactivado, **cuando** se abre cualquier página, **entonces** todo el
  contenido es legible.

## Dirección visual (propuesta)

Museografía contemporánea: muros oscuros, luz cálida sobre las piezas, cédulas de papel.

| Elemento | Propuesta |
|---|---|
| Paleta | Tinta `#15120F` (muro), nogal `#3B2A1E`, latón `#B08D57` (acento), papel `#F2ECE1` (cédula), lacre `#8E2B22` (sello) |
| Tema claro | Muro de yeso `#EEE9E0`, tinta como texto, los mismos acentos |
| Tipografía | **Fraunces** para títulos (serif con carácter), **Inter** para texto, **IBM Plex Mono** para números de catálogo y fechas |
| Imágenes | Capturas reales enmarcadas como en vitrina; ilustraciones tipo grabado para piezas sin captura |
| Movimiento | Cajones que se abren, cédulas que cuelgan, lupa sobre las capturas. Todo breve (≤ 250 ms) y opcional |

La identidad final se cierra en su propia spec, con un prototipo de alta fidelidad.

## No-objetivos

- Recorridos 3D en WebGL. Pesan, marean y fallan el artículo V.
- Blog. Si llega, será otra spec.
- Gestor de contenido (CMS). El contenido son archivos en el repo.
- Analítica invasiva. Si hay analítica, es sin cookies.

## Cómo sabremos que funcionó

- **Prueba de los diez segundos** con cinco personas ajenas al proyecto: al menos cuatro
  dicen correctamente el rol de Edrei y una de sus fortalezas.
- Lighthouse y axe sin errores en las páginas principales, medidos en CI.
- Edrei agrega una pieza nueva sin ayuda en menos de cinco minutos.

## Preguntas abiertas

- [NECESITA ACLARACIÓN] **D-1.** ¿A qué puestos o clientes apuntas? Define la frase del
  Vestíbulo, el orden de las salas y qué piezas se destacan.
- [NECESITA ACLARACIÓN] **D-6.** ¿Retrato real o ilustración?
- [NECESITA ACLARACIÓN] **D-7.** ¿La mosca de *Mátala si puedes* es el ejemplar vivo del
  Vestíbulo? Es la pieza más memorable del inventario y encaja literalmente con un gabinete
  que exhibe especímenes.
- ¿Hay alguna sala que sobre o falte para tu perfil? Por ejemplo, una sala para Axon Labs si
  la consultoría pesa tanto como el empleo.

## Cambios

| Fecha | Cambio |
|---|---|
| 2026-11-20 | Creada. |

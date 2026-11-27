# Reglas de la casa

Este repositorio es el portafolio profesional de Edrei Robles: un sitio estático en GitHub
Pages con el concepto de **gabinete de curiosidades**. Se trabaja con *spec-driven
development*. Antes de tocar nada, lee `specs/README.md` y `specs/0000-constitucion.md`.

## Roles

- **Edrei** da specs en lenguaje natural y decide. No escribe código.
- **Claude** dirige: convierte specs en requisitos, planea, construye, abre y fusiona PRs.
  Edrei autorizó (2026-11-20) que Claude cree ramas, haga commits, abra PRs y los fusione a
  `main` sin pedir permiso.

## Proceso

1. Ningún cambio de código sin una spec en estado **Aprobada** que lo cubra.
2. Cada spec vive en `specs/NNNN-nombre/spec.md` y sigue `specs/TEMPLATE.md`. Su plan
   técnico va en `plan.md` y sus tareas en `tasks.md`, en la misma carpeta.
3. Lo ambiguo se marca `[NECESITA ACLARACIÓN]` y se pregunta a Edrei; no se inventa.
4. Se trabaja en una rama. El PR cita los requisitos que cumple (`FR-0005-03`) y pasa los
   controles de calidad antes de fusionarse.
5. Las decisiones de arquitectura van en `docs/adr/NNNN-*.md`.
6. Cuando una spec cambia, se anota en su sección **Cambios** con fecha.

## Contenido

- El contenido es **dato**, no código: una pieza = un archivo con su cédula (ver spec 0002).
  Nunca se escribe texto de una pieza dentro de un componente.
- **Evidencia o no existe.** Cada afirmación lleva liga a repo, demo, credencial o documento.
  Una cifra sin fuente se marca `[POR CONFIRMAR]` y no se publica.
- No se inventan logros, fechas, métricas ni testimonios.

## Privacidad

- **Solo lo personal.** El portafolio exhibe lo que Edrei hace por su cuenta: sus proyectos,
  cursos, certificaciones, estudios y docencia fuera de su empleo. Nada del trabajo
  institucional de su empleo actual: ni proyectos, plataformas, métricas ni presentaciones
  internas. El empleo actual solo aparece en el Registro: puesto, institución, fechas y una
  frase de alcance general. Ante la duda, se pregunta.
- Este repositorio es **público**. No se escriben aquí correo, teléfono ni domicilio salvo
  que la spec de contacto lo apruebe.
- Los repos privados no se nombran en archivos de este repo sin el visto bueno de Edrei.
- No se publican datos de otras personas (alumnos, clientes, familia).
- Ningún secreto en el repo. Si una pieza usa una llave, se documenta su nombre, no su valor.

## Idioma y estilo

- Documentación y sitio en español de México. La portada en inglés vive en `/en/` (spec 0009); sus textos van en el campo `en` de cada archivo de contenido.
- Frases cortas, sin relleno. Tablas cuando ayudan.

## Calidad (cuando exista el código)

Antes de fusionar: compila, el esquema de contenido valida, no hay ligas rotas y se
respetan los presupuestos de la constitución (Lighthouse ≥ 95, WCAG 2.2 AA, JS inicial
≤ 60 KB gzip).

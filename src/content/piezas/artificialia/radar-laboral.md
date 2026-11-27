---
catalogo: AF-2026-008
titulo: Radar Laboral
subtitulo: Sube tu CV y recibe vacantes priorizadas de varias bolsas de trabajo
sala: artificialia
fecha: 2026-03
procedencia: Proyecto personal
rol: Diseño y desarrollo
estado: activo
materiales: [IA, Lectura de CV, Búsqueda de vacantes, Inicio de sesión con Google]
resumen: >-
  Lee el CV y separa cada dato en su campo, dejando vacío lo que no es confiable. Después devuelve
  una vacante destacada, una internacional, una cercana a tu mercado y una reserva, cada una con
  sus razones y la liga para postular.
evidencia:
  - { tipo: demo, url: "https://jobinderai.netlify.app/", etiqueta: Ver la app, etiqueta_en: Open the app }
imagen:
  src: ../../../assets/piezas/radar-laboral.webp
  alt: Pantalla de inicio de Radar Laboral, que pide entrar con Google para subir el CV.
orden: 9
objeto: cuadro
revisada: 2026-11
en:
  titulo: Radar Laboral · Job Radar
  subtitulo: Upload your CV and get prioritized openings from several job boards
  resumen: Reads the CV and puts each detail in its field, leaving blank what is not reliable. Then it
    returns a featured opening, an international one, one close to your market and a backup, each with
    its reasons and the link to apply.
---

## El problema

Buscar trabajo en varias bolsas a la vez es lento, y los filtros no entienden un perfil
profesional completo.

## Lo que hice

Una app donde la persona entra con Google, sube su CV en PDF o TXT y revisa lo que el motor
extrajo antes de buscar. Con su perfil corregido, recibe un top de vacantes de varias bolsas
activas y una bandeja extra de oportunidades, cada una con la razón de su afinidad, su fuente y la
liga directa para postular.

## Cómo está hecho

- **Lectura del CV** que prefiere dejar un campo vacío antes que llenarlo mal.
- **Análisis en el servidor** e historial de búsquedas por usuario autenticado.

El código es privado; la app se puede probar en línea.

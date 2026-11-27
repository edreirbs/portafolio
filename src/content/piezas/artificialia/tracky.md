---
catalogo: AF-2026-002
titulo: Tracky
subtitulo: Grabadora de juntas y organizador de tareas para personas con TDAH
sala: artificialia
fecha: 2026-11
procedencia: Proyecto personal
rol: Producto, arquitectura y desarrollo
estado: activo
materiales: [PWA, Preact, Hono, Netlify, Supabase, PostgreSQL, Whisper, Claude API, Spec-driven development]
resumen: >-
  Graba cualquier junta, la transcribe en tu propia computadora y la resume con Claude.
  Convierte cada tarea terminada en monedas que se canjean por tiempo libre.
cifras:
  - { valor: "5", etiqueta: specs implementadas, fuente: Repositorio }
evidencia:
  - { tipo: codigo, url: "https://github.com/edreirbs/tracky", etiqueta: Ver código, etiqueta_en: Code }
imagen:
  src: ../../../assets/piezas/tracky-arquitectura.svg
  alt: "Diagrama de arquitectura. El código vive en GitHub; Netlify publica la aplicación y sus funciones; Supabase guarda los datos con seguridad por renglón; la API de Claude se llama solo desde el servidor; y un puente local de Whisper transcribe el audio sin que salga de la computadora."
destacada: true
orden: 2
objeto: reloj
revisada: 2026-11
en:
  subtitulo: Meeting recorder and task organizer for people with ADHD
  resumen: Records any meeting, transcribes it on your own computer and summarizes it with Claude. Turns
    every finished task into coins you can trade for free time.
---

## El problema

Las personas con TDAH pierden los acuerdos de las juntas y se ahogan en listas de pendientes.
Casi todas las herramientas castigan lo que no se hizo en lugar de premiar lo que sí.

## Lo que hice

Diseñé y construí una aplicación con cinco pestañas: **Grabar**, **Notas**, **Tareas**,
**Monedas** y **Pregúntale a Tracky**, un chat en lenguaje natural sobre tus propias notas y
pendientes ("¿qué quedó pendiente con Ana?").

El organizador de tareas es deliberadamente amable: captura en una línea, máximo tres tareas en
*Ahora* y un cierre del día. Cada tarea terminada da monedas, con confeti, que nunca se pierden.

Se construyó con *spec-driven development*: una constitución, decisiones de arquitectura
documentadas y cinco specs implementadas.

## Cómo está hecho

- **Aplicación:** PWA con Vite, Preact y TypeScript, publicada en Netlify.
- **API:** Hono en Netlify Functions.
- **Datos:** Supabase, con PostgreSQL, autenticación y seguridad por renglón.
- **Privacidad:** el audio nunca sale de la computadora; un puente local de Whisper lo
  transcribe en `127.0.0.1`. La llave de Claude es el único secreto y solo vive en el servidor.
- **Instalación guiada:** comandos de Claude Code (`/tracky-setup`, `/tracky-doctor`,
  `/tracky-update`) que crean el proyecto de cualquier persona de punta a punta.

## Qué resultó

La versión 1 está implementada. Falta validarla con cuentas reales antes de abrirla a más
personas.

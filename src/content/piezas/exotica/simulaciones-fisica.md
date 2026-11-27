---
catalogo: EX-2023-001
titulo: Simulaciones para enseñar física
subtitulo: Laboratorios interactivos en el navegador, del cuerpo libre al Nobel de Física 2023
sala: exotica
fecha: 2023-08
fecha_fin: 2025-08
procedencia: Proyecto personal
rol: Diseño y desarrollo
estado: terminado
materiales: [JavaScript, HTML, Física, Estadística, Visualización]
resumen: >-
  Laboratorios pequeños que se usan desde el navegador: tensiones en cuerdas con su diagrama de
  cuerpo libre, el teorema del límite central aplicado a la investigación educativa y el
  experimento del Nobel de Física 2023.
evidencia:
  - { tipo: demo, url: "https://edreirbs.github.io/DCL/diagrama_tension_interactivo.html", etiqueta: Diagrama de cuerpo libre }
  - { tipo: demo, url: "https://edreirbs.github.io/teorema-limite-central/", etiqueta: Teorema del límite central }
  - { tipo: demo, url: "https://edreirbs.github.io/nobel-fisica-2023/", etiqueta: Experimento del Nobel 2023 }
imagen:
  src: ../../../assets/piezas/simulaciones-fisica.webp
  alt: Tres simulaciones lado a lado, el diagrama de cuerpo libre, el teorema del límite central y el experimento del Nobel de Física 2023.
orden: 8
objeto: cuadro
revisada: 2026-11
---

## El problema

Muchos conceptos de física y de estadística se entienden mejor moviéndolos que leyéndolos, y no
siempre hay un laboratorio a la mano.

## Lo que hice

Una serie de laboratorios de una sola página que cualquier estudiante abre en el navegador:

- **Diagrama de cuerpo libre:** se ajustan los ángulos de dos cuerdas y el peso, y se ven cambiar
  las tensiones en equilibrio.
- **Teorema del límite central en investigación educativa:** la fórmula, un ejemplo con
  calificaciones y preguntas para validar si el teorema aplica a una investigación.
- **Experimento del Nobel de Física 2023:** un esquema interactivo del experimento, de la
  generación y manipulación del pulso de luz a la interacción con la muestra y la medición de
  electrones.

## Cómo está hecho

HTML y JavaScript sin dependencias, publicados en GitHub Pages. Las de 2023 se hicieron con
ayuda de ChatGPT, como experimento de diseño de material didáctico con IA.

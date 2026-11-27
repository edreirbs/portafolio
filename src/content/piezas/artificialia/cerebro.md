---
catalogo: AF-2026-004
titulo: Cerebro
subtitulo: Un segundo cerebro cifrado que se abre desde cualquier lugar y solo con su frase
sala: artificialia
fecha: 2026-09
procedencia: Proyecto personal
rol: Diseño y desarrollo
estado: activo
materiales: [Python, WebCrypto, AES-256, PBKDF2, GitHub Pages, Grafos de conocimiento]
resumen: >-
  Une dos bóvedas de notas en un tablero con sus grafos y lo publica en GitHub Pages cifrado. El
  navegador lo descifra con una frase: en internet solo viaja texto ilegible.
evidencia:
  - { tipo: codigo, url: "https://github.com/edreirbs/second-brain", etiqueta: Ver código }
  - { tipo: demo, url: "https://edreirbs.github.io/second-brain/", etiqueta: Ver el candado }
imagen:
  src: ../../../assets/piezas/second-brain.webp
  alt: Pantalla de candado de Cerebro, que pide la frase para descifrar el tablero en el navegador.
destacada: true
orden: 4
objeto: cuadro
revisada: 2026-11
---

## El problema

Un segundo cerebro sirve si se puede consultar desde cualquier lugar. Publicarlo en internet,
en cambio, expone títulos de notas, nombres y relaciones que no deberían ser públicos.

## Lo que hice

Un tablero que reúne dos bóvedas de notas y sus grafos, servido en GitHub Pages para abrirlo
desde cualquier dispositivo, pero cifrado para que solo lo abra su dueño. La página publicada es
un candado: pide una frase y descifra el tablero dentro del navegador.

## Cómo está hecho

- **Compilación:** un script en Python recorre las bóvedas, arma los grafos y llena una plantilla.
  Las notas nunca se copian al repositorio.
- **Cifrado:** AES-256-CBC con llave derivada por PBKDF2-SHA256 (250,000 vueltas) y una sal nueva
  en cada publicación.
- **Descifrado:** WebCrypto en el navegador, que verifica la huella del contenido antes de pintarlo.
- **Publicación:** un solo comando compila, cifra y sube; si nada cambió, no hace nada.

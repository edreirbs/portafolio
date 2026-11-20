---
catalogo: AF-2026-001
titulo: Mátala si puedes
subtitulo: Una mosca simulada neurona por neurona que aprende de cada golpe
sala: artificialia
fecha: 2026-09
procedencia: Proyecto personal
rol: Concepto y desarrollo
estado: activo
materiales: [JavaScript, Three.js, Neurociencia computacional, Simulación, Remotion]
resumen: >-
  El circuito de escape de una Drosophila, conectado como en el animal, corre en tu navegador
  y aprende de cada intento de aplastarla. Neurociencia real convertida en un juego.
cifras:
  - { valor: "1,408", etiqueta: neuronas simuladas, fuente: README del repositorio }
  - { valor: "4,972", etiqueta: sinapsis, fuente: README del repositorio }
  - { valor: "2,000", etiqueta: pasos por segundo, fuente: README del repositorio }
evidencia:
  - { tipo: demo, url: "https://edreirbs.github.io/entrenamiento-redes-neuronales/", etiqueta: Jugar en vivo }
  - { tipo: codigo, url: "https://github.com/edreirbs/entrenamiento-redes-neuronales", etiqueta: Ver código }
imagen:
  src: ../../../assets/piezas/mosca.webp
  alt: Escena del juego. Una mosca en 3D sobre una mesa, el matamoscas encima y un panel que grafica cómo va aprendiendo.
ejemplar:
  poster: ../../../assets/piezas/mosca-ejemplar.webp
  nombre: Drosophila melanogaster, simulada
  alt: La mosca simulada sobre la mesa, con la mira del matamoscas alrededor.
destacada: true
orden: 1
revisada: 2026-11
---

## El problema

La neurociencia computacional suele quedarse en artículos y gráficas. La pregunta era si una
persona cualquiera puede *sentir*, en un minuto, qué significa que un cerebro aprenda.

## Lo que hice

Un juego de una sola pantalla: intentas aplastar una mosca cuyo cerebro está simulado neurona
por neurona. Las primeras veces la matas fácil; hacia la octava o novena ya no la tocas. Estás
entrenando a tu propia enemiga.

Cada mecánica está anclada a lo que una persona puede hacer de verdad. Los umbrales de ritmo y
de velocidad del golpe se midieron y se corrigieron cuando el primer diseño resultó
inalcanzable.

## Cómo está hecho

- **El cableado.** Las neuronas del circuito de escape de *Drosophila* (fotorreceptores,
  lámina, T5, LPLC2, LC4 y la neurona gigante DNp01), conectadas como en el animal según los
  conectomas públicos de la especie.
- **La dinámica.** Un motor de integración y disparo con fuga, con sinapsis dispersas. Un
  conectoma no dice la fuerza de cada sinapsis, así que esos parámetros se ajustaron midiendo
  hasta que el circuito se comportara como el animal.
- **El aprendizaje.** No hay backpropagation ni datos de entrenamiento: hay plasticidad en
  sinapsis concretas. Sensibilización y despegue corto, documentados en el animal, y un sesgo
  direccional que es modelo propio. Se guarda en el navegador de quien juega.
- **La escena.** La mosca, la mesa y el matamoscas en 3D con Three.js, incluido en el repositorio
  para no depender de un CDN.
- **El video.** Un video de 104 segundos producido con Remotion a partir de un guion versionado.

## Qué resultó

Contra un matamoscas de 270 ms, la mosca pasa de no escapar nunca en la primera generación a
escapar diez de cada diez veces en la novena. La generación 6 es la más interesante: ahí todo se
decide por márgenes de uno a cinco milisegundos.

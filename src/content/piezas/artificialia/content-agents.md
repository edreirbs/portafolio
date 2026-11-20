---
catalogo: AF-2026-003
titulo: Content Agents
subtitulo: Un motor de contenido con IA que investiga, escribe y publica cada semana
sala: artificialia
fecha: 2026-11
procedencia: Axon Labs
rol: Diseño del sistema y desarrollo
estado: activo
materiales: [Python, GitHub Actions, OpenAI API, RSS, LinkedIn API, GitHub Pages]
resumen: >-
  Lee fuentes de noticias e investigación, elige el tema con más relevancia comercial, redacta
  un artículo y su versión para LinkedIn, y publica sin intervención humana.
evidencia:
  - { tipo: demo, url: "https://edreirbs.github.io/conten-agents/", etiqueta: Ver el blog en vivo }
  - { tipo: codigo, url: "https://github.com/edreirbs/conten-agents", etiqueta: Ver código }
imagen:
  src: ../../../assets/piezas/content-agents.webp
  alt: Portada del blog de Axon Labs generado por el motor, con la línea editorial y los últimos análisis.
destacada: true
orden: 3
objeto: periodicos
revisada: 2026-11
---

## El problema

Una consultora de IA necesita publicar con constancia y criterio, pero el contenido orgánico se
come las horas que deberían ir a los clientes.

## Lo que hice

Un motor de costo mínimo con línea editorial propia. Cuatro roles se turnan cada semana:
*noticia del momento*, *buena práctica*, *herramienta a fondo* y *reflexión*. Antes de que el
modelo elija tema, un filtro descarta lo que no tiene relevancia comercial para la consultora.

## Cómo está hecho

- **Orquestación:** GitHub Actions, en un horario programado.
- **Investigación y redacción:** fuentes RSS de noticias, investigación y divulgación; un modelo
  de OpenAI elige el tema, redacta el artículo largo y su versión corta.
- **Imágenes:** fotografía libre de Pexels o Unsplash con atribución automática, y una portada
  generada como respaldo.
- **Publicación:** sitio estático en GitHub Pages y, de forma opcional, LinkedIn por su API
  oficial para organizaciones.
- **Modo seguro:** solo fuentes públicas, ligas limpias, datos sensibles redactados antes de
  llamar al modelo y nada de extractos guardados. Si la publicación en LinkedIn falla, el proceso
  falla de forma visible en vez de quedar "en verde".

## Qué resultó

Un blog que se publica solo, en vivo, con la voz y los filtros de la consultora.

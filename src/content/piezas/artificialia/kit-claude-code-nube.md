---
catalogo: AF-2026-006
titulo: "Kit de práctica: Claude Code en la nube"
subtitulo: Proyectos listos para que personas sin experiencia construyan y publiquen con Claude
sala: artificialia
fecha: 2026-08
fecha_fin: 2026-11
procedencia: Claude for Business · Universidad Panamericana
rol: Diseño pedagógico y desarrollo
estado: activo
materiales: [Claude Code, Skills, Subagentes, Supabase, Netlify, GitHub Pages, SQL]
resumen: >-
  Plantillas de la Sesión 7 del curso. Cada una trae reglas para Claude, una skill de marca o de
  reglas fiscales, un subagente revisor que solo lee, el esquema de la base, un respaldo
  terminado y una página que comprueba la base de cada alumno.
evidencia:
  - { tipo: demo, url: "https://lanzamiento-edrei.netlify.app/", etiqueta: Ver un ejemplo en vivo }
  - { tipo: codigo, url: "https://github.com/edreirbs/plantilla-junta-atn-s7", etiqueta: Ver una plantilla }
  - { tipo: demo, url: "https://edreirbs.github.io/comprobador-s7/", etiqueta: Ver el comprobador }
  - { tipo: codigo, url: "https://github.com/edreirbs/plantilla-ocso-s7", etiqueta: Ver el portal de facturación }
imagen:
  src: ../../../assets/piezas/kit-claude-code.webp
  alt: Página de registro a una junta de ficción, construida con Claude Code a partir de una plantilla del kit.
destacada: true
orden: 6
objeto: cuadro
revisada: 2026-11
---

## El problema

En una sesión de 150 minutos, personas que nunca han programado tienen que llegar de cero a una
página publicada, con base de datos, sin escribir código y sin exponer datos ni llaves.

## Lo que hice

Un kit de práctica donde cada alumno le pide todo a Claude en español, trabaja en una rama y
publica solo al fusionar un Pull Request revisado:

- **Mi página:** formulario público que guarda en Supabase y una lista que muestra lo guardado.
- **Página de lanzamiento** con lista de interesados, para una boutique ficticia.
- **Portal de facturación de práctica:** foto del ticket, datos fiscales y factura CFDI 4.0 en
  XML y PDF, sin validez fiscal, con doce tickets de práctica.
- **Junta con la redacción:** registro, muro de preguntas en vivo con votos, confirmaciones y un
  resumen diario con tareas programadas.
- **Registro a una junta de accionistas.**
- **Comprobador:** una página que dice si la base de cada alumno quedó lista.

## Cómo está hecho

- **Reglas para Claude** en cada proyecto, una **skill** con la marca o con las reglas del CFDI y
  un **subagente revisor** de seguridad o fiscal que solo puede leer y revisa antes del Pull Request.
- **Supabase** con funciones: la página nunca lee datos personales y todo texto de una persona se
  pinta como texto, nunca como HTML.
- **Un respaldo terminado y probado** en cada plantilla, por si el del alumno no queda.
- Las marcas son de ficción, con fines educativos y sin afiliación con sus titulares.

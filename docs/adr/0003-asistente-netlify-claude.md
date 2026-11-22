# ADR-0003 · Asistente con Claude Haiku 5.5 detrás de una función de Netlify

| Campo | Valor |
|---|---|
| Estado | Aceptada |
| Fecha | 2026-11-22 |
| Specs | 0015, constitución art. V y VIII |

## Contexto

El asistente necesita la llave de la API de Anthropic. GitHub Pages solo sirve archivos
estáticos: cualquier llave en el navegador o en el repositorio sería pública. Hace falta un
servidor pequeño que guarde la llave, aplique los candados y hable con Claude.

## Decisión

- **Netlify Functions** (TypeScript, `asistente/netlify/functions/`) en un sitio propio del
  equipo de Netlify de Edrei. Es gratis para este volumen, transmite respuestas por *streaming*
  y Edrei ya tiene cuenta.
- **Claude Haiku 5.5** (`claude-haiku-5-5`), decisión de Edrei: esfuerzo `low`, sin
  herramientas, `max_tokens` 1024, con el SDK oficial `@anthropic-ai/sdk`.
- **Conocimiento**: la compilación del sitio publica `/portafolio/conocimiento.txt` con el
  contenido del portafolio (perfil, piezas, registro, artículos, redes). La función lo lee del
  sitio publicado, así que actualizar el portafolio actualiza al asistente sin tocar Netlify.
- **Caché de prompt**: las reglas y el conocimiento van en el `system` con `cache_control`;
  solo la conversación cambia entre preguntas.
- **Candados en el servidor**, no en el navegador: origen permitido, tamaño de mensajes y
  turnos, límite por minuto (configuración de Netlify), cuotas por día por visitante y totales
  (Netlify Blobs, con la IP convertida en huella SHA-256 que no se guarda en claro) y firma HMAC
  de cada respuesta del asistente para rechazar historiales alterados.
- **Gasto**: la llave vive en un espacio de trabajo de la consola de Anthropic con límite de
  USD 1 al mes. Es el candado final: si se alcanza, el asistente se apaga hasta el mes siguiente.
- **La llave** la guarda Edrei en las variables de entorno de Netlify (`ANTHROPIC_API_KEY`,
  marcada como secreta). Nunca pasa por el chat, el repositorio ni el navegador.

## Alternativas descartadas

| Opción | Por qué no |
|---|---|
| Llave en el navegador | Pública en segundos. |
| Supabase Edge Functions | El plan gratis de Edrei ya tiene dos proyectos activos; habría que pausar uno. |
| Claude Opus 5.5 | Mejor redacción, unas 20 veces más caro; Edrei eligió Haiku con límite de USD 1. |
| Búsqueda vectorial (RAG) | El contenido cabe completo en el prompt y se cachea; un índice agrega piezas sin beneficio. |

## Consecuencias

- Un segundo lugar que mantener (Netlify). Su código vive en este repo, en `asistente/`.
- Con USD 1 al mes caben unas 500 preguntas; los topes diarios evitan que un día se coma el mes.
- Si Netlify o la llave fallan, el sitio sigue completo: el botón ofrece el CV y LinkedIn.

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
- **Credencial** (actualizado el 2026-11-27): el servidor usa primero la llave propia de Edrei
  si existe en `ASISTENTE_ANTHROPIC_API_KEY` (marcada secreta), contra `https://api.anthropic.com`.
  Si no existe, usa el **AI Gateway de Netlify**, que inyecta `ANTHROPIC_API_KEY` y
  `ANTHROPIC_BASE_URL` en las funciones, sirve Claude Haiku 5.5 al mismo precio y cobra en
  créditos del equipo de Netlify. Ninguna llave pasa por el chat, el repositorio ni el navegador.
- **Gasto**: con la llave propia, el límite de USD 1 del espacio de trabajo es el candado final.
  Con el AI Gateway, los topes diarios bajan a 20 preguntas en total y 10 por visitante: unos
  5 créditos de Netlify al día en el peor caso, porque esos créditos los comparten todos los
  sitios del equipo.
- **Secreto de firma**: lo genera el propio servidor la primera vez y vive solo en Netlify Blobs.
  No depende de la llave, así que cambiar de credencial no rompe las conversaciones.
- **Activación**: la constante `ACTIVO` en `asistente/lib/llave.ts` enciende el botón del sitio.
  Se activó después de que pasara la batería de trampas.

## Alternativas descartadas

| Opción | Por qué no |
|---|---|
| Llave en el navegador | Pública en segundos. |
| Esperar la llave propia | Edrei pidió (2026-11-27) que el asistente quedara conectado sin pasos de su parte; el gateway lo permite sin manejar secretos. La llave propia sigue soportada. |
| Supabase Edge Functions | El plan gratis de Edrei ya tiene dos proyectos activos; habría que pausar uno. |
| Claude Opus 5.5 | Mejor redacción, unas 20 veces más caro; Edrei eligió Haiku con límite de USD 1. |
| Búsqueda vectorial (RAG) | El contenido cabe completo en el prompt y se cachea; un índice agrega piezas sin beneficio. |

## Consecuencias

- Un segundo lugar que mantener (Netlify). Su código vive en este repo, en `asistente/`.
- Con USD 1 al mes caben unas 500 preguntas; los topes diarios evitan que un día se coma el mes.
- Si Netlify o la llave fallan, el sitio sigue completo: el botón ofrece el CV y LinkedIn.

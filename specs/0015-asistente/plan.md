# 0015 · Plan técnico

Ver la decisión de arquitectura en [ADR-0003](../../docs/adr/0003-asistente-netlify-claude.md).

## Piezas

| Pieza | Dónde | Qué hace |
|---|---|---|
| Conocimiento | `src/pages/conocimiento.txt.ts` | Genera en cada compilación el texto con todo lo publicado: perfil, redes, piezas con su detalle y evidencia, registro y artículos. |
| Servidor | `asistente/netlify/functions/asistente.mts` | Origen, formato, firma, cuotas, llamada a Claude Haiku 5.5 y respuesta por eventos. |
| Estado | `asistente/netlify/functions/estado.mts` | Dice si hay llave, para que el sitio muestre o no el botón. |
| Reglas | `asistente/lib/reglas.ts` | El prompt de sistema con los candados FR-0015-11 a 15. |
| Candados | `asistente/lib/candados.ts` | Validación, firma HMAC, huella anónima y orígenes. Con pruebas en `asistente/pruebas/`. |
| Botón y panel | `src/components/Asistente.astro` | HTML fijo; el script solo consulta el estado después de cargar. |
| Conversación | `src/asistente/chat.ts` | Se descarga al abrir: envío, lectura de eventos, pintado seguro, sugerencias, memoria de la visita y teclado. |
| Teléfono | `src/gabinete/objetos.ts` | El objeto del 3D que abre el asistente. |

## Flujo de una pregunta

1. El navegador manda `text/plain` con los turnos completos y firmados más la pregunta nueva.
2. El servidor valida origen, formato, largo, turnos y firmas; luego cuenta la cuota del día
   escribiendo una clave nueva en Netlify Blobs (nunca lee y reescribe un contador).
3. Lee el conocimiento publicado (con caché de 10 minutos) y llama a la API con las reglas y el
   conocimiento en el `system`, este último con `cache_control`.
4. Transmite los fragmentos (`t`), un reemplazo si el modelo se niega (`reemplazo`) y la firma de la
   respuesta completa (`fin`).

## Publicar cambios del servidor

El sitio `edrei-asistente` de Netlify se publica desde `asistente/` con la herramienta de Netlify.
Sin llave propia, el servidor usa el AI Gateway de Netlify. Para usar la llave propia, basta con
guardarla en las variables del sitio como `ASISTENTE_ANTHROPIC_API_KEY`, marcada como secreta, y
volver a publicar: el servidor la prefiere en automático.

## Pruebas

- `cd asistente && npm run tipos && npm run prueba`: candados sin llamar a Claude.
- `node asistente/pruebas/trampas.mjs`: batería de trampas contra el servidor publicado (FR-0015-20).
  Gasta 10 preguntas reales: el tope diario por visitante con el AI Gateway.

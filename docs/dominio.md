# Dominio propio: portafolio.edreirobles.com

**Estado: hecho (2026-11-27).** El portafolio vive en `https://portafolio.edreirobles.com/`.
La dirección vieja, `https://edreirbs.github.io/portafolio/`, redirige sola a la nueva.

## Decisión

Usar el subdominio **`portafolio.edreirobles.com`**.

`www.edreirobles.com` es tu sitio de Google Sites, y el portafolio liga a sus recursos (spec
0017). Si `www` apuntara al portafolio, esas ligas se romperían. Con el subdominio conviven los
dos.

## Lo que haces tú (unos 10 minutos)

Tu dominio se administra en **Squarespace Domains** (antes Google Domains).

1. Entra a Squarespace → *Domains* → `edreirobles.com` → *DNS* → *Custom records* y agrega:

   | Host | Tipo | Datos |
   |---|---|---|
   | `portafolio` | CNAME | `edreirbs.github.io` |

2. En GitHub, abre el repositorio `edreirbs/portafolio` → *Settings* → *Pages*. En
   *Custom domain* escribe `portafolio.edreirobles.com` y guarda. GitHub revisa el DNS; puede
   tardar de minutos a unas horas.
3. Cuando el chequeo salga en verde, marca **Enforce HTTPS**.
4. Avísame: "ya quedó el dominio".

Opcional y recomendable: en tu cuenta de GitHub → *Settings* → *Pages* → *Add a domain*,
verifica `edreirobles.com` con el registro TXT que te indique. Así nadie más puede usar un
subdominio tuyo en GitHub Pages.

## Lo que se cambió en el código

| Archivo | Cambio |
|---|---|
| `astro.config.mjs` | `site: 'https://portafolio.edreirobles.com'` y sin `base`: el sitio vive en la raíz. |
| `scripts/revisar-ligas.mjs` y CI | Revisan las ligas desde la raíz (`/`). |
| `asistente/lib/candados.ts` | Agregar el origen `https://portafolio.edreirobles.com`. |
| `asistente/lib/conocimiento.ts` | Leer el conocimiento desde el dominio nuevo. |
| `asistente/pruebas/trampas.mjs` | Probar desde el origen nuevo. |
| Piezas de Theatrum | Las ligas a `/constancias/` con el dominio nuevo. |
| `specs/README.md` | Cerrar la decisión D-3. |

Lección: en GitHub Pages con dominio propio el sitio pasa a la raíz. Si `base` sigue en
`/portafolio`, todos los archivos piden `/portafolio/...` y dan 404, y el gabinete se queda en 0 %.

## Qué no cambia

- Las demos de tus otros proyectos (`edreirbs.github.io/<repo>/`) siguen igual: el dominio se
  configura solo en este repositorio.
- El asistente en Netlify conserva su dirección.

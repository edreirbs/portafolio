# Dominio propio: portafolio.edreirobles.com

Hoy el portafolio vive en `https://edreirbs.github.io/portafolio/`. Este documento dice cómo
pasarlo a tu dominio sin romper nada.

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

## Lo que hago yo después

| Archivo | Cambio |
|---|---|
| `astro.config.mjs` | `site: 'https://portafolio.edreirobles.com'` y `base: '/'`. |
| `asistente/lib/candados.ts` | Agregar el origen `https://portafolio.edreirobles.com`. |
| `asistente/lib/conocimiento.ts` | Leer el conocimiento desde el dominio nuevo. |
| `asistente/pruebas/trampas.mjs` | Probar desde el origen nuevo. |
| Piezas de Theatrum | Las ligas a `/constancias/` con el dominio nuevo. |
| `specs/README.md` | Cerrar la decisión D-3. |

Después: compilar, revisar ligas, publicar el asistente en Netlify, correr la batería de
trampas y comprobar que la dirección vieja redirige sola a la nueva (GitHub lo hace).

## Qué no cambia

- Las demos de tus otros proyectos (`edreirbs.github.io/<repo>/`) siguen igual: el dominio se
  configura solo en este repositorio.
- El asistente en Netlify conserva su dirección.

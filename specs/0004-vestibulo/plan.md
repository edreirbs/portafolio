# Plan técnico · Fase 1

Cubre las specs 0003, 0004 y 0005. Sigue el [ADR-0001](../../docs/adr/0001-stack-astro-github-pages.md).

## Arquitectura

```
src/
  content.config.ts        esquema Zod de la cédula (spec 0002)
  content/
    perfil/edrei.md        título, promesa, pruebas, contacto, idiomas
    piezas/<sala>/*.md     una pieza por archivo
    registro/*.md          trayectoria
  layouts/Base.astro       cabecera, interruptor Ficha rápida, pie con fecha
  components/              Cedula, Vitrina, Plano, EjemplarVivo, Evidencias, Sello
  pages/
    index.astro            Vestíbulo
    artificialia.astro     sala
    piezas/[slug].astro    vitrina de cada pieza
    cv.astro               CV imprimible
    404.astro
  styles/                  tokens.css (colores, tipografía), base.css, ficha.css, print.css
public/piezas/             capturas de cada proyecto
.github/workflows/         ci.yml (PR) y deploy.yml (main → Pages)
```

## Decisiones

| Tema | Decisión |
|---|---|
| Dirección | Mientras no haya dominio (D-3): `https://edreirbs.github.io/portafolio/`, con `base: '/portafolio'`. |
| Tipografías | Fraunces, Inter e IBM Plex Mono servidas desde el propio sitio (`@fontsource`), en subconjunto latino. Sin CDN de terceros. |
| Temas | Claro y oscuro por `prefers-color-scheme`, con tokens en `:root`. |
| Ficha rápida | Atributo `data-modo="ficha"` en `<html>`, aplicado por un script en línea de menos de 1 KB antes de pintar, para que no parpadee. Guardado en `localStorage` dentro de `try/catch`. Sin JavaScript, el interruptor es una liga a `/cv`. |
| Ejemplar vivo | Imagen fija y botón; al pulsarlo se inserta un `<iframe>` con la demo publicada de la mosca. |
| Imágenes | Capturas tomadas una vez con Playwright, guardadas en el repo y optimizadas con `astro:assets`. |
| Fecha de actualización | Se toma del último commit al compilar. |

## Calidad

| Control | Dónde |
|---|---|
| `astro check` (tipos y esquema de contenido) | CI en cada PR |
| `astro build` | CI en cada PR |
| Ligas internas rotas | CI en cada PR |
| Lighthouse ≥ 95 en móvil (Vestíbulo, sala, una vitrina, CV) | Medido antes de fusionar; en CI desde la F3 |
| Accesibilidad con axe | Medido antes de fusionar |

## Despliegue

`deploy.yml` corre en cada push a `main`: compila y publica con `actions/deploy-pages`.
Requiere que el repositorio tenga **Settings → Pages → Source: GitHub Actions** (acción de Edrei).

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Pages no está activado y el despliegue falla | El PR de la F1 se fusiona igual; el sitio sale en cuanto se active. |
| La demo de la mosca cambia de dirección | El ejemplar vivo lee la liga desde el archivo de la pieza. |
| Al pasar a dominio propio cambian las ligas | `base` y `site` viven en un solo lugar de la configuración. |

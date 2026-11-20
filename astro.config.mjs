// @ts-check
import { defineConfig } from 'astro/config';

// Mientras no haya dominio propio (decisión D-3), el sitio vive en
// https://edreirbs.github.io/portafolio/. Al pasar a edreirobles.com solo cambian estas dos líneas.
export default defineConfig({
  site: 'https://edreirbs.github.io',
  base: '/portafolio',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
});

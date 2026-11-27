// @ts-check
import { defineConfig } from 'astro/config';

// Decisión D-3: el sitio vive en la raíz de su subdominio, https://portafolio.edreirobles.com/.
// Si cambia de dirección, se cambia `site` aquí y los orígenes del asistente (asistente/lib/candados.ts).
export default defineConfig({
  site: 'https://portafolio.edreirobles.com',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  // Three.js pesa ~170 KB gzip; el presupuesto del gabinete 3D es 250 KB (constitución, art. V).
  vite: { build: { chunkSizeWarningLimit: 800 } },
});

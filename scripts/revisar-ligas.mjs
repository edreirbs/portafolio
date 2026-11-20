// Revisa que toda liga interna del sitio compilado apunte a un archivo que existe.
// Uso: node scripts/revisar-ligas.mjs [dist] [/portafolio]
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

const dist = process.argv[2] ?? 'dist';
const base = (process.argv[3] ?? '/portafolio').replace(/\/$/, '');

async function* html(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const ruta = join(dir, e.name);
    if (e.isDirectory()) yield* html(ruta);
    else if (extname(e.name) === '.html') yield ruta;
  }
}

async function existe(ruta) {
  try {
    const s = await stat(ruta);
    if (s.isFile()) return true;
    if (s.isDirectory()) return existe(join(ruta, 'index.html'));
  } catch {}
  return false;
}

const rotas = [];
let revisadas = 0;
for await (const archivo of html(dist)) {
  const contenido = await readFile(archivo, 'utf8');
  for (const m of contenido.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const liga = m[1];
    if (!liga.startsWith(`${base}/`) && liga !== base) continue;
    const limpia = decodeURIComponent(liga.slice(base.length).split('#')[0].split('?')[0]);
    revisadas++;
    if (!(await existe(join(dist, limpia)))) rotas.push(`${archivo.slice(dist.length)} → ${liga}`);
  }
}

if (rotas.length) {
  console.error(`✗ ${rotas.length} ligas internas rotas:\n  ${rotas.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ ${revisadas} ligas internas revisadas, ninguna rota.`);

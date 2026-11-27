// Spec 0010: el mapa del sitio para buscadores, con la portada, el CV y cada pieza.
import type { APIRoute } from 'astro';
import { piezas } from '../lib/piezas';

export const GET: APIRoute = async ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const abs = (ruta: string) => new URL(`${base}/${ruta}`, site).href;
  const todas = await piezas();
  const urls = [
    { loc: abs(''), prioridad: '1.0' },
    { loc: abs('cv/'), prioridad: '0.8' },
    ...todas.map((p) => ({ loc: abs(`piezas/${p.id}/`), prioridad: p.data.destacada ? '0.7' : '0.5' })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><priority>${u.prioridad}</priority></url>`).join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};

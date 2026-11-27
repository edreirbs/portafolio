// Spec 0010: el mapa del sitio para buscadores, con la portada, el CV y cada pieza.
// Spec 0009: la portada en inglés, anunciada como alterna de la española.
import type { APIRoute } from 'astro';
import { piezas } from '../lib/piezas';

export const GET: APIRoute = async ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const abs = (ruta: string) => new URL(`${base}/${ruta}`, site).href;
  const todas = await piezas();
  const portada = [
    { hreflang: 'es-MX', href: abs('') },
    { hreflang: 'en', href: abs('en/') },
  ];
  const urls: { loc: string; prioridad: string; alternas?: typeof portada }[] = [
    { loc: abs(''), prioridad: '1.0', alternas: portada },
    { loc: abs('en/'), prioridad: '0.9', alternas: portada },
    { loc: abs('cv/'), prioridad: '0.8' },
    ...todas.map((p) => ({ loc: abs(`piezas/${p.id}/`), prioridad: p.data.destacada ? '0.7' : '0.5' })),
  ];
  const linea = (u: (typeof urls)[number]) =>
    `  <url><loc>${u.loc}</loc>${(u.alternas ?? [])
      .map((a) => `<xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}"/>`)
      .join('')}<priority>${u.prioridad}</priority></url>`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(linea).join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
};

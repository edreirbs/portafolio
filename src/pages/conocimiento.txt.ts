// Spec 0015 · FR-0015-12: el conocimiento del asistente es exactamente lo publicado en el
// portafolio, generado en cada compilación. La función de Netlify lo lee de aquí.
import type { APIRoute } from 'astro';
import { portafolio } from '../lib/portafolio';
import { INFO_SECCION, type Seccion } from '../lib/secciones';
import { periodo, periodoAnios } from '../lib/fechas';
import { fechaActualizacion } from '../lib/build';
import type { Pieza } from '../lib/piezas';

const sitio = (ruta = '') => new URL(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/${ruta}`, 'https://edreirbs.github.io').href;

/** El cuerpo de la pieza en texto: sin imágenes, HTML ni marcas que no aportan. */
function textoPlano(md: string): string {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/^#+\s*/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function pieza(p: Pieza): string {
  const d = p.data;
  const cuando = d.fecha_fin ? periodoAnios(d.fecha, d.fecha_fin) : d.fecha.slice(0, 4);
  const lineas = [
    `### ${d.titulo}`,
    `Ficha en el portafolio: ${sitio(`piezas/${p.id}/`)}`,
    `${d.subtitulo}`,
    `Fecha: ${cuando} · Procedencia: ${d.procedencia}`,
  ];
  if (d.institucion) lineas.push(`Institución: ${d.institucion}`);
  if (d.campo) lineas.push(`Campo: ${d.campo}`);
  if (d.tesis) lineas.push(`Tesis: ${d.tesis}`);
  if (d.distinciones) lineas.push(`Distinciones: ${d.distinciones}`);
  if (d.otorgante) lineas.push(`Otorga: ${d.otorgante}`);
  if (d.rol) lineas.push(`Rol de Edrei: ${d.rol}`);
  if (d.estado) lineas.push(`Estado: ${d.estado}`);
  if (d.materiales.length) lineas.push(`Materiales y temas: ${d.materiales.join(', ')}`);
  lineas.push(`Resumen: ${d.resumen}`);
  for (const c of d.cifras) lineas.push(`Cifra: ${c.valor} ${c.etiqueta}`);
  if (p.body?.trim()) lineas.push(`Detalle:\n${textoPlano(p.body)}`);
  lineas.push('Evidencia:');
  for (const e of d.evidencia) lineas.push(`- ${e.etiqueta}${e.url ? `: ${e.url}` : ' (documento sin liga pública)'}`);
  return lineas.join('\n');
}

export const GET: APIRoute = async () => {
  const { perfil, porSeccion, registro, articulos, visibles } = await portafolio();
  const titulo = (s: Seccion) => `## ${INFO_SECCION[s].nombre}\nSección en el portafolio: ${sitio(`#${s}`)}`;
  const partes: string[] = [];

  partes.push(`# Portafolio de ${perfil.nombre}
Sitio: ${sitio()}
Actualizado: ${fechaActualizacion().toISOString().slice(0, 10)}

## Perfil
Nombre: ${perfil.nombre}
Título profesional: ${perfil.titulo}
Promesa: ${perfil.promesa}
Credenciales destacadas: ${perfil.pruebas.map((p) => p.texto).join('; ')}
Resumen: ${perfil.resumen}
Ubicación: ${perfil.ubicacion}
Idiomas: ${perfil.idiomas.map((i) => `${i.idioma} (${i.nivel})`).join(', ')}
Competencias: ${perfil.competencias.join('; ')}`);

  partes.push(`${titulo('contacto')}
${perfil.contacto.map((c) => `- ${c.etiqueta}: ${c.url}`).join('\n')}
- Currículum: ${sitio('cv/')}
Edrei no publica correo, teléfono ni domicilio. Para contactarlo, la vía es LinkedIn.`);

  for (const s of ['proyectos', 'titulos', 'certificaciones'] as const) {
    if (!visibles.includes(s)) continue;
    partes.push(`${titulo(s)}\n\n${porSeccion[s].map(pieza).join('\n\n')}`);
  }

  if (visibles.includes('experiencia')) {
    const lugares = registro.map((r) => {
      const d = r.data;
      const lineas = [`### ${d.organizacion}${d.lugar ? ` (${d.lugar})` : ''}`];
      for (const x of d.puestos) lineas.push(`- ${x.puesto}: ${periodo(x.desde, x.hasta)}`);
      if (d.alcance) lineas.push(`Alcance: ${d.alcance}`);
      for (const l of d.logros) lineas.push(`Logro: ${l}`);
      return lineas.join('\n');
    });
    const charlas = porSeccion.experiencia.map(pieza);
    partes.push(`${titulo('experiencia')}\nDel empleo más reciente al más antiguo. "hoy" significa que sigue en el puesto.\n\n${[...lugares, ...charlas].join('\n\n')}`);
  }

  if (visibles.includes('publicaciones')) {
    const academicas = porSeccion.publicaciones.map(pieza);
    const divulgacion = `### Artículos de divulgación en LinkedIn (${articulos.length})\n${articulos
      .map((a) => `- ${a.titulo} (${a.fecha.slice(0, 4)}): ${a.url}`)
      .join('\n')}`;
    partes.push(`${titulo('publicaciones')}\n\n${[...academicas, divulgacion].join('\n\n')}`);
  }

  return new Response(`${partes.join('\n\n')}\n`, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};

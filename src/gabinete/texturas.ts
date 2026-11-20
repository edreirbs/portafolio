// Texturas dibujadas en canvas: no se descarga nada y todo es original del gabinete.
import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Texture } from 'three';

const SERIF = '"Fraunces Variable", Georgia, serif';
const SANS = '"Inter Variable", system-ui, sans-serif';
const MONO = '"IBM Plex Mono", ui-monospace, monospace';

/** Generador determinista: la escena sale igual en cada visita. */
export function azar(semilla: number) {
  let s = semilla >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lienzo(ancho: number, alto: number) {
  const c = document.createElement('canvas');
  c.width = ancho;
  c.height = alto;
  const ctx = c.getContext('2d')!;
  return { c, ctx };
}

function textura(c: HTMLCanvasElement, repetir = false): Texture {
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  if (repetir) t.wrapS = t.wrapT = RepeatWrapping;
  return t;
}

/** Papel envejecido: base para diplomas, mapas y periódicos. */
function papel(ctx: CanvasRenderingContext2D, w: number, h: number, base = '#e9dcbc', semilla = 1) {
  const r = azar(semilla);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(120, 84, 40, ${r() * 0.05})`;
    ctx.beginPath();
    ctx.arc(r() * w, r() * h, r() * 12 + 1, 0, Math.PI * 2);
    ctx.fill();
  }
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(92, 58, 20, 0.35)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function partir(ctx: CanvasRenderingContext2D, texto: string, ancho: number): string[] {
  const palabras = texto.split(' ');
  const lineas: string[] = [];
  let actual = '';
  for (const p of palabras) {
    const prueba = actual ? `${actual} ${p}` : p;
    if (ctx.measureText(prueba).width > ancho && actual) {
      lineas.push(actual);
      actual = p;
    } else actual = prueba;
  }
  if (actual) lineas.push(actual);
  return lineas;
}

/** Muro tapizado con damasco verde botella. */
export function muroDamasco(): Texture {
  const { c, ctx } = lienzo(256, 256);
  ctx.fillStyle = '#1d3328';
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = 'rgba(176, 141, 87, 0.16)';
  ctx.fillStyle = 'rgba(12, 28, 20, 0.55)';
  ctx.lineWidth = 2;
  const flor = (x: number, y: number, s: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(18, -10, 30, -40, 0, -56);
      ctx.bezierCurveTo(-30, -40, -18, -10, 0, 0);
    }
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };
  flor(128, 128, 0.9);
  for (const [x, y] of [[0, 0], [256, 0], [0, 256], [256, 256]] as const) flor(x, y, 0.55);
  return textura(c, true);
}

/** Alfombra persa con medallón, cenefas y fleco. */
export function alfombra(): Texture {
  const w = 1024;
  const h = 720;
  const { c, ctx } = lienzo(w, h);
  const r = azar(7);
  ctx.fillStyle = '#3d120f';
  ctx.fillRect(0, 0, w, h);
  const marcos: [number, string][] = [
    [18, '#18203a'],
    [46, '#9c7d55'],
    [54, '#2c0d0b'],
    [92, '#18203a'],
    [100, '#4e1713'],
  ];
  for (const [m, color] of marcos) {
    ctx.fillStyle = color;
    ctx.fillRect(m, m, w - m * 2, h - m * 2);
  }
  // Grecas de la cenefa
  ctx.fillStyle = '#9c7d55';
  for (let x = 62; x < w - 62; x += 22) {
    ctx.beginPath();
    ctx.moveTo(x, 62);
    ctx.lineTo(x + 11, 76);
    ctx.lineTo(x + 22, 62);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, h - 62);
    ctx.lineTo(x + 11, h - 76);
    ctx.lineTo(x + 22, h - 62);
    ctx.fill();
  }
  // Medallón central
  ctx.save();
  ctx.translate(w / 2, h / 2);
  for (const [rx, color] of [
    [205, '#18203a'],
    [176, '#9c7d55'],
    [166, '#2c0d0b'],
    [104, '#9c7d55'],
    [88, '#18203a'],
    [40, '#7a2a1e'],
  ] as const) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i <= 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const rr = i % 2 ? rx * 0.82 : rx;
      ctx.lineTo(Math.cos(a) * rr * 1.25, Math.sin(a) * rr * 0.8);
    }
    ctx.fill();
  }
  ctx.restore();
  // Retícula de botehs (gotas persas) en el campo, y desgaste
  for (let y = 128; y < h - 120; y += 38) {
    for (let x = 128 + ((y / 38) % 2) * 19; x < w - 120; x += 38) {
      const dx = (x - w / 2) / 1.25;
      const dy = y - h / 2;
      if (dx * dx + dy * dy < 215 * 215) continue;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(((x + y) % 4) * (Math.PI / 2));
      ctx.fillStyle = (x + y) % 3 ? 'rgba(156,125,85,0.45)' : 'rgba(24,32,58,0.55)';
      ctx.beginPath();
      ctx.arc(0, 3, 6, 0, Math.PI * 2);
      ctx.moveTo(-6, 3);
      ctx.quadraticCurveTo(-2, -12, 5, -10);
      ctx.fill();
      ctx.restore();
    }
  }
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = r() > 0.6 ? `rgba(255,230,190,${r() * 0.05})` : `rgba(0,0,0,${r() * 0.12})`;
    ctx.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
  }
  return textura(c);
}

/** Carta náutica antigua con rosa de los vientos e islas imaginarias. */
export function carta(semilla = 3, rotulo = 'Mare Incognitum'): Texture {
  const w = 1024;
  const h = 700;
  const { c, ctx } = lienzo(w, h);
  papel(ctx, w, h, '#e3d2a8', semilla);
  const r = azar(semilla + 10);
  ctx.strokeStyle = 'rgba(90, 60, 30, 0.35)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  // Islas
  for (let i = 0; i < 6; i++) {
    const cx = 120 + r() * (w - 240);
    const cy = 100 + r() * (h - 200);
    const radio = 30 + r() * 90;
    ctx.beginPath();
    for (let a = 0; a <= 40; a++) {
      const t = (a / 40) * Math.PI * 2;
      const rr = radio * (0.7 + r() * 0.45);
      ctx.lineTo(cx + Math.cos(t) * rr, cy + Math.sin(t) * rr * 0.75);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(160, 128, 74, 0.45)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(70, 44, 20, 0.85)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  // Rosa de los vientos
  ctx.save();
  ctx.translate(w - 170, h - 160);
  for (let i = 0; i < 16; i++) {
    ctx.rotate(Math.PI / 8);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(8, -20);
    ctx.lineTo(0, i % 2 ? -60 : -110);
    ctx.lineTo(-8, -20);
    ctx.closePath();
    ctx.fillStyle = i % 2 ? 'rgba(70,44,20,0.5)' : 'rgba(110, 33, 28, 0.85)';
    ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(60, 38, 18, 0.9)';
  ctx.font = `italic 600 46px ${SERIF}`;
  ctx.fillText(rotulo, 70, 90);
  ctx.font = `20px ${MONO}`;
  ctx.fillText('Gabinete de E. Robles · MMXXVI', 72, 124);
  return textura(c);
}

/** Globo terráqueo en proyección equirectangular. */
export function globoTerraqueo(): Texture {
  const w = 1024;
  const h = 512;
  const { c, ctx } = lienzo(w, h);
  papel(ctx, w, h, '#d9c08c', 11);
  const r = azar(19);
  for (let i = 0; i < 9; i++) {
    const cx = r() * w;
    const cy = 80 + r() * (h - 160);
    const radio = 40 + r() * 110;
    ctx.beginPath();
    for (let a = 0; a <= 48; a++) {
      const t = (a / 48) * Math.PI * 2;
      const rr = radio * (0.65 + r() * 0.5);
      ctx.lineTo(cx + Math.cos(t) * rr * 1.3, cy + Math.sin(t) * rr * 0.7);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(122, 90, 43, 0.55)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(60, 36, 14, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(80, 52, 24, 0.45)';
  ctx.lineWidth = 1.2;
  for (let x = 0; x <= w; x += w / 24) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += h / 12) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(110, 33, 28, 0.7)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();
  return textura(c);
}

/** Primera plana de un periódico decimonónico. */
export function periodico(nombre: string, titular: string, semilla = 5): Texture {
  const w = 600;
  const h = 840;
  const { c, ctx } = lienzo(w, h);
  papel(ctx, w, h, '#ece2c8', semilla);
  const r = azar(semilla);
  ctx.fillStyle = '#1b140e';
  ctx.textAlign = 'center';
  ctx.font = `700 64px ${SERIF}`;
  ctx.fillText(nombre, w / 2, 86);
  ctx.fillRect(30, 104, w - 60, 3);
  ctx.font = `16px ${MONO}`;
  ctx.fillText('EDICIÓN SEMANAL · PUBLICADA SIN INTERVENCIÓN HUMANA', w / 2, 128);
  ctx.fillRect(30, 140, w - 60, 1.5);
  ctx.font = `600 36px ${SERIF}`;
  const lineas = partir(ctx, titular, w - 80);
  lineas.slice(0, 2).forEach((l, i) => ctx.fillText(l, w / 2, 190 + i * 42));
  ctx.textAlign = 'left';
  const top = 190 + Math.min(lineas.length, 2) * 42;
  for (let col = 0; col < 3; col++) {
    const x = 32 + col * ((w - 64) / 3);
    for (let y = top; y < h - 40; y += 13) {
      const largo = ((w - 64) / 3 - 18) * (0.6 + r() * 0.4);
      ctx.fillStyle = 'rgba(27,20,14,0.55)';
      ctx.fillRect(x, y, largo, 4);
    }
  }
  return textura(c);
}

/** Diploma en pergamino, con sello de lacre. */
export function diploma(titulo: string, institucion: string, fecha: string, semilla = 9): Texture {
  const w = 700;
  const h = 520;
  const { c, ctx } = lienzo(w, h);
  papel(ctx, w, h, '#efe3c4', semilla);
  ctx.strokeStyle = 'rgba(122, 90, 43, 0.8)';
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, w - 48, h - 48);
  ctx.lineWidth = 1;
  ctx.strokeRect(34, 34, w - 68, h - 68);
  ctx.fillStyle = '#2a1d10';
  ctx.textAlign = 'center';
  ctx.font = `18px ${MONO}`;
  ctx.fillText(institucion.toUpperCase(), w / 2, 92);
  ctx.font = `italic 22px ${SERIF}`;
  ctx.fillText('otorga a', w / 2, 140);
  ctx.font = `700 44px ${SERIF}`;
  ctx.fillText('Edrei Robles', w / 2, 194);
  ctx.font = `italic 22px ${SERIF}`;
  ctx.fillText('el grado de', w / 2, 236);
  ctx.font = `600 34px ${SERIF}`;
  partir(ctx, titulo, w - 120)
    .slice(0, 3)
    .forEach((l, i) => ctx.fillText(l, w / 2, 288 + i * 40));
  ctx.font = `18px ${MONO}`;
  ctx.fillText(fecha, w / 2, h - 70);
  // Sello
  ctx.fillStyle = '#7d1f1a';
  ctx.beginPath();
  ctx.arc(w - 110, h - 104, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,220,200,0.35)';
  ctx.beginPath();
  ctx.arc(w - 120, h - 114, 12, 0, Math.PI * 2);
  ctx.fill();
  return textura(c);
}

/** Portada de revista académica encuadernada. */
export function portadaRevista(titulo: string, revista: string): Texture {
  const w = 512;
  const h = 700;
  const { c, ctx } = lienzo(w, h);
  ctx.fillStyle = '#26402f';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#c9a36a';
  ctx.lineWidth = 4;
  ctx.strokeRect(26, 26, w - 52, h - 52);
  ctx.fillStyle = '#d9b77a';
  ctx.textAlign = 'center';
  ctx.font = `600 34px ${SERIF}`;
  partir(ctx, revista, w - 100).forEach((l, i) => ctx.fillText(l, w / 2, 110 + i * 40));
  ctx.font = `italic 26px ${SERIF}`;
  partir(ctx, titulo, w - 110)
    .slice(0, 6)
    .forEach((l, i) => ctx.fillText(l, w / 2, 280 + i * 34));
  ctx.font = `18px ${MONO}`;
  ctx.fillText('VOL. 15 · NÚM. 30 · MMXXII', w / 2, h - 70);
  return textura(c);
}

/** Placa de latón grabada para cada estación. */
export function placa(titulo: string, subtitulo: string, montaje: boolean): Texture {
  const w = 768;
  const h = 256;
  const { c, ctx } = lienzo(w, h);
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#8a6a33');
  g.addColorStop(0.45, '#d6b06a');
  g.addColorStop(0.55, '#c49a52');
  g.addColorStop(1, '#7a5a2b');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(50, 32, 10, 0.75)';
  ctx.lineWidth = 6;
  ctx.strokeRect(14, 14, w - 28, h - 28);
  for (const [x, y] of [[34, 34], [w - 34, 34], [34, h - 34], [w - 34, h - 34]] as const) {
    ctx.fillStyle = 'rgba(50, 32, 10, 0.8)';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(40, 24, 6, 0.92)';
  ctx.textAlign = 'center';
  ctx.font = `600 78px ${SERIF}`;
  ctx.fillText(titulo, w / 2, 122);
  ctx.font = `30px ${MONO}`;
  ctx.fillText((montaje ? 'En montaje' : subtitulo).toUpperCase(), w / 2, 186);
  return textura(c);
}

/** Etiqueta de papel de un espécimen. */
export function etiqueta(texto: string, sub: string): Texture {
  const w = 512;
  const h = 200;
  const { c, ctx } = lienzo(w, h);
  papel(ctx, w, h, '#f1e7cf', 21);
  ctx.strokeStyle = 'rgba(60,40,20,0.6)';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, w - 20, h - 20);
  ctx.fillStyle = '#2a1d10';
  ctx.textAlign = 'center';
  ctx.font = `italic 600 42px ${SERIF}`;
  ctx.fillText(texto, w / 2, 92);
  ctx.font = `22px ${SANS}`;
  ctx.fillText(sub, w / 2, 146);
  return textura(c);
}

export async function fuentesListas(): Promise<void> {
  try {
    await Promise.all([
      document.fonts.load(`600 40px ${SERIF}`),
      document.fonts.load(`italic 600 40px ${SERIF}`),
      document.fonts.load(`20px ${MONO}`),
      document.fonts.load(`20px ${SANS}`),
    ]);
  } catch {
    /* si no cargan, el canvas usa las de respaldo */
  }
}

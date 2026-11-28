// Spec 0018 · El mayordomo del gabinete: un autómata humanoide de latón, cobre y acero pavonado,
// con frac, chaleco de damasco, chistera con gafas, monóculo y una ventanilla en el pecho por la que
// se ven girar sus engranes. Todo se modela en código: no hay modelos libres con este nivel de detalle.
//
// Mide unos 1.85 m con la chistera. Mira hacia +z. API en userData:
//   actualizar(dt, t, velocidad, giroCabeza) · anima la marcha (velocidad en m/s) y el reposo.
//   reverencia() · se inclina y se quita un poco la chistera.
import {
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Path,
  RepeatWrapping,
  Shape,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  type Material,
  type Object3D,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ───────────────────────── Texturas pintadas en canvas ─────────────────────────
function lienzo(lado: number) {
  const c = document.createElement('canvas');
  c.width = c.height = lado;
  return { c, ctx: c.getContext('2d')! };
}

/** Grabado de filigrana para el latón: volutas en relieve (mapa de relieve en grises). */
function grabado(): CanvasTexture {
  const { c, ctx } = lienzo(256);
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);
  ctx.lineCap = 'round';
  const voluta = (x: number, y: number, r: number, giro: number) => {
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 3.2; a += 0.08) {
      const rr = r * (1 - a / (Math.PI * 3.6));
      const px = x + Math.cos(a * giro) * rr;
      const py = y + Math.sin(a * giro) * rr;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  };
  for (const [tono, ancho] of [
    ['#5a5a5a', 3.2],
    ['#b4b4b4', 1.6],
  ] as const) {
    ctx.strokeStyle = tono;
    ctx.lineWidth = ancho;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const x = 32 + i * 64;
        const y = 32 + j * 64;
        voluta(x, y, 24, (i + j) % 2 ? 1 : -1);
        ctx.beginPath();
        ctx.moveTo(x - 30, y + 30);
        ctx.quadraticCurveTo(x, y + 8, x + 30, y + 30);
        ctx.stroke();
      }
    }
  }
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(2, 2);
  return t;
}

/** Damasco burdeos para el chaleco. */
function damasco(): CanvasTexture {
  const { c, ctx } = lienzo(256);
  ctx.fillStyle = '#4e1418';
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = '#6a1d22';
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const x = 32 + i * 64 + (j % 2) * 32;
      const y = 32 + j * 64;
      ctx.beginPath();
      ctx.moveTo(x, y - 24);
      ctx.bezierCurveTo(x + 22, y - 10, x + 22, y + 10, x, y + 24);
      ctx.bezierCurveTo(x - 22, y + 10, x - 22, y - 10, x, y - 24);
      ctx.fill();
      ctx.fillStyle = '#3d0f12';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6a1d22';
    }
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(3, 3);
  return t;
}

/** Trama fina de lana para el frac (relieve). */
function tejido(): CanvasTexture {
  const { c, ctx } = lienzo(128);
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 2) {
    ctx.fillStyle = y % 4 ? '#8c8c8c' : '#747474';
    ctx.fillRect(0, y, 128, 1);
  }
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(6, 6);
  return t;
}

/** Bocanada de vapor: un círculo difuso. */
function vapor(): CanvasTexture {
  const { c, ctx } = lienzo(64);
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
}

// ───────────────────────── Geometrías de apoyo ─────────────────────────
/** Un miembro torneado que cuelga hacia -y, con un leve abultamiento (músculo o manga). */
function miembro(largo: number, r0: number, r1: number, bulto = 0, segmentos = 20): LatheGeometry {
  const n = 12;
  const puntos = [new Vector2(0, 0)];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    puntos.push(new Vector2(r0 + (r1 - r0) * t + bulto * Math.sin(Math.PI * t), -largo * t));
  }
  puntos.push(new Vector2(0, -largo));
  return new LatheGeometry(puntos.reverse(), segmentos);
}

/** Un engrane con dientes y un hueco al centro, de canto sobre el plano XY. */
function engrane(radio: number, dientes: number, grosor: number): ExtrudeGeometry {
  const forma = new Shape();
  const pasos = dientes * 4;
  for (let i = 0; i <= pasos; i++) {
    const a = (i / pasos) * Math.PI * 2;
    const r = i % 4 < 2 ? radio : radio * 0.84;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) forma.moveTo(x, y);
    else forma.lineTo(x, y);
  }
  const hueco = new Path();
  hueco.absarc(0, 0, radio * 0.28, 0, Math.PI * 2, true);
  forma.holes.push(hueco);
  const g = new ExtrudeGeometry(forma, { depth: grosor, bevelEnabled: true, bevelThickness: grosor * 0.2, bevelSize: radio * 0.03, bevelSegments: 1 });
  g.translate(0, 0, -grosor / 2);
  return g;
}

function tubo(puntos: [number, number, number][], radio: number): TubeGeometry {
  return new TubeGeometry(new CatmullRomCurve3(puntos.map((p) => new Vector3(...p))), 24, radio, 8, false);
}

function malla(geo: BufferGeometry, mat: Material, pos: [number, number, number] = [0, 0, 0], rot: [number, number, number] = [0, 0, 0], esc?: [number, number, number]) {
  const m = new Mesh(geo, mat);
  m.position.set(...pos);
  m.rotation.set(...rot);
  if (esc) m.scale.set(...esc);
  return m;
}

/**
 * Une las piezas rígidas de un grupo por material: muchas piezas pequeñas, pocas llamadas de dibujo.
 * Las piezas marcadas con userData.mueve (engranes, ojos, vapor) se quedan sueltas.
 */
function fundir(grupo: Group) {
  const porMaterial = new Map<Material, BufferGeometry[]>();
  for (const hijo of [...grupo.children]) {
    const m = hijo as Mesh;
    if (!m.isMesh || m.userData.mueve) continue;
    m.updateMatrix();
    const g = (m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()).applyMatrix4(m.matrix);
    for (const nombre of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(nombre)) g.deleteAttribute(nombre);
    g.clearGroups();
    const mat = m.material as Material;
    if (!porMaterial.has(mat)) porMaterial.set(mat, []);
    porMaterial.get(mat)!.push(g);
    grupo.remove(m);
  }
  for (const [mat, geos] of porMaterial) {
    const unida = new Mesh(mergeGeometries(geos, false)!, mat);
    unida.castShadow = true;
    unida.receiveShadow = true;
    grupo.add(unida);
  }
}

/**
 * Cabeza esculpida: un elipsoide deformado vértice por vértice para darle rasgos humanos (cuencas,
 * cejas, nariz, pómulos, labios, mandíbula angosta y mentón), como una máscara art déco.
 */
function cabezaEsculpida(): BufferGeometry {
  const RX = 0.077;
  const RY = 0.112;
  const RZ = 0.094;
  const g = new SphereGeometry(1, 72, 56);
  const pos = g.attributes.position!;
  const gauss = (v: number, c: number, a: number) => Math.exp(-(((v - c) / a) ** 2));
  const paso = (a: number, b: number, v: number) => {
    const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i) * RX;
    const y = pos.getY(i) * RY;
    let z = pos.getZ(i) * RZ;
    const u = y / RY;
    // Mandíbula que se angosta hacia el mentón; nuca un poco más plana
    const quijada = paso(0.05, -0.95, u);
    // Cráneo redondo y ancho arriba; mandíbula angosta abajo
    x *= (1 - 0.34 * quijada) * (1 + 0.07 * paso(0.1, 0.85, u));
    z *= 1 + 0.05 * paso(0.2, 0.9, u);
    if (z < 0) z *= 1 - 0.2 * quijada;
    else z *= 1 - 0.1 * quijada;
    if (z > 0) {
      const frente = paso(0.25, 0.95, z / RZ);
      const ax = Math.abs(x);
      let d = 0;
      d -= 0.011 * gauss(ax, 0.029, 0.016) * gauss(y, 0.018, 0.013); // cuencas
      d += 0.006 * gauss(y, 0.04, 0.009) * paso(0.06, 0.03, ax); // cejas
      d += 0.006 * gauss(ax, 0.044, 0.016) * gauss(y, -0.012, 0.016); // pómulos
      // Nariz: del entrecejo a la punta
      const tabique = paso(0.035, -0.008, y) * paso(-0.032, -0.012, y);
      d += (0.006 + 0.018 * paso(0.03, -0.012, y)) * tabique * gauss(x, 0, 0.0105 + 0.004 * paso(0.02, -0.02, y));
      d -= 0.003 * gauss(y, -0.058, 0.003) * gauss(x, 0, 0.02); // comisura
      d += 0.0045 * gauss(y, -0.051, 0.006) * gauss(x, 0, 0.018); // labio superior
      d += 0.004 * gauss(y, -0.066, 0.006) * gauss(x, 0, 0.016); // labio inferior
      d += 0.007 * gauss(y, -0.098, 0.014) * gauss(x, 0, 0.022); // mentón
      z += d * frente;
    }
    pos.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  return g;
}

// ───────────────────────── El mayordomo ─────────────────────────
export function mayordomo(): Group {
  const relieve = grabado();
  const M = {
    laton: new MeshStandardMaterial({ color: 0xc9a25a, metalness: 1, roughness: 0.3, bumpMap: relieve, bumpScale: 0.7 }),
    pulido: new MeshStandardMaterial({ color: 0xe8c47c, metalness: 1, roughness: 0.16 }),
    rostro: new MeshStandardMaterial({ color: 0xdcb46a, metalness: 1, roughness: 0.22 }),
    cobre: new MeshStandardMaterial({ color: 0xb4693a, metalness: 1, roughness: 0.3 }),
    pavonado: new MeshStandardMaterial({ color: 0x30353b, metalness: 1, roughness: 0.36, bumpMap: relieve, bumpScale: 0.35 }),
    oscuro: new MeshStandardMaterial({ color: 0x3a2a18, metalness: 1, roughness: 0.4 }),
    frac: new MeshStandardMaterial({ color: 0x121114, roughness: 0.72, bumpMap: tejido(), bumpScale: 0.5, side: DoubleSide }),
    seda: new MeshStandardMaterial({ color: 0x0d0c0c, roughness: 0.26, metalness: 0.15, side: DoubleSide }),
    chaleco: new MeshStandardMaterial({ map: damasco(), roughness: 0.55 }),
    camisa: new MeshStandardMaterial({ color: 0xf1ebdf, roughness: 0.7 }),
    corbata: new MeshStandardMaterial({ color: 0x6e1a20, roughness: 0.32, metalness: 0.1 }),
    cuero: new MeshStandardMaterial({ color: 0x0b0a09, roughness: 0.2, metalness: 0.25 }),
    polaina: new MeshStandardMaterial({ color: 0x9a948b, roughness: 0.8 }),
    vidrio: new MeshPhysicalMaterial({ color: 0xfff3dc, roughness: 0.04, transparent: true, opacity: 0.22, clearcoat: 1 }),
    ambar: new MeshPhysicalMaterial({ color: 0xffb04a, roughness: 0.08, transparent: true, opacity: 0.5, clearcoat: 1 }),
  };
  const ojoMat = () => new MeshStandardMaterial({ color: 0x1a0c02, emissive: 0xff7a12, emissiveIntensity: 1.5, roughness: 0.3 });

  const raiz = new Group();
  const cuerpo = new Group(); // sube y baja con el paso
  raiz.add(cuerpo);
  const engranes: { m: Mesh; v: number }[] = [];
  const ojos: Mesh[] = [];

  // ── Piernas ──
  const CADERA = 0.97;
  const piernas: { muslo: Group; rodilla: Group; tobillo: Group }[] = [];
  for (const s of [-1, 1]) {
    const muslo = new Group();
    muslo.position.set(s * 0.1, CADERA, 0);
    muslo.add(malla(new SphereGeometry(0.066, 20, 14), M.laton));
    muslo.add(malla(miembro(0.44, 0.074, 0.056, 0.012), M.pavonado));
    for (const y of [-0.1, -0.3]) muslo.add(malla(new TorusGeometry(0.068 - y * 0.03, 0.007, 8, 28), M.pulido, [0, y, 0], [Math.PI / 2, 0, 0]));
    muslo.add(malla(new CylinderGeometry(0.007, 0.007, 0.3, 8), M.cobre, [s * 0.064, -0.2, 0.01]));
    muslo.add(malla(new CylinderGeometry(0.013, 0.013, 0.1, 10), M.pulido, [s * 0.064, -0.12, 0.01]));
    fundir(muslo);

    const rodilla = new Group();
    rodilla.position.y = -0.44;
    rodilla.add(malla(new SphereGeometry(0.052, 18, 12), M.laton));
    rodilla.add(malla(new CylinderGeometry(0.022, 0.022, 0.118, 16), M.pulido, [0, 0, 0], [0, 0, Math.PI / 2]));
    rodilla.add(malla(new SphereGeometry(0.03, 14, 10), M.pulido, [0, 0.005, 0.04], [0, 0, 0], [1, 1, 0.6]));
    rodilla.add(malla(miembro(0.43, 0.056, 0.042, 0.014), M.pavonado));
    rodilla.add(malla(new TorusGeometry(0.046, 0.006, 8, 24), M.pulido, [0, -0.38, 0], [Math.PI / 2, 0, 0]));
    rodilla.add(malla(new CylinderGeometry(0.008, 0.008, 0.3, 8), M.cobre, [0, -0.22, -0.055]));
    rodilla.add(malla(new CylinderGeometry(0.015, 0.015, 0.13, 10), M.laton, [0, -0.14, -0.055]));
    // Polaina
    rodilla.add(malla(new CylinderGeometry(0.05, 0.056, 0.07, 20), M.polaina, [0, -0.405, 0.004]));
    fundir(rodilla);
    muslo.add(rodilla);

    const tobillo = new Group();
    tobillo.position.y = -0.44;
    tobillo.add(malla(new SphereGeometry(0.038, 14, 10), M.laton));
    // Botín de charol con puntera de latón
    tobillo.add(malla(new BoxGeometry(0.095, 0.06, 0.2), M.cuero, [0, -0.05, 0.04]));
    tobillo.add(malla(new SphereGeometry(0.05, 18, 12), M.cuero, [0, -0.055, 0.14], [0, 0, 0], [0.95, 0.62, 1]));
    tobillo.add(malla(new SphereGeometry(0.05, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.pulido, [0, -0.06, 0.155], [0.25, 0, 0], [0.9, 0.5, 0.75]));
    tobillo.add(malla(new BoxGeometry(0.1, 0.012, 0.21), M.oscuro, [0, -0.08, 0.06]));
    fundir(tobillo);
    rodilla.add(tobillo);
    cuerpo.add(muslo);
    piernas.push({ muslo, rodilla, tobillo });
  }

  // ── Torso: chaleco de damasco, frac abierto con faldones, solapas de seda ──
  const torso = new Group();
  torso.position.y = CADERA;
  cuerpo.add(torso);
  const perfil = (escala = 1) =>
    [
      [0, -0.02],
      [0.15, -0.02],
      [0.152, 0.08],
      [0.138, 0.18],
      [0.15, 0.3],
      [0.172, 0.42],
      [0.168, 0.5],
      [0.12, 0.57],
      [0.06, 0.6],
      [0, 0.6],
    ].map(([r, y]) => new Vector2(r! * escala, y!));
  const fijo = new Group();
  torso.add(fijo);
  fijo.add(malla(new LatheGeometry(perfil(), 40), M.chaleco, [0, 0, 0], [0, 0, 0], [1, 1, 0.72]));
  // Pelvis de acero
  fijo.add(malla(new SphereGeometry(0.15, 24, 12), M.pavonado, [0, 0.01, 0], [0, 0, 0], [1.05, 0.45, 0.78]));
  // Botones, cadena del reloj y su leontina
  const frente = (r: number) => r * 0.72 + 0.006;
  for (let i = 0; i < 5; i++) {
    const y = 0.12 + i * 0.065;
    const r = y < 0.18 ? 0.14 : y < 0.3 ? 0.145 : 0.165;
    fijo.add(malla(new SphereGeometry(0.0095, 10, 8), M.pulido, [0, y, frente(r)]));
  }
  fijo.add(malla(tubo([[0, 0.25, 0.111], [-0.03, 0.215, 0.112], [-0.065, 0.2, 0.108], [-0.1, 0.22, 0.098]], 0.0028), M.pulido));
  fijo.add(malla(new CylinderGeometry(0.018, 0.018, 0.008, 20), M.pulido, [-0.1, 0.22, 0.1], [Math.PI / 2, 0, 0]));
  // Frac abierto al frente (de 0.6 a 2π-0.6 rad) y faldones
  fijo.add(malla(new LatheGeometry(perfil(1.07).slice(1, -1), 48, 0.62, Math.PI * 2 - 1.24), M.frac, [0, 0, 0], [0, 0, 0], [1, 1, 0.76]));
  for (const s of [-1, 1]) {
    // Solapas de seda en pico
    fijo.add(malla(new BoxGeometry(0.052, 0.27, 0.008), M.seda, [s * 0.09, 0.41, 0.118], [-0.12, s * 0.42, s * 0.3]));
    fijo.add(malla(new BoxGeometry(0.03, 0.06, 0.008), M.seda, [s * 0.125, 0.535, 0.098], [-0.2, s * 0.5, -s * 0.5]));
  }
  // Hombreras de latón
  for (const s of [-1, 1]) fijo.add(malla(new SphereGeometry(0.042, 18, 12), M.laton, [s * 0.198, 0.515, 0], [0, 0, 0], [1, 0.6, 1]));
  // Cuello de camisa, corbata de lazo y alfiler
  fijo.add(malla(new CylinderGeometry(0.052, 0.064, 0.075, 24, 1, true), M.camisa, [0, 0.615, 0]));
  for (const s of [-1, 1]) fijo.add(malla(new ConeGeometry(0.022, 0.05, 3), M.camisa, [s * 0.03, 0.575, 0.058], [Math.PI, 0, s * 0.5]));
  fijo.add(malla(new SphereGeometry(0.032, 16, 12), M.corbata, [0, 0.56, 0.07], [0, 0, 0], [1.3, 0.85, 0.75]));
  fijo.add(malla(new ConeGeometry(0.036, 0.1, 16), M.corbata, [0, 0.5, 0.083], [Math.PI + 0.25, 0, 0], [1, 1, 0.5]));
  fijo.add(malla(new SphereGeometry(0.0075, 10, 8), M.pulido, [0, 0.545, 0.098]));
  // Caldera de cobre a la espalda, con remaches, válvula y tubos a los hombros
  fijo.add(malla(new CylinderGeometry(0.068, 0.068, 0.25, 28), M.cobre, [0, 0.34, -0.17]));
  for (const y of [0.22, 0.46]) fijo.add(malla(new TorusGeometry(0.069, 0.008, 8, 28), M.pulido, [0, y, -0.17], [Math.PI / 2, 0, 0]));
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    fijo.add(malla(new SphereGeometry(0.0055, 6, 5), M.pulido, [Math.sin(a) * 0.07, 0.34, -0.17 + Math.cos(a) * 0.07]));
  }
  fijo.add(malla(new CylinderGeometry(0.012, 0.012, 0.05, 10), M.laton, [0, 0.49, -0.17]));
  fijo.add(malla(new TorusGeometry(0.026, 0.004, 6, 20), M.cobre, [0, 0.515, -0.17], [Math.PI / 2, 0, 0]));
  for (const s of [-1, 1]) fijo.add(malla(tubo([[s * 0.04, 0.44, -0.2], [s * 0.1, 0.52, -0.18], [s * 0.17, 0.53, -0.07], [s * 0.2, 0.5, -0.03]], 0.0085), M.cobre));
  fundir(fijo);

  // Ventanilla del pecho con engranes que giran
  const ventanilla = new Group();
  ventanilla.position.set(0.075, 0.37, 0.124);
  ventanilla.rotation.y = 0.25;
  ventanilla.add(malla(new TorusGeometry(0.044, 0.008, 10, 32), M.pulido));
  ventanilla.add(malla(new CylinderGeometry(0.045, 0.045, 0.006, 32), M.oscuro, [0, 0, -0.012], [Math.PI / 2, 0, 0]));
  for (const [x, y, r, d, v] of [
    [-0.012, 0.008, 0.024, 12, 1.4],
    [0.022, -0.016, 0.016, 9, -2.1],
    [0.006, -0.03, 0.011, 7, 3],
  ] as const) {
    const e = malla(engrane(r, d, 0.004), d % 2 ? M.cobre : M.pulido, [x, y, -0.005]);
    e.userData.mueve = true;
    ventanilla.add(e);
    engranes.push({ m: e, v });
  }
  const cristal = malla(new CylinderGeometry(0.042, 0.042, 0.003, 32), M.vidrio, [0, 0, 0.004], [Math.PI / 2, 0, 0]);
  cristal.userData.mueve = true;
  ventanilla.add(cristal);
  torso.add(ventanilla);

  // Faldones del frac: se mecen al andar
  const faldones = new Group();
  faldones.position.set(0, 0.1, -0.09);
  for (const s of [-1, 1]) faldones.add(malla(new BoxGeometry(0.125, 0.56, 0.01), M.frac, [s * 0.07, -0.27, -0.01], [0, 0, s * 0.05]));
  fundir(faldones);
  torso.add(faldones);

  // ── Brazos ──
  const brazos: { hombro: Group; codo: Group }[] = [];
  for (const s of [-1, 1]) {
    const hombro = new Group();
    hombro.position.set(s * 0.215, 0.5, 0);
    hombro.rotation.z = s * 0.07;
    hombro.add(malla(miembro(0.3, 0.058, 0.05, 0.006), M.frac));
    hombro.add(malla(new TorusGeometry(0.05, 0.008, 8, 24), M.pulido, [0, -0.28, 0], [Math.PI / 2, 0, 0]));
    hombro.add(malla(new CylinderGeometry(0.053, 0.05, 0.04, 20, 1, true), M.camisa, [0, -0.3, 0]));
    fundir(hombro);
    const codo = new Group();
    codo.position.y = -0.31;
    codo.add(malla(new SphereGeometry(0.042, 16, 12), M.laton));
    codo.add(malla(new CylinderGeometry(0.018, 0.018, 0.1, 12), M.pulido, [0, 0, 0], [0, 0, Math.PI / 2]));
    codo.add(malla(miembro(0.25, 0.043, 0.031, 0.009), M.pavonado));
    for (const z of [0.03, -0.03]) {
      codo.add(malla(new CylinderGeometry(0.005, 0.005, 0.2, 8), M.cobre, [s * 0.026, -0.13, z]));
      codo.add(malla(new CylinderGeometry(0.01, 0.01, 0.07, 10), M.laton, [s * 0.026, -0.08, z]));
    }
    codo.add(malla(new TorusGeometry(0.034, 0.006, 8, 22), M.pulido, [0, -0.25, 0], [Math.PI / 2, 0, 0]));
    // Mano de latón: palma, nudillos, cuatro dedos de dos falanges y pulgar
    codo.add(malla(new BoxGeometry(0.068, 0.075, 0.03), M.laton, [0, -0.3, 0]));
    codo.add(malla(new CylinderGeometry(0.008, 0.008, 0.07, 10), M.pulido, [0, -0.337, 0.005], [0, 0, Math.PI / 2]));
    for (let i = 0; i < 4; i++) {
      const x = -0.025 + i * 0.0167;
      codo.add(malla(new CylinderGeometry(0.0078, 0.0072, 0.036, 8), M.laton, [x, -0.357, 0.008], [0.25, 0, 0]));
      codo.add(malla(new CylinderGeometry(0.007, 0.006, 0.03, 8), M.laton, [x, -0.386, 0.02], [0.6, 0, 0]));
      codo.add(malla(new SphereGeometry(0.0068, 6, 5), M.pulido, [x, -0.373, 0.013]));
    }
    codo.add(malla(new CylinderGeometry(0.0085, 0.0075, 0.045, 8), M.laton, [-s * 0.04, -0.31, 0.018], [0.4, 0, s * 0.7]));
    fundir(codo);
    hombro.add(codo);
    torso.add(hombro);
    brazos.push({ hombro, codo });
  }
  // El brazo derecho del mayordomo (+x) sostiene una charola de plata con una tarjeta.
  const [brazoLibre, brazoCharola] = brazos as [{ hombro: Group; codo: Group }, { hombro: Group; codo: Group }];
  brazoCharola.hombro.rotation.x = -0.18;
  brazoCharola.codo.rotation.x = -1.32;
  const charola = new Group();
  charola.position.set(0, -0.31, 0.03);
  charola.rotation.x = 1.5;
  charola.add(malla(new CylinderGeometry(0.12, 0.11, 0.008, 40), M.pulido));
  charola.add(malla(new TorusGeometry(0.12, 0.006, 8, 40), M.laton, [0, 0.004, 0], [Math.PI / 2, 0, 0]));
  charola.add(malla(new BoxGeometry(0.08, 0.002, 0.052), M.camisa, [-0.012, 0.006, 0.01], [0, 0.35, 0]));
  fundir(charola);
  brazoCharola.codo.add(charola);

  // ── Cabeza: cráneo de latón grabado, mandíbula de acero, ojos que brillan, bigote de manubrio ──
  const cuello = new Group();
  cuello.position.y = 0.6;
  torso.add(cuello);
  const cuelloFijo = new Group();
  cuelloFijo.add(malla(new CylinderGeometry(0.038, 0.044, 0.08, 18), M.pavonado, [0, 0.03, 0]));
  for (const s of [-1, 1]) cuelloFijo.add(malla(new CylinderGeometry(0.0055, 0.0055, 0.08, 8), M.cobre, [s * 0.024, 0.03, 0.03]));
  cuelloFijo.add(malla(new TorusGeometry(0.046, 0.007, 8, 24), M.pulido, [0, 0.0, 0], [Math.PI / 2, 0, 0]));
  fundir(cuelloFijo);
  cuello.add(cuelloFijo);

  const cabeza = new Group();
  cabeza.position.y = 0.16;
  cabeza.scale.setScalar(1.07);
  cuello.add(cabeza);
  const caraFija = new Group();
  cabeza.add(caraFija);
  // Rostro esculpido de latón pulido
  caraFija.add(malla(cabezaEsculpida(), M.rostro));
  // Bigote de manubrio, fino, sobre el labio
  for (const s of [-1, 1]) {
    caraFija.add(
      malla(
        tubo(
          [
            [s * 0.002, -0.043, 0.1],
            [s * 0.013, -0.047, 0.097],
            [s * 0.024, -0.044, 0.092],
            [s * 0.031, -0.036, 0.087],
            [s * 0.028, -0.031, 0.088],
          ],
          0.0026,
        ),
        M.oscuro,
      ),
    );
    // Remaches en las sienes y orejas de engrane
    caraFija.add(malla(new SphereGeometry(0.0042, 8, 6), M.pulido, [s * 0.066, 0.05, 0.04]));
    caraFija.add(malla(new SphereGeometry(0.008, 10, 8), M.cobre, [s * 0.073, 0, 0]));
    const oreja = malla(engrane(0.022, 10, 0.007), M.pulido, [s * 0.069, 0.0, 0.0], [0, Math.PI / 2, 0]);
    oreja.userData.mueve = true;
    cabeza.add(oreja);
    engranes.push({ m: oreja, v: s * 0.9 });
  }
  // Monóculo en el ojo izquierdo del mayordomo, con su cadena
  caraFija.add(malla(new TorusGeometry(0.019, 0.0024, 8, 28), M.pulido, [0.029, 0.018, 0.093]));
  caraFija.add(malla(tubo([[0.047, 0.012, 0.09], [0.058, -0.03, 0.08], [0.06, -0.085, 0.062]], 0.0014), M.pulido));
  fundir(caraFija);
  // Ojos almendrados que brillan desde el fondo de las cuencas
  for (const s of [-1, 1]) {
    const ojo = malla(new SphereGeometry(0.011, 20, 12), ojoMat(), [s * 0.029, 0.018, 0.08], [0, 0, s * -0.12], [1.35, 0.5, 0.6]);
    ojo.userData.mueve = true;
    ojos.push(ojo);
    cabeza.add(ojo);
  }
  const lente = malla(new CylinderGeometry(0.0175, 0.0175, 0.002, 24), M.vidrio, [0.029, 0.018, 0.094], [Math.PI / 2, 0, 0]);
  lente.userData.mueve = true;
  cabeza.add(lente);

  // Chistera de seda con banda de cobre, gafas de explorador y un engrane de adorno
  const chistera = new Group();
  chistera.position.y = 0.118;
  chistera.rotation.set(-0.04, 0, 0.06);
  cabeza.add(chistera);
  const ala = [
    [0.07, 0.006],
    [0.115, 0.003],
    [0.134, 0.012],
    [0.138, 0.02],
    [0.124, 0.011],
    [0.07, 0.012],
  ].map(([r, y]) => new Vector2(r!, y!));
  const sombrero = new Group();
  sombrero.add(malla(new LatheGeometry(ala, 48), M.seda));
  sombrero.add(malla(new CylinderGeometry(0.084, 0.078, 0.2, 40), M.seda, [0, 0.11, 0]));
  sombrero.add(malla(new CylinderGeometry(0.0845, 0.0845, 0.006, 40), M.seda, [0, 0.212, 0]));
  sombrero.add(malla(new CylinderGeometry(0.08, 0.0795, 0.032, 40, 1, true), M.cobre, [0, 0.03, 0]));
  for (const s of [-1, 1]) {
    sombrero.add(malla(new CylinderGeometry(0.023, 0.025, 0.026, 24), M.pulido, [s * 0.03, 0.05, 0.075], [Math.PI / 2 - 0.15, 0, 0]));
    sombrero.add(malla(new TorusGeometry(0.023, 0.004, 8, 24), M.laton, [s * 0.03, 0.052, 0.089], [-0.15, 0, 0]));
  }
  sombrero.add(malla(new BoxGeometry(0.014, 0.008, 0.01), M.pulido, [0, 0.05, 0.09]));
  fundir(sombrero);
  chistera.add(sombrero);
  for (const s of [-1, 1]) {
    const gafa = malla(new CylinderGeometry(0.02, 0.02, 0.003, 24), M.ambar, [s * 0.03, 0.051, 0.09], [Math.PI / 2 - 0.15, 0, 0]);
    gafa.userData.mueve = true;
    chistera.add(gafa);
  }
  const adorno = malla(engrane(0.02, 9, 0.006), M.pulido, [0.082, 0.075, 0.0], [0, Math.PI / 2, 0]);
  adorno.userData.mueve = true;
  chistera.add(adorno);
  engranes.push({ m: adorno, v: -0.6 });

  // ── Vapor: una bocanada de la válvula de la espalda de vez en cuando ──
  const bocanadas: { s: Sprite; t: number }[] = [];
  const texVapor = vapor();
  for (let i = 0; i < 3; i++) {
    const s = new Sprite(new SpriteMaterial({ map: texVapor, transparent: true, depthWrite: false, opacity: 0 }));
    s.scale.setScalar(0.06);
    s.position.set(0, 0.53, -0.17);
    s.userData.mueve = true;
    torso.add(s);
    bocanadas.push({ s, t: -1 });
  }

  // ── Animación ──
  let fase = 0;
  let inicioReverencia = -1;
  let reloj = 0;
  let siguienteVapor = 3;
  const suave = (x: number) => x * x * (3 - 2 * x);
  raiz.userData.reverencia = () => {
    inicioReverencia = reloj;
  };
  raiz.userData.actualizar = (dt: number, t: number, velocidad: number, giroCabeza = 0) => {
    reloj = t;
    const amp = Math.min(1, velocidad / 1.1);
    fase += ((velocidad * dt) / 0.62) * Math.PI;
    // Marcha: muslos opuestos, rodilla que se dobla al adelantar la pierna, pie casi plano.
    piernas.forEach((p, i) => {
      const f = fase + i * Math.PI;
      const muslo = -Math.sin(f) * 0.42 * amp;
      const rodilla = Math.max(0, Math.cos(f)) * 0.78 * amp + 0.04;
      p.muslo.rotation.x = muslo;
      p.rodilla.rotation.x = rodilla;
      p.tobillo.rotation.x = -(muslo + rodilla) * 0.55;
    });
    cuerpo.position.y = 0.016 * amp * Math.abs(Math.cos(fase)) - 0.012 * amp;
    // El brazo libre se mece al revés que la pierna de su lado; la charola va firme.
    brazoLibre.hombro.rotation.x = Math.sin(fase) * 0.42 * amp + 0.04;
    brazoLibre.codo.rotation.x = -0.18 - Math.max(0, Math.sin(fase)) * 0.3 * amp;
    torso.rotation.y = Math.sin(fase) * 0.06 * amp;
    faldones.rotation.x = 0.08 + Math.abs(Math.sin(fase)) * 0.14 * amp;
    // Reposo: respira, mira hacia el visitante y le brillan los ojos.
    const respira = Math.sin(t * 1.3) * (1 - amp);
    torso.position.y = CADERA + respira * 0.004;
    cabeza.rotation.y += (giroCabeza + Math.sin(t * 0.37) * 0.12 * (1 - amp) - cabeza.rotation.y) * Math.min(1, dt * 3);
    cabeza.rotation.z = Math.sin(t * 0.8) * 0.03 * (1 - amp);
    for (const o of ojos) (o.material as MeshStandardMaterial).emissiveIntensity = 1.4 + Math.sin(t * 2.2) * 0.35;
    for (const e of engranes) e.m.rotation.z += e.v * dt * (1 + amp * 2);
    // Reverencia: se inclina y levanta un poco la chistera.
    const k = inicioReverencia < 0 ? 1 : (t - inicioReverencia) / 1.6;
    const arco = k < 1 ? Math.sin(suave(k) * Math.PI) : 0;
    torso.rotation.x = arco * 0.42 + 0.03 * amp;
    cabeza.rotation.x = arco * 0.16;
    chistera.position.y = 0.118 + arco * 0.05;
    chistera.rotation.x = -0.04 - arco * 0.35;
    if (k >= 1) inicioReverencia = -1;
    // Vapor en reposo
    if (amp < 0.2 && t > siguienteVapor) {
      const libre = bocanadas.find((b) => b.t < 0);
      if (libre) libre.t = 0;
      siguienteVapor = t + 4 + Math.random() * 3;
    }
    for (const b of bocanadas) {
      if (b.t < 0) continue;
      b.t += dt / 2.2;
      const m = b.s.material as SpriteMaterial;
      b.s.position.set(Math.sin(b.t * 5) * 0.01, 0.53 + b.t * 0.32, -0.17 - b.t * 0.05);
      b.s.scale.setScalar(0.05 + b.t * 0.22);
      m.opacity = Math.sin(Math.min(1, b.t) * Math.PI) * 0.35;
      if (b.t >= 1) {
        b.t = -1;
        m.opacity = 0;
      }
    }
  };
  raiz.traverse((o: Object3D) => {
    if ((o as Mesh).isMesh && !(o as Mesh).userData.mueve) o.castShadow = true;
  });
  return raiz;
}

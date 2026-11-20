// Spec 0012 · El gabinete en 3D: el estudio de un explorador del siglo XIX.
import {
  ACESFilmicToneMapping,
  BoxGeometry,
  Color,
  Fog,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  PointLight,
  Raycaster,
  RepeatWrapping,
  Scene,
  SpotLight,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Material,
  type Object3D,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import * as T from './texturas';
import * as O from './objetos';

// ───────────────────────── Datos que vienen de la página (contenido como dato) ─────────────────────────
interface Evidencia { etiqueta: string; url: string }
interface PiezaDato {
  id: string;
  catalogo: string;
  titulo: string;
  subtitulo: string;
  resumen: string;
  sala: string;
  fecha: string;
  procedencia: string;
  objeto?: string;
  url: string;
  evidencia: Evidencia[];
}
interface SalaDato { id: string; nombre: string; tema: string; piezas: number }
interface Datos { base: string; piezas: PiezaDato[]; salas: SalaDato[] }

type Vec3 = [number, number, number];
interface Estacion { vista: { cam: Vec3; mira: Vec3 }; atril?: Vec3; atrilRot?: number }

// Salón de 10 × 8 m y 3.6 m de alto. Las estaciones miran al centro.
const ANCHO = 10;
const FONDO = 8;
const ALTO = 3.6;
const ESTACIONES: Record<string, Estacion> = {
  centro: { vista: { cam: [0, 1.62, 3.55], mira: [0, 1.05, -1.6] } },
  artificialia: { vista: { cam: [0, 1.58, -1.2], mira: [0, 1.08, -3.5] }, atril: [-1.45, 0, -2.75], atrilRot: 0.5 },
  naturalia: { vista: { cam: [-2.35, 1.6, -1.25], mira: [-4.9, 1.45, -1.25] }, atril: [-3.85, 0, -0.1], atrilRot: 2.2 },
  theatrum: { vista: { cam: [-2.4, 1.55, 2.35], mira: [-4.35, 1.35, 2.35] }, atril: [-3.75, 0, 3.3], atrilRot: 2.0 },
  mirabilia: { vista: { cam: [2.55, 1.45, -2.2], mira: [4.3, 0.72, -2.2] }, atril: [3.6, 0, -1.05], atrilRot: -2.2 },
  scientifica: { vista: { cam: [2.15, 1.72, 0.45], mira: [4.4, 1.35, 0.45] }, atril: [3.7, 0, 1.45], atrilRot: -2.1 },
  exotica: { vista: { cam: [2.75, 1.45, 2.6], mira: [4.4, 1.0, 2.85] }, atril: [3.6, 0, 3.55], atrilRot: -2.0 },
};

const reducirMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
const tactil = matchMedia('(pointer: coarse)').matches;

// ───────────────────────── Utilidades ─────────────────────────
function webglDisponible(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function sombras(obj: Object3D, emite = true) {
  obj.traverse((o) => {
    if ((o as Mesh).isMesh) {
      o.castShadow = emite;
      o.receiveShadow = true;
    }
  });
}

/** Clona materiales para que resaltar un objeto no afecte a sus gemelos. */
function materialesPropios(obj: Object3D) {
  obj.traverse((o) => {
    const m = o as Mesh;
    if (m.isMesh) m.material = Array.isArray(m.material) ? m.material.map((x) => x.clone()) : m.material.clone();
  });
}

function mesh(geo: ConstructorParameters<typeof Mesh>[0], mat: Material | Material[]) {
  const m = new Mesh(geo, mat);
  m.receiveShadow = true;
  return m;
}

// ───────────────────────── Interacción: registro de objetos ─────────────────────────
type Interactivo = { tipo: 'pieza'; id: string; estacion: string } | { tipo: 'estacion'; id: string };

function marcar(obj: Object3D, dato: Interactivo) {
  obj.userData.interactivo = dato;
  materialesPropios(obj);
}

function buscarInteractivo(o: Object3D | null): { raiz: Object3D; dato: Interactivo } | null {
  while (o) {
    if (o.userData.interactivo) return { raiz: o, dato: o.userData.interactivo as Interactivo };
    o = o.parent;
  }
  return null;
}

function resaltar(raiz: Object3D, encendido: boolean) {
  raiz.traverse((o) => {
    const m = o as Mesh;
    if (!m.isMesh) return;
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    for (const mat of mats as MeshStandardMaterial[]) {
      if (!mat.emissive) continue;
      if (encendido) {
        mat.userData.emisivoOriginal ??= mat.emissive.getHex();
        mat.emissive.setHex(0x3a2208);
      } else if (mat.userData.emisivoOriginal !== undefined) {
        mat.emissive.setHex(mat.userData.emisivoOriginal);
      }
    }
  });
}

// ───────────────────────── Mirada y viajes de cámara ─────────────────────────
class Mirada {
  yaw = 0;
  pitch = 0;
  private desde?: { pos: Vector3; yaw: number; pitch: number };
  private hacia?: { pos: Vector3; yaw: number; pitch: number };
  private t = 1;
  constructor(private cam: PerspectiveCamera) {}

  static angulos(pos: Vector3, mira: Vector3) {
    const d = mira.clone().sub(pos).normalize();
    return { yaw: Math.atan2(-d.x, -d.z), pitch: Math.asin(d.y) };
  }

  colocar(pos: Vector3, mira: Vector3) {
    this.cam.position.copy(pos);
    Object.assign(this, Mirada.angulos(pos, mira));
    this.t = 1;
    this.aplicar();
  }

  viajar(pos: Vector3, mira: Vector3) {
    if (reducirMovimiento) return this.colocar(pos, mira);
    const fin = Mirada.angulos(pos, mira);
    let yaw = fin.yaw;
    while (yaw - this.yaw > Math.PI) yaw -= Math.PI * 2;
    while (yaw - this.yaw < -Math.PI) yaw += Math.PI * 2;
    this.desde = { pos: this.cam.position.clone(), yaw: this.yaw, pitch: this.pitch };
    this.hacia = { pos: pos.clone(), yaw, pitch: fin.pitch };
    this.t = 0;
  }

  girar(dx: number, dy: number) {
    if (this.t < 1) return;
    this.yaw -= dx;
    this.pitch = Math.max(-0.75, Math.min(0.55, this.pitch - dy));
    this.aplicar();
  }

  actualizar(dt: number): boolean {
    if (this.t >= 1 || !this.desde || !this.hacia) return false;
    this.t = Math.min(1, this.t + dt / 1.5);
    const e = this.t < 0.5 ? 4 * this.t ** 3 : 1 - (-2 * this.t + 2) ** 3 / 2;
    this.cam.position.lerpVectors(this.desde.pos, this.hacia.pos, e);
    this.yaw = this.desde.yaw + (this.hacia.yaw - this.desde.yaw) * e;
    this.pitch = this.desde.pitch + (this.hacia.pitch - this.desde.pitch) * e;
    this.aplicar();
    return true;
  }

  private aplicar() {
    this.cam.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }
}

// ───────────────────────── Interfaz HTML ─────────────────────────
function interfaz(raiz: HTMLElement, datos: Datos) {
  const $ = <E extends Element>(s: string) => raiz.querySelector<E>(s);
  const cedula = $<HTMLElement>('[data-cedula]')!;
  return {
    progreso(p: number) {
      const el = $<HTMLElement>('[data-progreso]');
      if (el) el.textContent = `${Math.round(p * 100)} %`;
    },
    listo() {
      raiz.dataset.estado = 'listo';
    },
    abrirCedula(id: string) {
      const p = datos.piezas.find((x) => x.id === id);
      if (!p) return;
      cedula.querySelector('[data-c-catalogo]')!.textContent = p.catalogo;
      cedula.querySelector('[data-c-titulo]')!.textContent = p.titulo;
      cedula.querySelector('[data-c-subtitulo]')!.textContent = p.subtitulo;
      cedula.querySelector('[data-c-resumen]')!.textContent = p.resumen;
      cedula.querySelector('[data-c-procedencia]')!.textContent = `${p.procedencia} · ${p.fecha.slice(0, 4)}`;
      const acciones = cedula.querySelector<HTMLElement>('[data-c-acciones]')!;
      acciones.replaceChildren();
      const principal = document.createElement('a');
      principal.className = 'g-boton g-boton--principal';
      principal.href = p.url;
      principal.textContent = 'Ver la vitrina completa';
      acciones.append(principal);
      for (const e of p.evidencia.slice(0, 2)) {
        const a = document.createElement('a');
        a.className = 'g-boton';
        a.href = e.url;
        a.textContent = e.etiqueta;
        acciones.append(a);
      }
      cedula.hidden = false;
      cedula.querySelector<HTMLElement>('[data-c-titulo]')!.focus();
    },
    cerrarCedula() {
      cedula.hidden = true;
    },
    marcarEstacion(id: string) {
      raiz.querySelectorAll('[data-estacion]').forEach((b) => b.setAttribute('aria-current', String(b.getAttribute('data-estacion') === id)));
    },
  };
}

// ───────────────────────── Escena ─────────────────────────
export async function iniciar() {
  const raiz = document.querySelector<HTMLElement>('[data-gabinete]');
  if (!raiz) return;
  const datos = JSON.parse(document.getElementById('datos-gabinete')!.textContent!) as Datos;
  const ui = interfaz(raiz, datos);

  // FR-0012-09: sin WebGL o con ahorro de datos, el gabinete 2D.
  const ahorro = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  if (!webglDisponible() || ahorro) {
    raiz.dataset.estado = 'respaldo';
    return;
  }
  const respaldoTardio = window.setTimeout(() => {
    if (raiz.dataset.estado !== 'listo') raiz.dataset.lento = '';
  }, 10000);

  await T.fuentesListas();

  const lienzo = raiz.querySelector<HTMLCanvasElement>('[data-lienzo]')!;
  const renderer = new WebGLRenderer({ canvas: lienzo, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, tactil ? 1.5 : 1.75));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !tactil;
  renderer.shadowMap.type = PCFShadowMap;

  const escena = new Scene();
  escena.background = new Color(0x0d0907);
  escena.fog = new Fog(0x120c08, 7, 17);
  const pmrem = new PMREMGenerator(renderer);
  escena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  escena.environmentIntensity = 0.32;

  const camara = new PerspectiveCamera(58, 1, 0.05, 40);
  const mirada = new Mirada(camara);
  const inicio = ESTACIONES.centro!.vista;
  mirada.colocar(new Vector3(...inicio.cam), new Vector3(...inicio.mira));

  // ── El salón ──
  const cargadorTex = new TextureLoader();
  const tex = async (ruta: string, repetir?: [number, number], color = true) => {
    const t = await cargadorTex.loadAsync(`${datos.base}gabinete/texturas/${ruta}`);
    if (color) t.colorSpace = SRGBColorSpace;
    if (repetir) {
      t.wrapS = t.wrapT = RepeatWrapping;
      t.repeat.set(...repetir);
    }
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  };
  const [parquet, parquetN, paneles, panelesN] = await Promise.all([
    tex('parquet_color.webp', [5, 4]),
    tex('parquet_normal.webp', [5, 4], false),
    tex('paneles_color.webp', [6, 1]),
    tex('paneles_normal.webp', [6, 1], false),
  ]);
  ui.progreso(0.1);

  const salon = new Group();
  escena.add(salon);
  const piso = mesh(new PlaneGeometry(ANCHO, FONDO), new MeshStandardMaterial({ map: parquet, normalMap: parquetN, roughness: 0.6, color: 0x9a7a5c }));
  piso.rotation.x = -Math.PI / 2;
  salon.add(piso);

  const alfombra = mesh(new PlaneGeometry(4.2, 2.95), new MeshStandardMaterial({ map: T.alfombra(), roughness: 1, color: 0x8a7468 }));
  alfombra.rotation.x = -Math.PI / 2;
  alfombra.position.set(0, 0.006, 0.4);
  salon.add(alfombra);

  const damasco = T.muroDamasco();
  const muroMat = (largo: number) => {
    const t = damasco.clone();
    t.repeat.set(largo / 0.9, (ALTO - 1.1) / 0.9);
    return new MeshStandardMaterial({ map: t, roughness: 0.92 });
  };
  const zocaloMat = new MeshStandardMaterial({ map: paneles, normalMap: panelesN, roughness: 0.55, color: 0x8a6a52 });
  const molduraMat = O.MAT.nogal();
  const muros: [number, number, number, number][] = [
    // x, z, rotY, largo
    [0, -FONDO / 2, 0, ANCHO],
    [0, FONDO / 2, Math.PI, ANCHO],
    [-ANCHO / 2, 0, Math.PI / 2, FONDO],
    [ANCHO / 2, 0, -Math.PI / 2, FONDO],
  ];
  for (const [x, z, rot, largo] of muros) {
    const muro = new Group();
    muro.position.set(x, 0, z);
    muro.rotation.y = rot;
    const alto = mesh(new PlaneGeometry(largo, ALTO - 1.1), muroMat(largo));
    alto.position.y = 1.1 + (ALTO - 1.1) / 2;
    const zocalo = mesh(new BoxGeometry(largo, 1.1, 0.05), zocaloMat);
    zocalo.position.set(0, 0.55, 0.025);
    const riel = mesh(new BoxGeometry(largo, 0.06, 0.08), molduraMat);
    riel.position.set(0, 1.12, 0.04);
    const cornisa = mesh(new BoxGeometry(largo, 0.16, 0.12), molduraMat);
    cornisa.position.set(0, ALTO - 0.08, 0.06);
    const rodapie = mesh(new BoxGeometry(largo, 0.14, 0.07), molduraMat);
    rodapie.position.set(0, 0.07, 0.06);
    muro.add(alto, zocalo, riel, cornisa, rodapie);
    salon.add(muro);
  }
  const techo = mesh(new PlaneGeometry(ANCHO, FONDO), new MeshStandardMaterial({ color: 0x2a1e16, roughness: 0.95 }));
  techo.rotation.x = Math.PI / 2;
  techo.position.y = ALTO;
  salon.add(techo);
  for (let x = -ANCHO / 2 + 1; x < ANCHO / 2; x += 1.6) {
    const viga = mesh(new BoxGeometry(0.22, 0.26, FONDO), new MeshStandardMaterial({ map: paneles, color: 0x5a4030, roughness: 0.7 }));
    viga.position.set(x, ALTO - 0.13, 0);
    salon.add(viga);
  }

  // ── Luz de lámpara de aceite (art. VI) ──
  escena.add(new HemisphereLight(0xffd9a8, 0x1a0f08, 0.42));
  const cenital = new SpotLight(0xffb469, 52, 0, 1.05, 0.85, 1.6);
  cenital.position.set(0, ALTO - 0.25, 0.3);
  cenital.target.position.set(0, 0, 0.1);
  cenital.castShadow = true;
  cenital.shadow.mapSize.set(1024, 1024);
  cenital.shadow.bias = -0.0004;
  escena.add(cenital, cenital.target);
  const focos: Record<string, Vec3> = {
    artificialia: [0, 1.2, -3.4],
    naturalia: [-4.8, 1.6, -1.25],
    theatrum: [-4.35, 1.3, 2.35],
    mirabilia: [4.3, 0.7, -2.2],
    scientifica: [4.4, 1.2, 0.45],
    exotica: [4.35, 0.95, 2.75],
  };
  for (const [, [x, y, z]] of Object.entries(focos)) {
    const foco = new SpotLight(0xffc98f, 26, 0, 0.42, 0.7, 1.7);
    foco.position.set(x * 0.55, ALTO - 0.2, z * 0.55 + (z < 0 ? 0.6 : -0.2));
    foco.target.position.set(x, y, z);
    escena.add(foco, foco.target);
  }
  const lampara = new PointLight(0xff9a4a, 2.4, 5, 1.8);
  escena.add(lampara);

  // ── Tamaño y bucle: el salón se ve mientras llegan los muebles (FR-0012-12) ──
  let esferaGlobo: Object3D | null = null;
  const ajustar = () => {
    const w = lienzo.clientWidth;
    const h = lienzo.clientHeight;
    renderer.setSize(w, h, false);
    camara.aspect = w / h;
    camara.fov = w < h ? 72 : 58;
    camara.updateProjectionMatrix();
  };
  new ResizeObserver(ajustar).observe(lienzo);
  ajustar();

  let previo = performance.now();
  const tick = (ahora: number) => {
    const dt = Math.min(0.05, (ahora - previo) / 1000);
    previo = ahora;
    mirada.actualizar(dt);
    if (!reducirMovimiento) {
      lampara.intensity = 2.4 + Math.sin(ahora * 0.011) * 0.18 + Math.sin(ahora * 0.037) * 0.12;
      if (esferaGlobo) esferaGlobo.rotation.y += dt * 0.08;
    }
    renderer.render(escena, camara);
  };
  renderer.setAnimationLoop(tick);
  document.addEventListener('visibilitychange', () => renderer.setAnimationLoop(document.hidden ? null : tick));

  // ── Muebles y objetos ──
  const gltf = new GLTFLoader();
  gltf.setMeshoptDecoder(MeshoptDecoder);
  const modelos = [
    'vintage_cabinet_01', 'GothicCabinet_01', 'vintage_wooden_drawer_01', 'vintage_grandfather_clock_01', 'ArmChair_01',
    'treasure_chest', 'vintage_suitcase', 'wooden_table_02', 'vintage_pocket_watch', 'vintage_microscope',
    'seadogs_compass', 'vintage_binocular', 'marble_bust_01', 'lambis_shell', 'bronze_whale_statue',
    'book_encyclopedia_set_01', 'fancy_picture_frame_01', 'vintage_oil_lamp', 'lantern_chandelier_01',
    'antique_ceramic_vase_01', 'Lantern_01',
  ] as const;
  let cargados = 0;
  const cargar = async (id: string) => {
    const g = await gltf.loadAsync(`${datos.base}gabinete/modelos/${id}.glb`);
    cargados++;
    ui.progreso(0.1 + (cargados / modelos.length) * 0.85);
    return g.scene;
  };
  const M = Object.fromEntries(await Promise.all(modelos.map(async (id) => [id, await cargar(id)] as const))) as Record<(typeof modelos)[number], Group>;
  for (const m of Object.values(M)) sombras(m);
  // Pino claro → nogal de época (art. VI).
  const entintar = (obj: Object3D, hex: number) =>
    obj.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      for (const mat of (Array.isArray(m.material) ? m.material : [m.material]) as MeshStandardMaterial[]) mat.color?.multiply(new Color(hex));
    });
  entintar(M.wooden_table_02, 0x6a4a36);
  entintar(M.vintage_wooden_drawer_01, 0x9a7a66);

  const poner = (obj: Object3D, pos: Vec3, rotY = 0, escala = 1) => {
    obj.position.set(...pos);
    obj.rotation.y = rotY;
    obj.scale.setScalar(escala);
    escena.add(obj);
    obj.updateMatrixWorld(true);
    return obj;
  };
  // Altura de la superficie de un mueble en un punto: rayo hacia abajo.
  const rayo = new Raycaster();
  const superficie = (mueble: Object3D, x: number, z: number) => {
    rayo.set(new Vector3(x, ALTO, z), new Vector3(0, -1, 0));
    const hit = rayo.intersectObject(mueble, true)[0];
    return hit ? hit.point.y : 0;
  };

  const piezaPor = (objeto: string) => datos.piezas.filter((p) => p.objeto === objeto);
  const interactivos: Object3D[] = [];
  const registrar = (obj: Object3D, dato: Interactivo) => {
    marcar(obj, dato);
    interactivos.push(obj);
  };

  // Centro: mesa del explorador
  const mesaCentro = poner(M.wooden_table_02, [0, 0, 0.35], 0.1, 1.15);
  const altoMesa = superficie(mesaCentro, 0.25, 0.35) || 0.92;
  const globoT = O.globo(T.globoTerraqueo());
  esferaGlobo = globoT.userData.esfera as Object3D;
  poner(globoT, [-0.32, altoMesa, 0.32], 0.4);
  const cartaMesa = O.cartaExtendida(T.carta(3, 'Mare Incognitum'));
  cartaMesa.position.set(0.2, altoMesa + 0.003, 0.42);
  cartaMesa.rotation.z = -0.12;
  escena.add(cartaMesa);
  poner(M.vintage_oil_lamp, [0.5, altoMesa, 0.18], 0, 0.85);
  lampara.position.set(0.5, altoMesa + 0.48, 0.18);
  poner(M.ArmChair_01, [1.25, 0, 1.15], -2.35, 1.05);
  poner(M.lantern_chandelier_01, [0, ALTO, 0.3], 0, 1.2);

  // Atmósfera
  poner(M.GothicCabinet_01, [-3.35, 0, -3.42], 0, 0.95);
  poner(M.vintage_grandfather_clock_01, [3.4, 0, -3.75], 0, 1.05);
  poner(M.fancy_picture_frame_01, [4.96, 2.15, 0.45], -Math.PI / 2, 1.7);
  poner(M.vintage_suitcase, [-3.4, 0, 3.55], 0.25, 0.85);
  poner(M.Lantern_01, [-3.1, 0.48, 3.5], 0.6, 1.4);

  // Artificialia: alacena victoriana
  const alacena = poner(M.vintage_cabinet_01, [0, 0, -3.62], 0, 1.05);
  registrar(alacena, { tipo: 'estacion', id: 'artificialia' });
  const yAlacena = superficie(alacena, 0, -3.36) || 0.95;
  const etiquetaMosca = T.etiqueta('Drosophila melanogaster', 'Modelo ampliado · 1,408 neuronas');
  const [pMosca] = piezaPor('campana');
  if (pMosca) {
    const c = poner(O.campanaMosca(etiquetaMosca), [-0.48, yAlacena, -3.33], 0.15, 1.15);
    registrar(c, { tipo: 'pieza', id: pMosca.id, estacion: 'artificialia' });
  }
  const [pReloj] = piezaPor('reloj');
  if (pReloj) {
    const soporte = O.soporteReloj();
    const reloj = M.vintage_pocket_watch;
    reloj.scale.setScalar(2.4);
    reloj.position.set(0, 0.04 + 0.03 * 2.4, 0);
    reloj.rotation.x = -0.35;
    soporte.add(reloj);
    poner(soporte, [0.05, yAlacena, -3.32], -0.1);
    registrar(soporte, { tipo: 'pieza', id: pReloj.id, estacion: 'artificialia' });
  }
  const [pPrensa] = piezaPor('periodicos');
  if (pPrensa) {
    const titulares = [pPrensa.subtitulo, 'La consultora publica cada semana', 'Cuatro roles editoriales se turnan', 'El modo seguro protege los datos'];
    const p = O.periodicos(titulares.map((t, i) => T.periodico('Gaceta de Axon', t, 5 + i)));
    poner(p, [0.55, yAlacena, -3.34], 0.12, 0.85);
    registrar(p, { tipo: 'pieza', id: pPrensa.id, estacion: 'artificialia' });
  }

  // Naturalia: pared de diplomas al estilo "salon" y consola con libros
  const consola = poner(M.wooden_table_02.clone(), [-4.6, 0, -1.25], Math.PI / 2, 1);
  registrar(consola, { tipo: 'estacion', id: 'naturalia' });
  const yConsola = superficie(consola, -4.6, -1.25) || 0.8;
  poner(M.book_encyclopedia_set_01, [-4.66, yConsola, -1.62], Math.PI / 2, 0.9);
  const grados = piezaPor('diploma').sort((a, b) => b.fecha.localeCompare(a.fecha));
  const posDiplomas: [number, number, number][] = [
    [-1.62, 2.25, 0.5],
    [-0.98, 2.25, 0.5],
    [-1.62, 1.72, 0.5],
    [-0.98, 1.72, 0.5],
  ];
  grados.forEach((p, i) => {
    const [z, y, w] = posDiplomas[i] ?? [-0.5 - i * 0.6, 1.8, 0.45];
    const d = O.diplomaEnmarcado(T.diploma(p.titulo, p.procedencia, p.fecha.slice(0, 4), 9 + i), w, w * 0.74);
    poner(d, [-4.96, y, z], Math.PI / 2);
    registrar(d, { tipo: 'pieza', id: p.id, estacion: 'naturalia' });
  });
  const [pRevista] = piezaPor('revista');
  if (pRevista) {
    const r = O.revista(T.portadaRevista(pRevista.titulo, 'Revista Estilos de Aprendizaje'));
    poner(r, [-4.55, yConsola, -0.95], Math.PI / 2 - 0.1);
    registrar(r, { tipo: 'pieza', id: pRevista.id, estacion: 'naturalia' });
  }

  // Theatrum: busto sobre pedestal
  const ped = poner(O.pedestal(), [-4.35, 0, 2.35], Math.PI / 2);
  poner(M.marble_bust_01, [-4.35, 1.04, 2.35], Math.PI / 2, 1.2);
  registrar(ped, { tipo: 'estacion', id: 'theatrum' });

  // Mirabilia: baúl del explorador con la medalla
  const baul = poner(M.treasure_chest, [4.3, 0, -2.2], -Math.PI / 2, 1);
  registrar(baul, { tipo: 'estacion', id: 'mirabilia' });
  const [pMedalla] = piezaPor('medalla');
  if (pMedalla) {
    const yBaul = superficie(baul, 4.3, -2.2) || 0.62;
    const med = poner(O.medallaEnCojin(), [4.28, yBaul, -2.2], -Math.PI / 2);
    registrar(med, { tipo: 'pieza', id: pMedalla.id, estacion: 'mirabilia' });
  }

  // Scientifica: cajonera de boticario con instrumentos
  const cajonera = poner(M.vintage_wooden_drawer_01, [4.45, 0, 0.45], -Math.PI / 2, 1);
  registrar(cajonera, { tipo: 'estacion', id: 'scientifica' });
  const yCaj = superficie(cajonera, 4.45, 0.45) || 1.09;
  poner(M.vintage_microscope, [4.42, yCaj, 0.05], -Math.PI / 2 - 0.4, 1.3);
  poner(M.seadogs_compass, [4.4, yCaj, 0.55], -Math.PI / 2, 1.6);
  poner(M.vintage_binocular, [4.45, yCaj + 0.03, 0.95], -Math.PI / 2 + 0.6, 1.2);

  // Exotica: mesa de curiosidades
  const mesaExo = poner(M.wooden_table_02.clone(), [4.35, 0, 2.75], -Math.PI / 2, 1);
  registrar(mesaExo, { tipo: 'estacion', id: 'exotica' });
  const yExo = superficie(mesaExo, 4.35, 2.75) || 0.8;
  poner(M.lambis_shell, [4.3, yExo, 2.45], -1.2, 1.8);
  poner(M.bronze_whale_statue, [4.4, yExo, 2.9], -Math.PI / 2 - 0.5, 0.42);
  poner(M.antique_ceramic_vase_01, [4.45, yExo, 3.25], 0, 0.9);

  // Atriles con placas de latón (FR-0012-05)
  for (const sala of datos.salas) {
    const est = ESTACIONES[sala.id];
    if (!est?.atril) continue;
    const a = O.atrilPlaca(T.placa(sala.nombre, sala.tema, sala.piezas === 0));
    poner(a, est.atril, est.atrilRot ?? 0);
    registrar(a, { tipo: 'estacion', id: sala.id });
  }
  // El candelabro envuelve al foco cenital: no debe tapar su propia luz.
  M.lantern_chandelier_01.traverse((o) => (o.castShadow = false));
  ui.progreso(1);

  // ── Navegación ──
  const irA = (id: string) => {
    const est = ESTACIONES[id];
    if (!est) return;
    mirada.viajar(new Vector3(...est.vista.cam), new Vector3(...est.vista.mira));
    ui.marcarEstacion(id);
    if (id === 'centro') ui.cerrarCedula();
  };
  const elegir = (dato: Interactivo) => {
    if (dato.tipo === 'estacion') {
      ui.cerrarCedula();
      irA(dato.id);
    } else {
      irA(dato.estacion);
      ui.abrirCedula(dato.id);
    }
  };

  raiz.querySelectorAll<HTMLButtonElement>('[data-estacion]').forEach((b) =>
    b.addEventListener('click', () => {
      ui.cerrarCedula();
      irA(b.dataset.estacion!);
    }),
  );
  raiz.querySelectorAll<HTMLButtonElement>('[data-pieza]').forEach((b) =>
    b.addEventListener('click', () => {
      const p = datos.piezas.find((x) => x.id === b.dataset.pieza);
      if (p) elegir({ tipo: 'pieza', id: p.id, estacion: p.sala });
    }),
  );
  raiz.querySelector('[data-cerrar]')?.addEventListener('click', () => ui.cerrarCedula());

  // Arrastrar para mirar; clic para elegir (FR-0012-02, 03, 04)
  const puntero = new Vector2();
  let arrastre: { x: number; y: number; movido: number } | null = null;
  let encima: Object3D | null = null;
  const tocar = (e: PointerEvent) => {
    const r = lienzo.getBoundingClientRect();
    puntero.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    rayo.setFromCamera(puntero, camara);
    const hit = rayo.intersectObjects(interactivos, true)[0];
    return hit ? buscarInteractivo(hit.object) : null;
  };
  lienzo.addEventListener('pointerdown', (e) => {
    arrastre = { x: e.clientX, y: e.clientY, movido: 0 };
    lienzo.setPointerCapture(e.pointerId);
  });
  lienzo.addEventListener('pointermove', (e) => {
    if (arrastre) {
      const dx = e.clientX - arrastre.x;
      const dy = e.clientY - arrastre.y;
      arrastre.movido += Math.abs(dx) + Math.abs(dy);
      arrastre.x = e.clientX;
      arrastre.y = e.clientY;
      mirada.girar(dx * 0.0042, dy * 0.0034);
      return;
    }
    if (tactil) return;
    const h = tocar(e);
    const nuevo = h?.raiz ?? null;
    if (nuevo !== encima) {
      if (encima) resaltar(encima, false);
      if (nuevo) resaltar(nuevo, true);
      encima = nuevo;
      lienzo.style.cursor = nuevo ? 'pointer' : 'grab';
    }
  });
  lienzo.addEventListener('pointerup', (e) => {
    const fue = arrastre;
    arrastre = null;
    if (fue && fue.movido < 8) {
      const h = tocar(e);
      if (h) elegir(h.dato);
    }
  });
  window.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('input, textarea, [data-cedula]')) {
      if (e.key === 'Escape') ui.cerrarCedula();
      return;
    }
    const paso = 0.08;
    if (e.key === 'ArrowLeft') mirada.girar(-paso, 0);
    else if (e.key === 'ArrowRight') mirada.girar(paso, 0);
    else if (e.key === 'ArrowUp') mirada.girar(0, -paso);
    else if (e.key === 'ArrowDown') mirada.girar(0, paso);
    else if (e.key === 'Escape') irA('centro');
    else return;
    e.preventDefault();
  });

  window.clearTimeout(respaldoTardio);
  ui.listo();
  ui.marcarEstacion('centro');
  // Para pruebas automáticas
  (window as unknown as { __gabinete?: unknown }).__gabinete = { irA, elegir, escena, camara };
}

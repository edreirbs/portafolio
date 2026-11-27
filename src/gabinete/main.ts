// Specs 0012 a 0016 · El gabinete en 3D: el estudio de un explorador del siglo XIX, con un
// mueble por cada sección del portafolio y un lugar para cada proyecto. Nada de adornos sueltos.
import {
  ACESFilmicToneMapping,
  Box3,
  BoxGeometry,
  Color,
  Fog,
  Group,
  HemisphereLight,
  MathUtils,
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

// ───────────────────────── Datos de la página (contenido como dato) ─────────────────────────
interface Evidencia { etiqueta: string; url: string }
interface PiezaDato {
  id: string;
  catalogo: string;
  titulo: string;
  subtitulo: string;
  resumen: string;
  seccion: string;
  fecha: string;
  procedencia: string;
  objeto?: string;
  url: string;
  evidencia: Evidencia[];
  /** Spec 0016: la captura del proyecto, para los que cuelgan en el muro. */
  imagen3d?: string;
}
interface SeccionDato { id: string; nombre: string; corto: string; cuenta: string }
type Accion = 'girar' | 'saltar' | 'balancear' | 'levantar' | 'mirar' | 'luz' | 'penumbra' | 'hora' | 'sentarse' | 'acercar' | 'biblioteca' | 'asistente';
interface Curiosidad { id: string; nombre: string; nota: string; accion: Accion }
interface Red { etiqueta: string; cuenta: string }
interface Datos {
  base: string;
  piezas: PiezaDato[];
  secciones: SeccionDato[];
  curiosidades: Curiosidad[];
  redes: Red[];
  bitacora: { anios: string; texto: string }[];
}

type Vec3 = [number, number, number];
interface Estacion { nombre: string; vista: { cam: Vec3; mira: Vec3 }; atril?: Vec3; atrilRot?: number }

const ANCHO = 10;
const FONDO = 8;
const ALTO = 3.6;
const OJOS = 1.62;
// FR-0014-05: cada sección tiene su mueble y su punto de vista.
const ESTACIONES: Record<string, Estacion> = {
  centro: { nombre: 'Centro del estudio', vista: { cam: [0, OJOS, 3.55], mira: [0, 1.05, -1.6] } },
  proyectos: { nombre: 'Proyectos', vista: { cam: [0, 1.62, 0.2], mira: [0, 1.4, -3.9] }, atril: [-0.95, 0, -2.25], atrilRot: 0.35 },
  titulos: { nombre: 'Títulos y diplomas', vista: { cam: [-2.35, 1.6, -1.25], mira: [-4.9, 1.45, -1.25] }, atril: [-3.85, 0, -0.1], atrilRot: 2.2 },
  certificaciones: { nombre: 'Certificaciones y cursos', vista: { cam: [2.15, 1.72, 0.45], mira: [4.4, 1.35, 0.45] }, atril: [3.7, 0, 1.45], atrilRot: -2.1 },
  experiencia: { nombre: 'Experiencia', vista: { cam: [-2.45, 1.62, 1.75], mira: [-4.2, 1.0, 1.45] }, atril: [-3.5, 0, 2.75], atrilRot: 2.1 },
  publicaciones: { nombre: 'Publicaciones', vista: { cam: [2.55, 1.45, -2.2], mira: [4.3, 0.72, -2.2] }, atril: [3.6, 0, -1.05], atrilRot: -2.2 },
  contacto: { nombre: 'Redes y contacto', vista: { cam: [0.3, 1.5, 1.95], mira: [0.05, 0.9, 0.55] } },
};

const reducirMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
const tactil = matchMedia('(pointer: coarse)').matches;

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

function mesh(geo: ConstructorParameters<typeof Mesh>[0], mat: Material | Material[]) {
  const m = new Mesh(geo, mat);
  m.receiveShadow = true;
  return m;
}

const suave = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

// ───────────────────────── Objetos interactivos ─────────────────────────
type Dato =
  | { tipo: 'pieza'; id: string; estacion: string; nombre: string; animacion: Accion }
  | { tipo: 'estacion'; id: string; nombre: string }
  | { tipo: 'objeto'; id: string; nombre: string; nota: string; accion: Accion };

interface Item {
  raiz: Object3D;
  dato: Dato;
  ancla: Vector3;
  marca?: HTMLButtonElement;
}

// Fuera de userData: Three.js serializa userData al clonar y una referencia circular lo rompe.
const itemDe = new WeakMap<Object3D, Item>();

function buscarItem(o: Object3D | null): Item | null {
  while (o) {
    const it = itemDe.get(o);
    if (it) return it;
    o = o.parent;
  }
  return null;
}

function resaltar(raiz: Object3D, encendido: boolean) {
  raiz.traverse((o) => {
    const m = o as Mesh;
    if (!m.isMesh) return;
    for (const mat of (Array.isArray(m.material) ? m.material : [m.material]) as MeshStandardMaterial[]) {
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

// ───────────────────────── Mirada: agarrar el mundo, inercia, zoom y viajes ─────────────────────────
class Mirada {
  yaw = 0;
  pitch = 0;
  zoom = 1;
  private vYaw = 0;
  private vPitch = 0;
  private desde?: { pos: Vector3; yaw: number; pitch: number };
  private hacia?: { pos: Vector3; yaw: number; pitch: number };
  private t = 1;
  constructor(private cam: PerspectiveCamera) {}

  static angulos(pos: Vector3, mira: Vector3) {
    const d = mira.clone().sub(pos).normalize();
    return { yaw: Math.atan2(-d.x, -d.z), pitch: Math.asin(d.y) };
  }

  get viajando() {
    return this.t < 1;
  }

  colocar(pos: Vector3, mira: Vector3) {
    this.cam.position.copy(pos);
    Object.assign(this, Mirada.angulos(pos, mira));
    this.t = 1;
    this.vYaw = this.vPitch = 0;
    this.aplicar();
  }

  viajar(pos: Vector3, mira?: Vector3) {
    const fin = mira ? Mirada.angulos(pos, mira) : { yaw: this.yaw, pitch: -0.12 };
    if (reducirMovimiento) {
      this.cam.position.copy(pos);
      this.yaw = fin.yaw;
      this.pitch = fin.pitch;
      this.t = 1;
      this.aplicar();
      return;
    }
    let yaw = fin.yaw;
    while (yaw - this.yaw > Math.PI) yaw -= Math.PI * 2;
    while (yaw - this.yaw < -Math.PI) yaw += Math.PI * 2;
    this.desde = { pos: this.cam.position.clone(), yaw: this.yaw, pitch: this.pitch };
    this.hacia = { pos: pos.clone(), yaw, pitch: fin.pitch };
    this.vYaw = this.vPitch = 0;
    this.t = 0;
  }

  /** FR-0013-01: arrastrar mueve la escena con la mano (como un visor de 360°). */
  arrastrar(dx: number, dy: number, dt: number) {
    if (this.viajando) return;
    const k = 0.0042 * this.zoom;
    this.girar(dx * k, dy * k);
    if (dt > 0) {
      this.vYaw = (dx * k) / dt;
      this.vPitch = (dy * k) / dt;
    }
  }

  soltar() {
    if (reducirMovimiento) this.vYaw = this.vPitch = 0;
  }

  frenar() {
    this.vYaw = this.vPitch = 0;
  }

  girar(dYaw: number, dPitch: number) {
    this.yaw += dYaw;
    this.pitch = MathUtils.clamp(this.pitch + dPitch, -0.85, 0.6);
    this.aplicar();
  }

  acercar(factor: number) {
    this.zoom = MathUtils.clamp(this.zoom * factor, 0.5, 1);
  }

  actualizar(dt: number, fovBase: number) {
    const fov = fovBase * this.zoom;
    if (Math.abs(this.cam.fov - fov) > 0.01) {
      this.cam.fov += (fov - this.cam.fov) * Math.min(1, dt * 10);
      this.cam.updateProjectionMatrix();
    }
    if (this.t < 1 && this.desde && this.hacia) {
      this.t = Math.min(1, this.t + dt / 1.4);
      const e = suave(this.t);
      this.cam.position.lerpVectors(this.desde.pos, this.hacia.pos, e);
      this.yaw = this.desde.yaw + (this.hacia.yaw - this.desde.yaw) * e;
      this.pitch = this.desde.pitch + (this.hacia.pitch - this.desde.pitch) * e;
      this.aplicar();
      return;
    }
    if (Math.abs(this.vYaw) + Math.abs(this.vPitch) > 0.002) {
      this.girar(this.vYaw * dt, this.vPitch * dt);
      const freno = Math.exp(-dt * 6);
      this.vYaw *= freno;
      this.vPitch *= freno;
    }
  }

  private aplicar() {
    this.cam.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }
}

// ───────────────────────── Animaciones de los objetos (FR-0013-02, 11) ─────────────────────────
interface Anim { obj: Object3D; accion: Accion; t: number; dur: number; pos: Vector3; rotY: number; rotZ: number; giro: number }

function animar(lista: Anim[], obj: Object3D, accion: Accion, haciaCamara = 0) {
  if (reducirMovimiento) return;
  const previa = lista.find((a) => a.obj === obj);
  if (previa) return;
  const dur = { girar: 1.6, saltar: 0.9, balancear: 1.2, levantar: 2.4, mirar: 2.6 }[accion as 'girar'] ?? 0;
  if (!dur) return;
  lista.push({ obj, accion, t: 0, dur, pos: obj.position.clone(), rotY: obj.rotation.y, rotZ: obj.rotation.z, giro: haciaCamara });
}

function avanzar(lista: Anim[], dt: number) {
  for (let i = lista.length - 1; i >= 0; i--) {
    const a = lista[i]!;
    a.t = Math.min(1, a.t + dt / a.dur);
    const t = a.t;
    const o = a.obj;
    switch (a.accion) {
      case 'girar':
        o.rotation.y = a.rotY + Math.PI * 2 * (1 - (1 - t) ** 3);
        break;
      case 'saltar':
        o.position.y = a.pos.y + Math.abs(Math.sin(t * Math.PI * 2)) * 0.07 * (1 - t);
        break;
      case 'balancear':
        o.rotation.z = a.rotZ + Math.sin(t * Math.PI * 5) * 0.05 * (1 - t);
        break;
      case 'levantar': {
        const sube = t < 0.3 ? suave(t / 0.3) : t > 0.7 ? suave((1 - t) / 0.3) : 1;
        o.position.y = a.pos.y + sube * 0.16;
        break;
      }
      case 'mirar': {
        const gira = t < 0.3 ? suave(t / 0.3) : t > 0.75 ? suave((1 - t) / 0.25) : 1;
        o.rotation.y = a.rotY + a.giro * gira;
        break;
      }
    }
    if (t >= 1) {
      o.position.copy(a.pos);
      o.rotation.y = a.rotY;
      o.rotation.z = a.rotZ;
      lista.splice(i, 1);
    }
  }
}

// ───────────────────────── Interfaz HTML ─────────────────────────
function interfaz(raiz: HTMLElement, datos: Datos) {
  const $ = <E extends Element>(s: string) => raiz.querySelector<E>(s)!;
  const cedula = $<HTMLElement>('[data-cedula]');
  const nota = $<HTMLElement>('[data-nota]');
  const mapa = $<HTMLElement>('[data-mapa]');
  const botonMapa = $<HTMLButtonElement>('[data-abrir-mapa]');
  const placa = $<HTMLElement>('.g-placa');
  let relojNota = 0;

  const ui = {
    progreso(p: number) {
      $<HTMLElement>('[data-progreso]').textContent = `${Math.round(p * 100)} %`;
    },
    listo() {
      raiz.dataset.estado = 'listo';
    },
    cerrarTodo() {
      cedula.hidden = true;
      nota.hidden = true;
      ui.cerrarSeccion();
    },
    /** FR-0014-04: el panel de una sección es la misma sección de la página. */
    abrirSeccion(id: string) {
      const panel = document.querySelector<HTMLElement>(`.sp[data-seccion="${id}"]`);
      if (!panel) return false;
      ui.cerrarTodo();
      window.dispatchEvent(new Event('asistente:cerrar'));
      panel.dataset.abierta = '';
      panel.scrollTop = 0;
      panel.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
      return true;
    },
    cerrarSeccion() {
      document.querySelectorAll<HTMLElement>('.sp[data-abierta]').forEach((s) => delete s.dataset.abierta);
    },
    seccionAbierta() {
      return document.querySelector('.sp[data-abierta]') !== null;
    },
    abrirCedula(id: string) {
      const p = datos.piezas.find((x) => x.id === id);
      if (!p) return;
      ui.cerrarTodo();
      window.dispatchEvent(new Event('asistente:cerrar'));
      cedula.querySelector('[data-c-catalogo]')!.textContent = p.catalogo;
      cedula.querySelector('[data-c-titulo]')!.textContent = p.titulo;
      cedula.querySelector('[data-c-subtitulo]')!.textContent = p.subtitulo;
      cedula.querySelector('[data-c-resumen]')!.textContent = p.resumen;
      const acciones = cedula.querySelector<HTMLElement>('[data-c-acciones]')!;
      acciones.replaceChildren();
      const principal = document.createElement('a');
      principal.className = 'g-boton g-boton--principal';
      principal.href = p.url;
      principal.textContent = 'Ver la pieza';
      acciones.append(principal);
      for (const e of p.evidencia.slice(0, 2)) {
        const a = document.createElement('a');
        a.className = 'g-boton';
        a.href = e.url;
        a.textContent = e.etiqueta;
        acciones.append(a);
      }
      cedula.hidden = false;
      cedula.querySelector<HTMLElement>('[data-c-titulo]')!.focus({ preventScroll: true });
    },
    mostrarNota(nombre: string, texto: string) {
      ui.cerrarTodo();
      nota.querySelector('[data-n-nombre]')!.textContent = nombre;
      nota.querySelector('[data-n-texto]')!.textContent = texto;
      nota.hidden = false;
      window.clearTimeout(relojNota);
      relojNota = window.setTimeout(() => (nota.hidden = true), 6500);
    },
    estacion(id: string) {
      $<HTMLElement>('[data-estacion-actual]').textContent = ESTACIONES[id]?.nombre ?? 'El estudio';
      raiz.querySelectorAll('[data-estacion]').forEach((b) => b.setAttribute('aria-current', String(b.getAttribute('data-estacion') === id)));
      raiz.querySelectorAll('[data-seccion-ir]').forEach((b) => b.setAttribute('aria-current', String(b.getAttribute('data-seccion-ir') === id)));
      $<HTMLButtonElement>('[data-volver]').hidden = id === 'centro';
    },
    alternarMapa(abrir = mapa.hidden) {
      mapa.hidden = !abrir;
      botonMapa.setAttribute('aria-expanded', String(abrir));
      if (abrir) mapa.querySelector<HTMLElement>('button')?.focus();
    },
    /** FR-0013-05: la placa se pliega en cuanto empieza la exploración. */
    plegarPlaca() {
      if (placa.dataset.modo === 'compacta') return;
      placa.dataset.modo = 'compacta';
      $<HTMLButtonElement>('[data-placa-toggle]').setAttribute('aria-expanded', 'false');
    },
    alternarPlaca() {
      const abierta = placa.dataset.modo !== 'compacta';
      placa.dataset.modo = abierta ? 'compacta' : 'abierta';
      $<HTMLButtonElement>('[data-placa-toggle]').setAttribute('aria-expanded', String(!abierta));
    },
    /** FR-0013-06: la guía se va con la primera interacción y no vuelve. */
    cerrarGuia() {
      const guia = $<HTMLElement>('[data-guia]');
      if (guia.hidden) return;
      guia.hidden = true;
      try {
        localStorage.setItem('gabinete-guia', 'vista');
      } catch {
        /* sin almacenamiento */
      }
    },
    abrirGuia() {
      let vista = false;
      try {
        vista = localStorage.getItem('gabinete-guia') === 'vista';
      } catch {
        /* sin almacenamiento */
      }
      $<HTMLElement>('[data-guia]').hidden = vista;
    },
  };
  return ui;
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
    document.documentElement.dataset.vista = 'clasica';
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
  const hemisferio = new HemisphereLight(0xffd9a8, 0x1a0f08, 0.42);
  escena.add(hemisferio);
  const cenital = new SpotLight(0xffb469, 52, 0, 1.05, 0.85, 1.6);
  cenital.position.set(0, ALTO - 0.25, 0.3);
  cenital.target.position.set(0, 0, 0.1);
  cenital.castShadow = true;
  cenital.shadow.mapSize.set(1024, 1024);
  cenital.shadow.bias = -0.0004;
  escena.add(cenital, cenital.target);
  const focos: SpotLight[] = [];
  for (const [x, y, z] of [
    [0, 1.2, -3.4],
    [-2.65, 1.6, -3.9],
    [2.65, 1.6, -3.9],
    [-4.8, 1.6, -1.25],
    [-4.15, 1.1, 1.4],
    [4.3, 0.7, -2.2],
  ] as Vec3[]) {
    const foco = new SpotLight(0xffc98f, 26, 0, 0.42, 0.7, 1.7);
    foco.position.set(x * 0.55, ALTO - 0.2, z * 0.55 + (z < 0 ? 0.6 : -0.2));
    foco.target.position.set(x, y, z);
    escena.add(foco, foco.target);
    focos.push(foco);
  }
  const lampara = new PointLight(0xff9a4a, 2.4, 5, 1.8);
  escena.add(lampara);

  // ── Bucle: el salón se ve mientras llegan los muebles (FR-0012-12) ──
  const items: Item[] = [];
  const anims: Anim[] = [];
  const capaMarcas = raiz.querySelector<HTMLElement>('[data-marcas]')!;
  let fovBase = 58;
  let corrimiento = 0;
  const ajustar = () => {
    const w = lienzo.clientWidth;
    const h = lienzo.clientHeight;
    renderer.setSize(w, h, false);
    camara.aspect = w / h;
    fovBase = w < h ? 72 : 58;
    camara.fov = fovBase * mirada.zoom;
    if (corrimiento > 0) camara.setViewOffset(w, h, corrimiento, 0, w, h);
    camara.updateProjectionMatrix();
  };
  // FR-0014-04: con un panel abierto a la derecha, la escena se corre para que el mueble se vea.
  const cedulaEl = raiz.querySelector<HTMLElement>('[data-cedula]')!;
  const correr = (dt: number) => {
    const w = lienzo.clientWidth;
    const h = lienzo.clientHeight;
    const panel =
      document.querySelector<HTMLElement>('.sp[data-abierta], .asis:not([hidden])') ?? (cedulaEl.hidden ? null : cedulaEl);
    const meta = panel && w > 760 ? Math.min(w * 0.3, (panel.offsetWidth + 28) / 2) : 0;
    if (Math.abs(meta - corrimiento) < 0.5) return;
    corrimiento += (meta - corrimiento) * (reducirMovimiento ? 1 : Math.min(1, dt * 7));
    if (meta === 0 && corrimiento < 1) {
      corrimiento = 0;
      camara.clearViewOffset();
    } else camara.setViewOffset(w, h, corrimiento, 0, w, h);
  };
  new ResizeObserver(ajustar).observe(lienzo);
  ajustar();

  // FR-0013-04: marcas doradas sobre lo que está a la vista
  const proyectado = new Vector3();
  const haciaObjeto = new Vector3();
  const frente = new Vector3();
  const colocarMarcas = () => {
    const w = lienzo.clientWidth;
    const h = lienzo.clientHeight;
    camara.getWorldDirection(frente);
    const ocultas = mirada.viajando;
    for (const it of items) {
      if (!it.marca) continue;
      haciaObjeto.copy(it.ancla).sub(camara.position);
      const dist = haciaObjeto.length();
      const delante = haciaObjeto.normalize().dot(frente) > 0.35;
      proyectado.copy(it.ancla).project(camara);
      const visible = !ocultas && delante && dist < 8.5 && Math.abs(proyectado.x) < 0.96 && Math.abs(proyectado.y) < 0.92;
      if (it.marca.hidden === visible) it.marca.hidden = !visible;
      if (visible) {
        const x = ((proyectado.x + 1) / 2) * w;
        const y = ((1 - proyectado.y) / 2) * h;
        it.marca.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      }
    }
  };

  let previo = performance.now();
  const tick = (ahora: number) => {
    const dt = Math.min(0.05, (ahora - previo) / 1000);
    previo = ahora;
    mirada.actualizar(dt, fovBase);
    correr(dt);
    avanzar(anims, dt);
    colocarMarcas();
    renderer.render(escena, camara);
  };
  renderer.setAnimationLoop(tick);
  document.addEventListener('visibilitychange', () => renderer.setAnimationLoop(document.hidden ? null : tick));

  // ── Muebles y objetos ──
  const gltf = new GLTFLoader();
  gltf.setMeshoptDecoder(MeshoptDecoder);
  // Spec 0016: solo los muebles que sostienen algo del portafolio.
  const modelos = ['vintage_cabinet_01', 'treasure_chest', 'wooden_table_02', 'vintage_pocket_watch', 'book_encyclopedia_set_01'] as const;
  let cargados = 0;
  const cargar = async (id: string) => {
    const g = await gltf.loadAsync(`${datos.base}gabinete/modelos/${id}.glb`);
    cargados++;
    ui.progreso(0.1 + (cargados / modelos.length) * 0.85);
    return g.scene;
  };
  const M = Object.fromEntries(await Promise.all(modelos.map(async (id) => [id, await cargar(id)] as const))) as Record<(typeof modelos)[number], Group>;
  for (const m of Object.values(M)) sombras(m);
  const entintar = (obj: Object3D, hex: number) =>
    obj.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      for (const mat of (Array.isArray(m.material) ? m.material : [m.material]) as MeshStandardMaterial[]) mat.color?.multiply(new Color(hex));
    });
  entintar(M.wooden_table_02, 0x6a4a36);

  const poner = <O extends Object3D>(obj: O, pos: Vec3, rotY = 0, escala = 1) => {
    obj.position.set(...pos);
    obj.rotation.y = rotY;
    obj.scale.setScalar(escala);
    escena.add(obj);
    obj.updateMatrixWorld(true);
    return obj;
  };
  const rayo = new Raycaster();
  const superficie = (mueble: Object3D, x: number, z: number) => {
    rayo.set(new Vector3(x, ALTO, z), new Vector3(0, -1, 0));
    const hit = rayo.intersectObject(mueble, true)[0];
    return hit ? hit.point.y : 0;
  };

  const caja = new Box3();
  const registrar = (raizObj: Object3D, dato: Dato, conMarca = true) => {
    raizObj.updateMatrixWorld(true);
    // Materiales propios: resaltar un objeto no debe afectar a sus gemelos.
    raizObj.traverse((o) => {
      const m = o as Mesh;
      if (m.isMesh) m.material = Array.isArray(m.material) ? m.material.map((x) => x.clone()) : m.material.clone();
    });
    caja.setFromObject(raizObj);
    const ancla = new Vector3((caja.min.x + caja.max.x) / 2, Math.min(caja.max.y + 0.06, 3.2), (caja.min.z + caja.max.z) / 2);
    const item: Item = { raiz: raizObj, dato, ancla };
    itemDe.set(raizObj, item);
    if (conMarca) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `g-marca g-marca--${dato.tipo}`;
      b.hidden = true;
      const etiqueta = dato.tipo === 'pieza' ? `${dato.nombre} · pieza` : dato.nombre;
      b.setAttribute('aria-label', etiqueta);
      b.innerHTML = `<span class="g-marca__punto" aria-hidden="true"></span><span class="g-marca__nombre" aria-hidden="true"></span>`;
      b.querySelector('.g-marca__nombre')!.textContent = etiqueta;
      b.addEventListener('click', () => elegir(item));
      b.addEventListener('pointerenter', () => resaltar(raizObj, true));
      b.addEventListener('pointerleave', () => resaltar(raizObj, false));
      b.addEventListener('focus', () => resaltar(raizObj, true));
      b.addEventListener('blur', () => resaltar(raizObj, false));
      capaMarcas.append(b);
      item.marca = b;
    }
    items.push(item);
    return item;
  };
  const curiosidad = (raizObj: Object3D, id: string) => {
    const c = datos.curiosidades.find((x) => x.id === id);
    if (!c) return null;
    return registrar(raizObj, { tipo: 'objeto', id, nombre: c.nombre, nota: c.nota, accion: c.accion });
  };
  const piezaPor = (objeto: string) => datos.piezas.filter((p) => p.objeto === objeto);
  const ANIMACION_PIEZA: Record<string, Accion> = {
    campana: 'levantar',
    reloj: 'girar',
    periodicos: 'levantar',
    diploma: 'balancear',
    revista: 'levantar',
    medalla: 'levantar',
    certificado: 'balancear',
  };
  const pieza = (raizObj: Object3D, p: PiezaDato) =>
    registrar(raizObj, { tipo: 'pieza', id: p.id, estacion: p.seccion, nombre: p.titulo, animacion: ANIMACION_PIEZA[p.objeto ?? ''] ?? 'saltar' });

  // Centro: mesa del explorador
  const mesaCentro = poner(M.wooden_table_02, [0, 0, 0.35], 0.1, 1.15);
  const altoMesa = superficie(mesaCentro, 0.25, 0.35) || 0.92;
  registrar(mesaCentro, { tipo: 'estacion', id: 'centro', nombre: 'Mesa del explorador' }, false);
  lampara.position.set(0.3, altoMesa + 0.9, 0.3);
  // FR-0014-05 · Redes y contacto: la correspondencia sobre la mesa
  const cartas = poner(O.correspondencia(datos.redes.map((r, i) => T.sobre(r.etiqueta, r.cuenta, 21 + i))), [0.02, altoMesa + 0.006, 0.66], 0.05);
  registrar(cartas, { tipo: 'estacion', id: 'contacto', nombre: 'Redes y contacto' });
  // Spec 0015 · FR-0015-01: el teléfono de latón abre el asistente, si el servidor está listo.
  const ponerTelefono = () => {
    if (telefono) return;
    telefono = curiosidad(poner(O.telefono(), [-0.6, altoMesa, 0.66], 0.5, 1.4), 'telefono');
  };
  let telefono: Item | null = null;
  if (document.documentElement.dataset.asistente === 'listo') ponerTelefono();
  else window.addEventListener('asistente:listo', ponerTelefono, { once: true });

  // Spec 0016 · Los demás proyectos cuelgan junto a la alacena: su captura enmarcada y su placa.
  const MUROS: [number, number][] = [[-1.4, 0], [1.4, 0], [-2.3, 0], [2.3, 0], [-3.2, 0], [3.2, 0], [-4.1, 0], [4.1, 0]];
  const cuadros = piezaPor('cuadro').filter((p) => p.imagen3d);
  const capturas = await Promise.all(
    cuadros.map(async (p) => {
      try {
        const t = await cargadorTex.loadAsync(p.imagen3d!);
        t.colorSpace = SRGBColorSpace;
        t.anisotropy = renderer.capabilities.getMaxAnisotropy();
        return t;
      } catch {
        return null;
      }
    }),
  );
  cuadros.forEach((p, i) => {
    const lugar = MUROS[i];
    const captura = capturas[i];
    if (!lugar || !captura) return;
    const [x, fila] = lugar;
    const cuadro = poner(O.cuadroProyecto(captura, T.placa(p.titulo, 'Proyecto', false), 0.74, 0.46), [x, fila ? 2.45 : 1.62, -3.965]);
    cuadro.userData.cuadro = true;
    cuadro.userData.normal = new Vector3(0, 0, 1);
    cuadro.userData.centro = new Box3().setFromObject(cuadro).getCenter(new Vector3());
    pieza(cuadro, p);
  });

  // Proyectos: alacena victoriana
  const alacena = poner(M.vintage_cabinet_01, [0, 0, -3.62], 0, 1.05);
  registrar(alacena, { tipo: 'estacion', id: 'proyectos', nombre: 'Proyectos' }, false);
  const yAlacena = superficie(alacena, 0, -3.36) || 0.95;
  const [pMosca] = piezaPor('campana');
  if (pMosca) pieza(poner(O.campanaMosca(T.etiqueta('Drosophila melanogaster', 'Modelo ampliado · 1,408 neuronas')), [-0.48, yAlacena, -3.33], 0.15, 1.15), pMosca);
  const [pReloj] = piezaPor('reloj');
  if (pReloj) {
    const soporte = O.soporteReloj();
    const reloj = M.vintage_pocket_watch;
    reloj.scale.setScalar(2.4);
    reloj.position.set(0, 0.04 + 0.03 * 2.4, 0);
    reloj.rotation.x = -0.35;
    soporte.add(reloj);
    soporte.userData.anima = reloj;
    pieza(poner(soporte, [0.05, yAlacena, -3.32], -0.1), pReloj);
  }
  const [pPrensa] = piezaPor('periodicos');
  if (pPrensa) {
    const titulares = [pPrensa.subtitulo, 'La consultora publica cada semana', 'Cuatro roles editoriales se turnan', 'El modo seguro protege los datos'];
    pieza(poner(O.periodicos(titulares.map((t, i) => T.periodico('Gaceta de Axon', t, 5 + i))), [0.55, yAlacena, -3.34], 0.12, 0.85), pPrensa);
  }

  // Títulos y diplomas: pared de diplomas y consola con la medalla
  const consola = poner(M.wooden_table_02.clone(), [-4.6, 0, -1.25], Math.PI / 2, 1);
  registrar(consola, { tipo: 'estacion', id: 'titulos', nombre: 'Títulos y diplomas' }, false);
  const yConsola = superficie(consola, -4.6, -1.25) || 0.8;
  const [pMedalla] = piezaPor('medalla');
  if (pMedalla) pieza(poner(O.medallaEnCojin(), [-4.55, yConsola, -1.25], Math.PI / 2), pMedalla);
  const grados = piezaPor('diploma').sort((a, b) => b.fecha.localeCompare(a.fecha));
  const posDiplomas: Vec3[] = [
    [-1.62, 2.25, 0.5],
    [-0.98, 2.25, 0.5],
    [-1.62, 1.72, 0.5],
    [-0.98, 1.72, 0.5],
  ];
  grados.forEach((p, i) => {
    const [z, y, w] = posDiplomas[i] ?? [-0.5 - i * 0.6, 1.8, 0.45];
    pieza(poner(O.diplomaEnmarcado(T.diploma(p.titulo, p.procedencia, p.fecha.slice(0, 4), 9 + i), w, w * 0.74), [-4.96, y, z], Math.PI / 2), p);
  });

  // Spec 0006 · Certificaciones: credenciales enmarcadas en el muro derecho, frente a su atril.
  const certificados = piezaPor('certificado').sort((a, b) => b.fecha.localeCompare(a.fecha));
  certificados.slice(0, 4).forEach((p, i) => {
    const z = 0.45 + (i % 2 ? 0.34 : -0.34);
    const y = i < 2 ? 1.72 : 1.2;
    const tex = T.diploma(p.titulo, p.procedencia, p.fecha.slice(0, 4), 31 + i, 'la credencial');
    pieza(poner(O.diplomaEnmarcado(tex, 0.52, 0.385), [4.96, y, z], -Math.PI / 2), p);
  });

  // Experiencia: bitácora abierta
  const bitacora = poner(O.bitacora(T.paginasBitacora('Bitácora', datos.bitacora)), [-4.15, 0, 1.4], Math.PI / 2);
  registrar(bitacora, { tipo: 'estacion', id: 'experiencia', nombre: 'Experiencia' });

  // Publicaciones: baúl del explorador con la revista y los artículos
  const baul = poner(M.treasure_chest, [4.3, 0, -2.2], -Math.PI / 2, 1);
  registrar(baul, { tipo: 'estacion', id: 'publicaciones', nombre: 'Publicaciones' }, false);
  const yBaul = superficie(baul, 4.3, -2.2) || 0.62;
  curiosidad(poner(M.book_encyclopedia_set_01, [4.3, yBaul, -2.5], -Math.PI / 2, 0.62), 'libros');
  const [pRevista] = piezaPor('revista');
  if (pRevista) pieza(poner(O.revista(T.portadaRevista(pRevista.titulo, 'Revista Estilos de Aprendizaje')), [4.25, yBaul, -1.95], -Math.PI / 2 + 0.1), pRevista);

  // Atriles con placa de latón: uno por sección visible, llevan a su mueble
  for (const sec of datos.secciones) {
    const est = ESTACIONES[sec.id];
    if (!est?.atril) continue;
    const a = poner(O.atrilPlaca(T.placa(sec.nombre, sec.cuenta, false)), est.atril, est.atrilRot ?? 0);
    registrar(a, { tipo: 'estacion', id: sec.id, nombre: sec.nombre }, false);
  }
  const hayPanel = (id: string) => datos.secciones.some((x) => x.id === id);
  /** Recorrido con las flechas de la barra: el centro y luego las secciones en orden. */
  const RECORRIDO = ['centro', ...datos.secciones.map((x) => x.id)];
  ui.progreso(1);

  // ── Acciones (FR-0013-02) ──
  let estacionActual = 'centro';
  const irA = (id: string) => {
    const est = ESTACIONES[id];
    if (!est) return;
    estacionActual = id;
    mirada.viajar(new Vector3(...est.vista.cam), new Vector3(...est.vista.mira));
    ui.estacion(id);
  };
  const acercarA = (it: Item) => {
    // Un cuadro se mira de frente y a su centro; un objeto, un poco desde arriba.
    const cuadro = Boolean(it.raiz.userData.cuadro);
    const objetivo = (it.raiz.userData.centro as Vector3 | undefined) ?? it.ancla;
    const dir =
      (it.raiz.userData.normal as Vector3 | undefined)?.clone() ?? new Vector3(0, objetivo.y, 0.3).sub(objetivo).setY(0).normalize();
    const pos = objetivo.clone().addScaledVector(dir, cuadro ? 1.15 : 1.05);
    pos.y = MathUtils.clamp(objetivo.y + (cuadro ? 0.02 : 0.25), 0.9, 2.4);
    mirada.viajar(pos, objetivo.clone().setY(objetivo.y - (cuadro ? 0 : 0.08)));
    ui.estacion('');
  };
  const parteAnimable = (it: Item) => (it.raiz.userData.anima as Object3D | undefined) ?? it.raiz;
  const hacer = (it: Item, accion: Accion) => {
    const obj = parteAnimable(it);
    switch (accion) {
      case 'acercar':
        acercarA(it);
        break;
      case 'biblioteca':
        irA('publicaciones');
        ui.abrirSeccion('publicaciones');
        return;
      case 'asistente':
        animar(anims, obj, 'levantar');
        ui.cerrarTodo();
        window.dispatchEvent(new Event('asistente:abrir'));
        return;
      case 'mirar': {
        const v = camara.position.clone().sub(obj.getWorldPosition(new Vector3()));
        const objetivo = Math.atan2(v.x, v.z);
        let giro = objetivo - obj.rotation.y;
        while (giro > Math.PI) giro -= Math.PI * 2;
        while (giro < -Math.PI) giro += Math.PI * 2;
        animar(anims, obj, 'mirar', MathUtils.clamp(giro, -0.8, 0.8));
        break;
      }
      case 'hora':
        animar(anims, obj, 'balancear');
        break;
      default:
        animar(anims, obj, accion);
    }
  };
  const elegir = (it: Item) => {
    ui.plegarPlaca();
    ui.cerrarGuia();
    ui.alternarMapa(false);
    const d = it.dato;
    if (d.tipo === 'estacion') {
      ui.cerrarTodo();
      irA(d.id);
      if (hayPanel(d.id)) ui.abrirSeccion(d.id);
    } else if (d.tipo === 'pieza') {
      if (it.raiz.userData.cuadro) acercarA(it);
      else if (estacionActual !== d.estacion) irA(d.estacion);
      animar(anims, parteAnimable(it), d.animacion);
      ui.abrirCedula(d.id);
    } else {
      hacer(it, d.accion);
      if (d.accion !== 'biblioteca' && d.accion !== 'asistente') {
        const hora = new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Monterrey' }).format(new Date());
        ui.mostrarNota(d.nombre, d.nota.replace('{hora}', hora));
      }
    }
  };

  // FR-0013-07: caminar hasta un punto del piso
  const caminar = (punto: Vector3) => {
    const x = MathUtils.clamp(punto.x, -4.1, 4.1);
    let z = MathUtils.clamp(punto.z, -2.9, 3.6);
    if (Math.abs(x) < 0.9 && z > -0.4 && z < 1.1) z = 1.35; // no atravesar la mesa
    mirada.viajar(new Vector3(x, OJOS, z));
    estacionActual = '';
    ui.estacion('');
    ui.cerrarTodo();
  };

  // ── Controles de la interfaz ──
  raiz.querySelectorAll<HTMLButtonElement>('[data-estacion]').forEach((b) =>
    b.addEventListener('click', () => {
      ui.cerrarTodo();
      ui.alternarMapa(false);
      ui.plegarPlaca();
      irA(b.dataset.estacion!);
    }),
  );
  // FR-0014-03: el menú de secciones lleva al mueble y abre su panel.
  const irASeccion = (id: string) => {
    ui.alternarMapa(false);
    ui.plegarPlaca();
    ui.cerrarGuia();
    irA(id);
    ui.abrirSeccion(id);
  };
  document.querySelectorAll<HTMLButtonElement>('[data-seccion-ir]').forEach((b) => b.addEventListener('click', () => irASeccion(b.dataset.seccionIr!)));
  document.querySelectorAll<HTMLButtonElement>('[data-cerrar-seccion]').forEach((b) => b.addEventListener('click', () => ui.cerrarSeccion()));
  // FR-0014-04: desde el panel, "Mirar en el gabinete" lleva la cámara al objeto de la pieza.
  document.querySelectorAll<HTMLButtonElement>('[data-mirar]').forEach((b) => {
    const it = items.find((x) => x.dato.tipo === 'pieza' && x.dato.id === b.dataset.mirar);
    if (!it) return;
    b.hidden = false;
    b.addEventListener('click', () => {
      ui.cerrarTodo();
      acercarA(it);
      animar(anims, parteAnimable(it), it.dato.tipo === 'pieza' ? it.dato.animacion : 'saltar');
      ui.abrirCedula(it.dato.id);
    });
  });
  // FR-0014-10: /#seccion abre esa sección.
  const desdeAncla = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (hayPanel(id)) irASeccion(id);
  };
  window.addEventListener('hashchange', desdeAncla);
  window.addEventListener('paneles:cerrar', () => ui.cerrarTodo());
  const paso = (d: number) => {
    const i = Math.max(0, RECORRIDO.indexOf(estacionActual));
    const sig = RECORRIDO[(i + d + RECORRIDO.length) % RECORRIDO.length]!;
    ui.cerrarTodo();
    ui.plegarPlaca();
    ui.cerrarGuia();
    if (hayPanel(sig)) irASeccion(sig);
    else irA(sig);
  };
  raiz.querySelector('[data-anterior]')!.addEventListener('click', () => paso(-1));
  raiz.querySelector('[data-siguiente]')!.addEventListener('click', () => paso(1));
  raiz.querySelector('[data-volver]')!.addEventListener('click', () => {
    ui.cerrarTodo();
    mirada.zoom = 1;
    irA('centro');
  });
  raiz.querySelector('[data-abrir-mapa]')!.addEventListener('click', () => ui.alternarMapa());
  raiz.querySelector('[data-placa-toggle]')!.addEventListener('click', () => ui.alternarPlaca());
  raiz.querySelectorAll('[data-cerrar]').forEach((b) => b.addEventListener('click', () => ui.cerrarTodo()));

  // ── Puntero: arrastrar, tocar, pellizcar (FR-0013-01, 07, 08) ──
  const puntero = new Vector2();
  const etiqueta = raiz.querySelector<HTMLElement>('[data-etiqueta]')!;
  const suelo = [piso, alfombra];
  const toques = new Map<number, { x: number; y: number }>();
  let arrastre: { x: number; y: number; t: number; movido: number } | null = null;
  let pellizco = 0;
  let encima: Item | null = null;
  type Toque = { tipo: 'item'; item: Item } | { tipo: 'piso'; punto: Vector3 } | null;
  const tocar = (x: number, y: number): Toque => {
    const r = lienzo.getBoundingClientRect();
    puntero.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    rayo.setFromCamera(puntero, camara);
    const hit = rayo.intersectObjects([...items.map((i) => i.raiz), ...suelo], true)[0];
    if (!hit) return null;
    const it = buscarItem(hit.object);
    if (it) return { tipo: 'item', item: it };
    return suelo.includes(hit.object as Mesh) ? { tipo: 'piso', punto: hit.point } : null;
  };
  const primeraInteraccion = () => {
    ui.plegarPlaca();
    ui.cerrarGuia();
  };
  lienzo.addEventListener('pointerdown', (e) => {
    lienzo.setPointerCapture(e.pointerId);
    toques.set(e.pointerId, { x: e.clientX, y: e.clientY });
    mirada.frenar();
    primeraInteraccion();
    if (toques.size === 2) {
      const [a, b] = [...toques.values()] as [{ x: number; y: number }, { x: number; y: number }];
      pellizco = Math.hypot(a.x - b.x, a.y - b.y);
      arrastre = null;
      return;
    }
    arrastre = { x: e.clientX, y: e.clientY, t: performance.now(), movido: 0 };
  });
  lienzo.addEventListener('pointermove', (e) => {
    if (toques.has(e.pointerId)) toques.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (toques.size === 2 && pellizco) {
      const [a, b] = [...toques.values()] as [{ x: number; y: number }, { x: number; y: number }];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      mirada.acercar(pellizco / d);
      pellizco = d;
      return;
    }
    if (arrastre) {
      const ahora = performance.now();
      const dx = e.clientX - arrastre.x;
      const dy = e.clientY - arrastre.y;
      arrastre.movido += Math.abs(dx) + Math.abs(dy);
      mirada.arrastrar(dx, dy, (ahora - arrastre.t) / 1000);
      arrastre.x = e.clientX;
      arrastre.y = e.clientY;
      arrastre.t = ahora;
      etiqueta.hidden = true;
      return;
    }
    if (tactil) return;
    const h = tocar(e.clientX, e.clientY);
    const nuevo = h?.tipo === 'item' ? h.item : null;
    if (nuevo !== encima) {
      if (encima) resaltar(encima.raiz, false);
      if (nuevo) resaltar(nuevo.raiz, true);
      encima = nuevo;
    }
    lienzo.style.cursor = nuevo ? 'pointer' : h?.tipo === 'piso' ? 'crosshair' : 'grab';
    if (nuevo) {
      etiqueta.textContent = nuevo.dato.tipo === 'pieza' ? `${nuevo.dato.nombre} · pieza` : nuevo.dato.nombre;
      etiqueta.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 14}px)`;
      etiqueta.hidden = false;
    } else etiqueta.hidden = true;
  });
  const terminar = (e: PointerEvent) => {
    toques.delete(e.pointerId);
    if (toques.size < 2) pellizco = 0;
    const fue = arrastre;
    arrastre = null;
    if (!fue) return;
    if (fue.movido < 8) {
      mirada.frenar();
      const h = tocar(e.clientX, e.clientY);
      if (h?.tipo === 'item') elegir(h.item);
      else if (h?.tipo === 'piso') caminar(h.punto);
    } else mirada.soltar();
  };
  lienzo.addEventListener('pointerup', terminar);
  lienzo.addEventListener('pointercancel', terminar);
  lienzo.addEventListener('pointerleave', () => {
    etiqueta.hidden = true;
    if (encima) resaltar(encima.raiz, false);
    encima = null;
  });
  lienzo.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      mirada.acercar(Math.exp(e.deltaY * 0.0012));
    },
    { passive: false },
  );
  window.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement;
    if (e.key === 'Escape') {
      if (!raiz.querySelector<HTMLElement>('[data-mapa]')!.hidden) ui.alternarMapa(false);
      else if (ui.seccionAbierta() || t.closest('[data-cedula], [data-nota]')) ui.cerrarTodo();
      else {
        ui.cerrarTodo();
        irA('centro');
      }
      return;
    }
    if (t.closest('input, textarea, [data-cedula], [data-mapa], .sp')) return;
    const k = 0.09;
    // Las flechas giran la mirada en su dirección (izquierda mira a la izquierda).
    if (e.key === 'ArrowLeft') mirada.girar(k, 0);
    else if (e.key === 'ArrowRight') mirada.girar(-k, 0);
    else if (e.key === 'ArrowUp') mirada.girar(0, k);
    else if (e.key === 'ArrowDown') mirada.girar(0, -k);
    else if (e.key === '+' || e.key === '=') mirada.acercar(0.9);
    else if (e.key === '-') mirada.acercar(1.1);
    else return;
    primeraInteraccion();
    e.preventDefault();
  });

  window.clearTimeout(respaldoTardio);
  ui.listo();
  ui.estacion('centro');
  ui.abrirGuia();
  desdeAncla();
  // Para pruebas automáticas
  (window as unknown as { __gabinete?: unknown }).__gabinete = { irA, elegir, items, escena, camara, mirada };
}

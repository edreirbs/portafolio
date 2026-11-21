// Spec 0012 y 0013 · El gabinete en 3D: el estudio de un explorador del siglo XIX.
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
  sala: string;
  fecha: string;
  procedencia: string;
  objeto?: string;
  url: string;
  evidencia: Evidencia[];
}
interface SalaDato { id: string; nombre: string; tema: string; piezas: number }
type Accion = 'girar' | 'saltar' | 'balancear' | 'levantar' | 'mirar' | 'luz' | 'penumbra' | 'hora' | 'sentarse' | 'acercar' | 'biblioteca';
interface Curiosidad { id: string; nombre: string; nota: string; accion: Accion }
interface Datos { base: string; piezas: PiezaDato[]; salas: SalaDato[]; curiosidades: Curiosidad[] }

type Vec3 = [number, number, number];
interface Estacion { nombre: string; vista: { cam: Vec3; mira: Vec3 }; atril?: Vec3; atrilRot?: number }

const ANCHO = 10;
const FONDO = 8;
const ALTO = 3.6;
const OJOS = 1.62;
const ESTACIONES: Record<string, Estacion> = {
  centro: { nombre: 'Centro del estudio', vista: { cam: [0, OJOS, 3.55], mira: [0, 1.05, -1.6] } },
  artificialia: { nombre: 'Artificialia', vista: { cam: [0, 1.58, -1.2], mira: [0, 1.08, -3.5] }, atril: [-1.45, 0, -2.75], atrilRot: 0.5 },
  mirabilia: { nombre: 'Mirabilia', vista: { cam: [2.55, 1.45, -2.2], mira: [4.3, 0.72, -2.2] }, atril: [3.6, 0, -1.05], atrilRot: -2.2 },
  scientifica: { nombre: 'Scientifica', vista: { cam: [2.15, 1.72, 0.45], mira: [4.4, 1.35, 0.45] }, atril: [3.7, 0, 1.45], atrilRot: -2.1 },
  exotica: { nombre: 'Exotica', vista: { cam: [2.75, 1.45, 2.6], mira: [4.4, 1.0, 2.85] }, atril: [3.6, 0, 3.55], atrilRot: -2.0 },
  theatrum: { nombre: 'Theatrum', vista: { cam: [-2.4, 1.55, 2.35], mira: [-4.35, 1.35, 2.35] }, atril: [-3.75, 0, 3.3], atrilRot: 2.0 },
  naturalia: { nombre: 'Naturalia', vista: { cam: [-2.35, 1.6, -1.25], mira: [-4.9, 1.45, -1.25] }, atril: [-3.85, 0, -0.1], atrilRot: 2.2 },
};
/** Recorrido con las flechas de la barra: una vuelta al salón. */
const RECORRIDO = ['centro', 'artificialia', 'mirabilia', 'scientifica', 'exotica', 'theatrum', 'naturalia'];

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
  const biblioteca = $<HTMLElement>('[data-biblioteca]');
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
      biblioteca.hidden = true;
    },
    abrirCedula(id: string) {
      const p = datos.piezas.find((x) => x.id === id);
      if (!p) return;
      ui.cerrarTodo();
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
    abrirBiblioteca() {
      ui.cerrarTodo();
      biblioteca.hidden = false;
      biblioteca.querySelector<HTMLElement>('h2')!.focus({ preventScroll: true });
    },
    estacion(id: string) {
      $<HTMLElement>('[data-estacion-actual]').textContent = ESTACIONES[id]?.nombre ?? 'El estudio';
      raiz.querySelectorAll('[data-estacion]').forEach((b) => b.setAttribute('aria-current', String(b.getAttribute('data-estacion') === id)));
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
    [-4.8, 1.6, -1.25],
    [-4.35, 1.3, 2.35],
    [4.3, 0.7, -2.2],
    [4.4, 1.2, 0.45],
    [4.35, 0.95, 2.75],
  ] as Vec3[]) {
    const foco = new SpotLight(0xffc98f, 26, 0, 0.42, 0.7, 1.7);
    foco.position.set(x * 0.55, ALTO - 0.2, z * 0.55 + (z < 0 ? 0.6 : -0.2));
    foco.target.position.set(x, y, z);
    escena.add(foco, foco.target);
    focos.push(foco);
  }
  const lampara = new PointLight(0xff9a4a, 2.4, 5, 1.8);
  escena.add(lampara);
  const luzLinterna = new PointLight(0xffa24f, 0, 3.5, 1.8);
  escena.add(luzLinterna);
  const brillo = { lampara: 1, linterna: 0, penumbra: false };

  // ── Bucle: el salón se ve mientras llegan los muebles (FR-0012-12) ──
  const items: Item[] = [];
  const anims: Anim[] = [];
  const capaMarcas = raiz.querySelector<HTMLElement>('[data-marcas]')!;
  let fovBase = 58;
  const ajustar = () => {
    const w = lienzo.clientWidth;
    const h = lienzo.clientHeight;
    renderer.setSize(w, h, false);
    camara.aspect = w / h;
    fovBase = w < h ? 72 : 58;
    camara.fov = fovBase * mirada.zoom;
    camara.updateProjectionMatrix();
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
    avanzar(anims, dt);
    const flama = reducirMovimiento ? 0 : Math.sin(ahora * 0.011) * 0.18 + Math.sin(ahora * 0.037) * 0.12;
    lampara.intensity = (2.4 + flama) * brillo.lampara;
    luzLinterna.intensity = (1.6 + flama * 0.6) * brillo.linterna;
    if (esferaGlobo && !reducirMovimiento && !anims.some((a) => a.obj === esferaGlobo)) esferaGlobo.rotation.y += dt * 0.08;
    colocarMarcas();
    renderer.render(escena, camara);
  };
  let esferaGlobo: Object3D | null = null;
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
  const entintar = (obj: Object3D, hex: number) =>
    obj.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      for (const mat of (Array.isArray(m.material) ? m.material : [m.material]) as MeshStandardMaterial[]) mat.color?.multiply(new Color(hex));
    });
  entintar(M.wooden_table_02, 0x6a4a36);
  entintar(M.vintage_wooden_drawer_01, 0x9a7a66);

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
  };
  const pieza = (raizObj: Object3D, p: PiezaDato) =>
    registrar(raizObj, { tipo: 'pieza', id: p.id, estacion: p.sala, nombre: p.titulo, animacion: ANIMACION_PIEZA[p.objeto ?? ''] ?? 'saltar' });

  // Centro: mesa del explorador
  const mesaCentro = poner(M.wooden_table_02, [0, 0, 0.35], 0.1, 1.15);
  const altoMesa = superficie(mesaCentro, 0.25, 0.35) || 0.92;
  registrar(mesaCentro, { tipo: 'estacion', id: 'centro', nombre: 'Mesa del explorador' }, false);
  const globoT = poner(O.globo(T.globoTerraqueo()), [-0.32, altoMesa, 0.32], 0.4);
  esferaGlobo = globoT.userData.esfera as Object3D;
  curiosidad(globoT, 'globo');
  const cartaMesa = O.cartaExtendida(T.carta(3, 'Mare Incognitum'));
  cartaMesa.position.set(0.2, altoMesa + 0.003, 0.42);
  cartaMesa.rotation.z = -0.12;
  escena.add(cartaMesa);
  curiosidad(cartaMesa, 'carta');
  const lamp = poner(M.vintage_oil_lamp, [0.5, altoMesa, 0.18], 0, 0.85);
  lampara.position.set(0.5, altoMesa + 0.48, 0.18);
  curiosidad(lamp, 'lampara');
  curiosidad(poner(M.ArmChair_01, [1.25, 0, 1.15], -2.35, 1.05), 'sillon');
  const candelabro = poner(M.lantern_chandelier_01, [0, ALTO, 0.3], 0, 1.2);
  candelabro.traverse((o) => (o.castShadow = false));
  curiosidad(candelabro, 'candelabro');

  // Atmósfera, también interactiva (FR-0013-02)
  curiosidad(poner(M.GothicCabinet_01, [-3.35, 0, -3.42], 0, 0.95), 'gabinete-gotico');
  curiosidad(poner(M.vintage_grandfather_clock_01, [3.4, 0, -3.75], 0, 1.05), 'reloj-pie');
  curiosidad(poner(M.fancy_picture_frame_01, [4.96, 2.15, 0.45], -Math.PI / 2, 1.7), 'cuadro');
  curiosidad(poner(M.vintage_suitcase, [-3.4, 0, 3.55], 0.25, 0.85), 'maletas');
  const linterna = poner(M.Lantern_01, [-3.1, 0.48, 3.5], 0.6, 1.4);
  luzLinterna.position.set(-3.1, 0.7, 3.5);
  curiosidad(linterna, 'linterna');

  // Artificialia: alacena victoriana
  const alacena = poner(M.vintage_cabinet_01, [0, 0, -3.62], 0, 1.05);
  registrar(alacena, { tipo: 'estacion', id: 'artificialia', nombre: 'Artificialia' }, false);
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

  // Naturalia: pared de diplomas y consola con libros
  const consola = poner(M.wooden_table_02.clone(), [-4.6, 0, -1.25], Math.PI / 2, 1);
  registrar(consola, { tipo: 'estacion', id: 'naturalia', nombre: 'Naturalia' }, false);
  const yConsola = superficie(consola, -4.6, -1.25) || 0.8;
  curiosidad(poner(M.book_encyclopedia_set_01, [-4.66, yConsola, -1.62], Math.PI / 2, 0.9), 'libros');
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
  const [pRevista] = piezaPor('revista');
  if (pRevista) pieza(poner(O.revista(T.portadaRevista(pRevista.titulo, 'Revista Estilos de Aprendizaje')), [-4.55, yConsola, -0.95], Math.PI / 2 - 0.1), pRevista);

  // Theatrum: busto sobre pedestal
  registrar(poner(O.pedestal(), [-4.35, 0, 2.35], Math.PI / 2), { tipo: 'estacion', id: 'theatrum', nombre: 'Theatrum' }, false);
  curiosidad(poner(M.marble_bust_01, [-4.35, 1.04, 2.35], Math.PI / 2, 1.2), 'busto');

  // Mirabilia: baúl del explorador con la medalla
  const baul = poner(M.treasure_chest, [4.3, 0, -2.2], -Math.PI / 2, 1);
  registrar(baul, { tipo: 'estacion', id: 'mirabilia', nombre: 'Mirabilia' }, false);
  const [pMedalla] = piezaPor('medalla');
  if (pMedalla) pieza(poner(O.medallaEnCojin(), [4.28, superficie(baul, 4.3, -2.2) || 0.62, -2.2], -Math.PI / 2), pMedalla);

  // Scientifica: cajonera con instrumentos
  const cajonera = poner(M.vintage_wooden_drawer_01, [4.45, 0, 0.45], -Math.PI / 2, 1);
  registrar(cajonera, { tipo: 'estacion', id: 'scientifica', nombre: 'Scientifica' }, false);
  const yCaj = superficie(cajonera, 4.45, 0.45) || 1.09;
  curiosidad(poner(M.vintage_microscope, [4.42, yCaj, 0.05], -Math.PI / 2 - 0.4, 1.3), 'microscopio');
  curiosidad(poner(M.seadogs_compass, [4.4, yCaj, 0.55], -Math.PI / 2, 1.6), 'brujula');
  curiosidad(poner(M.vintage_binocular, [4.45, yCaj + 0.03, 0.95], -Math.PI / 2 + 0.6, 1.2), 'binoculares');

  // Exotica: mesa de curiosidades
  const mesaExo = poner(M.wooden_table_02.clone(), [4.35, 0, 2.75], -Math.PI / 2, 1);
  registrar(mesaExo, { tipo: 'estacion', id: 'exotica', nombre: 'Exotica' }, false);
  const yExo = superficie(mesaExo, 4.35, 2.75) || 0.8;
  curiosidad(poner(M.lambis_shell, [4.3, yExo, 2.45], -1.2, 1.8), 'concha');
  curiosidad(poner(M.bronze_whale_statue, [4.4, yExo, 2.9], -Math.PI / 2 - 0.5, 0.42), 'ballena');
  curiosidad(poner(M.antique_ceramic_vase_01, [4.45, yExo, 3.25], 0, 0.9), 'porcelana');

  // Atriles con placa de latón: llevan a su estación
  for (const sala of datos.salas) {
    const est = ESTACIONES[sala.id];
    if (!est?.atril) continue;
    const a = poner(O.atrilPlaca(T.placa(sala.nombre, sala.tema, sala.piezas === 0)), est.atril, est.atrilRot ?? 0);
    registrar(a, { tipo: 'estacion', id: sala.id, nombre: `Ir a ${sala.nombre}` }, false);
  }
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
    const centro = new Vector3(0, it.ancla.y, 0.3);
    const dir = centro.sub(it.ancla).setY(0).normalize();
    const pos = it.ancla.clone().addScaledVector(dir, 1.05);
    pos.y = MathUtils.clamp(it.ancla.y + 0.25, 0.9, 2.4);
    mirada.viajar(pos, it.ancla.clone().setY(it.ancla.y - 0.08));
    ui.estacion('');
  };
  const parteAnimable = (it: Item) => (it.raiz.userData.anima as Object3D | undefined) ?? it.raiz;
  const hacer = (it: Item, accion: Accion) => {
    const obj = parteAnimable(it);
    switch (accion) {
      case 'luz':
        if (it.dato.id === 'linterna') brillo.linterna = brillo.linterna ? 0 : 1;
        else brillo.lampara = brillo.lampara === 1 ? 0.25 : 1;
        break;
      case 'penumbra': {
        brillo.penumbra = !brillo.penumbra;
        const f = brillo.penumbra ? 0.3 : 1;
        hemisferio.intensity = 0.42 * f;
        cenital.intensity = 52 * f;
        for (const foco of focos) foco.intensity = 26 * (brillo.penumbra ? 0.55 : 1);
        break;
      }
      case 'sentarse':
        mirada.viajar(new Vector3(1.05, 1.12, 0.95), new Vector3(-0.2, 0.95, 0.1));
        ui.estacion('');
        break;
      case 'acercar':
        acercarA(it);
        break;
      case 'biblioteca':
        ui.abrirBiblioteca();
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
    } else if (d.tipo === 'pieza') {
      if (estacionActual !== d.estacion) irA(d.estacion);
      animar(anims, parteAnimable(it), d.animacion);
      ui.abrirCedula(d.id);
    } else {
      hacer(it, d.accion);
      if (d.accion !== 'biblioteca') {
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
  raiz.querySelectorAll<HTMLButtonElement>('[data-pieza]').forEach((b) =>
    b.addEventListener('click', () => {
      const it = items.find((x) => x.dato.tipo === 'pieza' && x.dato.id === b.dataset.pieza);
      if (it) elegir(it);
    }),
  );
  const paso = (d: number) => {
    const i = Math.max(0, RECORRIDO.indexOf(estacionActual));
    const sig = RECORRIDO[(i + d + RECORRIDO.length) % RECORRIDO.length]!;
    ui.cerrarTodo();
    ui.plegarPlaca();
    ui.cerrarGuia();
    irA(sig);
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
      else if (t.closest('[data-cedula], [data-biblioteca], [data-nota]')) ui.cerrarTodo();
      else {
        ui.cerrarTodo();
        irA('centro');
      }
      return;
    }
    if (t.closest('input, textarea, [data-cedula], [data-biblioteca], [data-mapa]')) return;
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
  // Para pruebas automáticas
  (window as unknown as { __gabinete?: unknown }).__gabinete = { irA, elegir, items, escena, camara, mirada };
}

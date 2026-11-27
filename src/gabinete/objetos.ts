// Objetos modelados en código. Representan las piezas propias de Edrei, así que son únicos.
import {
  BoxGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  LatheGeometry,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  type Material,
  type Texture,
} from 'three';

export const MAT = {
  laton: () => new MeshStandardMaterial({ color: 0xc29a55, metalness: 1, roughness: 0.32 }),
  latonOscuro: () => new MeshStandardMaterial({ color: 0x8a6a33, metalness: 1, roughness: 0.45 }),
  nogal: () => new MeshStandardMaterial({ color: 0x3b2416, roughness: 0.55 }),
  nogalClaro: () => new MeshStandardMaterial({ color: 0x5a3820, roughness: 0.5 }),
  terciopelo: () => new MeshStandardMaterial({ color: 0x5e1513, roughness: 0.95 }),
  oro: () => new MeshStandardMaterial({ color: 0xe0b45a, metalness: 1, roughness: 0.22 }),
  vidrio: () =>
    new MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.04,
      transparent: true,
      opacity: 0.16,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      envMapIntensity: 2.2,
      side: DoubleSide,
      depthWrite: false,
    }),
  quitina: () => new MeshPhysicalMaterial({ color: 0x1c1712, roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.3 }),
};

function malla(geo: ConstructorParameters<typeof Mesh>[0], mat: Material | Material[], sombra = true) {
  const m = new Mesh(geo, mat);
  m.castShadow = sombra;
  m.receiveShadow = true;
  return m;
}

/** AF-2026-001: modelo ampliado de Drosophila bajo campana de cristal. */
export function campanaMosca(etiquetaTex: Texture): Group {
  const g = new Group();
  const base = malla(new CylinderGeometry(0.15, 0.16, 0.045, 48), MAT.nogal());
  base.position.y = 0.0225;
  g.add(base);
  const moldura = malla(new TorusGeometry(0.152, 0.008, 12, 48), MAT.laton());
  moldura.rotation.x = Math.PI / 2;
  moldura.position.y = 0.045;
  g.add(moldura);

  // Pedestal de corcho y la mosca encima
  const corcho = malla(new CylinderGeometry(0.035, 0.04, 0.05, 24), new MeshStandardMaterial({ color: 0x9c7a52, roughness: 1 }));
  corcho.position.y = 0.07;
  g.add(corcho);
  const mosca = new Group();
  const q = MAT.quitina();
  const torax = malla(new SphereGeometry(1, 24, 16), q);
  torax.scale.set(0.022, 0.02, 0.026);
  const abdomen = malla(new SphereGeometry(1, 24, 16), new MeshPhysicalMaterial({ color: 0x3a2a14, roughness: 0.4, clearcoat: 0.6 }));
  abdomen.scale.set(0.02, 0.017, 0.034);
  abdomen.position.set(0, -0.002, -0.042);
  const cabeza = malla(new SphereGeometry(1, 24, 16), q);
  cabeza.scale.set(0.02, 0.017, 0.015);
  cabeza.position.set(0, 0.002, 0.034);
  const ojoMat = new MeshPhysicalMaterial({ color: 0x8f1d14, roughness: 0.3, clearcoat: 1 });
  for (const s of [-1, 1]) {
    const ojo = malla(new SphereGeometry(0.011, 16, 12), ojoMat);
    ojo.position.set(s * 0.014, 0.006, 0.038);
    mosca.add(ojo);
    const ala = malla(
      new PlaneGeometry(0.03, 0.07),
      new MeshPhysicalMaterial({
        color: 0xd7e6f2,
        transparent: true,
        opacity: 0.38,
        roughness: 0.1,
        iridescence: 1,
        iridescenceIOR: 1.6,
        side: DoubleSide,
        depthWrite: false,
      }),
      false,
    );
    ala.rotation.set(-Math.PI / 2 + 0.25, 0, s * 0.35);
    ala.position.set(s * 0.024, 0.018, -0.03);
    mosca.add(ala);
    for (let i = 0; i < 3; i++) {
      const pata = malla(new CylinderGeometry(0.0016, 0.0012, 0.05, 6), q);
      pata.position.set(s * 0.026, -0.016, 0.012 - i * 0.016);
      pata.rotation.set(0.2 * (i - 1), 0, s * 0.9);
      mosca.add(pata);
    }
  }
  mosca.add(torax, abdomen, cabeza);
  mosca.position.y = 0.128;
  mosca.rotation.y = 0.5;
  g.add(mosca);
  g.userData.mosca = mosca;

  // Campana
  const perfil: Vector2[] = [];
  const radio = 0.13;
  const alto = 0.27;
  for (let i = 0; i <= 10; i++) perfil.push(new Vector2(radio, 0.045 + (i / 10) * (alto - radio)));
  for (let i = 1; i <= 16; i++) {
    const a = (i / 16) * (Math.PI / 2);
    perfil.push(new Vector2(Math.cos(a) * radio, 0.045 + alto - radio + Math.sin(a) * radio));
  }
  const campana = new Mesh(new LatheGeometry(perfil, 48), MAT.vidrio());
  campana.renderOrder = 2;
  const perilla = malla(new SphereGeometry(0.018, 16, 12), MAT.vidrio());
  perilla.position.y = 0.045 + alto + 0.012;
  const domo = new Group();
  domo.add(campana, perilla);
  g.add(domo);
  g.userData.anima = domo;

  // Etiqueta al frente
  const tag = malla(new PlaneGeometry(0.13, 0.05), new MeshStandardMaterial({ map: etiquetaTex, roughness: 0.9 }), false);
  tag.position.set(0, 0.024, 0.162);
  tag.rotation.x = -0.25;
  g.add(tag);
  return g;
}

/** AF-2026-003: pila de periódicos impresos. */
export function periodicos(texturas: Texture[]): Group {
  const g = new Group();
  const papelLado = new MeshStandardMaterial({ color: 0xe6dcc2, roughness: 0.95 });
  texturas.forEach((tex, i) => {
    const caraSup = new MeshStandardMaterial({ map: tex, roughness: 0.92 });
    const hoja = malla(new BoxGeometry(0.3, 0.012, 0.42), [papelLado, papelLado, caraSup, papelLado, papelLado, papelLado]);
    hoja.position.y = 0.006 + i * 0.012;
    hoja.rotation.y = (i % 2 ? -1 : 1) * (0.05 + i * 0.03);
    hoja.position.x = (i % 2 ? 1 : -1) * 0.008 * i;
    g.add(hoja);
  });
  return g;
}

/** Globo terráqueo con meridiano de latón sobre trípode de nogal. */
export function globo(tex: Texture): Group {
  const g = new Group();
  const esfera = malla(new SphereGeometry(0.2, 48, 32), new MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0.05 }));
  esfera.position.y = 0.42;
  esfera.rotation.z = 0.41;
  g.add(esfera);
  g.userData.esfera = esfera;
  g.userData.anima = esfera;
  const meridiano = malla(new TorusGeometry(0.215, 0.008, 10, 64, Math.PI * 1.4), MAT.laton());
  meridiano.position.y = 0.42;
  meridiano.rotation.set(0, Math.PI / 2, 0.41 - Math.PI * 0.2);
  g.add(meridiano);
  const horizonte = malla(new TorusGeometry(0.23, 0.012, 10, 64), MAT.nogalClaro());
  horizonte.rotation.x = Math.PI / 2;
  horizonte.position.y = 0.42;
  g.add(horizonte);
  const eje = malla(new CylinderGeometry(0.012, 0.016, 0.22, 12), MAT.nogal());
  eje.position.y = 0.11;
  g.add(eje);
  for (let i = 0; i < 3; i++) {
    const pata = malla(new CylinderGeometry(0.008, 0.01, 0.22, 8), MAT.nogal());
    const a = (i / 3) * Math.PI * 2;
    pata.position.set(Math.cos(a) * 0.07, 0.1, Math.sin(a) * 0.07);
    pata.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
    g.add(pata);
  }
  return g;
}

/** Carta extendida sobre una mesa. */
export function cartaExtendida(tex: Texture, ancho = 0.62, fondo = 0.42): Mesh {
  const m = malla(new PlaneGeometry(ancho, fondo), new MeshStandardMaterial({ map: tex, roughness: 0.9 }), false);
  m.rotation.x = -Math.PI / 2;
  return m;
}

/** Diploma enmarcado en dorado. */
export function diplomaEnmarcado(tex: Texture, ancho = 0.5, alto = 0.37): Group {
  const g = new Group();
  const oro = MAT.oro();
  const grosor = 0.035;
  const piezas: [number, number, number, number][] = [
    [0, alto / 2 + grosor / 2, ancho + grosor * 2, grosor],
    [0, -alto / 2 - grosor / 2, ancho + grosor * 2, grosor],
    [-ancho / 2 - grosor / 2, 0, grosor, alto],
    [ancho / 2 + grosor / 2, 0, grosor, alto],
  ];
  for (const [x, y, w, h] of piezas) {
    const m = malla(new BoxGeometry(w, h, 0.03), oro);
    m.position.set(x, y, 0.015);
    g.add(m);
  }
  const lamina = malla(new PlaneGeometry(ancho, alto), new MeshStandardMaterial({ map: tex, roughness: 0.85 }), false);
  lamina.position.z = 0.012;
  g.add(lamina);
  return g;
}

/** Revista encuadernada, de pie sobre un atril pequeño. */
export function revista(tex: Texture): Group {
  const g = new Group();
  const tapa = new MeshStandardMaterial({ map: tex, roughness: 0.7 });
  const lomo = new MeshStandardMaterial({ color: 0x26402f, roughness: 0.7 });
  const hojas = new MeshStandardMaterial({ color: 0xe9dfc6, roughness: 0.95 });
  const libro = malla(new BoxGeometry(0.21, 0.29, 0.025), [hojas, lomo, hojas, hojas, tapa, lomo]);
  libro.position.set(0, 0.155, 0);
  libro.rotation.x = -0.2;
  g.add(libro);
  const soporte = malla(new BoxGeometry(0.16, 0.012, 0.06), MAT.latonOscuro());
  soporte.position.set(0, 0.006, 0.02);
  g.add(soporte);
  return g;
}

/** MI-2022-001: medalla con listón guinda sobre cojín de terciopelo. */
export function medallaEnCojin(): Group {
  const g = new Group();
  const cojin = malla(new BoxGeometry(0.3, 0.06, 0.24), MAT.terciopelo());
  cojin.position.y = 0.03;
  g.add(cojin);
  const liston = malla(new BoxGeometry(0.05, 0.004, 0.13), new MeshStandardMaterial({ color: 0x6c1d45, roughness: 0.7 }));
  liston.position.set(0, 0.062, -0.04);
  g.add(liston);
  const medalla = malla(new CylinderGeometry(0.052, 0.052, 0.008, 48), MAT.oro());
  medalla.position.set(0, 0.066, 0.045);
  g.add(medalla);
  const relieve = malla(new TorusGeometry(0.04, 0.004, 8, 40), MAT.oro());
  relieve.rotation.x = Math.PI / 2;
  relieve.position.set(0, 0.071, 0.045);
  g.add(relieve);
  const disco = new Group();
  disco.position.set(0, 0.066, 0.045);
  medalla.position.set(0, 0, 0);
  relieve.position.set(0, 0.005, 0);
  disco.add(medalla, relieve);
  g.add(disco);
  g.userData.anima = disco;
  return g;
}

/** Pedestal de mármol oscuro para el busto. */
export function pedestal(): Group {
  const g = new Group();
  const marmol = new MeshStandardMaterial({ color: 0x2b2622, roughness: 0.35 });
  const base = malla(new BoxGeometry(0.46, 0.08, 0.46), marmol);
  base.position.y = 0.04;
  const fuste = malla(new BoxGeometry(0.34, 0.9, 0.34), marmol);
  fuste.position.y = 0.53;
  const capitel = malla(new BoxGeometry(0.44, 0.06, 0.44), marmol);
  capitel.position.y = 1.01;
  g.add(base, fuste, capitel);
  return g;
}

/** Atril de latón con la placa de la estación (cédula de museo). */
export function atrilPlaca(tex: Texture): Group {
  const g = new Group();
  const poste = malla(new CylinderGeometry(0.014, 0.018, 0.92, 12), MAT.latonOscuro());
  poste.position.y = 0.46;
  const pie = malla(new CylinderGeometry(0.12, 0.14, 0.02, 32), MAT.latonOscuro());
  pie.position.y = 0.01;
  const lamina = malla(new BoxGeometry(0.42, 0.14, 0.012), [
    MAT.latonOscuro(),
    MAT.latonOscuro(),
    MAT.latonOscuro(),
    MAT.latonOscuro(),
    new MeshStandardMaterial({ map: tex, metalness: 0.75, roughness: 0.38 }),
    MAT.latonOscuro(),
  ]);
  lamina.position.set(0, 0.96, 0.02);
  lamina.rotation.x = -0.55;
  g.add(pie, poste, lamina);
  return g;
}

/** Soporte de terciopelo para el reloj de bolsillo. */
export function soporteReloj(): Group {
  const g = new Group();
  const caja = malla(new BoxGeometry(0.16, 0.035, 0.13), MAT.nogal());
  caja.position.y = 0.0175;
  const forro = malla(new BoxGeometry(0.14, 0.004, 0.11), MAT.terciopelo());
  forro.position.y = 0.037;
  g.add(caja, forro);
  return g;
}

/** Spec 0014 · Redes y contacto: sobres lacrados en abanico y un sello de lacre. */
export function correspondencia(sobres: Texture[]): Group {
  const g = new Group();
  const n = sobres.length;
  sobres.forEach((tex, i) => {
    const t = n === 1 ? 0 : i / (n - 1) - 0.5;
    const s = malla(new PlaneGeometry(0.2, 0.125), new MeshStandardMaterial({ map: tex, roughness: 0.9 }), false);
    s.rotation.x = -Math.PI / 2;
    s.rotation.z = -t * 0.9;
    s.position.set(t * 0.34, 0.002 + i * 0.0012, -Math.abs(t) * 0.05);
    g.add(s);
  });
  const sello = new Group();
  const mango = malla(new CylinderGeometry(0.012, 0.016, 0.09, 16), MAT.nogalClaro());
  mango.position.y = 0.07;
  const cuello = malla(new CylinderGeometry(0.01, 0.012, 0.02, 16), MAT.laton());
  cuello.position.y = 0.018;
  const cabeza = malla(new CylinderGeometry(0.018, 0.018, 0.012, 24), MAT.laton());
  cabeza.position.y = 0.006;
  sello.add(mango, cuello, cabeza);
  sello.position.set(0.24, 0, 0.09);
  g.add(sello);
  return g;
}

/** Spec 0014 · Experiencia: bitácora abierta sobre un atril de lectura. */
export function bitacora(paginas: Texture): Group {
  const g = new Group();
  const poste = malla(new CylinderGeometry(0.03, 0.04, 0.95, 16), MAT.nogal());
  poste.position.y = 0.475;
  const pie = malla(new CylinderGeometry(0.2, 0.24, 0.04, 32), MAT.nogal());
  pie.position.y = 0.02;
  const atril = new Group();
  atril.position.y = 1.0;
  atril.rotation.x = 0.42;
  const tabla = malla(new BoxGeometry(0.62, 0.03, 0.42), MAT.nogalClaro());
  atril.add(tabla);
  const tapas = malla(new BoxGeometry(0.6, 0.02, 0.4), new MeshStandardMaterial({ color: 0x4a1d14, roughness: 0.7 }));
  tapas.position.y = 0.025;
  atril.add(tapas);
  const hojas = malla(new PlaneGeometry(0.56, 0.37), new MeshStandardMaterial({ map: paginas, roughness: 0.92 }), false);
  hojas.rotation.x = -Math.PI / 2;
  hojas.position.y = 0.037;
  atril.add(hojas);
  const cinta = malla(new BoxGeometry(0.014, 0.002, 0.16), MAT.terciopelo(), false);
  cinta.position.set(0.02, 0.039, 0.26);
  atril.add(cinta);
  g.add(pie, poste, atril);
  g.userData.anima = atril;
  return g;
}

/** Spec 0015 · El asistente: un teléfono de candelero de latón, con su auricular colgado. */
export function telefono(): Group {
  const g = new Group();
  const negro = new MeshStandardMaterial({ color: 0x141110, roughness: 0.35, metalness: 0.2 });
  const base = malla(new CylinderGeometry(0.06, 0.075, 0.03, 32), MAT.laton());
  base.position.y = 0.015;
  const tallo = malla(new CylinderGeometry(0.014, 0.018, 0.25, 16), MAT.laton());
  tallo.position.y = 0.155;
  const cuello = malla(new CylinderGeometry(0.02, 0.014, 0.03, 16), MAT.latonOscuro());
  cuello.position.y = 0.295;
  const bocina = new Group();
  bocina.position.set(0, 0.31, 0.012);
  bocina.rotation.x = 0.55;
  const cono = malla(new CylinderGeometry(0.032, 0.012, 0.05, 24, 1, true), negro);
  cono.position.y = 0.025;
  bocina.add(cono);
  g.add(base, tallo, cuello, bocina);
  // Gancho y auricular
  const gancho = malla(new BoxGeometry(0.05, 0.006, 0.01), MAT.laton());
  gancho.position.set(0.035, 0.25, 0);
  const auricular = new Group();
  auricular.position.set(0.062, 0.2, 0);
  const mango = malla(new CylinderGeometry(0.011, 0.011, 0.1, 16), negro);
  const copa = malla(new CylinderGeometry(0.024, 0.012, 0.035, 24), negro);
  copa.position.y = -0.065;
  auricular.add(mango, copa);
  // Cordón: un arco del auricular a la base
  const cordon = malla(new TorusGeometry(0.06, 0.004, 8, 24, Math.PI), negro, false);
  cordon.position.set(0.062, 0.105, 0.02);
  cordon.rotation.set(0, Math.PI / 2, Math.PI);
  g.add(gancho, auricular, cordon);
  g.userData.anima = auricular;
  return g;
}

/** Spec 0016 · Un proyecto colgado en el muro: su captura enmarcada y una placa con su nombre. */
export function cuadroProyecto(captura: Texture, placa: Texture, ancho = 0.95, alto = 0.6): Group {
  const g = diplomaEnmarcado(captura, ancho, alto);
  const lamina = malla(new BoxGeometry(0.4, 0.13, 0.012), [
    MAT.latonOscuro(),
    MAT.latonOscuro(),
    MAT.latonOscuro(),
    MAT.latonOscuro(),
    new MeshStandardMaterial({ map: placa, metalness: 0.75, roughness: 0.38 }),
    MAT.latonOscuro(),
  ]);
  lamina.position.set(0, -alto / 2 - 0.13, 0.01);
  g.add(lamina);
  return g;
}

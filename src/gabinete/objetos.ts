// Objetos modelados en código. Representan las piezas propias de Edrei, así que son únicos.
import {
  BoxGeometry,
  ConeGeometry,
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

/**
 * Spec 0018 · El mayordomo del gabinete: un autómata de latón con bombín, monóculo y pajarita,
 * de pie junto a la mesa con una charola. Abre el asistente. Mide unos 1.25 m.
 * userData.vivo(t) lo anima en reposo; userData.reverencia() lo hace inclinarse.
 */
export function mayordomo(): Group {
  const g = new Group();
  const frac = new MeshStandardMaterial({ color: 0x17130f, roughness: 0.6 });
  const camisa = new MeshStandardMaterial({ color: 0xeee6d6, roughness: 0.75 });
  const lacre = new MeshStandardMaterial({ color: 0x8e2b22, roughness: 0.45 });
  const sombrero = new MeshStandardMaterial({ color: 0x0f0d0b, roughness: 0.4, metalness: 0.15 });
  const ojos = new MeshStandardMaterial({ color: 0xffd98a, emissive: 0xffb347, emissiveIntensity: 1.5 });
  const laton = MAT.laton();
  const latonOscuro = MAT.latonOscuro();

  // Pedestal de nogal con aro de latón, como un autómata de feria.
  const base = malla(new CylinderGeometry(0.2, 0.22, 0.06, 40), MAT.nogal());
  base.position.y = 0.03;
  const aro = malla(new TorusGeometry(0.205, 0.012, 10, 48), laton);
  aro.rotation.x = Math.PI / 2;
  aro.position.y = 0.06;
  g.add(base, aro);

  const cuerpo = new Group();
  cuerpo.position.y = 0.06;
  g.add(cuerpo);
  for (const x of [-0.065, 0.065]) {
    const pierna = malla(new CylinderGeometry(0.034, 0.03, 0.4, 16), frac);
    pierna.position.set(x, 0.22, 0);
    const rodilla = malla(new SphereGeometry(0.037, 16, 12), latonOscuro);
    rodilla.position.set(x, 0.2, 0.006);
    const zapato = malla(new BoxGeometry(0.07, 0.035, 0.12), sombrero);
    zapato.position.set(x, 0.0175, 0.025);
    cuerpo.add(pierna, rodilla, zapato);
  }

  // Torso: frac oscuro, chaleco de latón con botones, pechera y pajarita de lacre.
  const torso = new Group();
  torso.position.y = 0.42;
  cuerpo.add(torso);
  const perfil = [
    [0, 0],
    [0.15, 0],
    [0.165, 0.08],
    [0.17, 0.2],
    [0.172, 0.3],
    [0.145, 0.39],
    [0.07, 0.44],
    [0, 0.44],
  ].map(([x, y]) => new Vector2(x, y));
  torso.add(malla(new LatheGeometry(perfil, 40), frac));
  const chaleco = malla(new CylinderGeometry(0.176, 0.17, 0.24, 32, 1, true, -0.5, 1), laton);
  chaleco.position.y = 0.2;
  torso.add(chaleco);
  for (let i = 0; i < 3; i++) {
    const boton = malla(new SphereGeometry(0.011, 10, 8), latonOscuro, false);
    boton.position.set(0, 0.12 + i * 0.06, 0.18);
    torso.add(boton);
  }
  const pechera = malla(new CylinderGeometry(0.075, 0.13, 0.09, 24, 1, true, -0.55, 1.1), camisa);
  pechera.position.y = 0.37;
  torso.add(pechera);
  const lazo = new Group();
  lazo.position.set(0, 0.405, 0.085);
  for (const lado of [-1, 1]) {
    const ala = malla(new ConeGeometry(0.026, 0.055, 4), lacre, false);
    ala.rotation.z = (lado * Math.PI) / 2;
    ala.position.x = lado * 0.026;
    lazo.add(ala);
  }
  lazo.add(malla(new SphereGeometry(0.013, 10, 8), lacre, false));
  torso.add(lazo);

  // Brazos: uno sostiene la charola al frente; el otro cae junto al cuerpo.
  const hombro = (x: number) => {
    const h = malla(new SphereGeometry(0.045, 16, 12), latonOscuro);
    h.position.set(x, 0.38, 0);
    torso.add(h);
  };
  hombro(0.165);
  hombro(-0.165);
  const brazoCharola = new Group();
  brazoCharola.position.set(0.19, 0.37, 0);
  const superior = malla(new CylinderGeometry(0.027, 0.025, 0.18, 14), frac);
  superior.position.y = -0.09;
  const codo = new Group();
  codo.position.y = -0.18;
  codo.rotation.x = Math.PI / 2;
  const antebrazo = malla(new CylinderGeometry(0.024, 0.022, 0.17, 14), frac);
  antebrazo.position.y = 0.085;
  const mano = malla(new SphereGeometry(0.028, 14, 10), laton);
  mano.position.y = 0.175;
  codo.add(antebrazo, mano);
  brazoCharola.add(superior, codo);
  const charola = new Group();
  charola.position.set(0.19, 0.24, 0.2);
  charola.add(malla(new CylinderGeometry(0.11, 0.11, 0.01, 40), laton));
  const borde = malla(new TorusGeometry(0.11, 0.006, 8, 40), latonOscuro, false);
  borde.rotation.x = Math.PI / 2;
  borde.position.y = 0.006;
  const tarjeta = malla(new BoxGeometry(0.075, 0.003, 0.05), camisa, false);
  tarjeta.position.set(-0.01, 0.008, 0.01);
  tarjeta.rotation.y = 0.3;
  charola.add(borde, tarjeta);
  torso.add(brazoCharola, charola);
  const brazoLibre = new Group();
  brazoLibre.position.set(-0.19, 0.37, 0);
  brazoLibre.rotation.z = -0.08;
  const libre = malla(new CylinderGeometry(0.026, 0.023, 0.33, 14), frac);
  libre.position.y = -0.165;
  const manoLibre = malla(new SphereGeometry(0.028, 14, 10), laton);
  manoLibre.position.y = -0.34;
  brazoLibre.add(libre, manoLibre);
  torso.add(brazoLibre);

  // Cabeza de latón: ojos que brillan, monóculo, bigote, tornillos por orejas y bombín.
  const cabeza = new Group();
  cabeza.position.y = 0.46;
  torso.add(cabeza);
  cabeza.add(malla(new CylinderGeometry(0.034, 0.04, 0.05, 16), latonOscuro));
  const craneo = malla(new SphereGeometry(0.105, 32, 24), laton);
  craneo.scale.set(1, 1.08, 0.98);
  craneo.position.y = 0.1;
  cabeza.add(craneo);
  for (const x of [-0.04, 0.04]) {
    const ojo = malla(new SphereGeometry(0.017, 16, 12), ojos, false);
    ojo.position.set(x, 0.115, 0.09);
    cabeza.add(ojo);
  }
  const monoculo = malla(new TorusGeometry(0.027, 0.004, 8, 28), MAT.oro(), false);
  monoculo.position.set(0.04, 0.115, 0.1);
  const cadena = malla(new CylinderGeometry(0.0018, 0.0018, 0.11, 6), MAT.oro(), false);
  cadena.position.set(0.062, 0.06, 0.1);
  cadena.rotation.z = 0.35;
  cabeza.add(monoculo, cadena);
  for (const lado of [-1, 1]) {
    const bigote = malla(new TorusGeometry(0.022, 0.0065, 8, 16, Math.PI * 0.9), latonOscuro, false);
    bigote.position.set(lado * 0.02, 0.07, 0.095);
    bigote.rotation.z = lado > 0 ? Math.PI * 1.05 : Math.PI * 1.05 - Math.PI * 0.1;
    bigote.scale.x = lado;
    cabeza.add(bigote);
    const oreja = malla(new CylinderGeometry(0.022, 0.022, 0.024, 16), latonOscuro, false);
    oreja.rotation.z = Math.PI / 2;
    oreja.position.set(lado * 0.106, 0.1, 0);
    cabeza.add(oreja);
  }
  const bombin = new Group();
  bombin.position.y = 0.19;
  bombin.rotation.z = 0.07;
  bombin.add(malla(new CylinderGeometry(0.135, 0.135, 0.012, 40), sombrero));
  const copa = malla(new SphereGeometry(0.094, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), sombrero);
  copa.scale.y = 1.2;
  copa.position.y = 0.005;
  const cinta = malla(new CylinderGeometry(0.095, 0.095, 0.022, 40, 1, true), lacre, false);
  cinta.position.y = 0.017;
  bombin.add(copa, cinta);
  cabeza.add(bombin);

  // Vida en reposo y reverencia (FR-0018-06). Sin "reducir movimiento" no se llama a vivo().
  let inicioReverencia = -1;
  let reloj = 0;
  g.userData.anima = cuerpo;
  g.userData.reverencia = () => {
    inicioReverencia = reloj;
  };
  g.userData.vivo = (t: number) => {
    reloj = t;
    cuerpo.position.y = 0.06 + Math.sin(t * 1.6) * 0.005;
    cabeza.rotation.y = Math.sin(t * 0.45) * 0.22;
    cabeza.rotation.z = Math.sin(t * 0.8) * 0.04;
    charola.rotation.z = Math.sin(t * 1.1) * 0.015;
    ojos.emissiveIntensity = 1.25 + Math.sin(t * 2.3) * 0.35;
    const k = inicioReverencia < 0 ? 1 : (t - inicioReverencia) / 1.5;
    const arco = k < 1 ? Math.sin(k * Math.PI) : 0;
    torso.rotation.x = arco * 0.38;
    cabeza.rotation.x = arco * 0.18;
    bombin.position.y = 0.19 + arco * 0.05;
    if (k >= 1) inicioReverencia = -1;
  };
  return g;
}

/** Spec 0016 · Un proyecto colgado en el muro: su captura enmarcada y una placa con su nombre. */
export function cuadroProyecto(captura: Texture, placa: Texture, ancho = 0.95, alto = 0.6): Group {
  const g = diplomaEnmarcado(captura, ancho, alto);
  const lamina = malla(new BoxGeometry(0.38, 0.12, 0.012), [
    MAT.latonOscuro(),
    MAT.latonOscuro(),
    MAT.latonOscuro(),
    MAT.latonOscuro(),
    new MeshStandardMaterial({ map: placa, metalness: 0.75, roughness: 0.38 }),
    MAT.latonOscuro(),
  ]);
  lamina.position.set(0, -alto / 2 - 0.12, 0.01);
  g.add(lamina);
  return g;
}

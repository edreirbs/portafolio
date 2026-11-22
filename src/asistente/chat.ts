// Spec 0015 · La conversación con el asistente. Se descarga solo cuando alguien abre el panel
// (FR-0015-08). Todo el texto del modelo se pinta con nodos del DOM, nunca con innerHTML.

interface Config {
  api: string;
  sugerencias: string[];
  hosts: string[];
  cv: string;
  linkedin: string;
}
interface Mensaje {
  rol: 'usuario' | 'asistente';
  texto: string;
  firma?: string;
  /** La respuesta se detuvo o falló: se muestra, pero no se manda de vuelta al servidor. */
  incompleta?: boolean;
}

const MAX_CARACTERES = 500;
const MAX_TURNOS = 12;
const CLAVE = 'asistente-conversacion';
const FUERA_DE_TEMA = 'Solo puedo responder sobre Edrei Robles y su portafolio.';

const cfg = JSON.parse(document.getElementById('asistente-config')!.textContent!) as Config;
const panel = document.getElementById('asistente')!;
const registro = panel.querySelector<HTMLElement>('[data-asis-registro]')!;
const sugerencias = panel.querySelector<HTMLElement>('[data-asis-sugerencias]')!;
const forma = panel.querySelector<HTMLFormElement>('[data-asis-forma]')!;
const entrada = panel.querySelector<HTMLTextAreaElement>('#asis-entrada')!;
const enviar = panel.querySelector<HTMLButtonElement>('[data-asis-enviar]')!;
const detener = panel.querySelector<HTMLButtonElement>('[data-asis-detener]')!;
const cuenta = panel.querySelector<HTMLElement>('[data-asis-cuenta]')!;
const anuncio = panel.querySelector<HTMLElement>('[data-asis-anuncio]')!;
const lanzador = document.querySelector<HTMLButtonElement>('[data-asistente-abrir]')!;
const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;

let mensajes: Mensaje[] = leer();
let control: AbortController | null = null;
let regreso: HTMLElement | null = null;

// ───────────────────────── Memoria de la visita (FR-0015-06) ─────────────────────────
function leer(): Mensaje[] {
  try {
    const m = JSON.parse(sessionStorage.getItem(CLAVE) ?? '[]');
    return Array.isArray(m) ? m : [];
  } catch {
    return [];
  }
}
function guardar() {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(mensajes));
  } catch {
    /* sin almacenamiento */
  }
}
function recordarAbierto(abierto: boolean) {
  try {
    sessionStorage.setItem('asistente-abierto', abierto ? '1' : '0');
  } catch {
    /* sin almacenamiento */
  }
}

// ───────────────────────── Texto seguro ─────────────────────────
function ligaPermitida(href: string): URL | null {
  try {
    const u = new URL(href, location.href);
    if (u.protocol !== 'https:' && u.origin !== location.origin) return null;
    if (u.origin === location.origin || cfg.hosts.includes(u.hostname)) return u;
  } catch {
    /* liga inválida */
  }
  return null;
}

/** **negritas** y [texto](url); una liga fuera de la lista se pinta como texto. */
function enLinea(destino: HTMLElement, texto: string) {
  const patron = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let ultimo = 0;
  for (const m of texto.matchAll(patron)) {
    if (m.index! > ultimo) destino.append(texto.slice(ultimo, m.index));
    if (m[1] !== undefined) {
      const b = document.createElement('strong');
      b.textContent = m[1];
      destino.append(b);
    } else {
      const u = ligaPermitida(m[3]!);
      if (u) {
        const a = document.createElement('a');
        a.href = u.href;
        a.textContent = m[2]!;
        if (u.origin !== location.origin) a.rel = 'noopener';
        destino.append(a);
      } else destino.append(m[2]!);
    }
    ultimo = m.index! + m[0].length;
  }
  if (ultimo < texto.length) destino.append(texto.slice(ultimo));
}

/** Separa la línea de preguntas para seguir ("→ a | b") del cuerpo de la respuesta. */
function partir(texto: string): { cuerpo: string; siguientes: string[] } {
  const i = texto.search(/(^|\n)\s*→/);
  if (i < 0) return { cuerpo: texto, siguientes: [] };
  const linea = texto.slice(i).replace(/^\s*→\s*/, '').split('\n')[0]!;
  const siguientes = linea
    .split('|')
    .map((s) => s.trim())
    .filter((s) => s.length > 3 && s.length < 120)
    .slice(0, 2);
  return { cuerpo: texto.slice(0, i).trimEnd(), siguientes };
}

function pintar(destino: HTMLElement, texto: string) {
  destino.replaceChildren();
  let lista: HTMLUListElement | null = null;
  let parrafo: HTMLParagraphElement | null = null;
  for (const cruda of texto.split('\n')) {
    const linea = cruda.trim();
    if (!linea) {
      lista = null;
      parrafo = null;
      continue;
    }
    const vineta = /^[-*•]\s+(.*)$/.exec(linea);
    if (vineta) {
      parrafo = null;
      if (!lista) destino.append((lista = document.createElement('ul')));
      const li = document.createElement('li');
      enLinea(li, vineta[1]!);
      lista.append(li);
    } else {
      lista = null;
      if (parrafo) parrafo.append(' ');
      else destino.append((parrafo = document.createElement('p')));
      enLinea(parrafo, linea);
    }
  }
}

// ───────────────────────── Interfaz ─────────────────────────
function burbuja(m: Mensaje): HTMLElement {
  const d = document.createElement('div');
  d.className = `asis-msj asis-msj--${m.rol}${m.incompleta ? ' asis-msj--cortado' : ''}`;
  if (m.rol === 'usuario') d.textContent = m.texto;
  else pintar(d, partir(m.texto).cuerpo);
  return d;
}

function aviso(texto: string, ligas = true) {
  const d = document.createElement('div');
  d.className = 'asis-msj asis-msj--aviso';
  d.append(texto);
  if (ligas) {
    d.append(' Mientras, puedes ver su ');
    const cv = document.createElement('a');
    cv.href = cfg.cv;
    cv.textContent = 'currículum';
    const li = document.createElement('a');
    li.href = cfg.linkedin;
    li.rel = 'noopener';
    li.textContent = 'LinkedIn';
    d.append(cv, ' o escribirle por ', li, '.');
  }
  registro.append(d);
  bajar();
  anunciar(d.textContent ?? '');
}

function saludo() {
  const d = document.createElement('div');
  d.className = 'asis-msj asis-msj--asistente';
  pintar(d, 'Hola. Soy el asistente del portafolio de **Edrei Robles**. Pregúntame por su trayectoria, sus proyectos, su formación o cómo contactarlo.');
  registro.append(d);
}

function ponerSugerencias(lista: string[]) {
  sugerencias.replaceChildren(
    ...lista.map((q) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = q;
      b.addEventListener('click', () => preguntar(q));
      return b;
    }),
  );
}

function sugerenciasActuales(): string[] {
  const ultima = [...mensajes].reverse().find((m) => m.rol === 'asistente' && !m.incompleta);
  if (!ultima) return cfg.sugerencias;
  const { siguientes } = partir(ultima.texto);
  return siguientes.length ? siguientes : cfg.sugerencias.slice(0, 3);
}

function bajar() {
  registro.scrollTo({ top: registro.scrollHeight, behavior: reducir ? 'auto' : 'smooth' });
}

function anunciar(texto: string) {
  anuncio.textContent = '';
  window.setTimeout(() => (anuncio.textContent = texto), 60);
}

function ocupado(si: boolean) {
  enviar.hidden = si;
  detener.hidden = !si;
  entrada.readOnly = si;
  sugerencias.toggleAttribute('inert', si);
}

function turnos() {
  return mensajes.filter((m) => m.rol === 'usuario').length;
}

function actualizarCuenta() {
  const quedan = MAX_CARACTERES - entrada.value.length;
  cuenta.textContent = quedan <= 80 ? `${quedan} caracteres` : '';
  enviar.disabled = !entrada.value.trim();
  entrada.style.height = 'auto';
  entrada.style.height = `${Math.min(entrada.scrollHeight, 120)}px`;
}

function reconstruir() {
  registro.replaceChildren();
  saludo();
  for (const m of mensajes) registro.append(burbuja(m));
  ponerSugerencias(sugerenciasActuales());
  registro.scrollTop = registro.scrollHeight;
}

// ───────────────────────── Conversación ─────────────────────────
/** Solo viajan los pares completos y firmados (FR-0015-14), y como máximo 11 antes de la nueva. */
function historial(nueva: string) {
  const pares: Mensaje[][] = [];
  for (let i = 0; i < mensajes.length - 1; i++) {
    const a = mensajes[i]!;
    const b = mensajes[i + 1]!;
    if (a.rol === 'usuario' && b.rol === 'asistente' && b.firma && !b.incompleta) {
      pares.push([a, b]);
      i++;
    }
  }
  return [
    ...pares.slice(-(MAX_TURNOS - 1)).flat().map((m) => (m.rol === 'usuario' ? { rol: m.rol, texto: m.texto } : { rol: m.rol, texto: m.texto, firma: m.firma })),
    { rol: 'usuario', texto: nueva },
  ];
}

const ERRORES: Record<string, [string, boolean]> = {
  'limite-visitante': ['Llegaste al límite de preguntas de hoy.', true],
  'limite-dia': ['El asistente ya respondió todas las preguntas que tiene para hoy.', true],
  rapido: ['Vas muy rápido. Espera un minuto y vuelve a preguntar.', false],
  largo: [`Tu pregunta pasa de ${MAX_CARACTERES} caracteres. Hazla más corta.`, false],
  turnos: ['Esta conversación llegó a su límite. Empieza una nueva con el botón de arriba.', false],
  firma: ['La conversación se desincronizó. Empieza una nueva con el botón de arriba.', false],
  servicio: ['El asistente está descansando en este momento.', true],
};

async function preguntar(texto: string) {
  const pregunta = texto.trim().slice(0, MAX_CARACTERES);
  if (!pregunta || control) return;
  if (turnos() >= MAX_TURNOS) return aviso(ERRORES.turnos![0], false);

  const cuerpo = JSON.stringify({ mensajes: historial(pregunta) });
  const mio: Mensaje = { rol: 'usuario', texto: pregunta };
  mensajes.push(mio);
  guardar();
  registro.append(burbuja(mio));
  entrada.value = '';
  actualizarCuenta();
  sugerencias.replaceChildren();

  const suyo: Mensaje = { rol: 'asistente', texto: '' };
  const caja = document.createElement('div');
  caja.className = 'asis-msj asis-msj--asistente';
  caja.setAttribute('aria-busy', 'true');
  caja.innerHTML = '<span class="asis-pensando"><i></i><i></i><i></i><span class="visualmente-oculto">Pensando…</span></span>';
  registro.append(caja);
  bajar();
  ocupado(true);
  control = new AbortController();

  let marco = 0;
  const repintar = () => {
    marco = 0;
    pintar(caja, partir(suyo.texto).cuerpo);
    if (registro.scrollHeight - registro.scrollTop - registro.clientHeight < 120) registro.scrollTop = registro.scrollHeight;
  };
  let error: string | null = null;
  try {
    // text/plain: petición simple, sin la consulta previa de CORS.
    const r = await fetch(`${cfg.api}/asistente`, { method: 'POST', body: cuerpo, headers: { 'content-type': 'text/plain;charset=UTF-8' }, signal: control.signal });
    if (!r.ok || !r.body) {
      let codigo = r.status === 429 ? 'rapido' : 'servicio';
      try {
        codigo = ((await r.json()) as { error?: string }).error ?? codigo;
      } catch {
        /* sin cuerpo JSON (límite por minuto de Netlify) */
      }
      throw new Error(codigo);
    }
    const lector = r.body.pipeThrough(new TextDecoderStream()).getReader();
    let resto = '';
    for (;;) {
      const { value, done } = await lector.read();
      if (done) break;
      resto += value;
      let corte: number;
      while ((corte = resto.indexOf('\n\n')) >= 0) {
        const bloque = resto.slice(0, corte);
        resto = resto.slice(corte + 2);
        const nombre = /^event: (.+)$/m.exec(bloque)?.[1];
        const datos = /^data: (.+)$/m.exec(bloque)?.[1];
        if (!nombre || !datos) continue;
        const d = JSON.parse(datos) as { t?: string; firma?: string; codigo?: string };
        if (nombre === 't' && d.t) {
          if (!suyo.texto) caja.removeAttribute('aria-busy');
          suyo.texto += d.t;
          marco ||= requestAnimationFrame(repintar);
        } else if (nombre === 'reemplazo' && d.t) {
          suyo.texto = d.t;
        } else if (nombre === 'fin') {
          suyo.firma = d.firma;
        } else if (nombre === 'error') {
          throw new Error(d.codigo === 'saturado' ? 'rapido' : 'servicio');
        }
      }
    }
    if (!suyo.firma) throw new Error('servicio');
  } catch (e) {
    error = control.signal.aborted ? 'detenida' : (e as Error).message;
  } finally {
    cancelAnimationFrame(marco);
    control = null;
    ocupado(false);
  }

  caja.removeAttribute('aria-busy');
  if (error && !suyo.texto) {
    caja.remove();
    // La pregunta sin respuesta no viaja en el historial.
    mensajes.pop();
    guardar();
    registro.lastElementChild?.remove();
    if (error !== 'detenida') {
      const [msg, ligas] = ERRORES[error] ?? ERRORES.servicio!;
      aviso(msg, ligas);
    }
    entrada.value = pregunta;
    actualizarCuenta();
    ponerSugerencias(sugerenciasActuales());
    return;
  }
  if (error) {
    suyo.incompleta = true;
    caja.classList.add('asis-msj--cortado');
  }
  mensajes.push(suyo);
  guardar();
  pintar(caja, partir(suyo.texto).cuerpo);
  ponerSugerencias(sugerenciasActuales());
  bajar();
  // FR-0015-07: el lector de pantalla oye la respuesta completa al terminar.
  anunciar(`Respuesta del asistente: ${caja.textContent ?? ''}`);
  if (suyo.texto === FUERA_DE_TEMA) ponerSugerencias(cfg.sugerencias);
}

// ───────────────────────── Abrir, cerrar y teclado ─────────────────────────
function enfocables(): HTMLElement[] {
  return [...panel.querySelectorAll<HTMLElement>('button, a[href], textarea')].filter((e) => !e.hidden && e.offsetParent !== null);
}

export function abrir(origen?: HTMLElement) {
  regreso = origen ?? lanzador;
  if (panel.hidden) {
    // Un panel a la vez: el gabinete 3D cierra los suyos.
    window.dispatchEvent(new Event('paneles:cerrar'));
    panel.hidden = false;
    document.documentElement.dataset.asistenteAbierto = '';
    lanzador.setAttribute('aria-expanded', 'true');
    recordarAbierto(true);
  }
  entrada.focus({ preventScroll: true });
}

export function cerrar() {
  if (panel.hidden) return;
  control?.abort();
  panel.hidden = true;
  delete document.documentElement.dataset.asistenteAbierto;
  lanzador.setAttribute('aria-expanded', 'false');
  recordarAbierto(false);
  (regreso && regreso.isConnected && !regreso.hidden ? regreso : lanzador).focus({ preventScroll: true });
}

forma.addEventListener('submit', (e) => {
  e.preventDefault();
  preguntar(entrada.value);
});
entrada.addEventListener('input', actualizarCuenta);
entrada.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    preguntar(entrada.value);
  }
});
detener.addEventListener('click', () => control?.abort());
panel.querySelector('[data-asis-cerrar]')!.addEventListener('click', cerrar);
panel.querySelector('[data-asis-nueva]')!.addEventListener('click', () => {
  control?.abort();
  mensajes = [];
  guardar();
  reconstruir();
  entrada.focus();
});
panel.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    e.stopPropagation();
    cerrar();
    return;
  }
  // FR-0015-07: el foco no se escapa del panel mientras está abierto.
  if (e.key !== 'Tab') return;
  const lista = enfocables();
  const primero = lista[0];
  const ultimo = lista.at(-1);
  if (!primero || !ultimo) return;
  if (e.shiftKey && document.activeElement === primero) {
    e.preventDefault();
    ultimo.focus();
  } else if (!e.shiftKey && document.activeElement === ultimo) {
    e.preventDefault();
    primero.focus();
  }
});
window.addEventListener('asistente:cerrar', cerrar);

reconstruir();
actualizarCuenta();

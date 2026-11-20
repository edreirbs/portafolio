/** Une una ruta interna con la base del sitio (decisión D-3). */
export function url(ruta = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const limpia = ruta.replace(/^\//, '');
  if (!limpia) return `${base}/`;
  const conBarra = /[.#?]/.test(limpia.split('/').pop() ?? '') || limpia.endsWith('/') ? limpia : `${limpia}/`;
  return `${base}/${conBarra}`;
}

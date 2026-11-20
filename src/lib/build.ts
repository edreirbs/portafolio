import { execSync } from 'node:child_process';

/** Fecha del último commit (FR-0004-06); si no hay git, la de la compilación. */
export function fechaActualizacion(): Date {
  try {
    const iso = execSync('git log -1 --format=%cI', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    if (iso) return new Date(iso);
  } catch {
    /* sin git */
  }
  return new Date();
}

export function fechaLarga(d: Date): string {
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Monterrey' }).format(d);
}

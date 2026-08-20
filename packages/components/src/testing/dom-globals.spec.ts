import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

// Verifica la vía única de acceso al DOM (components-package § Compatibilidad
// con server-side rendering, ADR-024): el código publicable no referencia los
// globals `document`/`window` ni llama `getComputedStyle` sin receptor — todo
// pasa por el DOCUMENT inyectado y su `defaultView`. La regla vale también en
// rutas event-driven: dos vías conviviendo es como un acceso sin guarda
// termina moviéndose a una ruta que corre en server sin que nada lo detecte.
// Cuando la Parte N instale angular-eslint, esto puede migrar a
// `no-restricted-globals` y este spec retirarse.

const ROOTS = [
  ['src/lib', 'packages/components/src/lib'].find((p) => existsSync(p)),
  ['router/src', 'packages/components/router/src'].find((p) => existsSync(p)),
];

const PATRONES: ReadonlyArray<{ nombre: string; regex: RegExp }> = [
  { nombre: 'document global', regex: /(?<![\w$.])document\b/ },
  { nombre: 'window global', regex: /(?<![\w$.])window\b/ },
  { nombre: 'getComputedStyle sin receptor', regex: /(?<![\w$.])getComputedStyle\s*\(/ },
];

function archivosTs(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return archivosTs(path);
    if (!name.endsWith('.ts') || name.endsWith('.spec.ts') || name.endsWith('.stories.ts')) {
      return [];
    }
    return [path];
  });
}

// Reemplaza comentarios por espacio en blanco preservando los saltos de línea,
// para que un global mencionado en prosa no cuente y los números de línea del
// reporte sigan siendo reales.
function sinComentarios(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/\/\/[^\n]*/g, ' ');
}

describe('vía única de acceso al DOM (ADR-024)', () => {
  it('resuelve los directorios de código publicable', () => {
    expect(ROOTS.every(Boolean)).toBe(true);
  });

  it('el código publicable no toca los globals del navegador', () => {
    const hallazgos: string[] = [];

    for (const root of ROOTS) {
      for (const file of archivosTs(root as string)) {
        const lineas = sinComentarios(readFileSync(file, 'utf-8')).split('\n');
        lineas.forEach((linea, i) => {
          for (const { nombre, regex } of PATRONES) {
            if (regex.test(linea)) {
              hallazgos.push(`${file}:${i + 1} — ${nombre}: ${linea.trim()}`);
            }
          }
        });
      }
    }

    expect(
      hallazgos,
      `Accesos a globals del navegador fuera de la vía inyectada:\n${hallazgos.join('\n')}\n` +
        `Inyectá DOCUMENT (@angular/core) y derivá window de document.defaultView (ADR-024).`,
    ).toEqual([]);
  });
});

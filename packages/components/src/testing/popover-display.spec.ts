import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

// Verifica que ningún CSS de overlay declare `display` de autor en su estado
// base: `display: flex` a secas pisa la regla del UA que oculta un [popover]
// cerrado (el origen de autor gana), y el elemento queda generando caja
// invisible — con el position: fixed que le dejó el posicionador, desborda a
// su containing block durante animaciones de transform (diagnóstico de
// aaa-045 en el menú; el listbox del select tenía el mismo defecto latente).
// La convención: el display vive solo en `:popover-open`; el bloque base lo
// omite o declara `display: none`.
//
// Barre el filesystem por el mismo motivo que public-surface.spec.ts: una
// convención sostenida por imitación se rompe con el próximo overlay.
// Verificación source-based porque jsdom no computa CSS de archivo (mismo
// criterio que los tests de tokens y del menú).

const LIB_DIR = ['src/lib', 'packages/components/src/lib'].find((p) => existsSync(p));

/** CSS del archivo sin comentarios: se asertan declaraciones, no prosa. */
const stripComments = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * Sujetos que el archivo estiliza en estado abierto: el compound que precede
 * a `:popover-open` (`.ds-menu__panel:popover-open` → `.ds-menu__panel`;
 * `:host(:popover-open)` → `:host`). Son los elementos popover del archivo.
 */
const popoverSubjects = (css: string): string[] => {
  const subjects = new Set<string>();
  for (const match of css.matchAll(/([^\s,{}]+):popover-open/g)) {
    subjects.add(match[1].replace(/\($/, ''));
  }
  return [...subjects];
};

/**
 * Declaraciones `display:` distintas de `none` sobre un sujeto popover en
 * bloques sin `:popover-open`. Heurística de bloques hoja (regex plano, sin
 * parser): un bloque con nesting (p.ej. `:popover-open { … @starting-style
 * { … } }`) no aporta las declaraciones de su nivel externo — suficiente
 * para el estado base de los overlays, que es plano. Mismo trade-off
 * aceptado en menu.spec.ts.
 */
const offendingDisplays = (css: string, subjects: string[]): string[] => {
  const offenders: string[] = [];
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = match[1].trim();
    if (selector.includes(':popover-open')) {
      continue;
    }
    const targetsPopover = selector
      .split(',')
      .some((sel) => subjects.some((subject) => sel.trim().startsWith(subject)));
    if (!targetsPopover) {
      continue;
    }
    for (const decl of match[2].matchAll(/display\s*:\s*([^;]+);?/g)) {
      const value = decl[1].trim();
      if (value !== 'none') {
        offenders.push(`${selector} → display: ${value}`);
      }
    }
  }
  return offenders;
};

describe('display de overlays sobre Popover API', () => {
  it('resuelve el directorio de componentes', () => {
    expect(LIB_DIR).toBeDefined();
  });

  it('todo CSS con :popover-open declara su display solo en el estado abierto', () => {
    const cssFiles = readdirSync(LIB_DIR as string, { recursive: true, encoding: 'utf-8' })
      .filter((f) => f.endsWith('.css'))
      .map((f) => join(LIB_DIR as string, f));

    const popoverCss = cssFiles.filter((f) => readFileSync(f, 'utf-8').includes(':popover-open'));
    expect(popoverCss.length).toBeGreaterThanOrEqual(4); // select, menu, tooltip, toast

    const conDisplayEnBase = popoverCss
      .map((file) => {
        const css = stripComments(readFileSync(file, 'utf-8'));
        return { file, offenders: offendingDisplays(css, popoverSubjects(css)) };
      })
      .filter(({ offenders }) => offenders.length > 0);

    expect(
      conDisplayEnBase,
      `Estos CSS de overlay declaran display de autor en el estado base y pisan ` +
        `el display:none del UA para popover cerrado: ` +
        conDisplayEnBase
          .map(({ file, offenders }) => `${file} (${offenders.join('; ')})`)
          .join(', ') +
        `. Declarar el display dentro de :popover-open (o display: none en el base).`,
    ).toEqual([]);
  });
});

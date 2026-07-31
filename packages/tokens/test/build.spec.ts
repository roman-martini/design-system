import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { parseCustomProperties, type ScopeVars } from '../scripts/contrast.mjs';

/**
 * Gate del artefacto emitido — [testing-09] (aaa-041).
 *
 * `dist/tokens.css` es literalmente lo que consume quien instala el package, y hasta
 * ahora ningún test lo tocaba: la suite validaba 3 JSON de `src/semantic/` y nada más.
 *
 * El spec asume `dist/` ya construido y no lo genera: buildear acá metería un efecto de
 * escritura en cada corrida y haría que el test valide un artefacto propio en vez del que
 * produce el pipeline. `pr.yml` corre `pnpm -r build` antes de `pnpm test:coverage`, así
 * que en CI el orden está garantizado sin cambiar nada.
 */

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(PACKAGE_ROOT, 'dist');
const THEMES = join(DIST, 'themes');

if (!existsSync(join(DIST, 'tokens.css'))) {
  throw new Error(
    'Falta el build de tokens: correr `pnpm -F @romanmartinidev/tokens build` antes de los tests.\n' +
      'En CI el orden ya está garantizado (pr.yml buildea antes de testear).',
  );
}

const baseVars = parseCustomProperties(readFileSync(join(DIST, 'tokens.css'), 'utf8'));

const themeFiles = existsSync(THEMES) ? readdirSync(THEMES).filter((f) => f.endsWith('.css')) : [];

const themes: Array<{ name: string; vars: ScopeVars }> = themeFiles.map((file) => ({
  name: file,
  vars: parseCustomProperties(readFileSync(join(THEMES, file), 'utf8')),
}));

/** Referencia de Style Dictionary que quedó literal en el output, ej. `{color.blue.600}`. */
const UNRESOLVED_REFERENCE = /\{[^}]+\}/;

/** Nombres de custom property usados dentro de un valor, vía `var(--x)`. */
function varsUsedIn(value: string): string[] {
  return [...value.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]);
}

describe('artefacto emitido: dist/tokens.css', () => {
  it('emite custom properties', () => {
    expect(baseVars.size).toBeGreaterThan(0);
  });

  it('toda custom property lleva el prefijo --ds-', () => {
    // El prefijo es contrato API público: cambiarlo es BREAKING y requiere un ADR que
    // reemplace al ADR-003.
    const offenders = [...baseVars.keys()].filter((k) => !k.startsWith('--ds-'));
    expect(offenders, `sin prefijo --ds-: ${offenders.join(', ')}`).toEqual([]);
  });

  it('ningún valor conserva una referencia de Style Dictionary sin resolver', () => {
    const offenders = [...baseVars.entries()]
      .filter(([, value]) => UNRESOLVED_REFERENCE.test(value))
      .map(([key, value]) => `${key}: ${value}`);

    expect(offenders, `referencias sin resolver:\n  ${offenders.join('\n  ')}`).toEqual([]);
  });

  it('todo var() apunta a una custom property declarada', () => {
    const dangling = [...baseVars.entries()].flatMap(([key, value]) =>
      varsUsedIn(value)
        .filter((used) => !baseVars.has(used))
        .map((used) => `${key} → ${used}`),
    );

    expect(dangling, `var() a propiedades inexistentes:\n  ${dangling.join('\n  ')}`).toEqual([]);
  });
});

describe('artefactos declarados en exports', () => {
  const pkg = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8')) as {
    exports: Record<string, string | Record<string, string>>;
  };

  const declaredPaths = Object.values(pkg.exports).flatMap((entry) =>
    typeof entry === 'string' ? [entry] : Object.values(entry),
  );

  it.each(declaredPaths)('%s existe', (relativePath) => {
    expect(existsSync(resolve(PACKAGE_ROOT, relativePath))).toBe(true);
  });
});

describe('themes emitidos', () => {
  it('hay al menos un theme', () => {
    expect(themes.length).toBeGreaterThan(0);
  });

  /**
   * Los themes se verifican por **contención**, no por igualdad de sets.
   *
   * No es un atajo: `sd.config.mjs` construye cada theme con
   * `filter: (token) => token.filePath.startsWith('src/theme/')`, de modo que cada
   * archivo emite SOLO sus propios overrides — unas pocas propiedades contra las
   * cientos del default. Exigir "el mismo set que el default", como sugería la
   * recomendación original de [testing-09], sería un gate imposible de satisfacer y
   * habría que apagarlo. No lo cambies a igualdad.
   *
   * Lo que la contención más la ausencia de `var()` colgantes sí detecta es el problema
   * real que el hallazgo describe: una variable que un theme referencia y que nadie
   * declara, que en el browser degrada a un fallback silencioso.
   */
  it.each(themeFiles)('%s no declara ninguna propiedad ausente del default', (file) => {
    const theme = themes.find((t) => t.name === file)!;
    const introduced = [...theme.vars.keys()].filter((k) => !baseVars.has(k));

    expect(
      introduced,
      `${file} introduce custom properties que el scope default no declara ` +
        `(un theme redefine, no crea):\n  ${introduced.join('\n  ')}`,
    ).toEqual([]);
  });

  it.each(themeFiles)('%s lleva el prefijo --ds- en todas sus propiedades', (file) => {
    const theme = themes.find((t) => t.name === file)!;
    const offenders = [...theme.vars.keys()].filter((k) => !k.startsWith('--ds-'));
    expect(offenders, `sin prefijo --ds- en ${file}: ${offenders.join(', ')}`).toEqual([]);
  });

  it.each(themeFiles)('%s no conserva referencias sin resolver', (file) => {
    const theme = themes.find((t) => t.name === file)!;
    const offenders = [...theme.vars.entries()]
      .filter(([, value]) => UNRESOLVED_REFERENCE.test(value))
      .map(([key, value]) => `${key}: ${value}`);

    expect(offenders, `referencias sin resolver en ${file}:\n  ${offenders.join('\n  ')}`).toEqual(
      [],
    );
  });

  /**
   * Un theme emite `var(--ds-color-…)` hacia primitives que su propio archivo NO declara
   * (el filtro los excluye del output) pero que sí viven en `:root` del default. Esa es la
   * causa del warning benigno de Style Dictionary al buildear los brands; acá se verifica
   * que la referencia realmente resuelve, en vez de confiar en la ausencia de warnings.
   */
  it.each(themeFiles)('%s: todo var() resuelve contra el default o contra sí mismo', (file) => {
    const theme = themes.find((t) => t.name === file)!;
    const dangling = [...theme.vars.entries()].flatMap(([key, value]) =>
      varsUsedIn(value)
        .filter((used) => !baseVars.has(used) && !theme.vars.has(used))
        .map((used) => `${key} → ${used}`),
    );

    expect(dangling, `var() sin destino en ${file}:\n  ${dangling.join('\n  ')}`).toEqual([]);
  });
});

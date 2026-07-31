import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  contrastRatio,
  evaluatePair,
  loadScopes,
  parseColor,
  resolveVar,
  type ContrastPair,
  type ScopeVars,
} from '../scripts/contrast.mjs';

/**
 * Gate de contraste WCAG AA sobre el build de tokens — HU-027 (aaa-041).
 *
 * Reemplaza al script on-demand que vivía en la skill `check-a11y`: los pares que las
 * specs declaran normativos se verifican por cálculo en cada PR, dentro de la suite que
 * el pipeline ya corre. El cálculo NO vive acá: es `scripts/contrast.mjs`, la única
 * implementación del repo (CA-027.5). Este spec solo declara qué se verifica.
 *
 * Los pares son datos: `test/contrast-pairs.json`. Sumar un componente al kit es sumar
 * filas ahí, sin tocar lógica (CA-027.3).
 */

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TOKENS_DIR = join(PACKAGE_ROOT, 'dist');

const pairs: ContrastPair[] = JSON.parse(
  readFileSync(join(PACKAGE_ROOT, 'test', 'contrast-pairs.json'), 'utf8'),
);

if (!existsSync(join(TOKENS_DIR, 'tokens.css'))) {
  throw new Error(
    'Falta el build de tokens: correr `pnpm -F @romanmartinidev/tokens build` antes de los tests.\n' +
      'En CI el orden ya está garantizado (pr.yml buildea antes de testear).',
  );
}

const scopes = loadScopes(TOKENS_DIR);
const scopeNames = Object.keys(scopes);

/** Cada par × cada scope, aplanado para que un fallo apunte a una fila y no a un grupo. */
const cases: Array<{ pair: ContrastPair; scope: string; vars: ScopeVars }> = pairs.flatMap((pair) =>
  scopeNames.map((scope) => ({ pair, scope, vars: scopes[scope] })),
);

describe('contraste WCAG AA de los pares declarados por las specs', () => {
  it('el build expone el scope default y uno por theme', () => {
    expect(scopeNames).toContain('default');
    expect(scopeNames.length).toBeGreaterThan(1);
  });

  it('hay pares declarados', () => {
    expect(pairs.length).toBeGreaterThan(0);
  });

  it.each(cases)('$pair.id @ $scope cumple su umbral', ({ pair, scope, vars }) => {
    const outcome = evaluatePair(pair, vars);

    // Un par que no resuelve a color plano es un fallo, no un caso a saltear: un par
    // omitido en silencio parece cobertura y no lo es (CA-027.4).
    expect(
      outcome.error,
      `${pair.id} @ ${scope}: ${outcome.error ?? ''} — revisar que ambos tokens existan y resuelvan a color`,
    ).toBeUndefined();

    expect(
      outcome.ratio,
      `${pair.id} @ ${scope}: ratio ${outcome.ratio} contra ${outcome.required} requerido ` +
        `(nivel ${pair.level}; fg ${pair.fg} = ${outcome.fgResolved}, bg ${pair.bg} = ${outcome.bgResolved}) ` +
        `— declarado por la spec ${pair.specRef}`,
    ).toBeGreaterThanOrEqual(outcome.required as number);
  });
});

/**
 * Trazabilidad de CA-027.6.
 *
 * La verificación enumera las specs de componente del repo en vez de buscar en su prosa
 * la frase "gate por script": un patrón sobre lenguaje natural da falsos positivos con las
 * negaciones ("el gate NO SHALL requerir pares nuevos", en skeleton y spinner) y falsos
 * negativos con las redacciones alternativas ("calculados por script", en tabs). Enumerar
 * directorios es determinista y detecta el caso que importa: un componente nuevo entra al
 * kit y nadie decidió si necesita pares.
 */
const SPECS_DIR = resolve(PACKAGE_ROOT, '..', '..', 'openspec', 'specs');

/** Specs de componente deliberadamente sin par, cada una con su motivo. */
const EXEMPT_SPECS: Record<string, string> = {
  // "el gate de contraste NO SHALL requerir pares nuevos (elemento decorativo no
  // textual, fondo bg.disabled theme-aware)" — component-skeleton.
  'component-skeleton': 'decorativo, sin texto ni indicador propio',
  // "el gate de contraste por script NO SHALL requerir pares nuevos (el contraste lo
  // gobierna el contexto contenedor)" — component-spinner. Hereda currentColor.
  'component-spinner': 'hereda currentColor del contenedor',
  // Sus únicos tokens de color son overlay-bg (no es un par de contraste), bg (superficie)
  // y border (borde de contenedor: 1.4.11 no aplica, ver design D3 de aaa-041). El texto
  // del modal usa tokens semantic ya cubiertos por los pares de design-tokens-package.
  'component-modal': 'superficie y overlay; su texto usa tokens semantic ya cubiertos',
  // No declara ningún token component.textarea.* de color: reutiliza los de input, que
  // están cubiertos.
  'component-textarea': 'reutiliza los tokens de color de input',
};

describe('trazabilidad de los pares con las specs (CA-027.6)', () => {
  const referenced = new Set(pairs.map((p) => p.specRef));

  it('todo par referencia una spec existente', () => {
    if (!existsSync(SPECS_DIR)) return; // package consumido fuera del monorepo
    for (const specRef of referenced) {
      expect(existsSync(join(SPECS_DIR, specRef, 'spec.md')), `spec inexistente: ${specRef}`).toBe(
        true,
      );
    }
  });

  it('toda spec de componente está cubierta por pares o declarada exenta', () => {
    if (!existsSync(SPECS_DIR)) return;

    const componentSpecs = readdirSync(SPECS_DIR).filter((d) => d.startsWith('component-'));
    const uncovered = componentSpecs.filter((s) => !referenced.has(s) && !(s in EXEMPT_SPECS));

    expect(
      uncovered,
      `estas specs de componente no tienen ningún par de contraste ni están declaradas exentas ` +
        `en EXEMPT_SPECS: ${uncovered.join(', ')}. Sumar sus pares a contrast-pairs.json, o ` +
        `declararlas exentas con el motivo.`,
    ).toEqual([]);
  });

  it('ninguna spec está a la vez cubierta y exenta', () => {
    const both = Object.keys(EXEMPT_SPECS).filter((s) => referenced.has(s));
    expect(both, `contradicción: exenta y con pares a la vez — ${both.join(', ')}`).toEqual([]);
  });

  it('el requirement de contraste de design-tokens-package está cubierto', () => {
    expect(referenced.has('design-tokens-package')).toBe(true);
  });
});

/**
 * Requirement "Jerarquía semantic.border respetada" (`subtle < default < strong`).
 *
 * Estaba sin test y se verifica con la misma lógica de contraste, así que entra acá en vez
 * de duplicar la maquinaria en otro spec.
 */
describe('jerarquía de contraste de semantic.color.border', () => {
  const SURFACE = '--ds-semantic-color-bg-surface';
  const rung = (name: string, vars: ScopeVars) => {
    const fg = parseColor(resolveVar(`--ds-semantic-color-border-${name}`, vars));
    const bg = parseColor(resolveVar(SURFACE, vars));
    expect(fg, `border-${name} no resuelve a color plano`).not.toBeNull();
    expect(bg, `${SURFACE} no resuelve a color plano`).not.toBeNull();
    return contrastRatio(fg!, bg!);
  };

  it.each(scopeNames)('subtle < default < strong en %s', (scope) => {
    const vars = scopes[scope];
    const subtle = rung('subtle', vars);
    const base = rung('default', vars);
    const strong = rung('strong', vars);

    expect(
      subtle,
      `@${scope}: subtle ${subtle} debería contrastar menos que default ${base}`,
    ).toBeLessThan(base);
    expect(
      base,
      `@${scope}: default ${base} debería contrastar menos que strong ${strong}`,
    ).toBeLessThan(strong);
  });
});

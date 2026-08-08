import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Gate estructural de la jerarquía de tokens — [tokens-03] (aaa-041).
 *
 * El requirement "Jerarquía interna primitives → semantic → component → theme" exigía
 * para cada regla que "el build SHALL fallar o el revisor SHALL rechazarlo", y hasta
 * ahora solo existía el revisor: `sd.config.mjs` no tiene preprocessor ni validación.
 * Con 827 tokens en 4 niveles y 600 referencias entre ellos, la invariante central del
 * package dependía de que cada review se acordara de comprobarla a mano.
 *
 * El recorrido de los JSON es propio y no reutiliza el de Style Dictionary a propósito:
 * el gate tiene que ser independiente de la herramienta que valida. Si SD cambiara su
 * semántica de resolución, el test lo expone en vez de heredarlo.
 *
 * NO reporta tokens huérfanos. Hay 219 sobre 754, y separar deuda real (un token que
 * quedó sin consumidor tras un refactor) de inventario deliberado (una escala de color
 * completa, los 13 niveles de z-index) es criterio humano, no una aserción binaria: es
 * el item `tokens-audit-formal` del backlog, con su propia sesión. Un gate que fallara
 * por huérfanos habría entrado rojo el día uno.
 */

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src');

const LEVELS = ['primitives', 'semantic', 'component', 'theme'] as const;
type Level = (typeof LEVELS)[number];

interface Token {
  level: Level;
  /** Ruta relativa legible para los mensajes de fallo, ej. `semantic/color.json`. */
  file: string;
  /** Path del token tal como se referencia, ej. `semantic.color.bg.primary`. */
  path: string;
  value: string;
}

/** Recorre un JSON de tokens y emite una entrada por hoja `{ value: … }`. */
function collect(node: unknown, trail: string[], level: Level, file: string, out: Token[]): void {
  if (node === null || typeof node !== 'object') return;

  const record = node as Record<string, unknown>;
  if ('value' in record && typeof record.value !== 'object') {
    out.push({ level, file, path: trail.join('.'), value: String(record.value) });
    return;
  }

  for (const [key, child] of Object.entries(record)) {
    collect(child, [...trail, key], level, file, out);
  }
}

const tokens: Token[] = [];
for (const level of LEVELS) {
  for (const file of readdirSync(join(SRC, level)).filter((f) => f.endsWith('.json'))) {
    const parsed: unknown = JSON.parse(readFileSync(join(SRC, level, file), 'utf8'));
    collect(parsed, [], level, `${level}/${file}`, tokens);
  }
}

const byLevel = (level: Level) => tokens.filter((t) => t.level === level);

/**
 * Índice path → tokens que lo declaran. Un path puede estar declarado dos veces: en
 * `semantic/` y de nuevo en un `theme/` que lo redefine — que es justamente lo válido.
 */
const index = new Map<string, Token[]>();
for (const token of tokens) {
  const existing = index.get(token.path);
  if (existing) existing.push(token);
  else index.set(token.path, [token]);
}

const REFERENCE = /\{([^}]+)\}/g;

/**
 * Nivel al que pertenece una referencia. Cuando un path está declarado en `semantic` y
 * redefinido en `theme`, el nivel que cuenta es `semantic`: el theme no es el dueño del
 * token, solo lo sobreescribe.
 */
function levelOf(ref: string): Level | 'MISSING' {
  const owners = index.get(ref);
  if (!owners) return 'MISSING';
  const owner = owners.find((o) => o.level !== 'theme') ?? owners[0];
  return owner.level;
}

/**
 * Niveles que cada nivel puede referenciar, según el requirement.
 *
 * - `primitives` solo a sí mismo (`shadow.focus` → `{color.blue.500}` es el caso real).
 * - `semantic` a primitives, más aliases intra-nivel no circulares.
 * - `component` a semantic o primitives — nunca a theme, que es lo que rompería el
 *   modelo de theming.
 * - `theme` a primitives o semantic: sus *claves* deben existir en semantic (lo verifica
 *   el test de contención), pero sus *valores* apuntan a primitives con normalidad.
 */
const ALLOWED: Record<Level, ReadonlySet<Level>> = {
  primitives: new Set<Level>(['primitives']),
  semantic: new Set<Level>(['primitives', 'semantic']),
  component: new Set<Level>(['primitives', 'semantic']),
  theme: new Set<Level>(['primitives', 'semantic']),
};

interface Edge {
  from: Token;
  ref: string;
  to: Level | 'MISSING';
}

const edges: Edge[] = tokens.flatMap((token) =>
  [...token.value.matchAll(REFERENCE)].map((match) => ({
    from: token,
    ref: match[1],
    to: levelOf(match[1]),
  })),
);

describe('inventario de tokens fuente', () => {
  it('los cuatro niveles tienen tokens', () => {
    for (const level of LEVELS) {
      expect(byLevel(level).length, `el nivel ${level} no tiene tokens`).toBeGreaterThan(0);
    }
  });

  it('hay referencias entre niveles que validar', () => {
    expect(edges.length).toBeGreaterThan(0);
  });
});

describe('reglas de referencia entre niveles', () => {
  it('toda referencia apunta a un token declarado', () => {
    const missing = edges
      .filter((e) => e.to === 'MISSING')
      .map((e) => `${e.from.file}: ${e.from.path} → {${e.ref}}`);

    expect(missing, `referencias a tokens inexistentes:\n  ${missing.join('\n  ')}`).toEqual([]);
  });

  it.each(LEVELS)('%s solo referencia niveles permitidos', (level) => {
    const violations = edges
      .filter((e) => e.from.level === level && e.to !== 'MISSING' && !ALLOWED[level].has(e.to))
      .map((e) => `${e.from.file}: ${e.from.path} → {${e.ref}} (nivel destino: ${e.to})`);

    expect(
      violations,
      `${level} solo puede referenciar ${[...ALLOWED[level]].join(' | ')}:\n  ${violations.join('\n  ')}`,
    ).toEqual([]);
  });

  it('ningún token de component referencia theme', () => {
    // Explícito además de la regla general: es la violación que rompe el modelo de
    // theming (un componente que depende de un theme deja de ser theme-agnóstico).
    const offenders = edges
      .filter((e) => e.from.level === 'component' && e.to === 'theme')
      .map((e) => `${e.from.file}: ${e.from.path} → {${e.ref}}`);

    expect(offenders).toEqual([]);
  });
});

describe('theme solo redefine claves existentes en semantic', () => {
  it('ninguna clave de theme está ausente de semantic', () => {
    const semanticPaths = new Set(byLevel('semantic').map((t) => t.path));
    const introduced = byLevel('theme')
      .filter((t) => !semanticPaths.has(t.path))
      .map((t) => `${t.file}: ${t.path}`);

    expect(
      introduced,
      `estos tokens de theme no existen en semantic — un theme redefine, no crea:\n  ${introduced.join('\n  ')}`,
    ).toEqual([]);
  });
});

describe('ausencia de ciclos', () => {
  it('ninguna cadena de referencias se cierra sobre sí misma', () => {
    // Los tokens de theme quedan fuera del grafo: comparten path con el semantic que
    // redefinen, así que incluirlos crearía aristas ambiguas sobre el mismo nodo.
    const graph = new Map<string, string[]>();
    for (const token of tokens) {
      if (token.level === 'theme') continue;
      graph.set(
        token.path,
        [...token.value.matchAll(REFERENCE)].map((m) => m[1]),
      );
    }

    const cycles: string[] = [];
    const state = new Map<string, 'open' | 'done'>();

    const visit = (node: string, stack: string[]): void => {
      if (state.get(node) === 'done') return;
      if (state.get(node) === 'open') {
        cycles.push([...stack.slice(stack.indexOf(node)), node].join(' → '));
        return;
      }
      state.set(node, 'open');
      for (const next of graph.get(node) ?? []) {
        if (graph.has(next)) visit(next, [...stack, next]);
      }
      state.set(node, 'done');
    };

    for (const node of graph.keys()) visit(node, [node]);

    expect(cycles, `ciclos de referencias:\n  ${cycles.join('\n  ')}`).toEqual([]);
  });
});

describe('component no duplica valores que ya existen en semantic', () => {
  it('modal.overlay-bg referencia el token semantic en vez de duplicar el valor', () => {
    // Scenario explícito del requirement, verificado como caso testigo de la regla
    // "cuando un valor ya existe como semantic, el component SHALL referenciarlo".
    const overlay = index.get('component.modal.overlay-bg')?.[0];
    expect(overlay, 'component.modal.overlay-bg no existe').toBeDefined();
    expect(overlay!.value).toBe('{semantic.color.bg.overlay}');
  });
});

describe('component consume la capa semantic para tipografía (aaa-052)', () => {
  /**
   * Trinquete sobre las referencias component → primitivas `font.*`.
   *
   * El estado final es el de los design systems maduros: la tipografía de component
   * gobernada por roles semantic (`semantic.font.size.body-*`, `label-*`, …), no por
   * primitivas sueltas. El mecanismo es un baseline congelado — el patrón estándar
   * para imponer una invariante nueva sobre legado existente sin bloquear el gate:
   *
   * - Una referencia NUEVA de component a `{font.*}` falla el test.
   * - El legado listado abajo solo puede ACHICARSE: cada entrada saldada (remapeada a
   *   su rol semantic, o retirada) debe borrarse de la lista o el test falla.
   *
   * El burn-down del legado es trabajo con juicio por componente (mapear por rol, no
   * por valor — y el avatar demuestra que no todo `font.*` tiene rol: sus iniciales
   * son escala dimensional). Queda como ítem de backlog registrado al archivar aaa-052.
   */
  const LEGACY_FONT_REFS = new Set([
    'component.accordion.header.font-weight',
    'component.avatar.font-size.lg', // candidato a excepción documentada: escala dimensional, no rol
    'component.avatar.font-size.md',
    'component.avatar.font-size.sm',
    'component.avatar.font-size.xl',
    'component.avatar.font-size.xs',
    'component.avatar.font-weight',
    'component.breadcrumbs.current.font-weight',
    'component.checkbox.label-font-size',
    'component.menu.item.font-size',
    'component.pagination.current.font-weight',
    'component.radio.label-font-size',
    'component.select.option.font-size',
    'component.select.trigger.font-size.lg',
    'component.select.trigger.font-size.md',
    'component.select.trigger.font-size.sm',
    'component.slider.label-font-size',
    'component.slider.tick.label-font-size',
    'component.slider.tooltip.font-size',
    'component.switch.label-font-size',
    'component.tabs.font-weight',
    'component.tabs.line-height',
    'component.tabs.size.lg.font-size',
    'component.tabs.size.md.font-size',
    'component.tabs.size.sm.font-size',
  ]);

  const fontEdges = edges.filter((e) => e.from.level === 'component' && e.ref.startsWith('font.'));

  it('ninguna referencia nueva de component a primitivas font.* fuera del legado', () => {
    const offenders = fontEdges
      .filter((e) => !LEGACY_FONT_REFS.has(e.from.path))
      .map((e) => `${e.from.file}: ${e.from.path} → {${e.ref}}`);

    expect(
      offenders,
      `tipografía nueva de component debe referenciar su rol semantic (semantic.font.*), no la primitiva:\n  ${offenders.join('\n  ')}`,
    ).toEqual([]);
  });

  it('el legado solo se achica: toda entrada saldada se borra de la lista', () => {
    const active = new Set(fontEdges.map((e) => e.from.path));
    const stale = [...LEGACY_FONT_REFS].filter((path) => !active.has(path));

    expect(
      stale,
      `estas entradas del baseline ya no referencian font.* — borrarlas de LEGACY_FONT_REFS:\n  ${stale.join('\n  ')}`,
    ).toEqual([]);
  });

  it.each([
    ['component.tooltip.font-size', '{semantic.font.size.body-xs}'],
    ['component.input.font-size.sm', '{semantic.font.size.body-sm}'],
    ['component.input.font-size.md', '{semantic.font.size.body-md}'],
    ['component.input.font-size.lg', '{semantic.font.size.body-lg}'],
    ['component.input.helper.font-size', '{semantic.font.size.label-sm}'],
  ])('testigo del remapeo: %s → %s', (tokenPath, expected) => {
    const token = index.get(tokenPath)?.[0];
    expect(token, `${tokenPath} no existe`).toBeDefined();
    expect(token!.value).toBe(expected);
  });
});

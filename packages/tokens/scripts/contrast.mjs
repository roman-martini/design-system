/**
 * contrast.mjs — Cálculo determinístico de contraste WCAG sobre el build de tokens.
 *
 * Única implementación del cálculo de ratio en el repo (aaa-041, CA-027.5 de HU-027).
 * Dos consumidores: el gate de CI (`test/contrast.spec.ts`) y la skill `check-a11y`
 * vía `contrast-cli.mjs`. No agregar una segunda: dos implementaciones divergen y
 * terminan dando veredictos distintos sobre el mismo par.
 *
 * Está en JavaScript y no en TypeScript a propósito: `.nvmrc` fija Node 22, donde el
 * type-stripping vive detrás de un flag experimental, y la skill tiene que poder
 * invocar esto con `node` directo, sin build step. Las firmas viven en `contrast.d.ts`,
 * así que el spec en TypeScript las consume con tipos completos.
 *
 * Importar este módulo no tiene efectos: todo el I/O pasa por `loadScopes`.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

/** Umbrales WCAG 2.2 por nivel de par. */
export const THRESHOLDS = { text: 4.5, 'large-text': 3, ui: 3 };

/** Backdrop asumido al compositar un color con alpha sin contexto conocido. */
const WHITE = { r: 255, g: 255, b: 255, a: 1 };

// ─── Parseo de CSS ────────────────────────────────────────────────────────────

/**
 * Extrae las declaraciones `--x: valor;` de un CSS en un Map.
 *
 * Ignora el selector a propósito: un archivo de theme declara todo bajo un único
 * selector de atributo, y el scope se arma en `loadScopes` combinando archivos.
 */
export function parseCustomProperties(css) {
  const map = new Map();
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(css)) !== null) map.set(m[1], m[2].trim());
  return map;
}

/**
 * Carga el scope default y uno por cada archivo de `themes/`.
 *
 * Cada scope de theme es el default con sus overrides aplicados encima, que es
 * cómo lo resuelve la cascada CSS en el browser.
 */
export function loadScopes(tokensDir) {
  const baseCssPath = join(tokensDir, 'tokens.css');
  if (!existsSync(baseCssPath)) {
    throw new Error(
      `No existe ${baseCssPath}. Buildear tokens primero: pnpm -F @romanmartinidev/tokens build`,
    );
  }

  const baseVars = parseCustomProperties(readFileSync(baseCssPath, 'utf8'));
  const scopes = { default: baseVars };

  const themesDir = join(tokensDir, 'themes');
  if (existsSync(themesDir)) {
    for (const file of readdirSync(themesDir).filter((f) => f.endsWith('.css'))) {
      const overrides = parseCustomProperties(readFileSync(join(themesDir, file), 'utf8'));
      scopes[basename(file, '.css')] = new Map([...baseVars, ...overrides]);
    }
  }

  return scopes;
}

/**
 * Sigue cadenas `var(--a)` → `var(--b)` → valor terminal.
 *
 * Devuelve `null` ante un ciclo o una propiedad no declarada — el llamador debe
 * tratar ese `null` como error, no como "sin contraste".
 */
export function resolveVar(name, vars, seen = new Set()) {
  if (seen.has(name)) return null; // ciclo
  seen.add(name);

  const raw = vars.get(name);
  if (raw == null) return null;

  const varRef = raw.match(/^var\((--[\w-]+)\s*(?:,\s*[^)]+)?\)$/);
  if (varRef) return resolveVar(varRef[1], vars, seen);

  return raw;
}

// ─── Parseo de color ──────────────────────────────────────────────────────────

/**
 * Devuelve `{ r, g, b, a }` con canales 0-255 y alpha 0-1, o `null` si el valor no
 * es un color plano (una sombra, un gradiente, una dimensión).
 */
export function parseColor(value) {
  if (value == null) return null;
  const v = value.trim().toLowerCase();

  const hex = v.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    const h = hex[1];
    if (h.length === 3 || h.length === 4) {
      const [r, g, b, a] = h.split('').map((c) => parseInt(c + c, 16));
      return { r, g, b, a: h.length === 4 ? a / 255 : 1 };
    }
    if (h.length === 6 || h.length === 8) {
      return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
        a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
      };
    }
    return null;
  }

  const rgb = v.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/,
  );
  if (rgb) {
    return { r: +rgb[1], g: +rgb[2], b: +rgb[3], a: rgb[4] !== undefined ? +rgb[4] : 1 };
  }

  const named = { white: { r: 255, g: 255, b: 255, a: 1 }, black: { r: 0, g: 0, b: 0, a: 1 } };
  return named[v] ?? null;
}

/** Compone `top` (con alpha) sobre `bottom` (opaco). */
export function composite(top, bottom) {
  const a = top.a;
  return {
    r: top.r * a + bottom.r * (1 - a),
    g: top.g * a + bottom.g * (1 - a),
    b: top.b * a + bottom.b * (1 - a),
    a: 1,
  };
}

// ─── WCAG ─────────────────────────────────────────────────────────────────────

/** Luminancia relativa según WCAG 2.x (sRGB linealizado). */
export function relativeLuminance({ r, g, b }) {
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Ratio de contraste WCAG 2.x entre dos colores opacos. Rango 1 – 21. */
export function contrastRatio(fg, bg) {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

// ─── Evaluación ───────────────────────────────────────────────────────────────

/**
 * Resuelve y calcula el ratio de un par en un scope.
 *
 * Un par que no resuelve a color plano devuelve `{ error }` en vez de un ratio: el
 * gate lo trata como fallo, nunca como aprobado (un par silenciosamente omitido es
 * peor que un par que falla, porque parece cobertura).
 */
export function evaluatePair(pair, vars) {
  const level = pair.level ?? 'text';
  const required = THRESHOLDS[level];
  if (required === undefined) {
    return { error: `level desconocido: ${level} (usar text | large-text | ui)` };
  }

  const fgResolved = resolveVar(pair.fg, vars);
  const bgResolved = resolveVar(pair.bg, vars);
  const fgColor = parseColor(fgResolved);
  const bgColor = parseColor(bgResolved);

  if (!fgColor || !bgColor) {
    return {
      fgResolved,
      bgResolved,
      required,
      error:
        `no resoluble a color plano ` +
        `(fg=${fgResolved ?? 'undefined'}, bg=${bgResolved ?? 'undefined'})`,
    };
  }

  const notes = [];
  let bgFinal = bgColor;
  if (bgColor.a < 1) {
    bgFinal = composite(bgColor, WHITE);
    notes.push('bg con alpha: compositado sobre #ffffff (backdrop asumido)');
  }
  const fgFinal = fgColor.a < 1 ? composite(fgColor, bgFinal) : fgColor;
  if (fgColor.a < 1) notes.push('fg con alpha: compositado sobre el bg resuelto');

  const ratio = Math.round(contrastRatio(fgFinal, bgFinal) * 100) / 100;

  return {
    fgResolved,
    bgResolved,
    ratio,
    required,
    pass: ratio >= required,
    ...(notes.length ? { notes } : {}),
  };
}

/** Evalúa todos los pares en todos los scopes. */
export function evaluatePairs(pairs, scopes) {
  let anyFail = false;
  let anyUnresolved = false;

  const results = pairs.map((pair) => {
    const byScope = {};
    for (const [scopeName, vars] of Object.entries(scopes)) {
      const outcome = evaluatePair(pair, vars);
      if (outcome.error) anyUnresolved = true;
      else if (!outcome.pass) anyFail = true;
      byScope[scopeName] = outcome;
    }
    return {
      id: pair.id ?? `${pair.fg} / ${pair.bg}`,
      fg: pair.fg,
      bg: pair.bg,
      level: pair.level ?? 'text',
      ...(pair.specRef ? { specRef: pair.specRef } : {}),
      scopes: byScope,
    };
  });

  return { results, anyFail, anyUnresolved };
}

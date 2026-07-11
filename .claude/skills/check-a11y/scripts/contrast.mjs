#!/usr/bin/env node
/**
 * contrast.mjs — Calculadora determinística de contraste WCAG sobre los tokens del DS.
 *
 * Resuelve pares foreground/background declarados como custom properties `--ds-*`
 * contra el build de tokens (`packages/tokens/dist/tokens.css` + `dist/themes/*.css`)
 * y calcula el ratio de contraste WCAG 2.x para el scope default y cada theme.
 *
 * Uso:
 *   node contrast.mjs --pairs <pairs.json> [--tokens <dir-dist-tokens>]
 *   node contrast.mjs --pairs-inline '<json>' [--tokens <dir-dist-tokens>]
 *
 * Formato de pairs.json (array):
 *   [
 *     {
 *       "id": "button-primary-text",          // etiqueta libre para el reporte
 *       "fg": "--ds-component-button-primary-text",
 *       "bg": "--ds-component-button-primary-bg",
 *       "level": "text"                        // "text" (4.5:1) | "large-text" (3:1) | "ui" (3:1, WCAG 1.4.11)
 *     }
 *   ]
 *
 * Salida: JSON por stdout — por par y por scope: valores resueltos, ratio, umbral, pass.
 * Exit code: 0 todo pasa · 1 al menos un par falla · 2 al menos un par no resoluble.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

// ---------- CLI ----------

const argv = process.argv.slice(2);
function argValue(flag) {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : null;
}

const tokensDir = argValue('--tokens') ?? 'packages/tokens/dist';
const pairsFile = argValue('--pairs');
const pairsInline = argValue('--pairs-inline');

if (!pairsFile && !pairsInline) {
  console.error('Uso: node contrast.mjs --pairs <pairs.json> | --pairs-inline <json> [--tokens <dir>]');
  process.exit(2);
}

let pairs;
try {
  pairs = JSON.parse(pairsInline ?? readFileSync(pairsFile, 'utf8'));
} catch (e) {
  console.error(`No se pudo parsear el JSON de pares: ${e.message}`);
  process.exit(2);
}

// ---------- Parseo de CSS custom properties ----------

/** Extrae `--x: valor;` de un archivo CSS en un Map (no importa el selector). */
function parseCustomProperties(css) {
  const map = new Map();
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(css)) !== null) map.set(m[1], m[2].trim());
  return map;
}

const baseCssPath = join(tokensDir, 'tokens.css');
if (!existsSync(baseCssPath)) {
  console.error(`No existe ${baseCssPath}. Buildear tokens primero: pnpm -F @romanmartinidev/tokens build`);
  process.exit(2);
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

/** Sigue cadenas var(--a) → var(--b) → #hex hasta un valor terminal. */
function resolveVar(name, vars, seen = new Set()) {
  if (seen.has(name)) return null; // ciclo
  seen.add(name);
  const raw = vars.get(name);
  if (raw == null) return null;
  const varRef = raw.match(/^var\((--[\w-]+)\s*(?:,\s*[^)]+)?\)$/);
  if (varRef) return resolveVar(varRef[1], vars, seen);
  return raw;
}

// ---------- Parseo de color ----------

/** Devuelve { r, g, b, a } en 0-255 / alpha 0-1, o null si no es un color plano. */
function parseColor(value) {
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
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
      return { r, g, b, a };
    }
    return null;
  }

  const rgb = v.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (rgb) {
    return { r: +rgb[1], g: +rgb[2], b: +rgb[3], a: rgb[4] !== undefined ? +rgb[4] : 1 };
  }

  const named = { white: { r: 255, g: 255, b: 255, a: 1 }, black: { r: 0, g: 0, b: 0, a: 1 } };
  if (named[v]) return named[v];

  return null; // shadow, gradient, dimensión, etc.
}

/** Composita `top` (con alpha) sobre `bottom` (opaco). */
function composite(top, bottom) {
  const a = top.a;
  return {
    r: top.r * a + bottom.r * (1 - a),
    g: top.g * a + bottom.g * (1 - a),
    b: top.b * a + bottom.b * (1 - a),
    a: 1,
  };
}

// ---------- WCAG ----------

function relativeLuminance({ r, g, b }) {
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(fg, bg) {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

const THRESHOLDS = { text: 4.5, 'large-text': 3, ui: 3 };
const WHITE = { r: 255, g: 255, b: 255, a: 1 };

// ---------- Evaluación ----------

let anyFail = false;
let anyUnresolved = false;

const results = pairs.map((pair) => {
  const level = pair.level ?? 'text';
  const required = THRESHOLDS[level];
  if (required === undefined) {
    anyUnresolved = true;
    return { ...pair, error: `level desconocido: ${level} (usar text | large-text | ui)` };
  }

  const byScope = {};
  for (const [scopeName, vars] of Object.entries(scopes)) {
    const fgRaw = resolveVar(pair.fg, vars);
    const bgRaw = resolveVar(pair.bg, vars);
    const fgColor = parseColor(fgRaw);
    const bgColor = parseColor(bgRaw);

    if (!fgColor || !bgColor) {
      anyUnresolved = true;
      byScope[scopeName] = {
        fgResolved: fgRaw,
        bgResolved: bgRaw,
        error: `no resoluble a color plano (fg=${fgRaw ?? 'undefined'}, bg=${bgRaw ?? 'undefined'})`,
      };
      continue;
    }

    const notes = [];
    let bgFinal = bgColor;
    if (bgColor.a < 1) {
      bgFinal = composite(bgColor, WHITE);
      notes.push('bg con alpha: compositado sobre #ffffff (backdrop asumido)');
    }
    const fgFinal = fgColor.a < 1 ? composite(fgColor, bgFinal) : fgColor;
    if (fgColor.a < 1) notes.push('fg con alpha: compositado sobre el bg resuelto');

    const ratio = contrastRatio(fgFinal, bgFinal);
    const pass = ratio >= required;
    if (!pass) anyFail = true;

    byScope[scopeName] = {
      fgResolved: fgRaw,
      bgResolved: bgRaw,
      ratio: Math.round(ratio * 100) / 100,
      required,
      pass,
      ...(notes.length ? { notes } : {}),
    };
  }

  return { id: pair.id ?? `${pair.fg} / ${pair.bg}`, fg: pair.fg, bg: pair.bg, level, scopes: byScope };
});

console.log(JSON.stringify({ tokensDir, scopes: Object.keys(scopes), results }, null, 2));
process.exit(anyFail ? 1 : anyUnresolved ? 2 : 0);

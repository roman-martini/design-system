#!/usr/bin/env node
// audit-tokens.mjs — auditoría determinística de consistencia de tokens.
//
// Tres verificaciones sobre packages/tokens (fuente) y packages/components/src (consumo):
//   1. orphans  — tokens definidos que nadie referencia ni consume.
//   2. hardcodes — valores visuales literales en el CSS de componentes, fuera de var(--ds-*).
//   3. hierarchy — violaciones de la jerarquía primitives -> semantic -> component (ADR-003).
//
// Determinístico: misma versión del repo => misma salida (todo se ordena antes de imprimir).
// No modifica nada. Uso:
//   node .claude/skills/audit-tokens/scripts/audit-tokens.mjs [--json] [--only=orphans,hardcodes,hierarchy]
//
// Exit codes: 0 = sin hallazgos accionables · 1 = hay hardcodes o violaciones de jerarquía
//             (los huérfanos son informativos y no cambian el exit code) · 2 = error de ejecución.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();
const TOKENS_SRC = join(ROOT, 'packages', 'tokens', 'src');
const COMPONENTS_SRC = join(ROOT, 'packages', 'components', 'src');

// ---------------------------------------------------------------------------
// Excepciones declaradas (CA-032.5): valores que legítimamente NO se tokenizan.
// La lista es explícita y justificada a propósito — un detector que calla por
// omisión no se puede auditar. Ampliarla es una decisión, no un parche.
// ---------------------------------------------------------------------------

const ALLOWED_KEYWORDS = new Set([
  '0', 'auto', 'none', 'inherit', 'initial', 'unset', 'revert',
  'currentcolor', 'transparent', // color: heredado del contexto o ausencia deliberada de color
  'fit-content', 'max-content', 'min-content', 'available', 'stretch',
  'solid', 'dashed', 'dotted', 'double', 'hidden', // estilos de borde
  'center', 'left', 'right', 'top', 'bottom', 'baseline',
  'ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear', 'infinite', 'alternate',
  'forwards', 'backwards', 'both', 'normal', 'nowrap', 'wrap',
  'cover', 'contain', 'repeat', 'no-repeat',
]);

// Medidas estructurales, no de diseño: no expresan escala visual del sistema.
const ALLOWED_DIMENSIONS = new Set([
  '0px', '0rem', '0%',
  '1px', '2px', // hairlines de borde y outline; el sistema no tokeniza anchos de línea
  '100%', '50%', '0%', '100vw', '100vh', '100dvh',
  '1', '1fr', // line-height unitless y tracks de grid
  '0s', '0ms', // "sin animación": lo que escribe un bloque prefers-reduced-motion
]);

// Propiedades cuyo valor SÍ expresa diseño y por lo tanto se audita.
const AUDITED_PROPS = new Set([
  'color', 'background', 'background-color', 'background-image',
  'border', 'border-color', 'border-width', 'border-radius',
  'border-top', 'border-right', 'border-bottom', 'border-left',
  'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
  'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
  'outline', 'outline-color', 'outline-width', 'outline-offset',
  'box-shadow', 'text-shadow', 'fill', 'stroke', 'stroke-width',
  'caret-color', 'text-decoration-color', 'accent-color',
  'font-size', 'font-weight', 'font-family', 'line-height', 'letter-spacing',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'padding-inline', 'padding-block',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'margin-inline', 'margin-block',
  'gap', 'row-gap', 'column-gap',
  'transition', 'transition-duration', 'transition-delay',
  'animation', 'animation-duration', 'animation-delay',
  'z-index', 'opacity',
]);

// Literales visuales: hex, funciones de color, medidas con unidad, duraciones.
const HEX = /#[0-9a-f]{3,8}\b/gi;
const COLOR_FN = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\s*\(/gi;
const LENGTH = /(?<![\w.-])\d*\.?\d+(?:px|rem|em|ch|ex|vw|vh|vmin|vmax|pt|cm|mm|in)\b/gi;
const TIME = /(?<![\w.-])\d*\.?\d+m?s\b/gi;
const NAMED_COLORS = new Set([
  'white', 'black', 'red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink',
  'gray', 'grey', 'silver', 'maroon', 'olive', 'lime', 'teal', 'navy', 'fuchsia',
  'aqua', 'cyan', 'magenta', 'brown', 'beige', 'gold', 'indigo', 'violet',
]);

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

function walk(dir, exts) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full, exts));
    else if (exts.some((e) => entry.endsWith(e))) out.push(full);
  }
  return out;
}

const rel = (p) => relative(ROOT, p).split(sep).join('/');

/** `{semantic.color.text.primary}` -> `semantic.color.text.primary` */
const refPath = (v) => v.slice(1, -1);

/** `semantic.color.text.primary` -> `--ds-semantic-color-text-primary` */
const cssVar = (path) => `--ds-${path.split('.').join('-')}`;

const isRef = (v) => typeof v === 'string' && v.startsWith('{') && v.endsWith('}');

// ---------------------------------------------------------------------------
// 1. Cargar la fuente de tokens
// ---------------------------------------------------------------------------

/** @type {Map<string, {path: string, value: string, file: string, level: string}>} */
const tokens = new Map();

function collect(node, trail, file) {
  if (node && typeof node === 'object' && 'value' in node && typeof node.value !== 'object') {
    const path = trail.join('.');
    tokens.set(path, {
      path,
      value: String(node.value),
      file: rel(file),
      level: trail[0] === 'semantic' || trail[0] === 'component' ? trail[0] : 'primitive',
    });
    return;
  }
  if (node && typeof node === 'object') {
    for (const key of Object.keys(node)) collect(node[key], [...trail, key], file);
  }
}

const themeFiles = new Set();
for (const file of walk(TOKENS_SRC, ['.json'])) {
  const isTheme = rel(file).includes('/theme/');
  if (isTheme) themeFiles.add(rel(file));
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(file, 'utf8'));
  } catch (err) {
    console.error(`ERROR: no se pudo parsear ${rel(file)} — ${err.message}`);
    process.exit(2);
  }
  // Los themes redefinen tokens semantic existentes: no crean tokens nuevos
  // (contrato de ADR-003), así que no entran al inventario de definiciones.
  if (!isTheme) collect(parsed, [], file);
}

if (tokens.size === 0) {
  console.error(`ERROR: no se encontró ningún token en ${rel(TOKENS_SRC)}`);
  process.exit(2);
}

// Referencias que hace la fuente, incluidos los themes (un theme que apunta a un
// primitive lo mantiene vivo).
/** @type {Map<string, string[]>} referencia -> quién la usa */
const referencedBy = new Map();
function noteRef(target, source) {
  if (!referencedBy.has(target)) referencedBy.set(target, []);
  referencedBy.get(target).push(source);
}

function scanRefs(node, trail, file) {
  if (node && typeof node === 'object' && 'value' in node && typeof node.value !== 'object') {
    const raw = String(node.value);
    for (const m of raw.matchAll(/\{[^}]+\}/g)) {
      noteRef(refPath(m[0]), trail.join('.') || rel(file));
    }
    return;
  }
  if (node && typeof node === 'object') {
    for (const key of Object.keys(node)) scanRefs(node[key], [...trail, key], file);
  }
}
for (const file of walk(TOKENS_SRC, ['.json'])) {
  scanRefs(JSON.parse(readFileSync(file, 'utf8')), [], file);
}

// ---------------------------------------------------------------------------
// 2. Escanear el consumo en los componentes
// ---------------------------------------------------------------------------

const componentFiles = walk(COMPONENTS_SRC, ['.css', '.html', '.ts']).filter(
  (f) => !f.endsWith('.spec.ts') && !f.endsWith('.stories.ts'),
);

/** @type {Map<string, string[]>} nombre de var CSS -> archivos que la usan */
const usedVars = new Map();
for (const file of componentFiles) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/gi)) {
    const name = m[1];
    if (!usedVars.has(name)) usedVars.set(name, []);
    if (!usedVars.get(name).includes(rel(file))) usedVars.get(name).push(rel(file));
  }
}

// ---------------------------------------------------------------------------
// Check 1 — tokens huérfanos
// ---------------------------------------------------------------------------

const orphans = [];
for (const t of tokens.values()) {
  if (referencedBy.has(t.path)) continue;
  if (usedVars.has(cssVar(t.path))) continue;
  orphans.push(t);
}
orphans.sort((a, b) => a.path.localeCompare(b.path));

// ---------------------------------------------------------------------------
// Check 2 — hardcodes en el CSS de componentes
// ---------------------------------------------------------------------------

const hardcodes = [];
const cssFiles = componentFiles.filter((f) => f.endsWith('.css'));

for (const file of cssFiles) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    const decl = line.trim();
    if (!decl || decl.startsWith('/*') || decl.startsWith('*') || decl.startsWith('//')) return;

    const match = decl.match(/^([a-z-]+)\s*:\s*(.+?);?\s*$/i);
    if (!match) return;
    const [, prop, rawValue] = match;
    const property = prop.toLowerCase();

    // Definición de custom property propia del componente: es tokenización local, no hardcode.
    if (property.startsWith('--')) return;
    if (!AUDITED_PROPS.has(property)) return;

    // Colores literales dentro de data URIs SVG (fill='white', stroke='#fff').
    // Se auditan aparte porque var() no funciona dentro del data URI: la corrección
    // es otra (mask-image + background-color tokenizado), pero el hallazgo es real.
    if (/url\(\s*["']?data:image\/svg/i.test(rawValue)) {
      for (const m of rawValue.matchAll(/(fill|stroke)=(?:'|%22|")([^'"%]+)/gi)) {
        const val = m[2].toLowerCase();
        if (val === 'none' || val === 'currentcolor' || val.startsWith('var')) continue;
        hardcodes.push({
          file: rel(file),
          line: i + 1,
          property,
          value: `${m[1]}='${m[2]}'`,
          kind: 'color-in-svg-data-uri',
          snippet: decl.length > 120 ? `${decl.slice(0, 117)}...` : decl,
        });
      }
      return;
    }

    // Quitar todo lo que ya está tokenizado y las funciones estructurales,
    // para quedarnos con los literales sueltos.
    let residue = rawValue
      .replace(/var\(\s*--ds-[a-z0-9-]+(?:\s*,[^)]*)?\)/gi, ' ')
      .replace(/\b(?:calc|clamp|min|max|translate[XYZ3d]*|scale[XYZ3d]*|rotate[XYZ]?|cubic-bezier|steps|repeat|minmax|env|counter)\s*\([^)]*\)/gi, ' ')
      .replace(/url\([^)]*\)/gi, ' ');

    const literals = [];
    for (const m of residue.matchAll(HEX)) literals.push({ kind: 'color', value: m[0] });
    for (const m of residue.matchAll(COLOR_FN)) literals.push({ kind: 'color', value: `${m[0]}…)` });
    for (const m of residue.matchAll(LENGTH)) {
      if (!ALLOWED_DIMENSIONS.has(m[0].toLowerCase())) literals.push({ kind: 'dimension', value: m[0] });
    }
    for (const m of residue.matchAll(TIME)) {
      if (!ALLOWED_DIMENSIONS.has(m[0].toLowerCase())) literals.push({ kind: 'motion', value: m[0] });
    }
    for (const word of residue.split(/[\s,()/]+/)) {
      const w = word.trim().toLowerCase().replace(/['"]/g, '');
      if (!w || ALLOWED_KEYWORDS.has(w) || ALLOWED_DIMENSIONS.has(w)) continue;
      if (NAMED_COLORS.has(w)) literals.push({ kind: 'color', value: w });
    }

    for (const lit of literals) {
      hardcodes.push({
        file: rel(file),
        line: i + 1,
        property,
        value: lit.value,
        kind: lit.kind,
        snippet: decl.length > 120 ? `${decl.slice(0, 117)}...` : decl,
      });
    }
  });
}
hardcodes.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.value.localeCompare(b.value));

// ---------------------------------------------------------------------------
// Check 3 — jerarquía primitives -> semantic -> component (ADR-003)
//
// Dos niveles de severidad, y la distinción importa:
//
//   hierarchy  — viola el contrato VIGENTE (ADR-003 + spec design-tokens-package).
//                Rompe el exit code.
//   warnings   — subóptimo pero PERMITIDO hoy. ADR-003 autoriza explícitamente
//                `component -> primitives` ("semantic, primitives (no theme)"),
//                así que reportarlo como violación sería inventar una regla que
//                el repo no tomó. Se informa porque tiene consecuencia real —un
//                primitive no responde al theme— y porque de ahí salió el bug del
//                focus ring en los brands. Promoverlo a violación exige un ADR
//                nuevo que restrinja ADR-003, no un cambio en este script.
// ---------------------------------------------------------------------------

const hierarchy = [];
const warnings = [];

for (const t of tokens.values()) {
  const refs = [...t.value.matchAll(/\{[^}]+\}/g)].map((m) => refPath(m[0]));

  // Referencias rotas: apuntan a un token que no existe en la fuente.
  for (const r of refs) {
    if (!tokens.has(r)) {
      hierarchy.push({
        kind: 'referencia-inexistente',
        token: t.path,
        file: t.file,
        detail: `{${r}} no está definido en packages/tokens/src`,
      });
    }
  }

  if (t.level === 'component') {
    for (const r of refs) {
      // Prohibido por ADR-003: el nivel component nunca depende de theme.
      if (r.startsWith('theme.')) {
        hierarchy.push({
          kind: 'component-referencia-theme',
          token: t.path,
          file: t.file,
          detail: `referencia {${r}}: el nivel component nunca depende de theme (ADR-003)`,
        });
      }
      // Permitido por ADR-003, pero con consecuencia: no sigue al theme.
      const target = tokens.get(r);
      const targetLevel = target ? target.level : r.startsWith('semantic.') ? 'semantic' : 'primitive';
      if (targetLevel === 'primitive' && /^color\./.test(r)) {
        warnings.push({
          kind: 'component-usa-primitive-de-color',
          token: t.path,
          file: t.file,
          detail: `referencia el primitive {${r}}: queda fijo en todos los themes. Permitido por ADR-003; revisar si es deliberado`,
        });
      }
    }
  }

  // Un semantic con el valor escrito literal no está mal formado, pero el nivel
  // semantic existe para dar intención a un primitive. El plan de la review ya
  // reconoce estos casos (tokens-09, tokens-11) como trabajo de la Parte H.
  if (t.level === 'semantic' && refs.length === 0) {
    warnings.push({
      kind: 'semantic-sin-referencia',
      token: t.path,
      file: t.file,
      detail: `valor literal "${t.value}" en vez de una referencia a primitives`,
    });
  }
}

// Consumo directo de primitives de color desde el CSS de un componente.
for (const [name, files] of usedVars) {
  if (/^--ds-color-/.test(name)) {
    for (const file of files) {
      warnings.push({
        kind: 'css-usa-primitive-de-color',
        token: name,
        file,
        detail: 'el CSS del componente consume un primitive de color: no responde al theme. Debería pasar por semantic o por su token de componente',
      });
    }
  }
}

const byKindThenToken = (a, b) => a.kind.localeCompare(b.kind) || String(a.token).localeCompare(String(b.token));
hierarchy.sort(byKindThenToken);
warnings.sort(byKindThenToken);

// ---------------------------------------------------------------------------
// Salida
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const onlyArg = args.find((a) => a.startsWith('--only='));
const only = onlyArg ? new Set(onlyArg.split('=')[1].split(',')) : null;
const show = (name) => !only || only.has(name);

const summary = {
  tokensDefinidos: tokens.size,
  archivosDeComponenteEscaneados: componentFiles.length,
  hardcodes: hardcodes.length,
  hierarchy: hierarchy.length,
  warnings: warnings.length,
  orphans: orphans.length,
};

if (asJson) {
  console.log(JSON.stringify({ summary, hardcodes, hierarchy, warnings, orphans }, null, 2));
} else {
  console.log(
    `\naudit-tokens — ${summary.tokensDefinidos} tokens definidos · ${summary.archivosDeComponenteEscaneados} archivos de componente escaneados\n`,
  );

  if (show('hardcodes')) {
    console.log(`## Hardcodes en CSS de componentes: ${hardcodes.length}`);
    for (const h of hardcodes) {
      console.log(`  ${h.file}:${h.line}  [${h.kind}] ${h.property}: ${h.value}`);
    }
    console.log('');
  }

  if (show('hierarchy')) {
    console.log(`## Violaciones del contrato de jerarquía: ${hierarchy.length}`);
    for (const v of hierarchy) {
      console.log(`  [${v.kind}] ${v.token}`);
      console.log(`      ${v.file} — ${v.detail}`);
    }
    console.log('');
  }

  if (show('warnings')) {
    console.log(`## Advertencias — permitido por ADR-003, revisar si es deliberado: ${warnings.length}`);
    for (const w of warnings) {
      console.log(`  [${w.kind}] ${w.token}`);
      console.log(`      ${w.file} — ${w.detail}`);
    }
    console.log('');
  }

  if (show('orphans')) {
    console.log(`## Tokens huérfanos — nadie los referencia ni los consume: ${orphans.length}`);
    for (const o of orphans) {
      console.log(`  ${o.path}  (${o.file})`);
    }
    console.log('');
  }

  console.log(
    `Resumen: ${hardcodes.length} hardcodes · ${hierarchy.length} violaciones de contrato · ` +
      `${warnings.length} advertencias · ${orphans.length} huérfanos\n` +
      `Rompen el exit code: hardcodes y violaciones de contrato. Advertencias y huérfanos son informativos.\n`,
  );
}

process.exit(hardcodes.length > 0 || hierarchy.length > 0 ? 1 : 0);

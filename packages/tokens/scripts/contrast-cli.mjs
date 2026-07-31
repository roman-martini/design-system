#!/usr/bin/env node
/**
 * contrast-cli.mjs — Interfaz de línea de comandos del cálculo de contraste.
 *
 * Cáscara delgada sobre `contrast.mjs`: parsea argumentos, delega y serializa. El
 * cálculo no vive acá (aaa-041, CA-027.5). El consumidor es la skill `check-a11y`,
 * que audita componentes con pares ad-hoc; el set versionado del package lo protege
 * el gate de CI en `test/contrast.spec.ts`.
 *
 * Uso:
 *   node contrast-cli.mjs --pairs-default [--tokens <dir>]
 *   node contrast-cli.mjs --pairs <pairs.json> [--tokens <dir>]
 *   node contrast-cli.mjs --pairs-inline '<json>' [--tokens <dir>]
 *
 * Formato de un par (array en el JSON):
 *   { "id": "button/primary-rest",
 *     "fg": "--ds-component-button-primary-text",
 *     "bg": "--ds-component-button-primary-bg",
 *     "level": "text" }        // "text" 4.5:1 | "large-text" 3:1 | "ui" 3:1 (SC 1.4.11)
 *
 * Salida: JSON por stdout — por par y por scope: valores resueltos, ratio, umbral, pass.
 * Exit code: 0 todo pasa · 1 al menos un par falla · 2 al menos un par no resuelve.
 */

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { evaluatePairs, loadScopes } from './contrast.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(HERE, '..');
const DEFAULT_PAIRS = join(PACKAGE_ROOT, 'test', 'contrast-pairs.json');
const DEFAULT_TOKENS_DIR = join(PACKAGE_ROOT, 'dist');

const argv = process.argv.slice(2);
function argValue(flag) {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : null;
}

const usage = [
  'Uso:',
  '  node contrast-cli.mjs --pairs-default [--tokens <dir>]',
  '  node contrast-cli.mjs --pairs <pairs.json> [--tokens <dir>]',
  '  node contrast-cli.mjs --pairs-inline <json> [--tokens <dir>]',
].join('\n');

const useDefaultPairs = argv.includes('--pairs-default');
const pairsFile = argValue('--pairs');
const pairsInline = argValue('--pairs-inline');

if (!useDefaultPairs && !pairsFile && !pairsInline) {
  console.error(usage);
  process.exit(2);
}

const tokensDir = argValue('--tokens') ?? DEFAULT_TOKENS_DIR;

let pairs;
try {
  pairs = JSON.parse(pairsInline ?? readFileSync(pairsFile ?? DEFAULT_PAIRS, 'utf8'));
} catch (e) {
  console.error(`No se pudo parsear el JSON de pares: ${e.message}`);
  process.exit(2);
}

if (!Array.isArray(pairs)) {
  console.error('El JSON de pares debe ser un array.');
  process.exit(2);
}

let scopes;
try {
  scopes = loadScopes(tokensDir);
} catch (e) {
  console.error(e.message);
  process.exit(2);
}

const { results, anyFail, anyUnresolved } = evaluatePairs(pairs, scopes);

console.log(
  JSON.stringify(
    { tokensDir, scopes: Object.keys(scopes), pairs: results.length, results },
    null,
    2,
  ),
);

process.exit(anyFail ? 1 : anyUnresolved ? 2 : 0);

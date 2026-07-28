/**
 * Helpers compartidos por `verify-packaging.mjs` (gate de CI) y `verify-dist.mjs`
 * (guard de `prepublishOnly`). Sin dependencias externas: corren con el Node del repo.
 */

import { readFileSync, existsSync } from 'node:fs';

/** Lee un JSON del filesystem. Lanza con el path incluido si falla. */
export function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    throw new Error(`No se pudo leer ${path}: ${err.message}`, { cause: err });
  }
}

/**
 * Aplana el campo `exports` de un manifest a la lista de paths de archivo que declara.
 * Soporta las tres formas que usa el repo: string plano, objeto de condiciones
 * (`types`/`default`/`import`) y sub-paths anidados.
 */
export function collectExportPaths(exportsField) {
  const paths = new Set();

  const walk = (node) => {
    if (typeof node === 'string') {
      paths.add(normalizeRelative(node));
      return;
    }
    if (node && typeof node === 'object') {
      for (const value of Object.values(node)) walk(value);
    }
  };

  walk(exportsField ?? {});
  return [...paths];
}

/** Normaliza `./dist/x.js` → `dist/x.js` para comparar contra rutas de tarball. */
export function normalizeRelative(p) {
  return p.replace(/^\.\//, '');
}

/**
 * Verifica que cada path declarado en `exports` exista dentro de `available`.
 * `available` es un Set de rutas relativas (del tarball o del filesystem).
 */
export function findMissingExports(manifest, available) {
  return collectExportPaths(manifest.exports).filter((p) => !available.has(p));
}

/** True si el manifest declara el script de aborto que ng-packagr escribe en full mode. */
export function hasPoisonScript(manifest) {
  return Boolean(manifest?.scripts?.prepublishOnly);
}

/** Compara dos archivos byte a byte. Devuelve false si alguno no existe. */
export function sameFileContents(a, b) {
  if (!existsSync(a) || !existsSync(b)) return false;
  return readFileSync(a).equals(readFileSync(b));
}

/** Nombre del ejecutable de npm según plataforma (Windows usa el .cmd). */
export const NPM_BIN = process.platform === 'win32' ? 'npm.cmd' : 'npm';

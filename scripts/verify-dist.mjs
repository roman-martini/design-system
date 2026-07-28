#!/usr/bin/env node
/**
 * Guard de `prepublishOnly` para los packages que publican desde su root.
 *
 * Publicar desde el root no da ninguna garantía estructural de que el build haya
 * corrido: un `dist/` ausente, vacío o viejo se publicaría en silencio. Este script
 * aborta la publicación si el manifest declara paths en `exports` que no existen
 * en el filesystem.
 *
 * Corre con el cwd en el directorio del package (así lo invoca npm/pnpm).
 */

import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { collectExportPaths, readJson } from './lib/packaging.mjs';

const packageDir = process.cwd();
const manifest = readJson(join(packageDir, 'package.json'));
const declared = collectExportPaths(manifest.exports);

if (declared.length === 0) {
  console.error(
    `✗ ${manifest.name}: el manifest no declara "exports" — no hay nada que verificar.`,
  );
  process.exit(1);
}

const missing = declared.filter((relative) => !existsSync(resolve(packageDir, relative)));

if (missing.length > 0) {
  console.error(
    `✗ ${manifest.name}: publicación abortada — faltan artefactos declarados en "exports":`,
  );
  for (const path of missing) console.error(`    ${path}`);
  console.error('\n  Corré el build del package antes de publicar (pnpm -r build).');
  process.exit(1);
}

console.log(`✓ ${manifest.name}: ${declared.length} paths de "exports" presentes en disco.`);

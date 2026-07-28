#!/usr/bin/env node
/**
 * Gate de packaging — verifica sobre el ARTEFACTO EMITIDO que ambos packages
 * publicables son publicables correctamente. Corre igual en local
 * (`pnpm verify:packaging`) y como step de `pr.yml`, siempre después del build.
 *
 * Existe porque el `0.2.0` publicado violaba Angular Package Format sin que nada
 * lo detectara: la configuración decía una cosa y el bundle emitido otra. Todo lo
 * que se verifica acá se lee del output, nunca de la config.
 *
 * No publica nada ni contacta al registry: `npm pack --dry-run` solo calcula.
 */

import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  NPM_BIN,
  findMissingExports,
  hasPoisonScript,
  normalizeRelative,
  readJson,
  sameFileContents,
} from './lib/packaging.mjs';

const repoRoot = resolve(fileURLToPath(import.meta.url), '../..');

/** Contenido mínimo que todo tarball publicable del repo debe llevar. */
const COMMON_REQUIRED = ['package.json', 'README.md', 'LICENSE', 'CHANGELOG.md'];

/** Nada de esto debe viajar al consumidor. */
const FORBIDDEN = [
  /^src\//,
  /^test\//,
  /\.spec\.ts$/,
  /\.stories\.ts$/,
  /^tsconfig.*\.json$/,
  /^ng-package\.json$/,
  /^vitest\.config\.ts$/,
  /^sd\.config\.mjs$/,
];

const PACKAGES = [
  {
    name: '@romanmartinidev/components',
    dir: 'packages/components',
    // Publica su dist (publishConfig.directory): el manifest generado por
    // ng-packagr es el contrato publicado.
    publishDir: 'packages/components/dist',
    required: [
      ...COMMON_REQUIRED,
      'fesm2022/romanmartinidev-components.mjs',
      'fesm2022/romanmartinidev-components-router.mjs',
      'types/romanmartinidev-components.d.ts',
      'types/romanmartinidev-components-router.d.ts',
      // Mini-manifest de APF para el entry point secundario: npm-packlist lo
      // descarta si el manifest publicado no declara `files` (ADR-021).
      'router/package.json',
    ],
    checkCompilationMode: true,
  },
  {
    name: '@romanmartinidev/tokens',
    dir: 'packages/tokens',
    // Publica desde el root: Style Dictionary no genera manifest (ADR-021).
    publishDir: 'packages/tokens',
    required: [...COMMON_REQUIRED, 'dist/tokens.js', 'dist/tokens.d.ts', 'dist/tokens.css'],
    checkCompilationMode: false,
  },
];

const failures = [];

function fail(pkg, message) {
  failures.push(`${pkg}: ${message}`);
}

/** 1. El FESM emitido está en partial compilation mode (APF). */
function checkCompilationMode(pkg) {
  const fesmDir = resolve(repoRoot, pkg.publishDir, 'fesm2022');
  if (!existsSync(fesmDir)) {
    fail(pkg.name, `no existe ${pkg.publishDir}/fesm2022 — ¿corriste el build?`);
    return;
  }

  const bundles = readdirSync(fesmDir).filter((f) => f.endsWith('.mjs'));
  if (bundles.length === 0) {
    fail(pkg.name, 'no hay bundles FESM en dist/fesm2022');
    return;
  }

  let declareFound = false;
  for (const bundle of bundles) {
    const source = readFileSync(join(fesmDir, bundle), 'utf8');
    if (source.includes('ɵɵdefineComponent') || source.includes('ɵɵdefineDirective')) {
      fail(
        pkg.name,
        `${bundle} está compilado en FULL mode (contiene ɵɵdefineComponent). ` +
          'Angular Package Format exige partial: revisá "compilationMode" en tsconfig.lib.json.',
      );
    }
    if (source.includes('ɵɵngDeclareComponent') || source.includes('ɵɵngDeclareDirective')) {
      declareFound = true;
    }
  }

  if (!declareFound) {
    fail(
      pkg.name,
      'ningún bundle FESM contiene declaraciones ɵɵngDeclare* — el build no salió en partial mode',
    );
  }
}

/** 2. Ningún manifest bajo dist trae el script de aborto de ng-packagr. */
function checkNoPoisonScript(pkg) {
  const distDir = resolve(repoRoot, pkg.dir, 'dist');
  if (!existsSync(distDir)) return;

  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else if (entry === 'package.json' && hasPoisonScript(readJson(full))) {
        fail(
          pkg.name,
          `${full.replace(repoRoot, '.')} declara scripts.prepublishOnly — ` +
            'es el guard que ng-packagr escribe al detectar full compilation mode.',
        );
      }
    }
  };

  walk(distDir);
}

/** 3-4. Contenido del tarball real y exports resolubles dentro de él. */
function checkTarball(pkg) {
  const publishDir = resolve(repoRoot, pkg.publishDir);
  if (!existsSync(publishDir)) {
    fail(pkg.name, `no existe el directorio de publicación ${pkg.publishDir}`);
    return;
  }

  let parsed;
  try {
    // execSync (comando completo) y no execFileSync: en Windows npm es un .cmd,
    // que Node 22+ rechaza ejecutar sin shell. El path se quotea por si el repo
    // vive bajo una ruta con espacios.
    const stdout = execSync(`${NPM_BIN} pack --dry-run --json "${publishDir}"`, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    parsed = JSON.parse(stdout);
  } catch (err) {
    fail(pkg.name, `npm pack --dry-run falló: ${err.message}`);
    return;
  }

  const entry = Array.isArray(parsed) ? parsed[0] : parsed;
  const files = new Set((entry?.files ?? []).map((f) => normalizeRelative(f.path)));

  if (files.size === 0) {
    fail(pkg.name, 'el tarball saldría vacío');
    return;
  }

  for (const required of pkg.required) {
    if (!files.has(required)) {
      fail(pkg.name, `el tarball no incluye "${required}"`);
    }
  }

  for (const file of files) {
    const forbidden = FORBIDDEN.find((pattern) => pattern.test(file));
    if (forbidden) {
      fail(pkg.name, `el tarball incluye "${file}", que no debe publicarse`);
    }
  }

  // Cada path de `exports` del manifest publicado debe existir en el tarball
  // — la verificación que ADR-017 declaró como mitigación y nunca se implementó.
  const publishedManifest = readJson(join(publishDir, 'package.json'));
  for (const missing of findMissingExports(publishedManifest, files)) {
    fail(pkg.name, `"exports" declara "${missing}" pero no está en el tarball`);
  }
}

/** 5. El LICENSE del package no derivó del canónico del monorepo. */
function checkLicense(pkg) {
  const packageLicense = resolve(repoRoot, pkg.dir, 'LICENSE');
  if (!existsSync(packageLicense)) {
    fail(pkg.name, `falta ${pkg.dir}/LICENSE — npm no hereda el LICENSE del root del monorepo`);
    return;
  }
  if (!sameFileContents(packageLicense, resolve(repoRoot, 'LICENSE'))) {
    fail(pkg.name, `${pkg.dir}/LICENSE difiere del LICENSE del root`);
  }
}

for (const pkg of PACKAGES) {
  if (pkg.checkCompilationMode) checkCompilationMode(pkg);
  checkNoPoisonScript(pkg);
  checkLicense(pkg);
  checkTarball(pkg);
}

if (failures.length > 0) {
  console.error(`\n✗ Verificación de packaging: ${failures.length} problema(s)\n`);
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error('');
  process.exit(1);
}

console.log(`✓ Verificación de packaging: ${PACKAGES.length} packages sin observaciones.`);

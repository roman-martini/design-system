#!/usr/bin/env node
/**
 * Gate del margen del presupuesto de tamaño — verifica que el colchón entre lo
 * medido y el techo declarado siga siendo más chico que la unidad de
 * crecimiento del package (para `components`, un componente).
 *
 * Lo exige la spec `ci-cd-pipeline`: "El margen SHALL quedar por debajo del
 * costo típico de la unidad de crecimiento del package [...] de modo que el
 * gate no pueda absorber un crecimiento entero en silencio".
 *
 * Existe porque esa regla se incumplió sin que nadie lo notara: el margen del
 * 5% de D-031 escalaba con el bundle, y al llegar `components` a 49.47 kB pasó
 * a valer 2 474 B contra los 2 316 B que cuesta un componente real. El techo
 * seguía verde y el gate ya no detectaba lo que existe para detectar. D-032 lo
 * topa en 2 kB y agrega esta verificación para que la próxima deriva la atrape
 * el pipeline.
 *
 * Corre después del build, igual que `pnpm size`: mide el `dist` real.
 */

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(import.meta.url), '../..');

/**
 * Tope del margen (D-032). Por debajo del costo de un componente real del kit
 * (2 316 B, medido en aaa-043 quitando `accordion` del public-api) y por encima
 * del costo de un fix normal (el typeahead de DsSelect costó 1 660 B), para que
 * el gate frene el crecimiento estructural sin ponerse rojo de rutina.
 */
const MARGIN_CAP_BYTES = 2000;

/** Tolerancia del redondeo al múltiplo de 10 B que manda la regla de D-031. */
const ROUNDING_SLACK_BYTES = 10;

const parseLimit = (limit) => {
  const match = /^([\d.]+)\s*kB$/i.exec(String(limit).trim());
  if (!match) {
    throw new Error(`Límite con formato inesperado en .size-limit.json: "${limit}"`);
  }
  // size-limit usa kB decimales (1000 B), no KiB.
  return Math.round(parseFloat(match[1]) * 1000);
};

const measure = () => {
  const raw = execSync('npx size-limit --json', {
    cwd: repoRoot,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  return JSON.parse(raw);
};

let measured;
try {
  measured = measure();
} catch (error) {
  // size-limit sale con código ≠ 0 cuando algún techo se excede, pero igual
  // imprime el JSON: ese caso lo reporta `pnpm size`, no este gate.
  const stdout = error.stdout?.toString() ?? '';
  const start = stdout.indexOf('[');
  if (start === -1) {
    console.error('✗ No se pudo medir el bundle. ¿Corriste `pnpm -r build` antes?');
    console.error(error.message);
    process.exit(1);
  }
  measured = JSON.parse(stdout.slice(start));
}

const config = JSON.parse(readFileSync(resolve(repoRoot, '.size-limit.json'), 'utf-8'));
const limitByName = new Map(config.map((entry) => [entry.name, parseLimit(entry.limit)]));

const offenders = [];
const rows = [];

for (const entry of measured) {
  const limit = limitByName.get(entry.name);
  if (limit === undefined) {
    offenders.push(`${entry.name}: no tiene entrada en .size-limit.json`);
    continue;
  }
  const margin = limit - entry.size;
  rows.push({ name: entry.name, size: entry.size, limit, margin });

  // Un margen negativo es un techo excedido: lo reporta `pnpm size`.
  if (margin > MARGIN_CAP_BYTES + ROUNDING_SLACK_BYTES) {
    offenders.push(
      `${entry.name}: margen de ${margin} B (medido ${entry.size} B, techo ${limit} B) ` +
        `supera el tope de ${MARGIN_CAP_BYTES} B`,
    );
  }
}

for (const row of rows) {
  const state = row.margin < 0 ? 'EXCEDIDO' : `${row.margin} B`;
  console.log(`  ${row.name}\n    medido ${row.size} B · techo ${row.limit} B · margen ${state}`);
}

if (offenders.length > 0) {
  console.error('\n✗ Margen del presupuesto por encima del tope (D-032):\n');
  for (const offender of offenders) {
    console.error(`  - ${offender}`);
  }
  console.error(
    `\nUn margen mayor que el costo de un componente deja entrar uno entero sin que el gate\n` +
      `diga nada, que es lo que el presupuesto existe para detectar (spec ci-cd-pipeline).\n` +
      `Bajá el techo en .size-limit.json a "medido + min(5%, ${MARGIN_CAP_BYTES} B)", redondeado\n` +
      `hacia arriba al múltiplo de 10 B, y actualizá la tabla de CONTRIBUTING.md.`,
  );
  process.exit(1);
}

console.log(`\n✓ Margen del presupuesto dentro del tope de ${MARGIN_CAP_BYTES} B (D-032).`);

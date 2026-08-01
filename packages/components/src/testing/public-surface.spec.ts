import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

// Verifica que ningún `index.ts` de componente use `export *`. La superficie
// pública del package se cura símbolo por símbolo: con `export *`, cualquier
// símbolo que alguien exporte de un archivo del componente entra al contrato
// semver sin decisión, y quitarlo después es breaking.
//
// Enumera el filesystem por el mismo motivo que la cobertura de axe: una lista
// escrita a mano se desactualiza el día que alguien agrega un componente, que es
// justo el caso a detectar. Fue lo que pasó — la convención se cumplía en 22 de
// 24 índices por imitación y `slider/` nació con `export *` igual (aaa-045).

const LIB_DIR = ['src/lib', 'packages/components/src/lib'].find((p) => existsSync(p));

describe('superficie pública del kit', () => {
  it('resuelve el directorio de componentes', () => {
    expect(LIB_DIR).toBeDefined();
  });

  it('ningún índice de componente re-exporta con export *', () => {
    const dirs = readdirSync(LIB_DIR as string, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);

    expect(dirs.length).toBeGreaterThan(20);

    const conExportStar = dirs.filter((dir) => {
      const index = join(LIB_DIR as string, dir, 'index.ts');
      return existsSync(index) && /^\s*export\s+\*/m.test(readFileSync(index, 'utf-8'));
    });

    expect(
      conExportStar,
      `Estos índices usan 'export *': ${conExportStar.join(', ')}. ` +
        `Enumerá los símbolos que el componente expone (export { … } / export type { … }); ` +
        `lo que no esté escrito ahí no es parte de la API pública.`,
    ).toEqual([]);
  });
});

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

// Verifica que NINGÚN componente del kit quede sin aserción de axe. Enumera el
// filesystem en vez de comparar contra una lista escrita a mano: una lista se
// desactualiza en silencio el día que alguien agrega un componente, que es
// exactamente el caso que este test tiene que detectar (CA-028.2).

const LIB_DIR = ['src/lib', 'packages/components/src/lib'].find((p) => existsSync(p));

/**
 * Directorios de `src/lib/` que no son componentes renderizables y por eso no
 * tienen aserción de axe propia. Cada exención necesita su motivo acá.
 */
const SIN_RENDER_PROPIO: Record<string, string> = {
  field:
    'clase base abstracta (DsFieldBase) + CSS compartido: no se renderiza sola, se audita a través de input, textarea, select, checkbox, radio y switch',
};

describe('cobertura de axe en el kit (CA-028.2)', () => {
  it('resuelve el directorio de componentes', () => {
    expect(LIB_DIR).toBeDefined();
  });

  it('todo componente del kit tiene una aserción de axe o una exención con motivo', () => {
    const dirs = readdirSync(LIB_DIR as string, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);

    expect(dirs.length).toBeGreaterThan(20);

    const sinCobertura = dirs.filter((dir) => {
      if (dir in SIN_RENDER_PROPIO) return false;

      const specs = readdirSync(join(LIB_DIR as string, dir)).filter((f) => f.endsWith('.spec.ts'));

      // Se busca la INVOCACIÓN, no la mención: `includes('expectNoAxeViolations')`
      // matchea también la línea del import, así que un spec al que le borren la
      // aserción y le dejen el import pasaría el gate. Verificado al construirlo.
      return !specs.some((spec) =>
        readFileSync(join(LIB_DIR as string, dir, spec), 'utf-8').includes(
          'expectNoAxeViolations(',
        ),
      );
    });

    expect(
      sinCobertura,
      `Estos componentes no asertan axe en ningún spec: ${sinCobertura.join(', ')}. ` +
        `Agregá la aserción con expectNoAxeViolations, o —si no es un componente renderizable— ` +
        `declaralo en SIN_RENDER_PROPIO con su motivo.`,
    ).toEqual([]);
  });

  it('cada exención declarada corresponde a un directorio que existe', () => {
    const huerfanas = Object.keys(SIN_RENDER_PROPIO).filter(
      (dir) => !existsSync(join(LIB_DIR as string, dir)),
    );

    expect(huerfanas, `Exenciones que ya no corresponden a ningún directorio`).toEqual([]);
  });
});

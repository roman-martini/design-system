import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Lectura del CSS fuente de un componente para los scenarios que asertan tokens
 * (criterio de aaa-023: jsdom no computa estilos, así que el contrato de tokens
 * se verifica sobre el archivo fuente).
 *
 * Angular intercepta los imports de `.css` —incluso con `?raw`—, de ahí el
 * `readFileSync` en vez de un import.
 *
 * Antes de aaa-042 esta lógica estaba copiada en 13 specs, cada uno con su
 * propio par de paths candidatos. **Y todas las copias devolvían `''` cuando el
 * archivo no aparecía**, con lo cual un path equivocado no rompía nada: los
 * asserts del tipo "el CSS no contiene hex" pasaban en verde sobre un string
 * vacío. Acá se lanza: un fuente que no se encuentra es un error, no un pase.
 */

// El cwd depende de cómo se invoque Vitest: desde el root del monorepo o desde
// el package. Se prueban ambas raíces en vez de atarse a una.
const RAICES = ['src', 'packages/components/src'];

/** Lee un archivo por su path relativo a `packages/components/src/`. */
export function readSource(relativo: string): string {
  const encontrado = RAICES.map((raiz) => join(raiz, relativo)).find((p) => existsSync(p));

  if (!encontrado) {
    throw new Error(
      `No se encontró el fuente '${relativo}' desde ninguna raíz conocida (${RAICES.join(', ')}). ` +
        `Si el archivo se movió, actualizá el spec; devolver vacío haría pasar sus aserciones sin leer nada.`,
    );
  }

  return readFileSync(encontrado, 'utf-8');
}

/**
 * Lee el CSS de un componente. Por defecto `lib/<dir>/<dir>.css`; el segundo
 * parámetro cubre los componentes con más de una hoja (`accordion-item.css`).
 */
export function readComponentCss(dir: string, archivo = `${dir}.css`): string {
  return readSource(join('lib', dir, archivo));
}

/** Lee la superficie pública del package, para los scenarios de public-api. */
export function readPublicApi(): string {
  return readSource('public-api.ts');
}

import axe, { type NodeResult, type Result, type RunOptions } from 'axe-core';

/**
 * Gate de accesibilidad de la suite (fase 1 de HU-028, change aaa-042).
 *
 * Corre axe-core sobre el DOM renderizado de un fixture y falla ante cualquier
 * violación WCAG A/AA. **Es infraestructura de test**: no se exporta desde
 * `public-api.ts` ni entra al artefacto publicado.
 *
 * No depende del test runner: lanza `Error` con el detalle formateado. Cualquier
 * runner lo reporta como fallo, y el mensaje no queda a merced de cómo un
 * matcher serialice el objeto de resultados.
 *
 * ## Qué evalúa
 *
 * Las tags de WCAG 2.0 y 2.1, niveles A y AA — el compromiso declarado del
 * producto (D-007). AAA está fuera de alcance por HU-028. Se suma
 * `best-practice` porque la medición del 2026-07-31 mostró que el kit ya la
 * pasa entera: entra como trinquete sin costo.
 *
 * ## Qué NO evalúa, y por qué
 *
 * | Regla            | Motivo                                                                   |
 * | ---------------- | ------------------------------------------------------------------------ |
 * | `color-contrast` | jsdom no computa estilos ni layout: la regla nunca concluye (quedó        |
 * |                  | `incomplete` en 22 de 27 casos medidos). **No tapa un hallazgo**: el      |
 * |                  | contraste lo cubre el gate de tokens de HU-027 por cálculo — 107 pares    |
 * |                  | × 4 scopes, cobertura estrictamente mayor que un render en jsdom.         |
 *
 * Ninguna otra regla se deshabilita. Las que la medición mostró indeterminadas
 * sin error (`aria-valid-attr-value`, `aria-allowed-attr` en select y menu)
 * quedan activas a propósito: hoy no fallan, y si algún día concluyen en
 * violación se quiere saber.
 *
 * ## Qué NO es auditable en jsdom (va a la fase 2 — Parte L)
 *
 * | Caso                                   | Motivo verificado                                                     |
 * | -------------------------------------- | --------------------------------------------------------------------- |
 * | Contenido del listbox de `DsSelect`     | `[popover]` sin `:popover-open`: jsdom no implementa el top layer, así |
 * |                                        | que el subárbol cuenta como oculto y axe no evalúa nada (0 passes).   |
 * | Panel de `DsMenu` abierto               | Idem.                                                                 |
 * | Interior de `DsModal` abierto           | Un `<dialog open>` rompe 11 reglas de axe en jsdom, porque            |
 * |                                        | `checkVisibility` y `getAnimations` son `undefined`. Peor que no       |
 * |                                        | evaluar: axe **deja de detectar violaciones que existen**.            |
 *
 * En los tres casos el trigger sí se audita en fase 1; lo que queda afuera es
 * el contenido desplegado.
 */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];

const REGLAS_DESHABILITADAS: RunOptions['rules'] = {
  // Ver la tabla del docblock: jsdom no computa color. Cubierta por HU-027.
  'color-contrast': { enabled: false },
};

/** Firma con la que axe reporta que una regla falló por error interno. */
const ERROR_DEL_MOTOR = 'Axe encountered an error';

export interface AxeAssertionOptions {
  /**
   * Acepta una corrida no concluyente (axe no evaluó nada, o alguna regla falló
   * por límites del entorno). **Exige el motivo**, que queda escrito en el punto
   * de invocación: así la excepción se ve en el diff en vez de esconderse en una
   * config lejana. Usar solo para lo que la tabla de arriba declara no auditable.
   */
  readonly allowInconclusive?: string;
}

interface Inconcluyente {
  readonly motivo: string;
  readonly detalle: string;
}

/**
 * Corre axe sobre `root` y falla si encuentra violaciones **o si la corrida no
 * fue concluyente**.
 *
 * La segunda condición es la que hace confiable al gate. `violations.length === 0`
 * por sí solo es una señal insuficiente: la medición del 2026-07-31 mostró que con
 * un `<dialog open>` en el árbol, axe no reporta violaciones que sí existen. Un
 * gate construido sobre esa señal habría dado verde sobre el modal desde el día
 * uno. Por eso se exige, además de cero violaciones, que el motor haya evaluado
 * reglas con éxito y que ninguna haya quedado indeterminada por error interno.
 */
export async function expectNoAxeViolations(
  root: Element,
  options: AxeAssertionOptions = {},
): Promise<void> {
  const results = await axe.run(root, {
    runOnly: { type: 'tag', values: TAGS },
    rules: REGLAS_DESHABILITADAS,
  });

  if (results.violations.length > 0) {
    throw new Error(formatearViolaciones(results.violations));
  }

  const inconcluyente = detectarInconcluyente(results.passes, results.incomplete);
  if (!inconcluyente) return;

  if (options.allowInconclusive) {
    return;
  }

  throw new Error(
    `axe no produjo un resultado concluyente sobre este árbol, así que la ausencia de ` +
      `violaciones no prueba nada.\n\n` +
      `  Causa: ${inconcluyente.motivo}\n` +
      `  ${inconcluyente.detalle}\n\n` +
      `Si el caso es uno de los que jsdom no permite auditar (contenido de un popover ` +
      `abierto, interior de un <dialog open>), declaralo con su motivo:\n` +
      `  expectNoAxeViolations(el, { allowInconclusive: 'por qué' })\n` +
      `y verificá que esté en la tabla de exclusiones de src/testing/axe.ts.`,
  );
}

function detectarInconcluyente(passes: Result[], incomplete: Result[]): Inconcluyente | null {
  const conError = incomplete.filter((regla) =>
    regla.nodes.some((nodo) => mensajesDe(nodo).some((m) => m.includes(ERROR_DEL_MOTOR))),
  );

  if (conError.length > 0) {
    return {
      motivo: `${conError.length} regla(s) fallaron por un error interno del motor`,
      detalle: `Reglas afectadas: ${conError.map((r) => r.id).join(', ')}`,
    };
  }

  if (passes.length === 0) {
    return {
      motivo: 'axe no evaluó ninguna regla con éxito',
      detalle:
        'El árbol está vacío, oculto para el motor, o no es el elemento que se quería auditar.',
    };
  }

  return null;
}

function mensajesDe(nodo: NodeResult): string[] {
  return [...nodo.any, ...nodo.all, ...nodo.none].map((check) => check.message ?? '');
}

function formatearViolaciones(violaciones: Result[]): string {
  const detalle = violaciones
    .map((v) => {
      const nodos = v.nodes.map((n) => `      ${n.html}`).join('\n');
      return `  · [${v.impact}] ${v.id} — ${v.help}\n${nodos}\n      ${v.helpUrl}`;
    })
    .join('\n\n');

  const total = violaciones.reduce((suma, v) => suma + v.nodes.length, 0);
  return `axe encontró ${violaciones.length} regla(s) violada(s) en ${total} nodo(s):\n\n${detalle}`;
}

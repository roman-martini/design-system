/**
 * Firmas de `contrast.mjs`, para que los specs en TypeScript consuman la lógica
 * portada con tipos completos (aaa-041, design D1). El módulo es `.mjs` porque la
 * skill `check-a11y` lo invoca con `node` directo, sin build step.
 */

/** Nivel de par y su umbral: `text` 4.5:1, `large-text` y `ui` 3:1. */
export type ContrastLevel = 'text' | 'large-text' | 'ui';

export declare const THRESHOLDS: Record<ContrastLevel, number>;

/** Color con canales 0-255 y alpha 0-1. */
export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** Par de tokens a verificar, tal como se declara en `test/contrast-pairs.json`. */
export interface ContrastPair {
  /** Etiqueta con prefijo de dominio (`semantic/…`, `button/…`) para el reporte. */
  id: string;
  /** Custom property del color de frente (texto, borde, indicador). */
  fg: string;
  /** Custom property del fondo adyacente. */
  bg: string;
  level: ContrastLevel;
  /** Spec de OpenSpec cuyo requirement respalda este par (trazabilidad CA-027.6). */
  specRef: string;
}

/** Resultado de un par en un scope: ratio y veredicto, o error de resolución. */
export interface PairOutcome {
  fgResolved?: string | null;
  bgResolved?: string | null;
  ratio?: number;
  required?: number;
  pass?: boolean;
  notes?: string[];
  error?: string;
}

export interface PairResult {
  id: string;
  fg: string;
  bg: string;
  level: ContrastLevel;
  specRef?: string;
  /** Un outcome por scope: `default` más uno por archivo de `dist/themes/`. */
  scopes: Record<string, PairOutcome>;
}

export interface EvaluationReport {
  results: PairResult[];
  anyFail: boolean;
  anyUnresolved: boolean;
}

/** Custom properties de un scope: nombre → valor crudo declarado. */
export type ScopeVars = Map<string, string>;

export declare function parseCustomProperties(css: string): ScopeVars;

/**
 * Carga el scope `default` desde `tokens.css` y uno por archivo de `themes/`.
 * Lanza si `tokens.css` no existe, con el comando de build en el mensaje.
 */
export declare function loadScopes(tokensDir: string): Record<string, ScopeVars>;

/** Sigue cadenas `var()` hasta un valor terminal; `null` ante ciclo o ausencia. */
export declare function resolveVar(
  name: string,
  vars: ScopeVars,
  seen?: Set<string>,
): string | null;

/** `null` si el valor no es un color plano (sombra, gradiente, dimensión). */
export declare function parseColor(value: string | null | undefined): Rgba | null;

export declare function composite(top: Rgba, bottom: Rgba): Rgba;

export declare function relativeLuminance(color: Pick<Rgba, 'r' | 'g' | 'b'>): number;

/** Ratio WCAG 2.x entre dos colores opacos. Rango 1 – 21. */
export declare function contrastRatio(fg: Rgba, bg: Rgba): number;

export declare function evaluatePair(
  pair: Pick<ContrastPair, 'fg' | 'bg'> & { level?: ContrastLevel },
  vars: ScopeVars,
): PairOutcome;

export declare function evaluatePairs(
  pairs: readonly ContrastPair[],
  scopes: Record<string, ScopeVars>,
): EvaluationReport;

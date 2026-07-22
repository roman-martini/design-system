# Design — components-button-variants (aaa-033)

Decisiones técnicas del change. Muere al archivar; lo one-way door se promueve a ADR si aparece.

## Context

Segunda entrega de la tanda 3 (D-014). HU-020 refinada (PO 2026-07-22): naming `danger`, D-016 (cadena semantic corregida en la fuente), alcance danger completo. `DsButton` ya tiene primary/secondary/ghost + disabled accesible (ADR-011) + loading (aaa-031); el bootstrap dejó `button.danger.*` y `button.link.*` latentes en tokens (link queda fuera de alcance).

## Goals / Non-Goals

**Goals:**

- 4 variantes aditivas 100% tokenizadas sin tocar la API previa.
- Par danger AA en los 4 themes corrigiendo el semantic (D-016), verificado por gate.
- disabled/loading funcionan idénticos en todas las variantes (sin CSS por-variante para esos estados).

**Non-Goals:**

- Variante `link` (tokens latentes del bootstrap; sin caso — entra con aprobación del PO, D-015).
- Split de ejes `variant × tone` (la API plana existente se mantiene; refactor solo si la matriz crece).

## Decisions

### 1. API: union type ampliado, plano y aditivo

```ts
export type DsButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost' // existentes
  | 'outline'
  | 'danger'
  | 'danger-outline'
  | 'danger-ghost'; // nuevos
```

- Plano (no `variant + tone`): compatible hacia atrás sin migración; con 7 valores sigue legible. Si una tanda futura multiplica la matriz, el refactor a dos ejes se evalúa entonces (dos-way door).

### 2. Tokens: bloques component por variante (patrón del bootstrap)

| Bloque                    | Estado    | Referencias                                                                                                           |
| ------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------- |
| `button.danger.*`         | existente | `bg.danger`/`danger-hover`/`danger-active` + `text.inverse` (se estrena)                                              |
| `button.outline.*`        | nuevo     | bg `transparent`, border `border.default`, text `text.primary`, hover/active `bg.secondary-hover/active` (como ghost) |
| `button.danger-outline.*` | nuevo     | bg `transparent`, border `border.danger` (semantic existente), text `text.danger`, hover/active `bg.danger-subtle`    |
| `button.danger-ghost.*`   | nuevo     | bg y border `transparent`, text `text.danger`, hover/active `bg.danger-subtle`                                        |

- `danger-outline` usa `border.danger` (semantic **existente** del bootstrap, red.500 = 3.76:1 sobre surface ≥3:1 ✓ para 1.4.11): el semantic ya provee el token dedicado, mejor que reutilizar `text.danger` para un rol de borde. (Ajuste sobre la versión propuesta del design, detectado en el apply.)

### 3. D-016 en `semantic/color.json` (default only)

- `bg.danger` `{color.red.500}` → `{color.red.600}`; `danger-hover` → `{color.red.700}`; `danger-active` → `{color.red.800}`. `danger-subtle` no cambia.
- `theme/dark.json` corre su cadena un paso **aclarando** (600/500/400 → 500/400/300): el gate reveló que `text.inverse` de dark no es blanco y la base `red.600` daba 3.71:1 ✗; con `red.500` queda 4.76:1 ✓ (hover 6.48, active más alto). Corrección sobre la premisa del proposal, detectada por el gate.
- Ratios del gate (4 themes): base 4.83/4.83/4.83/4.76 ✓ · hover 6.47/…/6.48 ✓ · active 8.31/…/6.48 ✓ · borde danger-outline 3.76 (ui ≥3) ✓ · regresiones: ninguna.

### 4. CSS: mismos patrones `[data-variant]` del archivo actual

- `button.css` suma 4 bloques `[data-variant='…']` con los mismos selectores de interacción existentes (`:hover:not([aria-disabled='true']):not([data-loading])`).
- disabled (opacity) y loading (cursor/overlay) son transversales por atributo — cero CSS nuevo por variante para esos estados (CA-020.5 sale gratis).

## Risks / Trade-offs

- [Ningún caso real de `elevated`… no aplica acá; el riesgo análogo es `danger-ghost` sin uso] → costo marginal bajo (pares ya sanos); asumido por el PO (D-015).
- [D-016 oscurece fondos danger futuros] → impacto real hoy nulo (nadie consume `bg.danger` sólido); el gate documenta los ratios como scenario anti-regresión.
- [jsdom no computa colores] → los tests asertan `data-variant` + tokens en CSS fuente; los ratios los verifica el script de contraste post-build (mismo criterio que aaa-015/025).

## Open Questions

(ninguna — el refinamiento de HU-020 cerró las tres decisiones el 2026-07-22)

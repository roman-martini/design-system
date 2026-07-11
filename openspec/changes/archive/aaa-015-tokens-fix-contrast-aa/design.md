# Design — tokens-fix-contrast-aa

## Context

Los ratios actuales salen de la [auditoría 2026-07-11](../../../docs/design/a11y/2026-07-11-audit.md), calculados con `check-a11y/scripts/contrast.mjs` sobre `packages/tokens/dist/` (4 scopes). Las fallas viven en el mapeo semantic → primitives del theme default y del override de brand-a; dark y brand-b ya pasan con sus propios overrides. Los componentes consumen los tokens vía CSS variables, así que el fix no toca `packages/components`.

## Goals / Non-Goals

**Goals:**

- `text.inverse` sobre `bg.primary` ≥ 4.5:1 y `border.strong` sobre `bg.surface` ≥ 3:1 en los 4 themes.
- Formalizar esos umbrales como requirement del spec para que no regresen.

**Non-Goals:**

- Rediseñar la paleta o los primitives (los hex no cambian; cambia qué primitive referencia cada semantic).
- Los hallazgos media/baja restantes de la auditoría (borde del botón secundario, checkmark hardcodeado, `aria-checked`): tienen sus propios caminos declarados en el reporte.
- Tocar `focus-ring` ni `border.primary` (pasan sus umbrales actuales).

## Decisions

1. **Subir la cadena completa un paso** (`primary/hover/active`), no solo el reposo. Alternativa considerada: cambiar solo `bg.primary` a blue-600 — dejaría `primary` y `primary-hover` con el mismo valor y rompería el affordance de hover. Subir toda la cadena conserva la progresión visual (reposo < hover < active) y todos los pasos quedan ≥ 4.5:1 con blanco.
2. **Oscurecer el fondo, no el texto**. Alternativa: texto oscuro sobre blue-500 (dark ya lo hace) — en light invertiría el patrón esperado de botón primario claro-sobre-oscuro y tocaría `text.inverse`, con impacto colateral en todos sus consumidores.
3. **`border.strong` → neutral-500** — el candidato mínimo que pasa 3:1 en los 4 scopes (4.74 light / 3.78 dark). La jerarquía del spec `subtle (100) < default (300) < strong (500)` se mantiene creciente.
4. **Sin ADR**: cambio de valores reversible que ejecuta D-007. Si a futuro se quisiera política de contraste distinta, el requirement nuevo del spec es el lugar del contrato.

## Risks / Trade-offs

- [El primario default cambia de tono percibido (blue-500 → blue-600)] → aprobado explícitamente por el PO (2026-07-11); brand-b y dark no cambian.
- [Consumidores externos con snapshots visuales verían diff] → pre-1.0, sin consumidores externos conocidos (D-003/D-004); changeset patch lo comunica.
- [`border.strong` se usa en más lugares a futuro (inputs, etc.)] → neutral-500 es más oscuro, nunca menos accesible; el requirement nuevo cubre el par crítico.

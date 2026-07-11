---
id: aaa-015
name: tokens-fix-contrast-aa
type: change
status: archived
archived: 2026-07-11
modifies-specs:
  - design-tokens-package (scenario de resolución actualizado + requirement de contraste AA nuevo)
---

# Proposal — tokens-fix-contrast-aa

## Why

La [auditoría de accesibilidad 2026-07-11](../../../docs/design/a11y/2026-07-11-audit.md) verificó con script 3 hallazgos de severidad alta que reducen a 2 causas en tokens: el texto del botón primario falla WCAG AA 1.4.3 en los themes default (3.68:1) y brand-a (3.30:1), y el borde de Checkbox/Radio sin marcar falla 1.4.11 (2.52:1) siendo el único indicador visual del control. D-007 define la a11y como parte del valor del producto; el PO aprobó el cambio visual el 2026-07-11.

## What Changes

- `packages/tokens/src/semantic/color.json`: la cadena `bg.primary` / `bg.primary-hover` / `bg.primary-active` sube un paso — `blue-500/600/700` → `blue-600/700/800` (blanco sobre blue-600 = 5.17:1).
- `packages/tokens/src/semantic/color.json`: `border.strong` — `neutral-400` → `neutral-500` (4.74:1 sobre surface; la jerarquía `subtle < default < strong` se mantiene).
- `packages/tokens/src/theme/brand-a.json`: `bg.primary` / `hover` / `active` — `green-600/700/800` → `green-700/800/900` (blanco sobre green-700 = 5.02:1).
- **Cambio visual** (no de API): Button primario, Checkbox y Radio se oscurecen un paso en default y brand-a. Dark y brand-b no cambian (sus overrides ya pasan: 4.87:1 y 5.38:1).

Todos los ratios candidatos fueron verificados con `check-a11y/scripts/contrast.mjs` antes de proponer.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `design-tokens-package`:
  - El scenario de resolución de referencias que usa `bg.primary → {color.blue.500}` como ejemplo queda desactualizado → se actualiza a `{color.blue.600}`.
  - Se agrega un requirement **"Contraste WCAG AA de tokens interactivos"** con scenarios verificables por script, para que el fix no regrese: `text.inverse`/`bg.primary` ≥ 4.5:1 y `border.strong`/`bg.surface` ≥ 3:1 en todos los themes.

## Impact

- **Código**: solo `packages/tokens/src/` (2 archivos JSON). `packages/components` no cambia código: consume los tokens vía `var(--ds-*)`.
- **Visual**: consumidores del theme default y brand-a ven el primario y los bordes de form controls un paso más oscuros. Sin cambio de API ni de nombres de tokens → changeset **patch** de `@romanmartinidev/tokens`.
- **Verificación**: re-correr los pares de la auditoría con el script post-build; los pares que hoy fallan deben pasar y ninguno de los que pasan debe caer bajo su umbral.
- **Sin ADR**: es un cambio de valores reversible que ejecuta D-007; no hay decisión one-way door nueva.

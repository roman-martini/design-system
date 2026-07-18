---
id: aaa-019
name: components-add-tooltip
type: change
status: proposed
modifies-specs:
  - components-package (ADDED: DsTooltip)
  - design-tokens-package (sin delta de spec; component.tooltip nuevo referenciando semantic/primitives)
related-adrs:
  - ADR-007
  - ADR-014
---

# Proposal — components-add-tooltip

## Why

Cuarto entregable de la tanda 1 (D-009): la ayuda contextual sobre controles compactos es el complemento natural de un kit con botones ícono-only, y su a11y (WCAG 1.4.13) es de las más incumplidas en tooltips caseros. [HU-007](../../../docs/product/epics/EP-002-kit-componentes/HU-007-tooltip.md) fue refinada con el PO el 2026-07-18 y hereda **todo** el patrón de overlays anclados de [ADR-014](../../../docs/architecture/adr/ADR-014-overlays-anclados-popover-api.md) — es el primer reuso del ADR y su validación.

## What Changes

- Nueva **directiva `DsTooltip`** (`[dsTooltip]`) — la **primera directiva del kit** (ADR-007 ya cubre su naming): texto string, triggers hover (con delay tokenizado, configurable) **y** foco (inmediato), cierre inmediato, WCAG 1.4.13 completo (ESC dismissable sin mover foco, hoverable, persistent), `role="tooltip"` + `aria-describedby` dinámico.
- Superficie visual como **componente interno no exportado** (`DsTooltipPanel`): una directiva no puede portar CSS; el panel lo encapsula y la API pública sigue siendo solo la directiva (detalle en design.md §1).
- Capa y posicionamiento por **ADR-014 reglas 1–6**: Popover API (`popover="manual"`, §2 del design) + fallback JS con 4 placements y flip.
- Nuevos tokens **`component.tooltip.*`**: `bg`/`text` **invertidos vía semantic** (`text.primary`/`bg.surface` — theme-aware con ~17:1 en los 4 themes), `delay` → `{motion.duration.slower}` (500ms), padding, radius, font-size, max-width, shadow, offset.
- Changesets: **minor** de components (DsTooltip) y **minor** de tokens (tokens nuevos).

## Capabilities

### New Capabilities

(ninguna — se extiende la existente)

### Modified Capabilities

- `components-package`: ADDED Requirement "Directiva DsTooltip" — API, triggers, 1.4.13, ARIA, placement y tokens, derivado 1:1 de los 8 CAs de HU-007.

## Impact

- **Código**: `packages/components/src/lib/tooltip/` (directiva pública + panel interno), `public-api.ts`, `packages/tokens/src/component/tooltip.json` (nuevo), story + demos en playground (botón ícono-only con su `aria-label` propio).
- **Dependencias**: ninguna nueva. jsdom: el polyfill de Popover API ya existe (aaa-016); los tests de delay usan fake timers.
- **Clasificación** (workflow add-component): overlay anclado **no modal** → ADR-014 sin re-decidir; no es form control ni control de acción (la directiva no altera la interactividad del anfitrión); sin iconos propios.
- **Sin ADR previsto**: valida ADR-014 en su segundo consumidor; si el reuso destapa un gap del patrón, se anota ahí (acción de seguimiento del propio ADR).

---
id: aaa-021
name: components-add-toast
type: change
status: archived
archived: 2026-07-18
modifies-specs:
  - components-package (ADDED: DsToastService + provideDsToasts)
  - design-tokens-package (MODIFIED: contraste AA extendido a borders de status — ejecuta tokens-fix-status-borders)
related-adrs:
  - ADR-007
  - ADR-012
  - ADR-014
---

# Proposal — components-add-toast

## Why

Quinto entregable de la tanda 1 (D-009): el feedback asíncrono (guardado, error de red, deshacer) es el único patrón del kit que hoy obliga al consumidor a inventar su propia solución — y los toasts caseros fallan sistemáticamente en lo mismo: anuncios a lectores de pantalla, timers que no pausan (WCAG 2.2.1) y errores que se esfuman antes de leerse. HU-008 fue refinada con el PO el 2026-07-18 (posición global por provider, danger persistente, acción única opcional, top layer).

## What Changes

- Nueva **`DsToastService`** — la **primera service del kit** (naming por ADR-007): `show({ message, variant, duration?, action? })` + atajos `success/info/warning/danger(message, options?)`; devuelve una referencia con `dismiss()`.
- **`provideDsToasts({ position })`**: posición global de la app (default `bottom-right`), nunca por toast.
- Stack en **top layer vía popover manual** (ADR-014, **tercer consumidor**): contenedor interno no exportado, visible sobre modales abiertos; `z-index.toast` sigue reservado a consumidores no-top-layer (nota de ADR-013).
- Comportamiento por variante: success/info/warning se auto-cierran (~5s tokenizado, `duration` ajusta, `0` persiste) con **timer pausable por hover y foco**; **danger persiste** hasta cierre manual y siempre muestra botón de cierre. `role="status"` vs `role="alert"`; el foco nunca se mueve al aparecer.
- **Acción única opcional** (label + callback): un botón alcanzable por teclado; activarlo ejecuta y cierra.
- Iconos por variante + X de cierre según ADR-012 (evita depender solo del color — WCAG 1.4.1).
- Nuevos tokens **`component.toast.*`** + **ejecuta `tokens-fix-status-borders`** (CA-008.7): `semantic.color.border.success/warning/info` `*-400` → `*-500` (light) y `*-800` → `*-400` (dark), mismo fix que `border.danger` en aaa-017, verificado por script en los 4 themes.
- Changesets: **minor** de components (DsToastService) y **minor** de tokens (tokens nuevos + fix de status borders). Con lockstep (ADR-015) el par sale como 0.3.0.

## Capabilities

### New Capabilities

(ninguna — se extiende la existente)

### Modified Capabilities

- `components-package`: ADDED Requirement "Sistema de toasts (DsToastService)" — API, posición por provider, auto-dismiss pausable, acción, ARIA, stack en top layer y tokens, derivado 1:1 de los 8 CAs de HU-008.
- `design-tokens-package`: MODIFIED Requirement "Contraste WCAG AA de tokens interactivos" — agrega los pares `border.success/warning/info` sobre `bg.surface` ≥ 3:1 en todos los themes.

## Impact

- **Código**: `packages/components/src/lib/toast/` (service + provider públicos, contenedor e item internos), `public-api.ts`, `packages/tokens/src/component/toast.json` (nuevo), `packages/tokens/src/semantic/color.json` + `theme/dark.json` (fix borders), story + demo en playground.
- **Dependencias**: ninguna nueva (`@lucide/angular` ya es peer por ADR-012).
- **Clasificación** (workflow add-component): overlay **no anclado** en top layer → ADR-014 aplica solo en su regla de capa (popover manual), sin posicionamiento anclado; no es form control; primera pieza cuyo entry point es una service.
- **Sin ADR previsto**: tercera validación de ADR-014 (capa) y reuso de ADR-012/ADR-011; si la service como entry point destapa una decisión de patrón (ej. convención de providers del kit), se evalúa ADR al cierre.

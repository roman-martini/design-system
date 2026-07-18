---
id: aaa-018
name: components-add-tabs
type: change
status: proposed
modifies-specs:
  - components-package (ADDED: DsTabs + DsTab)
  - design-tokens-package (sin delta de spec; alineación de valores en component.tabs)
related-adrs:
  - ADR-011
---

# Proposal — components-add-tabs

## Why

Tercer componente de la tanda 1 (D-009): alternar contenido en una misma pantalla es el patrón de organización más común después de los formularios, y su a11y (roving tabindex, ARIA tabs) es de las más fáciles de hacer mal a mano. [HU-006](../../../docs/product/epics/EP-002-kit-componentes/HU-006-tabs-navegacion.md) fue refinada con el PO el 2026-07-12 (las 3 variantes, activación automática, paneles con `hidden`, `[(value)]` por id) y tiene 8 CAs binarios.

## What Changes

- Nuevo componente **`DsTabs`** (`ds-tabs`): contenedor que renderiza el `tablist` a partir de los `DsTab` proyectados (patrón de registración padre-hijo del kit), con `[(value)]` (model string), `variant` (`underline | pills | contained`, default `underline`), `size` (`sm | md | lg`), activación automática y roving tabindex (un solo tab-stop).
- Nuevo componente **`DsTab`** (`ds-tab`): declara `value` (requerido), `label` (string del botón) y `disabled`; hostea su panel (`role="tabpanel"`, `hidden` cuando inactivo — el contenido conserva estado del DOM).
- **Alineación de tokens** `component.tabs.*`: `size.*.height` con px crudos (`"32px"`) → `{dimension.32/40/48}` (consistencia con input/select; sin cambio de valor emitido) + verificación de contraste por script de las 3 variantes.
- Tab deshabilitado con `aria-disabled` + guarda (rama botón de ADR-011 — el tab es un control de acción).
- Changesets: **minor** de components (DsTabs + DsTab) y **patch** de tokens (alineación sin cambio de valores).

## Capabilities

### New Capabilities

(ninguna — se extiende la existente)

### Modified Capabilities

- `components-package`: ADDED Requirements "Componente DsTabs" y "Componente DsTab" — API, teclado, ARIA APG, variantes, paneles y tokens, derivados 1:1 de los 8 CAs de HU-006.

## Impact

- **Código**: `packages/components/src/lib/tabs/` (nuevo, ambos componentes — misma convención que select/option: DsTab no existe sin DsTabs), `public-api.ts`, `packages/tokens/src/component/tabs.json` (alineación), story + demo en playground.
- **Dependencias**: ninguna nueva. Sin overlay (no aplica ADR-014). Sin jsdom polyfill (no usa APIs faltantes).
- **Clasificación** (workflow add-component): control de navegación local — no es form control (sin CVA: el valor activo es UI state, no dato de formulario); tab disabled → rama botón ADR-011; sin iconos propios.
- **Sin ADR previsto**: aplica patrones existentes (registración, roving tabindex documentado en el spec).

---
id: aaa-016
name: components-add-select
type: change
status: proposed
modifies-specs:
  - components-package (ADDED: DsSelect + DsOption)
related-adrs:
  - ADR-011
  - ADR-012
  - ADR-013
---

# Proposal — components-add-select

## Why

Selección de opciones es el gap más grande del kit para armar un formulario real ([HU-003](../../../docs/product/epics/EP-002-kit-componentes/HU-003-select-formularios.md), Refinada). La tanda 1 de expansión del kit fue aprobada por [D-009](../../../docs/product/decisiones.md) (2026-07-11) y Select es el primer componente porque su decisión de posicionamiento la reutiliza Tooltip (HU-007, hoy bloqueado por esto).

## What Changes

- Nuevo componente **`DsSelect`** (`ds-select`): combobox de selección única integrado a Angular Forms (CVA), patrón ARIA APG combobox + listbox, navegación por teclado completa, chevron `LucideChevronDown` (ADR-012).
- Nuevo componente **`DsOption`** (`ds-option`): opción proyectada dentro del select (patrón de registración padre-hijo ya probado en RadioGroup/Radio), con `value`, `disabled` propio y contenido custom.
- Nuevos tokens `component/select.json` (trigger, listbox, option) **referenciando semantic** — sin cambios en las reglas del package tokens.
- **Decisión de posicionamiento del dropdown** (detalle en design.md): Popover API nativa para la capa + estrategia de posicionamiento con fallback; sienta el patrón para overlays no modales → se promueve a **ADR-014** al archivar.
- Changesets: **minor** de `@romanmartinidev/components` (componentes nuevos) y **minor** de `@romanmartinidev/tokens` (tokens aditivos).

## Capabilities

### New Capabilities

(ninguna — se extiende la existente)

### Modified Capabilities

- `components-package`: ADDED Requirements "Componente DsSelect" y "Componente DsOption" — API, CVA, teclado, ARIA, iconografía, tokens, disabled y posicionamiento, derivados 1:1 de los CAs de HU-003.

## Impact

- **Código**: `packages/components/src/lib/select/` (nuevo), `public-api.ts`, `packages/tokens/src/component/select.json` (nuevo), story + demo en playground.
- **Dependencias**: ninguna nueva — `@lucide/angular` ya es peer (aaa-014); la evaluación de plataforma del posicionamiento busca explícitamente evitar `@floating-ui/dom` (criterio ADR-013).
- **Clasificación** (workflow add-component): form control → **CVA**; trigger sobre `<button>` → disabled con `aria-disabled` + guarda (caso híbrido de ADR-011, justificado en design.md §3); overlay **no modal** → evaluación de plataforma primero; consume iconos → ADR-012 §1.
- **Riesgo de test**: jsdom probablemente no implementa Popover API → polyfill mínimo en `test-setup.ts` (mismo precedente que `<dialog>`, ADR-013 §6).

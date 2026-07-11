---
id: aaa-017
name: components-add-input
type: change
status: archived
archived: 2026-07-11
modifies-specs:
  - components-package (ADDED: DsInput)
  - design-tokens-package (sin delta de spec; fix de valor en component.input)
related-adrs:
  - ADR-011
  - ADR-012
  - ADR-014
---

# Proposal — components-add-input

## Why

Entrada de texto es, junto con Select (`aaa-016`), el mínimo de cualquier formulario real — segundo componente de la tanda 1 aprobada por [D-009](../../../docs/product/decisiones.md). [HU-005](../../../docs/product/epics/EP-002-kit-componentes/HU-005-input-textfield.md) fue refinada con el PO el 2026-07-11 (field completo, tipos sin `number`, slots pasivos, invalid automático) y tiene 8 CAs binarios listos para convertirse en scenarios.

## What Changes

- Nuevo componente **`DsInput`** (`ds-input`): **field completo** — label, `<input>` nativo, hint y error asociados programáticamente — con CVA, tipos `text | email | password | tel | url | search`, estado invalid automático desde el NgControl (`invalid && touched`) con override manual, `disabled` **nativo** (ADR-011 rama form control — el control operable es un `<input>` real, a diferencia de Select), slots pasivos `[ds-input-prefix]`/`[ds-input-suffix]` y sizes por tokens.
- **Fix de token**: `component.input.text-placeholder` → `{semantic.color.text.secondary}` (hoy `text.tertiary`, que falla AA — mismo ajuste que hizo Select en `aaa-016`). Los tokens `component.input.*` restantes ya existen desde el bootstrap; no se crean nuevos.
- Changesets: **minor** de `@romanmartinidev/components` (componente nuevo) y **patch** de `@romanmartinidev/tokens` (fix de valor).

## Capabilities

### New Capabilities

(ninguna — se extiende la existente)

### Modified Capabilities

- `components-package`: ADDED Requirement "Componente DsInput" — API, CVA, anatomía accesible del field, tipos, estados, tokens y slots, derivado 1:1 de los 8 CAs de HU-005.

## Impact

- **Código**: `packages/components/src/lib/input/` (nuevo), `public-api.ts`, `packages/tokens/src/component/input.json` (1 valor), story + demo en playground (form combinado con Select/Checkbox).
- **Dependencias**: ninguna nueva.
- **Clasificación** (workflow add-component): form control con `<input>` nativo → CVA + disabled nativo (ADR-011); sin overlay (no aplica ADR-014 salvo el precedente de reenvío de `aria-label`); iconos solo si el consumidor los proyecta (ADR-012).
- **Decisión técnica** (design.md): cómo leer el estado del NgControl para el invalid automático sin ciclo de DI (el patrón `NG_VALUE_ACCESSOR` + `inject(NgControl)` es circular).

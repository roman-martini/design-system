---
id: aaa-036
name: components-add-textarea
type: change
status: archived
archived: 2026-07-26
introduces-specs:
  - component-textarea
modifies-specs:
  - design-tokens-package (sin delta de spec; agrega component.textarea.*)
related-adrs:
  - ADR-004
  - ADR-011
  - ADR-020
related-decisions:
  - D-014
  - D-017
---

# Proposal — components-add-textarea

# Why

Quinta entrega de la **tanda 3** (D-014): la referencia moder-minimal usa un campo multilínea (img 2, "Notes"). Hoy el dev que necesita texto largo no tiene un field accesible del kit. HU-024 fue refinada con el PO el 2026-07-23: **`DsTextarea` sobre una base compartida `DsFieldBase`** extraída de `DsInput`. Respalda la **prioridad 1** (misma a11y/validación que Input) y **D-017** (cero duplicación, patrón reutilizable para futuros form fields).

# What Changes

- Nueva base **`DsFieldBase`** (`@Directive()` abstracto, interno): concentra la lógica de field que hoy vive en `DsInput` — CVA por auto-registración de `NgControl`, `model` `value`/`disabled`, inputs `label`/`hint`/`error`/`placeholder`/`invalid`/`size`, aliases `aria-*`, IDs de a11y, `isInvalid`/`showError`/`describedBy`, `onInput`/`onBlur`.
- **`DsInput` refactorizado** para extender `DsFieldBase` — **sin cambio de API pública** (mismo selector, inputs, comportamiento). Su suite de tests permanece verde como prueba de no-regresión.
- Nuevo **`DsTextarea`** (`ds-textarea`, ADR-007) que extiende `DsFieldBase`: renderiza `<textarea>` con `rows` (default 3) y `resize` (`vertical` default | `none`), integrado a Forms.
- **CSS de field compartido** (`field.css`, clases `.ds-field__*`) usado por ambos vía `styleUrls`, reutilizando tokens `component.input.*`; nuevo `component.textarea.*` para lo específico (min-height, padding vertical).
- Spec **`component-textarea` nuevo** (ADR-018). Showcase con el campo Notes de la referencia. `DsFieldBase` es interno (no se exporta ni tiene spec propia).
- Changesets: **minor** de components (DsTextarea + refactor interno de Input) y **minor** de tokens. Lockstep (ADR-015); veto npm vigente.
- **Generará [ADR-020]** al archivarse (base de form fields — patrón transversal ≥2 componentes).

# Capabilities

## New Capabilities

- `component-textarea`: contrato de `DsTextarea` — field multilínea con rows/resize, CVA, label/hint/error/invalid compartidos, a11y. Derivado 1:1 de los CAs de HU-024.

## Modified Capabilities

- `design-tokens-package`: sin delta de spec — `component/textarea.json` nuevo cumple la jerarquía ADR-003.
- `component-input`: **sin delta** — el refactor es interno (API y comportamiento idénticos); la no-regresión la prueba su suite de tests.

# Alternativas evaluadas

Descartadas en el refinamiento con el PO (2026-07-23, decisiones en HU-024):

1. **`multiline` en `DsInput`** (render condicional de `<textarea>`) — descartada: DRY pero la API `<ds-input multiline>` es semánticamente confusa (un textarea no es un input) y sobrecarga la identidad del componente.
2. **`DsTextarea` autónomo que duplica el field wrapper** — descartada por D-017: copia label/hint/error/CVA/IDs en dos lugares; dos puntos de mantenimiento y de deriva.
3. **Base compartida `DsFieldBase`** (elegida) — API limpia (`<ds-textarea>`), cero duplicación, y deja el patrón listo para futuros form fields; costo: refactor interno de `DsInput` (sin romper su API).

# Impact

- **Código**: `packages/components/src/lib/field/` (base + field.css), `lib/input/` (extiende la base; template usa `.ds-field__*`), `lib/textarea/` (nuevo), `public-api.ts` (+`DsTextarea`, `DsTextareaResize`), `packages/tokens/src/component/textarea.json` (nuevo), showcase.
- **Riesgo controlado**: el refactor de `DsInput` es interno; su suite de tests actúa de red de no-regresión (debe seguir 100% verde).
- **Dependencias**: ninguna nueva.
- **ADR**: genera ADR-020 al cerrar (base de form fields).

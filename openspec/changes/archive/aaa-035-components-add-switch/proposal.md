---
id: aaa-035
name: components-add-switch
type: change
status: archived
archived: 2026-07-23
introduces-specs:
  - component-switch
modifies-specs:
  - design-tokens-package (sin delta de spec; extiende component.switch del bootstrap: +lg, bg-off themable)
related-adrs:
  - ADR-011
  - ADR-007
related-decisions:
  - D-014
  - D-017
---

# Proposal — components-add-switch

# Why

Cuarta entrega de la **tanda 3** (D-014): la referencia moder-minimal usa toggles on/off (img 1) y el bloque Cookie Settings (img 4) que hoy el consumidor arma a mano. HU-023 fue refinada con el PO el 2026-07-22 (base `<input type="checkbox" role="switch">` + CVA, sizes sm/md/lg, label opcional). Respalda la **prioridad 1** (a11y de plataforma + Forms nativos) y ejecuta D-007. Es la contraparte de acción inmediata del `DsCheckbox` (selección en un form).

# What Changes

- Nuevo **`DsSwitch`** (`ds-switch`, ADR-007): standalone + OnPush, `ControlValueAccessor` — mismo patrón que `DsCheckbox`/`DsRadio` (`model` `checked`/`disabled`, `setDisabledState`, toggle nativo por Space).
- Base **`<input type="checkbox" role="switch">`** con `aria-checked`; track + thumb estilizados. Disabled **nativo** (form control, ADR-011).
- **Sizes** `sm | md | lg` (default `md`) e input **`label`** opcional (clickable), consistente con `DsCheckbox`.
- **Fixes D-017 al `component/switch.json` del bootstrap**: (1) agregar los tokens de size **`lg`** (venía `sm/md`); (2) `bg-off`/`bg-off-hover` pasan a referenciar **semantic** (themable en dark; hoy son primitives `neutral.300/400`). Transición del thumb con tokens de motion + `prefers-reduced-motion`.
- **Gate**: el estado on/off se distingue ≥3:1 (WCAG 1.4.11) y el thumb es visible sobre el track on — verificado por script en los 4 themes.
- Spec **`component-switch` nuevo** (ADR-018). Showcase con el bloque Cookie Settings + estados y sizes.
- Changesets: **minor** de components (componente nuevo) y **minor** de tokens (switch extendido). Lockstep (ADR-015); veto npm vigente.

# Capabilities

## New Capabilities

- `component-switch`: contrato de `DsSwitch` — CVA + `role="switch"`, sizes, label, track/thumb tokenizados con reduced-motion, distinguibilidad de estados por gate. Derivado 1:1 de los CAs de HU-023.

## Modified Capabilities

- `design-tokens-package`: sin delta de spec — `component/switch.json` se extiende (lg + bg-off themable), cumpliendo la jerarquía ADR-003.

# Alternativas evaluadas

Descartadas en el refinamiento con el PO (2026-07-22, decisiones en HU-023):

1. **`<button role="switch" aria-checked>`** — descartada: perdería la integración de Angular Forms nativa (CVA sobre `<input>`) y el toggle por teclado gratis, sin beneficio. La semántica de plataforma es la preferencia del repo (ADR-011/013/014).
2. **`aria-disabled` en vez de disabled nativo** — descartada: es un form control; el `disabled` nativo es semánticamente correcto y anunciado en contexto de formulario (ratificado por ADR-011 para checkbox/radio).
3. **Dejar el switch del bootstrap en sm/md con `bg-off` primitive** — descartada por D-017 (sin medias tintas): faltaría `lg` (inconsistente con Checkbox) y el off no adaptaría a dark. Se completa.

# Impact

- **Código**: `packages/components/src/lib/switch/` (componente + css + spec + stories), `public-api.ts` (+`DsSwitch`, `DsSwitchSize`), `packages/tokens/src/component/switch.json` (extendido), `semantic`/`theme` no se tocan (bg-off referencia semantic existente), página del showcase.
- **Dependencias**: ninguna nueva.
- **Clasificación**: form control (CVA) — reutiliza el molde de `DsCheckbox`.
- **Sin ADR nuevo**: reutiliza ADR-011 (disabled nativo de form controls); tokens reversibles.

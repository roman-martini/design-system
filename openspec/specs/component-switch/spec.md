---
name: component-switch
type: spec
status: active
created: 2026-07-23
---

# component-switch

## Purpose

Contrato de `DsSwitch`: toggle on/off de acción inmediata integrado a Angular Forms (`ControlValueAccessor`), con sizes, label opcional y estado comunicado por la posición del thumb.

## Requirements

### Requirement: Switch/Toggle (DsSwitch)

El package SHALL exponer `DsSwitch` (`ds-switch`, naming por ADR-007) junto con el type `DsSwitchSize`. El componente SHALL implementar `ControlValueAccessor` sobre un `<input type="checkbox" role="switch">`, con `model` `checked` (default `false`) y `disabled` (default `false`), input `label` (default `''`) y `size` (`sm | md | lg`, default `md`). El toggle SHALL responder a click y Space; el `disabled` SHALL ser nativo (form control, ADR-011). Track y thumb SHALL salir de tokens `component.switch.*` por size, con la transición respetando `prefers-reduced-motion`. El estado on/off SHALL comunicarse por la posición del thumb (indicador no-cromático), con el thumb sobre el track encendido cumpliendo ≥3:1 (WCAG 1.4.11) verificado por gate.

#### Scenario: control accesible con CVA (CA-023.1)

- **GIVEN** un `<ds-switch>` (standalone, OnPush) enlazado por `[(checked)]` o `formControl`
- **WHEN** el usuario hace click o presiona Space
- **THEN** el `<input>` interno SHALL tener `type="checkbox"` y `role="switch"` con `aria-checked` reflejando el estado
- **AND** el valor SHALL propagarse por el `ControlValueAccessor` (`onChange`/`onTouched`)

#### Scenario: sizes y visual tokenizado con reduced-motion (CA-023.2)

- **GIVEN** un switch con `size` en `sm | md | lg` (default `md`)
- **WHEN** se renderiza
- **THEN** track (width/height), thumb (size) y el desplazamiento SHALL salir de `component.switch.*` por size
- **AND** la transición del thumb SHALL usar tokens de motion y SHALL existir un bloque `@media (prefers-reduced-motion: reduce)` que la anula

#### Scenario: estado distinguible y disabled (CA-023.3)

- **WHEN** se evalúa el thumb sobre el track encendido en los 4 themes
- **THEN** `thumb.bg` vs `bg-on` SHALL cumplir ≥3:1 (gate) y el estado on/off SHALL comunicarse por la posición del thumb (indicador no-cromático); `bg-off` SHALL ser un token themable
- **GIVEN** un switch `disabled`
- **THEN** el toggle SHALL estar bloqueado y el control SHALL reflejarlo (opacidad reducida, `disabled` nativo)

#### Scenario: label opcional clickable (CA-023.4)

- **GIVEN** un switch con `label`
- **WHEN** se renderiza
- **THEN** el label SHALL estar asociado al input y hacer toggle al clickearse
- **AND** el switch SHALL conservar su nombre accesible

#### Scenario: estilos exclusivamente por tokens (CA-023.5)

- **WHEN** se inspecciona el CSS del componente
- **THEN** todo valor SHALL referenciarse vía `var(--ds-*)` (`component.switch.*`)
- **AND** SHALL NO existir hex codes ni colores literales

#### Scenario: exportado desde public-api.ts (CA-023.6)

- **WHEN** se inspecciona `packages/components/src/public-api.ts`
- **THEN** SHALL contener `export * from './lib/switch';`
- **AND** un consumidor SHALL poder importar `DsSwitch` y `DsSwitchSize`

#### Scenario: tests del comportamiento con Vitest (CA-023.1–023.5)

- **WHEN** se ejecuta `pnpm -F @romanmartinidev/components test`
- **THEN** Vitest SHALL cubrir: `role="switch"` + toggle por el input, integración `[formControl]` (setValue/toggle/disable), CVA (`writeValue`/`onChange`/`onTouched`/`setDisabledState`), reflejo de `size` en el host, label asociado, y no-hardcodes en el CSS fuente

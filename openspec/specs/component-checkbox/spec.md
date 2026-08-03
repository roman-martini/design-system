---
name: component-checkbox
type: spec
status: active
created: 2026-07-20
---

# component-checkbox

## Purpose

Contrato de `DsCheckbox`: estados checked/indeterminate/disabled, integración como ControlValueAccessor y accesibilidad (`aria-checked`, teclado).

## Requirements

### Requirement: Componente Checkbox

El package SHALL exponer `DsCheckbox` (selector `ds-checkbox`) cumpliendo las convenciones de [ADR-004](../../../docs/architecture/adr/ADR-004-arquitectura-components.md) (arquitectura) y [ADR-007](../../../docs/architecture/adr/ADR-007-naming-prefijos.md) (naming): standalone, OnPush, signal-based API, prefix `Ds` en class y `ds-` en selector. El componente SHALL implementar `ControlValueAccessor` para integración nativa con Angular Forms (reactivos y template-driven). SHALL soportar estado `checked` (model two-way), `indeterminate` (input one-way), `disabled` (model two-way; CVA puede mutarlo), `label` (input string fallback), `size` ('sm' | 'md' | 'lg' con default 'md').

#### Scenario: estructura de archivos sigue ADR-004 + ADR-007

- **WHEN** se inspecciona `packages/components/src/lib/checkbox/`
- **THEN** existen: `checkbox.ts`, `checkbox.html`, `checkbox.css`, `checkbox.spec.ts`, `checkbox.stories.ts`, `index.ts`
- **AND** la class se llama `DsCheckbox` y el selector es `ds-checkbox`

#### Scenario: two-way binding con [(checked)]

- **GIVEN** un consumidor con `<ds-checkbox [(checked)]="state()" />` y `state = signal(false)`
- **WHEN** el usuario hace click en el checkbox
- **THEN** `state()` SHALL pasar a `true`
- **AND** otro click SHALL volverlo a `false`

#### Scenario: integración con FormControl reactivo

- **GIVEN** un consumidor con `<ds-checkbox [formControl]="ctrl" />` y `ctrl = new FormControl(false)`
- **WHEN** se ejecuta `ctrl.setValue(true)`
- **THEN** el checkbox renderizado SHALL aparecer marcado
- **AND** un click del usuario SHALL actualizar `ctrl.value` a `false`

#### Scenario: setDisabledState del CVA

- **GIVEN** un Checkbox dentro de un FormControl
- **WHEN** se ejecuta `ctrl.disable()`
- **THEN** el `<input type="checkbox">` interno SHALL tener `disabled` true
- **AND** clicks en el host SHALL ser ignorados

#### Scenario: indeterminate con aria-checked="mixed"

- **GIVEN** `<ds-checkbox [indeterminate]="true" [(checked)]="state" />`
- **WHEN** se inspecciona el DOM renderizado
- **THEN** el `<input type="checkbox">` SHALL tener `indeterminate` propiedad true (sincronizada vía `effect()`)
- **AND** el host element SHALL tener `aria-checked="mixed"`
- **AND** visualmente SHALL renderizarse con un guion (-) en vez del check (✓)

#### Scenario: label via input string

- **GIVEN** `<ds-checkbox label="Acepto términos" />` sin contenido entre tags
- **WHEN** se renderiza
- **THEN** el componente SHALL mostrar el texto "Acepto términos" como label
- **AND** el label SHALL estar asociado al input por estructura `<label><input>...</label>`

#### Scenario: label via <ng-content> tiene precedencia sobre input string

- **GIVEN** `<ds-checkbox label="ignored">Acepto los <a href="/tos">términos</a></ds-checkbox>`
- **WHEN** se renderiza
- **THEN** el componente SHALL mostrar el contenido proyectado (con el link)
- **AND** SHALL ignorar el input string `label`

#### Scenario: sizes sm/md/lg consumen tokens

- **WHEN** se renderiza `<ds-checkbox size="sm" />`, `size="md"`, y `size="lg"`
- **THEN** el box visible del input SHALL escalar entre tres tamaños distintos (sm < md < lg)
- **AND** los tamaños SHALL referenciar variables `var(--ds-dimension-*)` o `var(--ds-semantic-*)` exclusivamente (NO valores px hardcoded en el CSS)

#### Scenario: focus visible respeta accesibilidad WCAG

- **GIVEN** un Checkbox renderizado
- **WHEN** el usuario navega con Tab y enfoca el checkbox
- **THEN** SHALL aplicarse `box-shadow: var(--ds-semantic-shadow-focus)` (ring de focus alrededor del input)
- **AND** SHALL desaparecer el outline default del browser (no doble ring)

#### Scenario: respeta variant disabled

- **GIVEN** `<ds-checkbox [disabled]="true" [(checked)]="state" />` con `state = signal(false)`
- **WHEN** el usuario hace click
- **THEN** `state()` SHALL permanecer en `false`
- **AND** el cursor sobre el host SHALL ser `not-allowed`
- **AND** el opacity SHALL aplicarse via token (`var(--ds-opacity-50)` o equivalente semántico)

#### Scenario: exportado desde public-api.ts

- **WHEN** se inspecciona `packages/components/src/public-api.ts`
- **THEN** SHALL contener `export * from './lib/checkbox';`
- **AND** un consumidor SHALL poder hacer `import { DsCheckbox, type DsCheckboxSize } from '@romanmartinidev/components';`

### Requirement: Estilos del checkbox por tokens de componente

`DsCheckbox` SHALL estilizarse con los tokens `component.checkbox.*` —fondos marcado y sin marcar, borde, radius, color de la marca y del label— y NO SHALL consumir `semantic.*` ni primitives directamente para esos valores, según la jerarquía de ADR-003 que exige `design-tokens-package`. El color de la marca (checkmark e indeterminate) SHALL salir de `component.checkbox.check-color` y SHALL adaptarse al theme, de modo que conserve contraste sobre el fondo del control marcado en todos los themes publicados.

#### Scenario: la marca del control sale de un token theme-aware

- **WHEN** se inspecciona el CSS del checkbox
- **THEN** el color del checkmark y del estado indeterminate SHALL referenciarse vía `var(--ds-component-checkbox-check-color)`
- **AND** SHALL NO existir literales de color (`white`, hex, `rgb(...)`) en ninguna parte del archivo, incluido el interior de un SVG embebido
- **GIVEN** el theme oscuro, donde el fondo del control marcado aclara
- **THEN** la marca SHALL cambiar de color con el theme, conservando contraste contra ese fondo

#### Scenario: los tokens del componente se consumen

- **WHEN** se inspecciona el CSS del checkbox
- **THEN** fondo, borde, radius, tamaños y color de label SHALL referenciarse vía `var(--ds-component-checkbox-*)`
- **AND** SHALL NO consumirse `semantic.*` ni primitives directamente para esos valores
- **AND** todo token de `component.checkbox.*` que describa un estado que el componente renderiza SHALL tener consumidor en el CSS

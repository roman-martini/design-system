## ADDED Requirements

### Requirement: Componente Checkbox

El package SHALL exponer `CheckboxComponent` (selector `rmd-checkbox`) cumpliendo las convenciones de [ADR-004](../../docs/architecture/adr/ADR-004-arquitectura-components.md): standalone, OnPush, signal-based API. El componente SHALL implementar `ControlValueAccessor` para integración nativa con Angular Forms (reactivos y template-driven). SHALL soportar estado `checked` (model two-way), `indeterminate` (input one-way), `disabled` (model two-way; CVA puede mutarlo), `label` (input string fallback), `size` ('sm' | 'md' | 'lg' con default 'md').

#### Scenario: estructura de archivos sigue ADR-004

- **WHEN** se inspecciona `packages/components/src/lib/checkbox/`
- **THEN** existen: `checkbox.component.ts`, `checkbox.component.css`, `checkbox.component.spec.ts`, `checkbox.stories.ts`, `index.ts`
- **AND** la class se llama `CheckboxComponent` y el selector es `rmd-checkbox`

#### Scenario: two-way binding con [(checked)]

- **GIVEN** un consumidor con `<rmd-checkbox [(checked)]="state()" />` y `state = signal(false)`
- **WHEN** el usuario hace click en el checkbox
- **THEN** `state()` SHALL pasar a `true`
- **AND** otro click SHALL volverlo a `false`

#### Scenario: integración con FormControl reactivo

- **GIVEN** un consumidor con `<rmd-checkbox [formControl]="ctrl" />` y `ctrl = new FormControl(false)`
- **WHEN** se ejecuta `ctrl.setValue(true)`
- **THEN** el checkbox renderizado SHALL aparecer marcado
- **AND** un click del usuario SHALL actualizar `ctrl.value` a `false`

#### Scenario: setDisabledState del CVA

- **GIVEN** un Checkbox dentro de un FormControl
- **WHEN** se ejecuta `ctrl.disable()`
- **THEN** el `<input type="checkbox">` interno SHALL tener `disabled` true
- **AND** clicks en el host SHALL ser ignorados

#### Scenario: indeterminate con aria-checked="mixed"

- **GIVEN** `<rmd-checkbox [indeterminate]="true" [(checked)]="state" />`
- **WHEN** se inspecciona el DOM renderizado
- **THEN** el `<input type="checkbox">` SHALL tener `indeterminate` propiedad true (sincronizada vía `effect()`)
- **AND** el host element SHALL tener `aria-checked="mixed"`
- **AND** visualmente SHALL renderizarse con un guion (-) en vez del check (✓)

#### Scenario: label via input string

- **GIVEN** `<rmd-checkbox label="Acepto términos" />` sin contenido entre tags
- **WHEN** se renderiza
- **THEN** el componente SHALL mostrar el texto "Acepto términos" como label
- **AND** el label SHALL estar asociado al input por `<label for>` o estructura `<label><input>...</label>`

#### Scenario: label via <ng-content> tiene precedencia sobre input string

- **GIVEN** `<rmd-checkbox label="ignored">Acepto los <a href="/tos">términos</a></rmd-checkbox>`
- **WHEN** se renderiza
- **THEN** el componente SHALL mostrar el contenido proyectado (con el link)
- **AND** SHALL ignorar el input string `label`

#### Scenario: sizes sm/md/lg consumen tokens

- **WHEN** se renderiza `<rmd-checkbox size="sm" />`, `size="md"`, y `size="lg"`
- **THEN** el box visible del input SHALL escalar entre tres tamaños distintos (sm < md < lg)
- **AND** los tamaños SHALL referenciar variables `var(--ds-semantic-space-*)` exclusivamente (NO valores px hardcoded en el CSS)

#### Scenario: focus visible respeta accesibilidad WCAG

- **GIVEN** un Checkbox renderizado
- **WHEN** el usuario navega con Tab y enfoca el checkbox
- **THEN** SHALL aplicarse `box-shadow: var(--ds-semantic-shadow-focus)` (ring de 3px alrededor del input)
- **AND** SHALL desaparecer el outline default del browser (no doble ring)

#### Scenario: respeta variant disabled

- **GIVEN** `<rmd-checkbox [disabled]="true" [(checked)]="state" />` con `state = signal(false)`
- **WHEN** el usuario hace click
- **THEN** `state()` SHALL permanecer en `false`
- **AND** el cursor sobre el host SHALL ser `not-allowed`
- **AND** el opacity SHALL aplicarse via `var(--ds-opacity-50)`

#### Scenario: exportado desde public-api.ts

- **WHEN** se inspecciona `packages/components/src/public-api.ts`
- **THEN** SHALL contener `export * from './lib/checkbox';`
- **AND** un consumidor SHALL poder hacer `import { CheckboxComponent } from '@romanmartinidev/components';`

### Requirement: @angular/forms como peerDependency

El package `@romanmartinidev/components/package.json` SHALL declarar `@angular/forms` en `peerDependencies` con rango `^21.0.0` cuando expone componentes que implementan `ControlValueAccessor`. Si no se declara, el consumidor recibe warning de peer dep faltante.

#### Scenario: peerDependencies incluye @angular/forms

- **WHEN** se inspecciona `packages/components/package.json` campo `peerDependencies`
- **THEN** SHALL contener `"@angular/forms": "^21.0.0"`

#### Scenario: warning si consumidor no tiene @angular/forms

- **GIVEN** un consumidor sin `@angular/forms` instalado
- **WHEN** se ejecuta `npm install @romanmartinidev/components`
- **THEN** npm SHALL emitir warning de peer dep faltante

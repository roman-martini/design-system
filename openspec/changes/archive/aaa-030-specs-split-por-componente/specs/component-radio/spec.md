## ADDED Requirements

### Requirement: Componente DsRadioGroup

El package SHALL exponer `DsRadioGroup` (selector `ds-radio-group`) que agrupa componentes `DsRadio` hijos para representar una selección única. Sigue las convenciones de [ADR-004](../../../docs/architecture/adr/ADR-004-arquitectura-components.md) (arquitectura) y [ADR-007](../../../docs/architecture/adr/ADR-007-naming-prefijos.md) (naming). El componente SHALL implementar `ControlValueAccessor` para integración con Angular Forms reactivos y template-driven. SHALL soportar `value` (model two-way con tipo genérico), `name` (input opcional), `disabled` (model two-way).

#### Scenario: estructura de archivos

- **WHEN** se inspecciona `packages/components/src/lib/radio-group/`
- **THEN** existen `radio-group.ts`, `radio-group.html`, `radio-group.css`, `radio-group.spec.ts`, `radio-group.stories.ts`, `index.ts`
- **AND** la class se llama `DsRadioGroup` y el selector es `ds-radio-group`

#### Scenario: selección única entre radios hijos

- **GIVEN** un `<ds-radio-group>` con 3 `<ds-radio>` hijos de valores `'a'`, `'b'`, `'c'`
- **WHEN** el usuario hace click en el radio con valor `'b'`
- **THEN** el valor del group SHALL cambiar a `'b'`
- **AND** solo el radio con valor `'b'` SHALL estar marcado como seleccionado
- **AND** los radios con valor `'a'` y `'c'` SHALL aparecer no seleccionados

#### Scenario: two-way binding con [(value)]

- **GIVEN** un consumidor con `<ds-radio-group [(value)]="state.framework">` y `state.framework = signal('react')`
- **WHEN** el componente se renderiza
- **THEN** el radio hijo con value `'react'` SHALL aparecer seleccionado
- **AND** si el usuario hace click en otro radio, el signal del consumidor SHALL actualizarse

#### Scenario: integración con FormControl reactivo

- **GIVEN** un consumidor con `<ds-radio-group [formControl]="ctrl">` y `ctrl = new FormControl('angular')`
- **WHEN** el componente se renderiza
- **THEN** el radio hijo con value `'angular'` SHALL aparecer seleccionado
- **AND** si el usuario hace click en otro radio, `ctrl.value` SHALL actualizarse al valor del radio clickeado

#### Scenario: setDisabledState del CVA propaga a los radios hijos

- **GIVEN** un `<ds-radio-group [formControl]="ctrl">` con 3 radios hijos
- **WHEN** el consumidor ejecuta `ctrl.disable()`
- **THEN** los 3 radios SHALL comportarse como deshabilitados
- **AND** clicks sobre cualquier radio NO SHALL cambiar el valor del group

#### Scenario: name auto-generado para grupos sin name explícito

- **GIVEN** dos `<ds-radio-group>` distintos en la misma página, ninguno con input `name` explícito
- **WHEN** ambos se renderizan
- **THEN** cada radio hijo SHALL tener un atributo `name` heredado de su group
- **AND** los `name` de ambos grupos SHALL ser distintos para evitar agrupación accidental a nivel de form submission HTML

#### Scenario: name explícito sobrescribe el auto-generado

- **GIVEN** un `<ds-radio-group name="custom-name">`
- **WHEN** se renderiza
- **THEN** los radios hijos SHALL tener `name="custom-name"`

#### Scenario: keyboard navigation flecha derecha

- **GIVEN** un `<ds-radio-group>` con foco en el primer radio
- **WHEN** el usuario presiona `ArrowRight` o `ArrowDown`
- **THEN** el foco SHALL moverse al siguiente radio habilitado del group
- **AND** ese radio SHALL ser seleccionado automáticamente
- **AND** el valor del group SHALL reflejarse al value de ese radio

#### Scenario: keyboard navigation flecha izquierda

- **GIVEN** un `<ds-radio-group>` con foco en el segundo radio
- **WHEN** el usuario presiona `ArrowLeft` o `ArrowUp`
- **THEN** el foco SHALL moverse al anterior radio habilitado
- **AND** ese radio SHALL ser seleccionado automáticamente

#### Scenario: keyboard navigation Home y End

- **GIVEN** un `<ds-radio-group>` con foco en cualquier radio
- **WHEN** el usuario presiona `Home`
- **THEN** el foco y selección SHALL ir al primer radio habilitado del group
- **WHEN** el usuario presiona `End`
- **THEN** el foco y selección SHALL ir al último radio habilitado del group

#### Scenario: keyboard navigation salta radios deshabilitados

- **GIVEN** un `<ds-radio-group>` con 3 radios donde el segundo está deshabilitado
- **WHEN** el foco está en el primero y el usuario presiona `ArrowRight`
- **THEN** el foco SHALL saltar directamente al tercer radio
- **AND** el segundo radio NO SHALL recibir foco ni selección

#### Scenario: ARIA role radiogroup

- **WHEN** se inspecciona el DOM del `<ds-radio-group>` renderizado
- **THEN** el host element SHALL tener `role="radiogroup"`
- **AND** si el consumidor proveyó `aria-label` o `aria-labelledby`, SHALL pasarse al host

#### Scenario: igualdad por referencia para valores no primitivos

- **GIVEN** un `<ds-radio-group [(value)]="selected()">` con radios cuyos `value` son objects `{ id: 1 }`, `{ id: 2 }`, `{ id: 3 }`
- **WHEN** el consumidor asigna a `selected` el mismo objeto `{ id: 2 }` que un radio expone
- **THEN** ese radio SHALL aparecer seleccionado
- **AND** si el consumidor asigna `{ id: 2 }` como objeto nuevo (no la misma referencia), ningún radio SHALL aparecer seleccionado (comparación por referencia)

#### Scenario: exportado desde public-api.ts

- **WHEN** se inspecciona `packages/components/src/public-api.ts`
- **THEN** SHALL contener `export * from './lib/radio-group';`
- **AND** un consumidor SHALL poder hacer `import { DsRadioGroup } from '@romanmartinidev/components'`

### Requirement: Componente DsRadio

El package SHALL exponer `DsRadio` (selector `ds-radio`) que representa una opción de selección única dentro de un `DsRadioGroup` ancestro, o como radio standalone con output propio. Sigue las convenciones de ADR-004 y ADR-007: standalone, OnPush, signal-based API, sin sufijo `Component`. SHALL soportar `value` (input requerido, genérico), `disabled` (input boolean), `label` (input string fallback), `size` (`'sm' | 'md' | 'lg'` con default `'md'`), slot `<ng-content>` para custom content.

#### Scenario: estructura de archivos

- **WHEN** se inspecciona `packages/components/src/lib/radio/`
- **THEN** existen `radio.ts`, `radio.html`, `radio.css`, `radio.spec.ts`, `radio.stories.ts`, `index.ts`
- **AND** la class se llama `DsRadio` y el selector es `ds-radio`

#### Scenario: renderiza input type radio

- **WHEN** se renderiza un `<ds-radio value="a">`
- **THEN** el DOM SHALL contener un `<input type="radio">`
- **AND** el host element SHALL tener `role="radio"` (o el `<input>` lo SHALL tener intrínsecamente)

#### Scenario: label via input string

- **GIVEN** `<ds-radio value="a" label="Opción A">` sin contenido entre tags
- **WHEN** se renderiza
- **THEN** el componente SHALL mostrar el texto "Opción A" como label
- **AND** el label SHALL estar asociado al input (click en el label togglea el input)

#### Scenario: label via slot ng-content tiene precedencia sobre input string

- **GIVEN** `<ds-radio value="a" label="ignored">Acepto los <a href="/tos">términos</a></ds-radio>`
- **WHEN** se renderiza
- **THEN** el componente SHALL mostrar el contenido proyectado (con el link)
- **AND** SHALL ignorar el input string `label`

#### Scenario: sizes sm/md/lg consumen tokens

- **WHEN** se renderiza `<ds-radio size="sm">`, `size="md"`, y `size="lg"`
- **THEN** el círculo visible del radio SHALL escalar entre tres tamaños distintos (sm < md < lg)
- **AND** los tamaños SHALL referenciar variables `var(--ds-dimension-*)` o `var(--ds-semantic-*)` exclusivamente, sin valores px hardcoded en el CSS

#### Scenario: focus visible respeta accesibilidad WCAG

- **GIVEN** un `<ds-radio>` renderizado
- **WHEN** el usuario lo enfoca por teclado
- **THEN** SHALL aplicarse `box-shadow: var(--ds-semantic-shadow-focus)` (ring de focus alrededor del input)
- **AND** SHALL desaparecer el outline default del browser para evitar doble ring

#### Scenario: standalone emite selected

- **GIVEN** un `<ds-radio value="opt-a" (selected)="handle($event)">` que NO está dentro de un `<ds-radio-group>`
- **WHEN** el usuario hace click en el radio
- **THEN** el output `selected` SHALL emitir con el value del radio (`'opt-a'`)

#### Scenario: dentro de un group el output selected no se emite

- **GIVEN** un `<ds-radio value="a" (selected)="handle($event)">` que vive dentro de un `<ds-radio-group>`
- **WHEN** el usuario hace click en el radio
- **THEN** el group SHALL actualizar su `value`
- **AND** el output `selected` del radio NO SHALL emitir (el group es el responsable de la selección)

#### Scenario: respeta disabled propio

- **GIVEN** un `<ds-radio value="a" [disabled]="true">`
- **WHEN** el usuario hace click
- **THEN** el radio SHALL permanecer no seleccionado
- **AND** el cursor sobre el host SHALL ser `not-allowed`
- **AND** la apariencia visual SHALL atenuarse via token de opacity

#### Scenario: hereda disabled del group ancestro

- **GIVEN** un `<ds-radio-group [disabled]="true">` con `<ds-radio value="a">` adentro (sin disabled propio)
- **WHEN** el usuario hace click en el radio
- **THEN** el radio SHALL comportarse como deshabilitado
- **AND** el group NO SHALL actualizar su valor

#### Scenario: heredar disabled aún si el radio individual no tiene input disabled false

- **GIVEN** un `<ds-radio-group [disabled]="true">` con `<ds-radio [disabled]="false">` adentro
- **WHEN** el usuario hace click en el radio
- **THEN** el radio SHALL comportarse como deshabilitado (el group gana sobre el radio individual)

#### Scenario: name del group propaga al input nativo del radio

- **GIVEN** un `<ds-radio-group name="framework">` con `<ds-radio value="angular">` adentro
- **WHEN** se inspecciona el DOM
- **THEN** el `<input type="radio">` interno del radio SHALL tener `name="framework"`

#### Scenario: aria-checked refleja estado de selección

- **GIVEN** un `<ds-radio-group>` con dos radios
- **WHEN** el primer radio está seleccionado
- **THEN** el primer radio SHALL tener `aria-checked="true"`
- **AND** el segundo SHALL tener `aria-checked="false"`

#### Scenario: exportado desde public-api.ts

- **WHEN** se inspecciona `packages/components/src/public-api.ts`
- **THEN** SHALL contener `export * from './lib/radio';`
- **AND** un consumidor SHALL poder hacer `import { DsRadio, type DsRadioSize } from '@romanmartinidev/components'`

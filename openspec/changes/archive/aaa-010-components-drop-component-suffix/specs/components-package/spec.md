## MODIFIED Requirements

### Requirement: Arquitectura flat por componente

Cada componente SHALL vivir en su propia carpeta bajo `packages/components/src/lib/<name>/`. Cada carpeta SHALL contener al menos: `<name>.ts`, `<name>.css`, `<name>.spec.ts`, `index.ts` (re-export interno).

#### Scenario: agregar un componente nuevo

- **GIVEN** la lib con un componente existente (Button)
- **WHEN** se agrega un componente nuevo `Input`
- **THEN** SHALL crearse `src/lib/input/{input.ts, input.css, input.spec.ts, index.ts}` siguiendo el mismo patrón
- **AND** `src/public-api.ts` SHALL agregar `export * from './lib/input';`

#### Scenario: estructura interna del componente es predecible

- **WHEN** un dev abre `src/lib/<name>/`
- **THEN** SHALL encontrar `<name>.ts` como entry point del componente, `<name>.css` como estilos, `<name>.spec.ts` como tests, e `index.ts` como surface interna

### Requirement: Componentes standalone con signal-based API

Los componentes SHALL ser **standalone** (`standalone: true` o decorator standalone por default en Angular ≥20). Inputs SHALL usar `input()` (signals), outputs SHALL usar `output()` (signals). NO SHALL usar `@Input()` ni `@Output()` con decorators. NO SHALL declararse en `NgModule`s.

#### Scenario: componente declara standalone y usa signal inputs

- **WHEN** se inspecciona `src/lib/button/button.ts`
- **THEN** la clase SHALL tener `@Component({ ..., standalone: true })` o equivalente Angular 21
- **AND** sus inputs SHALL declararse con `input<T>(...)`, no `@Input()`
- **AND** sus outputs SHALL declararse con `output<T>()`, no `@Output()`

#### Scenario: consumidor importa sin NgModule

- **GIVEN** un componente standalone consumidor
- **WHEN** se importa `DsButton` desde `@romanmartinidev/components`
- **THEN** SHALL incluirse directamente en el array `imports` del componente, sin envolverlo en un NgModule

### Requirement: Selector prefix fijo

Todos los componentes SHALL usar el prefix `ds-` en su selector (ej. `ds-button`, `ds-checkbox`). El prefix queda parte del contrato API público — cambiarlo es **BREAKING** y exige un ADR nuevo que reemplace al ADR-007.

#### Scenario: Button tiene selector ds-button

- **WHEN** se inspecciona `button.ts`
- **THEN** el decorator `@Component` SHALL declarar `selector: 'ds-button'`

#### Scenario: Checkbox tiene selector ds-checkbox

- **WHEN** se inspecciona `checkbox.ts`
- **THEN** el decorator `@Component` SHALL declarar `selector: 'ds-checkbox'`

#### Scenario: componente sin prefix ds- es rechazado

- **WHEN** alguien agrega `@Component({ selector: 'rmd-button', ... })` o cualquier prefix distinto de `ds-`
- **THEN** SHALL ser rechazado por revisión (Angular ESLint `@angular-eslint/component-selector` con prefix `ds` configurado puede automatizar)

### Requirement: Naming convention de class y archivo

Las classes de componentes SHALL llamarse `Ds<Name>` (PascalCase con prefix `Ds`, **sin** sufijo `Component`). Los archivos SHALL nombrarse `<name>.ts` (kebab-case, **sin sufijo de rol** `.component` — alineado con el style-guide moderno de Angular v20+); los archivos acompañantes SHALL seguir el mismo patrón (`<name>.html`, `<name>.css`, `<name>.spec.ts`). El `<Name>` SHALL coincidir entre carpeta, archivo, class y selector (ej. carpeta `button/`, archivo `button.ts`, class `DsButton`, selector `ds-button`).

Types públicos exportados por un componente SHALL también llevar prefix `Ds<Name><TypeName>` (ej. `DsButtonVariant`, `DsButtonSize`, `DsCheckboxSize`).

#### Scenario: Button cumple la convención

- **WHEN** se inspecciona la implementación de Button
- **THEN** carpeta `src/lib/button/`, archivo `button.ts`, class `DsButton`, selector `ds-button` SHALL coincidir
- **AND** los types públicos SHALL ser `DsButtonVariant` y `DsButtonSize`

#### Scenario: Checkbox cumple la convención

- **WHEN** se inspecciona la implementación de Checkbox
- **THEN** carpeta `src/lib/checkbox/`, archivo `checkbox.ts`, class `DsCheckbox`, selector `ds-checkbox` SHALL coincidir
- **AND** el type público SHALL ser `DsCheckboxSize`

#### Scenario: class TypeScript NO lleva sufijo Component

- **WHEN** se inspecciona la class exportada de un componente
- **THEN** SHALL NO terminar en `Component` (ej. `DsButton` ✓; `DsButtonComponent` ✗)
- **AND** SHALL empezar con prefix `Ds`

#### Scenario: archivo NO lleva sufijo de rol .component

- **WHEN** se inspecciona `packages/components/src/lib/<name>/`
- **THEN** SHALL NO existir archivos con el patrón `<name>.component.*`
- **AND** el entry point SHALL ser `<name>.ts`

### Requirement: Styles plain CSS consumiendo tokens via CSS variables

Los componentes SHALL usar archivos `.css` (no `.scss`, no `.less`). El styling SHALL consumir tokens vía CSS custom properties con prefix `--ds-*` provistos por `@romanmartinidev/tokens`. NO SHALL declararse valores de color, espaciado, tipografía o radius hardcoded en los CSS de componente.

#### Scenario: Button consume tokens

- **WHEN** se inspecciona `button.css`
- **THEN** los valores de color, spacing, border-radius, shadow SHALL referenciarse vía `var(--ds-...)`
- **AND** SHALL NO existir hex codes (`#xxx`), valores pixel hardcoded (excepto `0`, `1px` para borders), ni rgba/hsla literales

#### Scenario: tokens se aplican automáticamente

- **GIVEN** un consumidor que importó `@romanmartinidev/tokens/css` antes de usar componentes
- **WHEN** renderiza `<ds-button>` sin override
- **THEN** las variables `--ds-*` SHALL resolverse desde `:root` y el botón SHALL pintarse con el design system aplicado

### Requirement: ViewEncapsulation Emulated en componentes

Los componentes SHALL usar `ViewEncapsulation.Emulated` (el default de Angular). NO SHALL usar `ViewEncapsulation.None` ni `ViewEncapsulation.ShadowDom` salvo justificación documentada en ADR.

#### Scenario: Button hereda encapsulation default

- **WHEN** se inspecciona el decorator `@Component` de `button.ts`
- **THEN** SHALL NO declarar `encapsulation: ViewEncapsulation.None` ni `encapsulation: ViewEncapsulation.ShadowDom`
- **AND** SHALL heredar el comportamiento default Emulated

#### Scenario: estilos no leak a otros componentes

- **GIVEN** dos componentes consumidores hermanos (`<ds-button>` y otro componente con clase `.button` propia)
- **WHEN** se renderizan en la misma página
- **THEN** los estilos de `button.css` SHALL aplicar solo al `<ds-button>` (el atributo `_ngcontent-*` de Angular Emulated los aísla)

### Requirement: Tests del Button con Vitest

El package SHALL incluir tests para Button con Vitest + `@analogjs/vitest-angular`. Los tests SHALL cubrir: creación del componente, renderizado del `<button>`, comportamiento del output `clicked` con y sin `disabled`.

#### Scenario: corre con pnpm test

- **WHEN** se ejecuta `pnpm -F @romanmartinidev/components test`
- **THEN** Vitest SHALL ejecutar `button.spec.ts` y SHALL retornar exit 0 con todos los tests passing

#### Scenario: test del comportamiento disabled

- **GIVEN** un Button renderizado con `disabled` set a `true`
- **WHEN** se simula un click
- **THEN** el output `clicked` SHALL NO emitir

#### Scenario: test del comportamiento enabled

- **GIVEN** un Button renderizado sin disabled (default false)
- **WHEN** se simula un click
- **THEN** el output `clicked` SHALL emitir exactamente una vez

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

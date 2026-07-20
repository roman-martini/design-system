---
name: component-input
type: spec
status: active
created: 2026-07-20
---

# component-input

## Purpose

Contrato de `DsInput`: tipos y estados del campo, mensajes de ayuda/error, e integración como ControlValueAccessor.

## Requirements

### Requirement: Componente DsInput

El package SHALL exponer `DsInput` (selector `ds-input`), field de texto completo — label, `<input>` nativo, hint y mensaje de error asociados programáticamente — siguiendo ADR-004/007/010 (arquitectura y naming) y la rama form control de ADR-011 (disabled nativo). SHALL implementar `ControlValueAccessor` para Angular Forms (reactivos y template-driven) **sin** proveer `NG_VALUE_ACCESSOR`: auto-registración vía `NgControl` inyectado optional/self (`ngControl.valueAccessor = this`), el patrón que evita el ciclo de DI y habilita leer el estado del control para el invalid automático. SHALL soportar `value` (model two-way string), `type` (`DsInputType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'search'`, default `'text'`), `label`, `hint`, `error`, `placeholder` (inputs string), `invalid` (input boolean opcional que fuerza el estado), `disabled` (model two-way), `size` (`'sm' | 'md' | 'lg'`, default `'md'`), y slots pasivos `[ds-input-prefix]`/`[ds-input-suffix]`.

#### Scenario: estructura de archivos

- **WHEN** se inspecciona `packages/components/src/lib/input/`
- **THEN** existen `input.ts`, `input.html`, `input.css`, `input.spec.ts`, `input.stories.ts`, `index.ts`
- **AND** la class se llama `DsInput` y el selector es `ds-input`

#### Scenario: two-way binding e integración CVA

- **GIVEN** `<ds-input [formControl]="ctrl">` con `ctrl = new FormControl('')`
- **WHEN** el usuario tipea "hola"
- **THEN** `ctrl.value` SHALL ser `"hola"` (actualizado en cada input)
- **WHEN** el consumidor ejecuta `ctrl.setValue('chau')`
- **THEN** el `<input>` nativo SHALL mostrar `"chau"`

#### Scenario: anatomía accesible del field

- **GIVEN** `<ds-input label="Email" hint="Nunca lo compartimos">`
- **WHEN** se inspecciona el DOM
- **THEN** SHALL existir un `<label>` cuyo `for` apunta al id del `<input>` nativo
- **AND** el `<input>` SHALL referenciar el hint vía `aria-describedby`
- **GIVEN** un `<ds-input aria-label="Búsqueda">` sin `label`
- **THEN** el `aria-label` SHALL reenviarse al `<input>` nativo (no queda inerte en el host)

#### Scenario: tipos de texto en lista blanca

- **WHEN** se renderiza `<ds-input type="email">` (o `password`, `tel`, `url`, `search`)
- **THEN** el `<input>` nativo SHALL tener ese `type`
- **AND** el type TypeScript `DsInputType` SHALL rechazar en compilación valores fuera de la lista (`number` no es asignable)

#### Scenario: estado invalid automático desde el NgControl

- **GIVEN** `<ds-input [formControl]="ctrl" error="Email inválido">` con un validador que falla
- **WHEN** el control aún no fue tocado
- **THEN** el field SHALL verse en estado normal (sin borde de error) y el mensaje SHALL NO mostrarse
- **WHEN** el usuario lo toca y lo deja invalid (`invalid && touched`)
- **THEN** el `<input>` SHALL tener `aria-invalid="true"`, el borde SHALL usar `--ds-component-input-border-error`, y el mensaje de error SHALL renderizarse visible, asociado por `aria-describedby` (reemplazando al hint mientras esté presente)

#### Scenario: override manual del estado invalid

- **GIVEN** `<ds-input [invalid]="true" error="Tomado">` sin forms API
- **THEN** el estado de error SHALL aplicarse igual (visual + `aria-invalid` + mensaje)

#### Scenario: disabled nativo vía forms API

- **GIVEN** `<ds-input [formControl]="ctrl">` y `ctrl.disable()`
- **WHEN** se inspecciona el `<input>` nativo
- **THEN** SHALL tener el atributo `disabled` nativo (rama form control de ADR-011)
- **AND** la apariencia SHALL atenuarse vía tokens (`bg-disabled`, `text-disabled`)

#### Scenario: estilos y contraste por tokens

- **WHEN** se inspecciona `input.css`
- **THEN** todo valor visual SHALL referenciarse vía `var(--ds-*)` (tokens `component.input.*`), sin hex ni px hardcodeados (excepto `0`)
- **AND** los sizes `sm | md | lg` SHALL escalar por los tokens `height`/`padding-x`/`font-size`
- **AND** los pares texto/placeholder/borde sobre el bg del field SHALL cumplir AA calculados por script en los 4 themes (`text-placeholder` referencia `text.secondary`)

#### Scenario: slots pasivos prefix y suffix

- **GIVEN** `<ds-input><svg lucideSearch ds-input-prefix size="16" strokeWidth="1.5" aria-hidden="true"></svg></ds-input>`
- **WHEN** se renderiza
- **THEN** el contenido SHALL aparecer dentro del wrapper visual del control, antes del `<input>` (suffix: después)
- **AND** el contrato SHALL declararlo decorativo (`aria-hidden`, no focuseable) — los iconos siguen ADR-012

#### Scenario: foco visible en el field

- **WHEN** el usuario enfoca el input por teclado
- **THEN** el wrapper del control SHALL mostrar el indicador de foco tokenizado (`:focus-within` + `--ds-semantic-shadow-focus` o `border-focus`)
- **AND** SHALL NO haber `outline: none` sin reemplazo

#### Scenario: exportado desde public-api.ts

- **WHEN** se inspecciona `packages/components/src/public-api.ts`
- **THEN** SHALL contener `export * from './lib/input';`
- **AND** un consumidor SHALL poder hacer `import { DsInput, type DsInputType, type DsInputSize } from '@romanmartinidev/components'`

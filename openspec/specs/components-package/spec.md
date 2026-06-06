---
name: components-package
type: spec
status: active
created: 2026-05-31
---

# components-package

## Purpose

Define los requisitos del package `@romanmartinidev/components` como artefacto publicable Angular: identidad y metadata, dependencias (Angular y tokens como peerDependencies), arquitectura interna flat por componente, contrato de componentes (standalone + signals), selector prefix `rmd-`, naming convention de class y archivo, estrategia de styles (CSS plain con tokens vía CSS variables), ViewEncapsulation, surface de exports vía `public-api.ts`, build con ng-packagr en Angular Package Format, tests con Vitest, y reglas de dependencia que cierran ciclos con `@romanmartinidev/tokens`.

## Requirements

### Requirement: Identidad del package publicable

El package SHALL llamarse `@romanmartinidev/components`. Su `package.json` SHALL declarar `name`, `version`, `description`, `author`, `license` (MIT), `keywords`, `repository` (con `type`, `url` y `directory` apuntando a `packages/components`), `homepage`, `bugs`, `engines` (alineado con el root), `publishConfig: { "access": "public" }`, `files: ["dist", "README.md"]`, y `sideEffects: false`.

#### Scenario: package.json contiene metadata de publicación completa

- **WHEN** se inspecciona `packages/components/package.json`
- **THEN** los campos `name`, `version`, `description`, `author`, `license`, `repository.directory`, `engines.node`, `publishConfig.access`, `files`, `sideEffects` SHALL estar presentes con valores válidos

#### Scenario: tarball publicable contiene solo dist y README

- **WHEN** se ejecuta `npm pack --dry-run` desde `packages/components/`
- **THEN** el listado SHALL incluir `dist/`, `package.json`, `README.md`, `LICENSE` (si aplica)
- **AND** SHALL NO incluir `src/`, `vitest.config.ts`, `tsconfig.lib.json`, `ng-package.json`

### Requirement: Angular y tokens como peerDependencies

El `package.json` SHALL declarar `@angular/core`, `@angular/common` y `@romanmartinidev/tokens` como `peerDependencies`. Angular SHALL declararse con rango `^21.0.0`. `@romanmartinidev/tokens` SHALL declararse con valor `workspace:*` durante desarrollo, que Changesets SHALL reescribir a versión semver real al publicar. NO SHALL declararse ninguna de estas tres como `dependencies` regular (evitar duplicación en el bundle del consumidor; convención de ng-packagr y del ecosistema Angular libs).

#### Scenario: instalar el package en un consumidor con Angular

- **GIVEN** un proyecto consumidor con Angular 21 y `@romanmartinidev/tokens` instalados
- **WHEN** se ejecuta `npm install @romanmartinidev/components`
- **THEN** npm SHALL satisfacer las peer deps sin instalar otra copia de Angular ni de tokens

#### Scenario: tokens debe instalarse explícitamente

- **GIVEN** un consumidor que no tiene `@romanmartinidev/tokens` instalado
- **WHEN** se ejecuta `npm install @romanmartinidev/components`
- **THEN** npm SHALL emitir warning de peer dep faltante exigiendo instalar `@romanmartinidev/tokens` explícitamente

#### Scenario: workspace:\* se reescribe al publicar

- **WHEN** se publica el package vía `pnpm release` (Changesets)
- **THEN** el `package.json` del tarball SHALL tener `@romanmartinidev/tokens` con una versión semver real (ej. `^0.1.0`), no `workspace:*`

### Requirement: Arquitectura flat por componente

Cada componente SHALL vivir en su propia carpeta bajo `packages/components/src/lib/<name>/`. Cada carpeta SHALL contener al menos: `<name>.component.ts`, `<name>.component.css`, `<name>.component.spec.ts`, `index.ts` (re-export interno).

#### Scenario: agregar un componente nuevo

- **GIVEN** la lib con un componente existente (Button)
- **WHEN** se agrega un componente nuevo `Input`
- **THEN** SHALL crearse `src/lib/input/{input.component.ts, input.component.css, input.component.spec.ts, index.ts}` siguiendo el mismo patrón
- **AND** `src/public-api.ts` SHALL agregar `export * from './lib/input';`

#### Scenario: estructura interna del componente es predecible

- **WHEN** un dev abre `src/lib/<name>/`
- **THEN** SHALL encontrar `<name>.component.ts` como entry point del componente, `<name>.component.css` como estilos, `<name>.component.spec.ts` como tests, e `index.ts` como surface interna

### Requirement: Componentes standalone con signal-based API

Los componentes SHALL ser **standalone** (`standalone: true` o decorator standalone por default en Angular ≥20). Inputs SHALL usar `input()` (signals), outputs SHALL usar `output()` (signals). NO SHALL usar `@Input()` ni `@Output()` con decorators. NO SHALL declararse en `NgModule`s.

#### Scenario: componente declara standalone y usa signal inputs

- **WHEN** se inspecciona `src/lib/button/button.component.ts`
- **THEN** la clase SHALL tener `@Component({ ..., standalone: true })` o equivalente Angular 21
- **AND** sus inputs SHALL declararse con `input<T>(...)`, no `@Input()`
- **AND** sus outputs SHALL declararse con `output<T>()`, no `@Output()`

#### Scenario: consumidor importa sin NgModule

- **GIVEN** un componente standalone consumidor
- **WHEN** se importa `ButtonComponent` desde `@romanmartinidev/components`
- **THEN** SHALL incluirse directamente en el array `imports` del componente, sin envolverlo en un NgModule

### Requirement: Selector prefix fijo

Todos los componentes SHALL usar el prefix `ds-` en su selector (ej. `ds-button`, `ds-checkbox`). El prefix queda parte del contrato API público — cambiarlo es **BREAKING** y exige un ADR nuevo que reemplace al ADR-007.

#### Scenario: Button tiene selector ds-button

- **WHEN** se inspecciona `button.component.ts`
- **THEN** el decorator `@Component` SHALL declarar `selector: 'ds-button'`

#### Scenario: Checkbox tiene selector ds-checkbox

- **WHEN** se inspecciona `checkbox.component.ts`
- **THEN** el decorator `@Component` SHALL declarar `selector: 'ds-checkbox'`

#### Scenario: componente sin prefix ds- es rechazado

- **WHEN** alguien agrega `@Component({ selector: 'rmd-button', ... })` o cualquier prefix distinto de `ds-`
- **THEN** SHALL ser rechazado por revisión (Angular ESLint `@angular-eslint/component-selector` con prefix `ds` configurado puede automatizar)

### Requirement: Naming convention de class y archivo

Las classes de componentes SHALL llamarse `Ds<Name>` (PascalCase con prefix `Ds`, **sin** sufijo `Component`). Los archivos SHALL nombrarse `<name>.component.ts` (kebab-case con sufijo `.component.ts`). El `<Name>` SHALL coincidir entre carpeta, archivo, class y selector (ej. carpeta `button/`, archivo `button.component.ts`, class `DsButton`, selector `ds-button`).

Types públicos exportados por un componente SHALL también llevar prefix `Ds<Name><TypeName>` (ej. `DsButtonVariant`, `DsButtonSize`, `DsCheckboxSize`).

#### Scenario: Button cumple la convención

- **WHEN** se inspecciona la implementación de Button
- **THEN** carpeta `src/lib/button/`, archivo `button.component.ts`, class `DsButton`, selector `ds-button` SHALL coincidir
- **AND** los types públicos SHALL ser `DsButtonVariant` y `DsButtonSize`

#### Scenario: Checkbox cumple la convención

- **WHEN** se inspecciona la implementación de Checkbox
- **THEN** carpeta `src/lib/checkbox/`, archivo `checkbox.component.ts`, class `DsCheckbox`, selector `ds-checkbox` SHALL coincidir
- **AND** el type público SHALL ser `DsCheckboxSize`

#### Scenario: class TypeScript NO lleva sufijo Component

- **WHEN** se inspecciona la class exportada de un componente
- **THEN** SHALL NO terminar en `Component` (ej. `DsButton` ✓; `DsButtonComponent` ✗)
- **AND** SHALL empezar con prefix `Ds`

### Requirement: Styles plain CSS consumiendo tokens via CSS variables

Los componentes SHALL usar archivos `.css` (no `.scss`, no `.less`). El styling SHALL consumir tokens vía CSS custom properties con prefix `--ds-*` provistos por `@romanmartinidev/tokens`. NO SHALL declararse valores de color, espaciado, tipografía o radius hardcoded en los CSS de componente.

#### Scenario: Button consume tokens

- **WHEN** se inspecciona `button.component.css`
- **THEN** los valores de color, spacing, border-radius, shadow SHALL referenciarse vía `var(--ds-...)`
- **AND** SHALL NO existir hex codes (`#xxx`), valores pixel hardcoded (excepto `0`, `1px` para borders), ni rgba/hsla literales

#### Scenario: tokens se aplican automáticamente

- **GIVEN** un consumidor que importó `@romanmartinidev/tokens/css` antes de usar componentes
- **WHEN** renderiza `<ds-button>` sin override
- **THEN** las variables `--ds-*` SHALL resolverse desde `:root` y el botón SHALL pintarse con el design system aplicado

### Requirement: ViewEncapsulation Emulated en componentes

Los componentes SHALL usar `ViewEncapsulation.Emulated` (el default de Angular). NO SHALL usar `ViewEncapsulation.None` ni `ViewEncapsulation.ShadowDom` salvo justificación documentada en ADR.

#### Scenario: Button hereda encapsulation default

- **WHEN** se inspecciona el decorator `@Component` de `button.component.ts`
- **THEN** SHALL NO declarar `encapsulation: ViewEncapsulation.None` ni `encapsulation: ViewEncapsulation.ShadowDom`
- **AND** SHALL heredar el comportamiento default Emulated

#### Scenario: estilos no leak a otros componentes

- **GIVEN** dos componentes consumidores hermanos (`<ds-button>` y otro componente con clase `.button` propia)
- **WHEN** se renderizan en la misma página
- **THEN** los estilos de `button.component.css` SHALL aplicar solo al `<ds-button>` (el atributo `_ngcontent-*` de Angular Emulated los aísla)

### Requirement: Surface de exports a través de public-api.ts

El package SHALL exponer `src/public-api.ts` como entry point. Solo lo re-exportado desde `public-api.ts` SHALL ser parte de la API pública. Detalles internos (helpers, tipos privados) SHALL NO re-exportarse aunque vivan en `src/lib/`.

#### Scenario: import de Button funciona

- **WHEN** un consumidor escribe `import { DsButton } from '@romanmartinidev/components';`
- **THEN** el bundler SHALL resolver al export desde `dist/index.d.ts` y `dist/fesm2022/<entry>.mjs` (rutas exactas las define ng-packagr)

#### Scenario: import a internals está bloqueado

- **WHEN** un consumidor escribe `import { ... } from '@romanmartinidev/components/internals';`
- **THEN** el bundler SHALL fallar con error de export no encontrado (consecuencia del `exports` cerrado del package.json)

### Requirement: Build con ng-packagr produce APF

El build SHALL invocarse con `pnpm -F @romanmartinidev/components build` y SHALL ejecutar `ng-packagr -p ng-package.json`. El output SHALL cumplir Angular Package Format (APF): bundles FESM2022, type declarations, partial Ivy compilation. El output SHALL emitirse a `dist/`.

#### Scenario: build fresco produce artefactos APF

- **GIVEN** `packages/components/dist/` borrado
- **WHEN** se ejecuta `pnpm -F @romanmartinidev/components build`
- **THEN** el comando SHALL retornar exit 0
- **AND** SHALL crearse `dist/package.json`, `dist/fesm2022/<entry>.mjs`, `dist/index.d.ts`, y los demás artefactos requeridos por APF

#### Scenario: dist/package.json tiene exports válidos

- **WHEN** se inspecciona `dist/package.json` post-build
- **THEN** sus campos `main`, `module`, `typings` (o `exports`) SHALL apuntar a artefactos existentes dentro de `dist/`

### Requirement: Tests del Button con Vitest

El package SHALL incluir tests para Button con Vitest + `@analogjs/vitest-angular`. Los tests SHALL cubrir: creación del componente, renderizado del `<button>`, comportamiento del output `clicked` con y sin `disabled`.

#### Scenario: corre con pnpm test

- **WHEN** se ejecuta `pnpm -F @romanmartinidev/components test`
- **THEN** Vitest SHALL ejecutar `button.component.spec.ts` y SHALL retornar exit 0 con todos los tests passing

#### Scenario: test del comportamiento disabled

- **GIVEN** un Button renderizado con `disabled` set a `true`
- **WHEN** se simula un click
- **THEN** el output `clicked` SHALL NO emitir

#### Scenario: test del comportamiento enabled

- **GIVEN** un Button renderizado sin disabled (default false)
- **WHEN** se simula un click
- **THEN** el output `clicked` SHALL emitir exactamente una vez

### Requirement: Reglas de dependencia respetadas

El package SHALL NO depender de ninguna app en `apps/*`. SHALL declarar `@romanmartinidev/tokens` como `peerDependencies` con `workspace:*`. SHALL declarar Angular como `peerDependencies`. SHALL NO crear ciclo con `tokens` (tokens no consume components).

#### Scenario: components depende de tokens como peer dep

- **WHEN** se inspecciona `packages/components/package.json` campo `peerDependencies`
- **THEN** SHALL contener `@romanmartinidev/tokens: "workspace:*"`, `@angular/core: "^21.0.0"`, `@angular/common: "^21.0.0"`
- **AND** SHALL NO contener referencias a `playground` ni a apps en `apps/*`
- **AND** SHALL NO declarar `dependencies` regulares

#### Scenario: tokens no depende de components

- **WHEN** se inspecciona `packages/tokens/package.json`
- **THEN** SHALL NO mencionar `@romanmartinidev/components` en `dependencies`, `peerDependencies` ni `devDependencies`

### Requirement: Componente Checkbox

El package SHALL exponer `DsCheckbox` (selector `ds-checkbox`) cumpliendo las convenciones de [ADR-004](../../../docs/architecture/adr/ADR-004-arquitectura-components.md) (arquitectura) y [ADR-007](../../../docs/architecture/adr/ADR-007-naming-prefijos.md) (naming): standalone, OnPush, signal-based API, prefix `Ds` en class y `ds-` en selector. El componente SHALL implementar `ControlValueAccessor` para integración nativa con Angular Forms (reactivos y template-driven). SHALL soportar estado `checked` (model two-way), `indeterminate` (input one-way), `disabled` (model two-way; CVA puede mutarlo), `label` (input string fallback), `size` ('sm' | 'md' | 'lg' con default 'md').

#### Scenario: estructura de archivos sigue ADR-004 + ADR-007

- **WHEN** se inspecciona `packages/components/src/lib/checkbox/`
- **THEN** existen: `checkbox.component.ts`, `checkbox.component.html`, `checkbox.component.css`, `checkbox.component.spec.ts`, `checkbox.stories.ts`, `index.ts`
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

### Requirement: @angular/forms como peerDependency

El package `@romanmartinidev/components/package.json` SHALL declarar `@angular/forms` en `peerDependencies` con rango `^21.0.0` cuando expone componentes que implementan `ControlValueAccessor`. Si no se declara, el consumidor recibe warning de peer dep faltante.

#### Scenario: peerDependencies incluye @angular/forms

- **WHEN** se inspecciona `packages/components/package.json` campo `peerDependencies`
- **THEN** SHALL contener `"@angular/forms": "^21.0.0"`

#### Scenario: warning si consumidor no tiene @angular/forms

- **GIVEN** un consumidor sin `@angular/forms` instalado
- **WHEN** se ejecuta `npm install @romanmartinidev/components`
- **THEN** npm SHALL emitir warning de peer dep faltante

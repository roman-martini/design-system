---
id: SPC-003
name: components-package
type: spec
status: active
introduced-by: CHG-003
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

Todos los componentes SHALL usar el prefix `rmd-` en su selector. El prefix queda parte del contrato API público — cambiarlo es **BREAKING** y exige un ADR nuevo que reemplace al ADR-004.

#### Scenario: Button tiene selector rmd-button

- **WHEN** se inspecciona `button.component.ts`
- **THEN** el decorator `@Component` SHALL declarar `selector: 'rmd-button'`

#### Scenario: componente sin prefix rmd- es rechazado

- **WHEN** alguien agrega `@Component({ selector: 'app-button', ... })` (o cualquier prefix distinto)
- **THEN** SHALL ser rechazado por revisión (Angular ESLint `@angular-eslint/component-selector` con prefix configurado puede automatizar)

### Requirement: Naming convention de class y archivo

Las classes de componentes SHALL llamarse `<Name>Component` (PascalCase con sufijo `Component`). Los archivos SHALL nombrarse `<name>.component.ts` (kebab-case con sufijo `.component.ts`). El `<Name>` SHALL coincidir entre carpeta, archivo, class y selector (ej. carpeta `button/`, archivo `button.component.ts`, class `ButtonComponent`, selector `rmd-button`).

#### Scenario: Button cumple la convención

- **WHEN** se inspecciona la implementación de Button
- **THEN** carpeta `src/lib/button/`, archivo `button.component.ts`, class `ButtonComponent`, selector `rmd-button` SHALL coincidir

### Requirement: Styles plain CSS consumiendo tokens via CSS variables

Los componentes SHALL usar archivos `.css` (no `.scss`, no `.less`). El styling SHALL consumir tokens vía CSS custom properties con prefix `--ds-*` provistos por `@romanmartinidev/tokens`. NO SHALL declararse valores de color, espaciado, tipografía o radius hardcoded en los CSS de componente.

#### Scenario: Button consume tokens

- **WHEN** se inspecciona `button.component.css`
- **THEN** los valores de color, spacing, border-radius, shadow SHALL referenciarse vía `var(--ds-...)`
- **AND** SHALL NO existir hex codes (`#xxx`), valores pixel hardcoded (excepto `0`, `1px` para borders), ni rgba/hsla literales

#### Scenario: tokens se aplican automáticamente

- **GIVEN** un consumidor que importó `@romanmartinidev/tokens/css` antes de usar componentes
- **WHEN** renderiza `<rmd-button>` sin override
- **THEN** las variables `--ds-*` SHALL resolverse desde `:root` y el botón SHALL pintarse con el design system aplicado

### Requirement: ViewEncapsulation Emulated en componentes

Los componentes SHALL usar `ViewEncapsulation.Emulated` (el default de Angular). NO SHALL usar `ViewEncapsulation.None` ni `ViewEncapsulation.ShadowDom` salvo justificación documentada en ADR.

#### Scenario: Button hereda encapsulation default

- **WHEN** se inspecciona el decorator `@Component` de `button.component.ts`
- **THEN** SHALL NO declarar `encapsulation: ViewEncapsulation.None` ni `encapsulation: ViewEncapsulation.ShadowDom`
- **AND** SHALL heredar el comportamiento default Emulated

#### Scenario: estilos no leak a otros componentes

- **GIVEN** dos componentes consumidores hermanos (`<rmd-button>` y otro componente con clase `.button` propia)
- **WHEN** se renderizan en la misma página
- **THEN** los estilos de `button.component.css` SHALL aplicar solo al `<rmd-button>` (el atributo `_ngcontent-*` de Angular Emulated los aísla)

### Requirement: Surface de exports a través de public-api.ts

El package SHALL exponer `src/public-api.ts` como entry point. Solo lo re-exportado desde `public-api.ts` SHALL ser parte de la API pública. Detalles internos (helpers, tipos privados) SHALL NO re-exportarse aunque vivan en `src/lib/`.

#### Scenario: import de Button funciona

- **WHEN** un consumidor escribe `import { ButtonComponent } from '@romanmartinidev/components';`
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

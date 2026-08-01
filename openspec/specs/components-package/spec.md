---
name: components-package
type: spec
status: active
created: 2026-05-31
---

# components-package

## Purpose

Define los requisitos del package `@romanmartinidev/components` como artefacto publicable Angular: identidad y metadata, dependencias (Angular y tokens como peerDependencies), arquitectura interna flat por componente, contrato de componentes (standalone + signals), selector prefix `ds-`, naming convention de class (`Ds<Name>`) y archivo (`<name>.ts`, sin sufijo de rol), estrategia de styles (CSS plain con tokens vía CSS variables), ViewEncapsulation, surface de exports vía `public-api.ts`, build con ng-packagr en Angular Package Format, tests con Vitest, y reglas de dependencia que cierran ciclos con `@romanmartinidev/tokens`.

## Requirements

### Requirement: Identidad del package publicable

El package SHALL llamarse `@romanmartinidev/components`. Su `package.json` SHALL declarar `name`, `version`, `description`, `author`, `license` (MIT), `keywords`, `repository` (con `type`, `url` y `directory` apuntando a `packages/components`), `homepage`, `bugs`, `publishConfig` y `sideEffects: false`.

El `publishConfig` SHALL declarar `access: "public"` y **`directory: "dist"`** ([ADR-021](../../../docs/architecture/adr/ADR-021-estrategia-publicacion-packages.md)): el artefacto publicado es el output de ng-packagr, y su `dist/package.json` generado es la **fuente única** del contrato publicado (exports, module, typings).

El manifest raíz **NO SHALL** declarar `main`, que apunta a una ruta inexistente dentro de `dist/`. SHALL declarar `files` con las rutas **relativas al contenido de `dist/`** (`fesm2022`, `types`, `router`, `README.md`, `LICENSE`, `CHANGELOG.md`), porque ng-packagr lo copia sin reescribir al manifest generado: dejar el valor apuntando a `dist` produciría un tarball vacío, y omitirlo haría que `npm-packlist` descarte `dist/router/package.json` — el mini-manifest de fallback del entry point secundario — al tratar ese subdirectorio como package anidado.

El manifest raíz SHALL conservar `module`, `types` y `exports` (incluido `"./package.json"`): dentro del monorepo son lo que resuelve el package para playground y Storybook, ya que no hay `paths` de tsconfig. Estos campos son **detalle de resolución interna**, no contrato publicado: ng-packagr los reescribe con rutas relativas a `dist/` en el manifest generado. El sub-path `"./package.json"` SHALL declararse en forma de objeto (`{ "default": "./package.json" }`); la forma de string plano hace fallar la generación del manifest de ng-packagr.

El manifest raíz **NO SHALL** declarar `engines`: los requisitos de Node y pnpm son del monorepo, no del consumidor, y viven en el `package.json` root privado.

#### Scenario: package.json contiene metadata de publicación completa

- **WHEN** se inspecciona `packages/components/package.json`
- **THEN** los campos `name`, `version`, `description`, `author`, `license`, `repository.directory`, `publishConfig.access`, `publishConfig.directory`, `files`, `sideEffects` SHALL estar presentes con valores válidos
- **AND** los campos `main` y `engines` SHALL estar ausentes

#### Scenario: el tarball se arma desde dist y contiene el artefacto completo

- **WHEN** se ejecuta `npm pack --dry-run` sobre `packages/components/dist/`
- **THEN** el listado SHALL incluir `package.json`, `README.md`, `LICENSE`, `CHANGELOG.md`, los bundles `fesm2022/`, los `.d.ts` de los entry points `.` y `./router`, y el mini-manifest `router/package.json`
- **AND** SHALL NO incluir `src/`, `vitest.config.ts`, `tsconfig.lib.json` ni `ng-package.json`

#### Scenario: cada path del exports publicado existe en el tarball

- **GIVEN** el manifest generado en `dist/package.json`
- **WHEN** se resuelve cada path declarado en su `exports` contra el contenido del tarball
- **THEN** todos SHALL existir — la verificación que [ADR-017](../../../docs/architecture/adr/ADR-017-secondary-entry-points.md) declaró como mitigación del entry point secundario

#### Scenario: el tarball incluye el texto de la licencia

- **WHEN** se inspecciona el tarball publicable
- **THEN** SHALL contener un `LICENSE` byte a byte idéntico al `LICENSE` del root del monorepo
- **AND** SHALL contener `CHANGELOG.md`

### Requirement: Angular y tokens como peerDependencies

El `package.json` SHALL declarar `@angular/core`, `@angular/common` y `@romanmartinidev/tokens` como `peerDependencies`. Angular SHALL declararse con rango `^21.0.0`. `@romanmartinidev/tokens` SHALL declararse con el rango semver plano **`>=0.1.0 <1.0.0`** mientras el par esté pre-1.0 (al saltar a 1.0 pasa a `^1.0.0`), publicado **tal cual** (sin pin exacto ni protocol de workspace). Ambos packages versionan en **lockstep** ([ADR-015](../../../docs/architecture/adr/ADR-015-versionado-lockstep.md)): la versión hermana siempre satisface el rango, y el consumidor SHALL instalar ambos en la misma versión (documentado en README). NO SHALL declararse ninguna de estas tres como `dependencies` regular (evitar duplicación en el bundle del consumidor; convención de ng-packagr y del ecosistema Angular libs).

#### Scenario: instalar el package en un consumidor con Angular

- **GIVEN** un proyecto consumidor con Angular 21 y `@romanmartinidev/tokens` instalados
- **WHEN** se ejecuta `npm install @romanmartinidev/components`
- **THEN** npm SHALL satisfacer las peer deps sin instalar otra copia de Angular ni de tokens

#### Scenario: tokens debe instalarse explícitamente

- **GIVEN** un consumidor que no tiene `@romanmartinidev/tokens` instalado
- **WHEN** se ejecuta `npm install @romanmartinidev/components`
- **THEN** npm SHALL emitir warning de peer dep faltante exigiendo instalar `@romanmartinidev/tokens` explícitamente

#### Scenario: el tarball publica el rango del peer, no un pin

- **WHEN** se publica el package vía `pnpm release` (Changesets)
- **THEN** el `package.json` del tarball SHALL tener `@romanmartinidev/tokens` con el rango declarado (`>=0.1.0 <1.0.0`), no un protocol de workspace ni una versión exacta pinneada

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

### Requirement: Surface de exports a través de public-api.ts

El package SHALL exponer `src/public-api.ts` como entry point. Solo lo re-exportado desde `public-api.ts` SHALL ser parte de la API pública. Detalles internos (helpers, tipos privados) SHALL NO re-exportarse aunque vivan en `src/lib/`.

El `index.ts` de cada componente SHALL enumerar los símbolos que expone, uno por uno. Un símbolo entra a la API pública porque alguien lo escribió en ese índice, no porque comparta archivo con otro que sí corresponde.

#### Scenario: import de Button funciona

- **WHEN** un consumidor escribe `import { DsButton } from '@romanmartinidev/components';`
- **THEN** el bundler SHALL resolver al export desde `dist/index.d.ts` y `dist/fesm2022/<entry>.mjs` (rutas exactas las define ng-packagr)

#### Scenario: import a internals está bloqueado

- **WHEN** un consumidor escribe `import { ... } from '@romanmartinidev/components/internals';`
- **THEN** el bundler SHALL fallar con error de export no encontrado (consecuencia del `exports` cerrado del package.json)

#### Scenario: cada índice de componente enumera su superficie

- **WHEN** se inspecciona cualquier `src/lib/<name>/index.ts`
- **THEN** SHALL contener únicamente exports con nombre (`export { … }` / `export type { … }`)
- **AND** agregar un símbolo exportado a un archivo del componente SHALL dejarlo fuera de la API pública mientras nadie lo agregue a ese índice

### Requirement: Build con ng-packagr produce APF

El build SHALL invocarse con `pnpm -F @romanmartinidev/components build` y SHALL ejecutar `ng-packagr -p ng-package.json -c tsconfig.lib.json`. El output SHALL cumplir Angular Package Format (APF): bundles FESM2022, type declarations y **partial Ivy compilation**. El output SHALL emitirse a `dist/`.

`tsconfig.lib.json` SHALL declarar `compilationMode: "partial"` en `angularCompilerOptions`. Como el flag `-c` **reemplaza** el tsconfig interno de ng-packagr en lugar de extenderlo, omitir ese campo hace caer el build a full compilation mode, que embebe instrucciones de Ivy atadas a la versión exacta del compilador y rompe a los consumidores en otras versiones de Angular.

El cumplimiento SHALL verificarse sobre el **artefacto emitido**, no sobre la configuración.

#### Scenario: build fresco produce artefactos APF

- **GIVEN** `packages/components/dist/` borrado
- **WHEN** se ejecuta `pnpm -F @romanmartinidev/components build`
- **THEN** el comando SHALL retornar exit 0
- **AND** SHALL crearse `dist/package.json`, `dist/fesm2022/<entry>.mjs`, los `.d.ts` de cada entry point y los demás artefactos requeridos por APF

#### Scenario: el FESM emitido está en partial compilation mode

- **WHEN** se inspeccionan los bundles `dist/fesm2022/*.mjs` post-build
- **THEN** SHALL contener declaraciones `ɵɵngDeclareComponent` / `ɵɵngDeclareDirective`
- **AND** SHALL NO contener ninguna instrucción `ɵɵdefineComponent`

#### Scenario: el manifest generado no trae el guard de full mode

- **WHEN** se inspecciona `dist/package.json` post-build
- **THEN** SHALL NO declarar `scripts.prepublishOnly` — ng-packagr solo escribe ese script de aborto cuando detecta full compilation mode, por lo que su presencia SHALL tratarse como falla de build

#### Scenario: dist/package.json tiene exports válidos

- **WHEN** se inspecciona `dist/package.json` post-build
- **THEN** sus campos `module`, `typings` y `exports` SHALL apuntar a artefactos existentes dentro de `dist/`
- **AND** `exports` SHALL incluir los entry points `.`, `./router` y `./package.json`

### Requirement: Estado disabled accesible del ds-button

El `ds-button` (botón de acción) SHALL implementar su estado deshabilitado con **`aria-disabled`** en lugar del atributo `disabled` nativo, de modo que el control **permanezca en el tab order y sea anunciado** por lectores de pantalla como no disponible (en vez de desaparecer silenciosamente). La activación SHALL bloquearse por una guarda en el manejador de click. El componente SHALL exponer un input `disabledReason` (string, default vacío) que, cuando el botón está deshabilitado, comunica **por qué** vía un texto visible asociado con `aria-describedby`.

Los form controls (`ds-checkbox`, `ds-radio`) mantienen su `disabled` nativo — semánticamente correcto en un `<input>` y anunciado en el contexto del formulario. La justificación del patrón diferenciado (acción vs. form control) vive en [ADR-011](../../../docs/architecture/adr/ADR-011-estado-disabled-accesible.md).

#### Scenario: el botón deshabilitado permanece focuseable

- **WHEN** se renderiza `<ds-button [disabled]="true">`
- **THEN** el `<button>` SHALL NO tener el atributo `disabled` nativo
- **AND** SHALL NO tener `tabindex="-1"`
- **AND** SHALL poder recibir foco por teclado (no sale del tab order)

#### Scenario: expone aria-disabled según el estado

- **GIVEN** `<ds-button [disabled]="true">`
- **THEN** el `<button>` SHALL tener `aria-disabled="true"`
- **WHEN** el input `disabled` es `false`
- **THEN** el `<button>` SHALL NO tener el atributo `aria-disabled`

#### Scenario: no activa la acción cuando está deshabilitado

- **GIVEN** `<ds-button [disabled]="true" (clicked)="handle()">`
- **WHEN** el usuario hace click (o presiona Enter/Space, que en un `<button>` disparan un click)
- **THEN** el output `clicked` SHALL NO emitir (guarda en el manejador de click)

#### Scenario: activa la acción cuando está habilitado

- **GIVEN** `<ds-button (clicked)="handle()">` sin `disabled`
- **WHEN** el usuario hace click
- **THEN** el output `clicked` SHALL emitir exactamente una vez

#### Scenario: disabledReason se anuncia y es visible

- **GIVEN** `<ds-button [disabled]="true" disabledReason="Completá los campos requeridos">`
- **WHEN** se renderiza
- **THEN** SHALL existir un elemento que muestra el texto "Completá los campos requeridos"
- **AND** el `<button>` SHALL referenciar ese elemento vía `aria-describedby`
- **AND** el texto SHALL ser visible (no oculto solo para lectores de pantalla) — el usuario vidente con teclado también recibe el motivo

#### Scenario: sin motivo o habilitado no hay describedby

- **WHEN** el botón está deshabilitado pero `disabledReason` está vacío
- **THEN** el `<button>` SHALL NO tener `aria-describedby` apuntando a un motivo
- **AND** NO SHALL renderizarse el elemento del motivo
- **WHEN** el botón está habilitado aunque tenga `disabledReason`
- **THEN** tampoco SHALL renderizarse el motivo ni el `aria-describedby`

#### Scenario: los estilos de disabled se aplican vía atributo aria

- **WHEN** el botón está deshabilitado
- **THEN** los estilos del estado (opacity atenuada, `cursor: not-allowed`) SHALL aplicarse mediante el selector `[aria-disabled="true"]`
- **AND** los estados hover/active SHALL excluirse con `:not([aria-disabled="true"])` en vez de `:not(:disabled)`

### Requirement: Convención de iconografía con Lucide

El sistema de diseño SHALL usar **Lucide** (package `@lucide/angular`) como librería de iconos, según [ADR-012](../../../docs/architecture/adr/ADR-012-iconografia-lucide.md). Los iconos SHALL importarse como **componentes standalone por icono** (tree-shakeable, type-safe), NO vía registry por nombre. Los usos de iconos en componentes del DS SHALL declarar el estilo explícitamente — tamaño base `16` y `strokeWidth` `1.5` (starting point del DS), color heredado vía `currentColor` — sin depender de configuración global de la app consumidora. Mientras ningún componente publicado consuma iconos, `@lucide/angular` NO SHALL declararse como dependencia de `@romanmartinidev/components`; cuando el primer componente publicado los consuma, SHALL declararse como **`peerDependency`** (mismo criterio que Angular y `@romanmartinidev/tokens`).

#### Scenario: import tree-shakeable por icono

- **WHEN** un componente o demo del repo usa un icono
- **THEN** SHALL importarlo por nombre desde `@lucide/angular` (ej. `import { LucideX } from '@lucide/angular'`)
- **AND** SHALL renderizarlo con su componente standalone (ej. `<svg lucideX>`)
- **AND** NO SHALL existir un registry central de iconos por string

#### Scenario: estilo explícito del DS

- **WHEN** se inspecciona un uso de icono del DS
- **THEN** SHALL declarar `size="16"` y `strokeWidth="1.5"` (o valores justificados por el componente)
- **AND** el color SHALL resolverse por `currentColor` desde el contexto (tokenizado), no hardcodeado en el icono

#### Scenario: icono decorativo oculto para lectores de pantalla

- **GIVEN** un icono que acompaña texto visible
- **WHEN** se inspecciona el DOM
- **THEN** el `<svg>` SHALL tener `aria-hidden="true"`

#### Scenario: icono semántico nombrado por su control

- **GIVEN** un control interactivo cuyo único contenido es un icono (ej. botón X de cierre)
- **WHEN** se inspecciona el DOM
- **THEN** el control SHALL tener `aria-label` con el nombre de la acción
- **AND** el `<svg>` SHALL tener `aria-hidden="true"` (el nombre lo da el control)

#### Scenario: la demo de integración renderiza los iconos del disparador

- **GIVEN** el playground levantado
- **WHEN** se navega a la sección de iconografía
- **THEN** SHALL renderizarse `LucideX` y `LucideChevronDown` con el estilo del DS (16 / 1.5 / currentColor)

#### Scenario: la dependencia se declara como peer recién con el primer consumo publicado

- **WHEN** ningún componente de `@romanmartinidev/components` consume iconos
- **THEN** `packages/components/package.json` NO SHALL declarar `@lucide/angular` (en ninguna sección de dependencias de runtime)
- **WHEN** el primer componente publicado consuma iconos (ej. Modal)
- **THEN** `@lucide/angular` SHALL declararse en `peerDependencies` de `@romanmartinidev/components` y documentarse en su README

### Requirement: Reglas de dependencia respetadas

El package SHALL NO depender de ninguna app en `apps/*`. SHALL declarar `@romanmartinidev/tokens` como `peerDependencies` con el rango de la política lockstep (**`>=0.1.0 <1.0.0`** pre-1.0, ADR-015). SHALL declarar Angular como `peerDependencies`. SHALL NO crear ciclo con `tokens` (tokens no consume components).

#### Scenario: components depende de tokens como peer dep

- **WHEN** se inspecciona `packages/components/package.json` campo `peerDependencies`
- **THEN** SHALL contener `@romanmartinidev/tokens: ">=0.1.0 <1.0.0"`, `@angular/core: "^21.0.0"`, `@angular/common: "^21.0.0"`
- **AND** SHALL NO contener referencias a `playground` ni a apps en `apps/*`
- **AND** SHALL NO declarar `dependencies` regulares

#### Scenario: tokens no depende de components

- **WHEN** se inspecciona `packages/tokens/package.json`
- **THEN** SHALL NO mencionar `@romanmartinidev/components` en `dependencies`, `peerDependencies` ni `devDependencies`

### Requirement: @angular/forms como peerDependency

El package `@romanmartinidev/components/package.json` SHALL declarar `@angular/forms` en `peerDependencies` con rango `^21.0.0` cuando expone componentes que implementan `ControlValueAccessor`. Si no se declara, el consumidor recibe warning de peer dep faltante.

#### Scenario: peerDependencies incluye @angular/forms

- **WHEN** se inspecciona `packages/components/package.json` campo `peerDependencies`
- **THEN** SHALL contener `"@angular/forms": "^21.0.0"`

#### Scenario: warning si consumidor no tiene @angular/forms

- **GIVEN** un consumidor sin `@angular/forms` instalado
- **WHEN** se ejecuta `npm install @romanmartinidev/components`
- **THEN** npm SHALL emitir warning de peer dep faltante

### Requirement: Verificación automática de accesibilidad del DOM renderizado

Todo componente público del kit SHALL tener su render por defecto verificado con un motor de accesibilidad automatizado (`axe-core`) como parte de la suite de tests del package, ejecutada por el pipeline sin step ni servicio adicional. La verificación SHALL cubrir las reglas de nivel WCAG 2.0/2.1 A y AA; una violación SHALL hacer fallar el test identificando la regla, su impacto y el nodo — NO SHALL emitirse como advertencia.

La configuración SHALL vivir en **un único helper compartido** (`packages/components/src/testing/axe.ts`): el conjunto de reglas evaluadas, las reglas deshabilitadas con su justificación escrita, y la lista de exclusiones. NO SHALL configurarse axe por componente ni duplicarse la invocación.

Una corrida que **no pudo evaluar nada** SHALL fallar. La ausencia de violaciones NO SHALL contarse como éxito por sí sola: el helper SHALL exigir además que el motor haya evaluado reglas con éxito y que ninguna regla haya quedado indeterminada por error interno del motor. Una excepción a esta regla SHALL declarar su motivo en el punto de invocación.

Lo que el entorno de test (jsdom) no permita evaluar SHALL declararse en una **lista de exclusiones versionada** en el mismo helper, con su motivo técnico y el destino que lo cubre. NO SHALL deshabilitarse una regla para ocultar un hallazgo real.

#### Scenario: cada componente público asserta axe sobre su render por defecto

- **GIVEN** el package de componentes
- **WHEN** se ejecuta `pnpm -F @romanmartinidev/components test`
- **THEN** cada componente público SHALL tener al menos una aserción de axe sobre su render por defecto
- **AND** la suite SHALL retornar exit 0

#### Scenario: una violación AA hace fallar la suite

- **GIVEN** un componente al que se le introduce una violación de nivel AA (por ejemplo un control sin nombre accesible)
- **WHEN** corre su spec
- **THEN** el test SHALL fallar
- **AND** el mensaje SHALL nombrar la regla de axe violada, su impacto y el nodo afectado

#### Scenario: una corrida no concluyente falla en vez de pasar

- **GIVEN** un árbol que el motor no puede auditar (subárbol oculto, o reglas que fallan por límites del entorno)
- **WHEN** corre la aserción de axe sin declarar una excepción con motivo
- **THEN** el test SHALL fallar indicando que la corrida no fue concluyente
- **AND** NO SHALL reportarse como éxito por ausencia de violaciones

#### Scenario: reglas deshabilitadas declaradas y justificadas en un solo lugar

- **WHEN** se inspecciona el helper compartido
- **THEN** SHALL enumerar las reglas deshabilitadas con su motivo escrito
- **AND** SHALL enumerar las exclusiones no cubribles en el entorno de test con su motivo técnico y el destino que las cubre

#### Scenario: el gate corre en el pipeline sin infraestructura nueva

- **GIVEN** el workflow de PR
- **WHEN** se ejecuta el step de tests existente
- **THEN** las aserciones de accesibilidad SHALL ejecutarse con él
- **AND** NO SHALL requerirse un step, job ni servicio adicional

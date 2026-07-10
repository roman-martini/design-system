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
- **THEN** Vitest SHALL ejecutar `button.spec.ts` y SHALL retornar exit 0 con todos los tests passing

#### Scenario: test del comportamiento disabled

- **GIVEN** un Button renderizado con `disabled` set a `true`
- **WHEN** se simula un click
- **THEN** el output `clicked` SHALL NO emitir

#### Scenario: test del comportamiento enabled

- **GIVEN** un Button renderizado sin disabled (default false)
- **WHEN** se simula un click
- **THEN** el output `clicked` SHALL emitir exactamente una vez

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

### Requirement: Componente DsModal

El package SHALL exponer `DsModal` (selector `ds-modal`), el primer componente overlay del kit, implementado sobre el elemento `<dialog>` nativo con `showModal()` (top layer, focus trap, fondo inerte y restauración de foco provistos por la plataforma — [ADR-013](../../../docs/architecture/adr/ADR-013-overlays-dialog-nativo.md)). Sigue ADR-004/ADR-007/ADR-010 (arquitectura y naming), ADR-012 (iconografía del botón de cierre) y el patrón de overlay de tokens de aaa-009. SHALL soportar `open` (model two-way boolean), `size` (`'sm' | 'md' | 'lg' | 'xl'`, default `'md'`), `heading` (input string para el título accesible), `closeLabel` (input string, default "Cerrar"), `closeOnEscape` (input boolean, default `true`), `closeOnOverlay` (input boolean, default `true`), slot default para el cuerpo y slot `[ds-modal-footer]` para acciones.

#### Scenario: estructura de archivos

- **WHEN** se inspecciona `packages/components/src/lib/modal/`
- **THEN** existen `modal.ts`, `modal.html`, `modal.css`, `modal.spec.ts`, `modal.stories.ts`, `index.ts`
- **AND** la class se llama `DsModal` y el selector es `ds-modal`

#### Scenario: apertura y cierre controlados con [(open)]

- **GIVEN** un consumidor con `<ds-modal [(open)]="opened">` y `opened = signal(false)`
- **WHEN** el consumidor setea `opened` en `true`
- **THEN** el modal SHALL mostrarse como diálogo modal (top layer, `showModal()`)
- **WHEN** el consumidor setea `opened` en `false`
- **THEN** el modal SHALL cerrarse

#### Scenario: cierre por tecla ESC sincroniza el model

- **GIVEN** un modal abierto con `closeOnEscape` default (`true`)
- **WHEN** el usuario presiona `Escape`
- **THEN** el modal SHALL cerrarse
- **AND** el model `open` del consumidor SHALL pasar a `false` (sin divergencia de estado)

#### Scenario: closeOnEscape=false mantiene el modal abierto

- **GIVEN** un modal abierto con `[closeOnEscape]="false"`
- **WHEN** el usuario presiona `Escape`
- **THEN** el modal SHALL permanecer abierto
- **AND** el model `open` SHALL seguir en `true`

#### Scenario: cierre por click en el overlay

- **GIVEN** un modal abierto con `closeOnOverlay` default (`true`)
- **WHEN** el usuario hace click sobre el backdrop (fuera del contenido)
- **THEN** el modal SHALL cerrarse y el model SHALL pasar a `false`
- **WHEN** `[closeOnOverlay]="false"`
- **THEN** el click en el backdrop NO SHALL cerrar el modal

#### Scenario: botón X de cierre según ADR-012

- **WHEN** se inspecciona el header del modal renderizado
- **THEN** SHALL existir un botón cuyo único contenido es el icono `LucideX` (16 / 1.5)
- **AND** el botón SHALL tener `aria-label` igual a `closeLabel` (default "Cerrar")
- **AND** el `<svg>` SHALL tener `aria-hidden="true"`
- **AND** el click en ese botón SHALL cerrar el modal y actualizar el model

#### Scenario: sizes consumen los tokens component.modal.size

- **WHEN** se renderiza `<ds-modal size="sm|md|lg|xl">`
- **THEN** el ancho del contenido SHALL derivar de `var(--ds-component-modal-size-<size>)` (sm=448px, md=640px, lg=896px, xl=1152px)
- **AND** NO SHALL haber anchos hardcodeados en el CSS del componente

#### Scenario: a11y de diálogo modal provista por la plataforma

- **GIVEN** un modal abierto vía `showModal()`
- **THEN** el foco SHALL quedar atrapado dentro del modal mientras esté abierto
- **AND** el contenido de fondo SHALL quedar inerte (interacción y árbol de accesibilidad)
- **AND** al cerrar, el foco SHALL restaurarse al elemento que tenía el foco antes de abrir

#### Scenario: título accesible via heading

- **GIVEN** `<ds-modal heading="Confirmar acción">`
- **WHEN** se inspecciona el DOM abierto
- **THEN** SHALL renderizarse un heading con ese texto e `id` único
- **AND** el `<dialog>` SHALL referenciarlo vía `aria-labelledby`

#### Scenario: animación con tokens de overlay y reduced motion

- **WHEN** se inspecciona `modal.css`
- **THEN** las transiciones de entrada SHALL usar `var(--ds-semantic-motion-transition-overlay-enter)` y las de salida `var(--ds-semantic-motion-transition-overlay-exit)` (fade + scale)
- **AND** SHALL existir un bloque `@media (prefers-reduced-motion: reduce)` que desactiva las transiciones

#### Scenario: backdrop con tokens de overlay

- **WHEN** se inspecciona el estilo del `::backdrop`
- **THEN** el fondo SHALL ser `var(--ds-semantic-color-bg-overlay)`
- **AND** SHALL aplicar `backdrop-filter: blur(var(--ds-semantic-effect-blur-overlay))`

#### Scenario: body scroll lock mientras está abierto

- **GIVEN** un documento con scroll
- **WHEN** el modal se abre
- **THEN** el `<body>` SHALL quedar con el scroll bloqueado
- **WHEN** el modal se cierra (o el componente se destruye abierto)
- **THEN** el scroll del `<body>` SHALL restaurarse
- **AND** con múltiples modales abiertos, el scroll SHALL restaurarse recién cuando cierra el último

#### Scenario: peerDependency de Lucide declarada (ejecuta ADR-012 §2)

- **WHEN** se inspecciona `packages/components/package.json`
- **THEN** `peerDependencies` SHALL incluir `@lucide/angular`
- **AND** el README del package SHALL documentar la peer dependency y su motivo

#### Scenario: exportado desde public-api.ts

- **WHEN** se inspecciona `packages/components/src/public-api.ts`
- **THEN** SHALL contener `export * from './lib/modal';`
- **AND** un consumidor SHALL poder hacer `import { DsModal, type DsModalSize } from '@romanmartinidev/components'`

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

### Requirement: @angular/forms como peerDependency

El package `@romanmartinidev/components/package.json` SHALL declarar `@angular/forms` en `peerDependencies` con rango `^21.0.0` cuando expone componentes que implementan `ControlValueAccessor`. Si no se declara, el consumidor recibe warning de peer dep faltante.

#### Scenario: peerDependencies incluye @angular/forms

- **WHEN** se inspecciona `packages/components/package.json` campo `peerDependencies`
- **THEN** SHALL contener `"@angular/forms": "^21.0.0"`

#### Scenario: warning si consumidor no tiene @angular/forms

- **GIVEN** un consumidor sin `@angular/forms` instalado
- **WHEN** se ejecuta `npm install @romanmartinidev/components`
- **THEN** npm SHALL emitir warning de peer dep faltante

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

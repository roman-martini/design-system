---
name: playground-app
type: spec
status: active
created: 2026-06-01
---

# playground-app

## Purpose

Define los requisitos del workspace `apps/playground/` como laboratorio interno del monorepo: identidad y privacidad (no publicable), modo zoneless de Angular 21, consumo de las libs internas (`@romanmartinidev/tokens` y `@romanmartinidev/components`) vía `workspace:*`, orden de import de tokens CSS, demo del Button en la app, ausencia de routing y SSR en esta fase, setup de Storybook 10 con stories co-ubicadas en `packages/components/`, tests con Vitest alineado al stack de components, y build exitoso end-to-end.

## Requirements

### Requirement: Identidad y propósito del playground

El workspace `apps/playground/` SHALL existir como app Angular 21 cuyo propósito es servir de laboratorio para validar las libs publicables del monorepo (`@romanmartinidev/tokens`, `@romanmartinidev/components`) y para crear prototipos exportables. El `package.json` del playground SHALL declarar `"private": true` (no se publica a npm). SHALL declarar `name: "playground"` (o `"@romanmartinidev/playground"` con `private: true`).

#### Scenario: playground no se publica a npm

- **WHEN** se inspecciona `apps/playground/package.json`
- **THEN** el campo `private: true` SHALL estar presente
- **AND** SHALL NO declarar `publishConfig`, `files`, ni intentar publicarse

#### Scenario: ubicado bajo apps/\*

- **WHEN** se inspecciona `pnpm-workspace.yaml`
- **THEN** el patrón `apps/*` SHALL incluir `apps/playground/`
- **AND** `pnpm install` SHALL reconocerlo como workspace

### Requirement: Modo zoneless (sin zone.js)

El playground SHALL ejecutarse en modo **zoneless change detection** de Angular 21. SHALL invocar `provideExperimentalZonelessChangeDetection()` (o nombre estable equivalente en Angular 21) en `app.config.ts`. SHALL NO incluir `zone.js` ni en `dependencies`/`devDependencies` ni en `polyfills` de `angular.json`.

#### Scenario: bootstrap declara zoneless

- **WHEN** se inspecciona `apps/playground/src/app/app.config.ts`
- **THEN** el array `providers` SHALL contener `provideExperimentalZonelessChangeDetection()` (o equivalente Angular 21)

#### Scenario: zone.js no está en el bundle

- **WHEN** se ejecuta `pnpm -F playground build` y se inspecciona el output
- **THEN** ningún chunk SHALL contener `zone.js` como dependencia
- **AND** `apps/playground/angular.json` campo `polyfills` SHALL estar vacío o no incluir `zone.js`

### Requirement: Consumo de libs internas vía workspace:\*

El `package.json` del playground SHALL declarar `@romanmartinidev/tokens` y `@romanmartinidev/components` en `dependencies` con valor `workspace:*`. SHALL declarar Angular core packages (`@angular/core`, `@angular/common`, `@angular/platform-browser`) en `dependencies` con rango `^21.0.0`. NO SHALL hardcodear versiones semver para las libs internas durante desarrollo.

#### Scenario: dependencias internas usan workspace:\*

- **WHEN** se inspecciona `apps/playground/package.json` campo `dependencies`
- **THEN** SHALL contener `"@romanmartinidev/tokens": "workspace:*"` y `"@romanmartinidev/components": "workspace:*"`

#### Scenario: pnpm install resuelve workspace deps localmente

- **GIVEN** monorepo configurado
- **WHEN** se ejecuta `pnpm install` desde root
- **THEN** `apps/playground/node_modules/@romanmartinidev/tokens` SHALL resolverse al workspace `packages/tokens` (symlink o resolución pnpm equivalente)
- **AND** `apps/playground/node_modules/@romanmartinidev/components` SHALL resolverse al workspace `packages/components`

### Requirement: Import de tokens CSS antes de componentes

El entry CSS (`src/styles.css` o equivalente) o el `main.ts` SHALL importar `@romanmartinidev/tokens/css` antes de que se rendericen componentes que dependan de las variables `--ds-*`. Sin este import, los componentes pintan sin estilos resueltos.

#### Scenario: styles.css importa tokens

- **WHEN** se inspecciona `apps/playground/src/styles.css`
- **THEN** SHALL contener `@import '@romanmartinidev/tokens/css';` (o equivalente: `@import url(...)` o un import en `main.ts`)

#### Scenario: variables --ds-\* resueltas en runtime

- **GIVEN** la app levantada con `pnpm -F playground start`
- **WHEN** se inspecciona el `<html>` en el browser
- **THEN** `getComputedStyle(document.documentElement).getPropertyValue('--ds-semantic-color-bg-primary')` SHALL retornar un valor no vacío

### Requirement: Demo del Button en la app

El `AppComponent` SHALL importar `ButtonComponent` y renderizarlo en su template demostrando al menos: una variant `primary`, una `secondary`, una `ghost`, y un estado `disabled`. El template SHALL ser autoexplicativo sobre cómo se consumen los componentes.

#### Scenario: AppComponent importa ButtonComponent

- **WHEN** se inspecciona `apps/playground/src/app/app.component.ts`
- **THEN** SHALL importar `ButtonComponent` desde `@romanmartinidev/components`
- **AND** SHALL incluirlo en el array `imports` del decorator (standalone)

#### Scenario: template renderiza al menos 4 botones demo

- **GIVEN** la app levantada
- **WHEN** se cuentan los elementos `<rmd-button>` en el DOM renderizado
- **THEN** SHALL haber al menos 4 instancias cubriendo los estados primary, secondary, ghost, disabled

### Requirement: Single page sin routing

El playground SHALL NO configurar router en Fase 4. NO SHALL declarar `provideRouter()` ni `<router-outlet>`. El template raíz SHALL renderizar directamente el contenido demo.

#### Scenario: sin provideRouter

- **WHEN** se inspecciona `app.config.ts`
- **THEN** el array `providers` SHALL NO contener `provideRouter(...)`

#### Scenario: sin router-outlet

- **WHEN** se inspecciona el template de `AppComponent`
- **THEN** SHALL NO contener `<router-outlet>`

### Requirement: Setup de Storybook 10 en .storybook/

`apps/playground/.storybook/` SHALL contener al menos `main.ts`, `preview.ts`, `tsconfig.json`. `main.ts` SHALL declarar `framework: '@storybook/angular'`, `stories: ['../../../packages/components/src/lib/**/*.stories.ts']` (paths relativos a `.storybook/`). `preview.ts` SHALL importar `@romanmartinidev/tokens/css` para que las stories pinten con tokens. `package.json` SHALL incluir scripts `storybook` (dev) y `build-storybook`.

#### Scenario: storybook arranca

- **WHEN** se ejecuta `pnpm -F playground storybook`
- **THEN** el dev server SHALL arrancar sin errores y servir en localhost:6006 (default Storybook)
- **AND** la sidebar SHALL mostrar la story de Button

#### Scenario: preview carga tokens CSS

- **WHEN** se inspecciona `apps/playground/.storybook/preview.ts`
- **THEN** SHALL contener un import de `@romanmartinidev/tokens/css`

### Requirement: Story del Button co-ubicada con el componente

`packages/components/src/lib/button/button.stories.ts` SHALL existir con stories CSF 3 cubriendo: Default, Variants (primary/secondary/ghost), Sizes (sm/md/lg), Disabled. Las stories SHALL exponer args interactivos en el Storybook controls panel para `variant`, `size`, `disabled`.

#### Scenario: button.stories.ts existe co-ubicado

- **WHEN** se inspecciona `packages/components/src/lib/button/`
- **THEN** SHALL existir el archivo `button.stories.ts`
- **AND** SHALL exportar `default { component: ButtonComponent, ... }` (CSF 3)

#### Scenario: Storybook renderiza las stories del Button

- **GIVEN** Storybook levantado
- **WHEN** se navega a la categoría Button
- **THEN** SHALL haber al menos 4 stories visibles: Default, Variants, Sizes, Disabled
- **AND** los controles del panel SHALL permitir cambiar `variant`, `size`, `disabled` interactivamente

#### Scenario: stories no entran al tarball publicable

- **WHEN** se ejecuta `npm pack --dry-run` desde `packages/components/`
- **THEN** el listado SHALL NO contener `button.stories.ts` ni ningún `*.stories.ts`
- **AND** `dist/` SHALL NO contener artefactos compilados de stories

### Requirement: Tests con Vitest alineado con components

`apps/playground/` SHALL usar Vitest con `@analogjs/vitest-angular` + `@analogjs/vite-plugin-angular` + `jsdom`. SHALL incluir al menos un spec del `AppComponent` que verifica creación y renderizado de al menos un `<rmd-button>`. NO SHALL usar Karma/Jasmine.

#### Scenario: corre con pnpm test

- **WHEN** se ejecuta `pnpm -F playground test` (o `pnpm -F playground exec vitest run`)
- **THEN** Vitest SHALL ejecutar los specs y retornar exit 0 con todos passing

#### Scenario: app.component.spec.ts verifica integración con Button

- **GIVEN** un spec del AppComponent
- **WHEN** se monta el componente
- **THEN** el spec SHALL encontrar al menos un elemento `rmd-button` en el DOM renderizado

### Requirement: Sin SSR

El playground SHALL NO configurar SSR (Server-Side Rendering) en Fase 4. NO SHALL declarar `provideClientHydration`, archivos `server.ts`, ni dependencies `@angular/platform-server` / `@angular/ssr`. El build SHALL ser CSR puro.

#### Scenario: sin server bundle

- **WHEN** se ejecuta `pnpm -F playground build`
- **THEN** el output SHALL contener solo el browser bundle (`dist/playground/browser/` o equivalente)
- **AND** SHALL NO contener `dist/playground/server/`

### Requirement: Build del playground es exitoso

`pnpm -F playground build` SHALL completar sin errores y producir un bundle browser válido. El bundle SHALL incluir el código del Button y los CSS resueltos de tokens.

#### Scenario: build fresco produce output

- **GIVEN** `apps/playground/dist/` borrado
- **WHEN** se ejecuta `pnpm -F playground build`
- **THEN** el comando SHALL retornar exit 0
- **AND** SHALL crearse al menos `index.html`, archivos JS bundle, y CSS bundle dentro del dist
- **AND** el CSS bundle SHALL contener al menos una variable `--ds-*` (importada desde tokens)

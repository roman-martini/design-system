# playground-app — delta de a11y-testing-gates

## MODIFIED Requirements

### Requirement: Modo zoneless (sin zone.js)

El playground SHALL ejecutarse en modo **zoneless change detection** de Angular 21. SHALL invocar `provideExperimentalZonelessChangeDetection()` (o nombre estable equivalente en Angular 21) en `app.config.ts`. SHALL NO incluir `zone.js` ni en `dependencies`/`devDependencies` ni en `polyfills` de `angular.json`.

**La suite de tests SHALL correr bajo el mismo modelo de change detection que la aplicación**: el setup de test SHALL configurar el TestBed en modo zoneless y SHALL NO importar el setup de zone. Testear bajo un modelo de change detection distinto al de producción invalida la fidelidad de la suite — un defecto de detección de cambios propio de zoneless pasaría los tests y fallaría en la app real.

#### Scenario: bootstrap declara zoneless

- **WHEN** se inspecciona `apps/playground/src/app/app.config.ts`
- **THEN** el array `providers` SHALL contener `provideExperimentalZonelessChangeDetection()` (o equivalente Angular 21)

#### Scenario: zone.js no está en el bundle

- **WHEN** se ejecuta `pnpm -F playground build` y se inspecciona el output
- **THEN** ningún chunk SHALL contener `zone.js` como dependencia
- **AND** `apps/playground/angular.json` campo `polyfills` SHALL estar vacío o no incluir `zone.js`

#### Scenario: el setup de test es zoneless

- **WHEN** se inspecciona `apps/playground/src/test-setup.ts`
- **THEN** SHALL configurar el TestBed en modo zoneless
- **AND** SHALL NO importar el setup de zone
- **AND** `pnpm -F playground test` SHALL retornar exit 0

### Requirement: Tests con Vitest alineado con components

`apps/playground/` SHALL usar Vitest con `@analogjs/vitest-angular` + `@analogjs/vite-plugin-angular` + `jsdom`. SHALL incluir al menos un spec del componente raíz `App` que verifica creación y renderizado de al menos un `<ds-button>`. NO SHALL usar Karma/Jasmine.

El smoke de las vistas del showcase SHALL derivarse del **registro único** de entradas, no de una lista escrita a mano: agregar un componente al registro SHALL agregar su cobertura de smoke sin editar el spec. La aserción SHALL verificar que la vista montó; las aserciones de contenido específico pertenecen al spec del componente correspondiente.

#### Scenario: corre con pnpm test

- **WHEN** se ejecuta `pnpm -F playground test` (o `pnpm -F playground exec vitest run`)
- **THEN** Vitest SHALL ejecutar los specs y retornar exit 0 con todos passing

#### Scenario: app.spec.ts verifica integración con Button

- **GIVEN** un spec del componente raíz `App`
- **WHEN** se monta el componente
- **THEN** el spec SHALL encontrar al menos un elemento `ds-button` en el DOM renderizado

#### Scenario: toda vista del registro tiene smoke test

- **GIVEN** el registro de entradas del showcase
- **WHEN** se ejecuta la suite del playground
- **THEN** SHALL montarse la ruta lazy de **cada** entrada del registro
- **AND** cada vista SHALL montar sin error y con contenido renderizado
- **AND** una entrada nueva en el registro SHALL quedar cubierta sin editar el spec

## MODIFIED Requirements

### Requirement: Demo del Button en la app

El componente raíz `App` SHALL importar `DsButton` y renderizarlo en su template demostrando al menos: una variant `primary`, una `secondary`, una `ghost`, y un estado `disabled`. El template SHALL ser autoexplicativo sobre cómo se consumen los componentes.

#### Scenario: App importa DsButton

- **WHEN** se inspecciona `apps/playground/src/app/app.ts`
- **THEN** SHALL importar `DsButton` desde `@romanmartinidev/components`
- **AND** SHALL incluirlo en el array `imports` del decorator (standalone)

#### Scenario: template renderiza al menos 4 botones demo

- **GIVEN** la app levantada
- **WHEN** se cuentan los elementos `<ds-button>` en el DOM renderizado
- **THEN** SHALL haber al menos 4 instancias cubriendo los estados primary, secondary, ghost, disabled

### Requirement: Story del Button co-ubicada con el componente

`packages/components/src/lib/button/button.stories.ts` SHALL existir con stories CSF 3 cubriendo: Default, Variants (primary/secondary/ghost), Sizes (sm/md/lg), Disabled. Las stories SHALL exponer args interactivos en el Storybook controls panel para `variant`, `size`, `disabled`.

#### Scenario: button.stories.ts existe co-ubicado

- **WHEN** se inspecciona `packages/components/src/lib/button/`
- **THEN** SHALL existir el archivo `button.stories.ts`
- **AND** SHALL exportar `default { component: DsButton, ... }` (CSF 3)

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

`apps/playground/` SHALL usar Vitest con `@analogjs/vitest-angular` + `@analogjs/vite-plugin-angular` + `jsdom`. SHALL incluir al menos un spec del componente raíz `App` que verifica creación y renderizado de al menos un `<ds-button>`. NO SHALL usar Karma/Jasmine.

#### Scenario: corre con pnpm test

- **WHEN** se ejecuta `pnpm -F playground test` (o `pnpm -F playground exec vitest run`)
- **THEN** Vitest SHALL ejecutar los specs y retornar exit 0 con todos passing

#### Scenario: app.spec.ts verifica integración con Button

- **GIVEN** un spec del componente raíz `App`
- **WHEN** se monta el componente
- **THEN** el spec SHALL encontrar al menos un elemento `ds-button` en el DOM renderizado

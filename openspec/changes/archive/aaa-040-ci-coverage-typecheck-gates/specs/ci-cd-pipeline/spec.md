# ci-cd-pipeline — delta de ci-coverage-typecheck-gates

## MODIFIED Requirements

### Requirement: Workflow de validación en cada PR

El repo SHALL incluir un workflow `.github/workflows/pr.yml` que se dispara en cada `pull_request` apuntado a `main`. El workflow SHALL ejecutar al menos: instalación de deps con lockfile congelado, format check, lint, **typecheck recursivo**, build recursivo de todos los workspaces, **tests con cobertura**, y validación de OpenSpec. El workflow SHALL fallar si cualquier paso reporta exit code distinto de 0.

El step de typecheck SHALL ejecutarse **antes** del build recursivo, de modo que un error de tipos se reporte como tal —con archivo y línea— en vez de manifestarse como un build roto.

La validación de OpenSpec SHALL ejecutarse con el CLI **`@fission-ai/openspec`** declarado como devDependency del root e invocado vía `pnpm exec`, de modo que quede bajo `pnpm install --frozen-lockfile` como el resto del toolchain. NO SHALL invocarse vía `npx --yes openspec`: el package `openspec` del registry de npm es un placeholder sin ejecutable y no corresponde a este CLI.

#### Scenario: PR con código que rompe build falla CI

- **GIVEN** un PR que introduce un error de TypeScript en `packages/components/`
- **WHEN** el PR se abre o actualiza
- **THEN** el workflow `pr.yml` SHALL fallar en el step de `pnpm -r build`
- **AND** el status de "All checks passed" del PR SHALL ser rojo

#### Scenario: PR con tests fallidos falla CI

- **GIVEN** un PR que rompe un test existente
- **WHEN** se dispara el workflow
- **THEN** el step de tests con cobertura SHALL fallar con exit code distinto de 0

#### Scenario: PR con OpenSpec inválido falla CI

- **GIVEN** un PR que modifica una spec base sin respetar el formato (ej. quita `## Purpose`)
- **WHEN** se dispara el workflow
- **THEN** el step `pnpm exec openspec validate --all` SHALL fallar

#### Scenario: la validación de OpenSpec no depende de instalaciones globales

- **GIVEN** un runner limpio sin ningún CLI de OpenSpec en el PATH
- **WHEN** corre `pnpm install --frozen-lockfile` seguido del step de validación
- **THEN** el CLI SHALL resolverse desde `node_modules` del repo
- **AND** SHALL validar las specs y changes reales, no abortar por ejecutable ausente

#### Scenario: PR con format incorrecto falla CI

- **GIVEN** un PR con archivos no formateados según Prettier
- **WHEN** se dispara el workflow
- **THEN** el step `pnpm format:check` SHALL fallar

#### Scenario: el typecheck falla antes que el build

- **GIVEN** un PR cuyo único defecto es un error de tipos en un archivo de test
- **WHEN** se dispara el workflow
- **THEN** el step de typecheck SHALL fallar señalando el archivo
- **AND** el step de build recursivo NO SHALL haberse ejecutado

## ADDED Requirements

### Requirement: Gate de cobertura con umbral en packages con código instrumentable

Los workspaces con código fuente instrumentable SHALL declarar en su `vitest.config.ts` un bloque `coverage` con provider `v8` y reporters aptos para lectura humana y para consumo por herramientas (texto en consola más un formato máquina tipo `lcov`).

Todo workspace con código instrumentable SHALL declarar **thresholds** de cobertura, y la corrida con cobertura SHALL **fallar** con exit code distinto de 0 cuando cualquier métrica cae por debajo de su umbral. Emitir una advertencia sin fallar NO satisface este requirement.

Los umbrales SHALL fijarse en el nivel de cobertura **realmente medido** al instalarlos, no en un valor aspiracional, y SHALL comportarse como trinquete: una vez fijados solo suben. Bajar un umbral SHALL requerir decisión explícita del product owner, registrada como tal.

Un workspace **sin código fuente instrumentable** —aquel cuyos tests validan un artefacto generado y no un módulo propio— SHALL declarar el bloque `coverage` sin thresholds, y su contrato de calidad SHALL cubrirse con tests de validación del artefacto. Declarar un umbral que no puede fallar NO satisface este requirement.

La política de cobertura vigente SHALL estar documentada en `CONTRIBUTING.md`.

#### Scenario: cobertura bajo el umbral falla el PR

- **GIVEN** un PR que agrega código sin tests a `@romanmartinidev/components`, dejando la cobertura por debajo de su threshold
- **WHEN** corre el step de tests con cobertura
- **THEN** el step SHALL terminar con exit code distinto de 0
- **AND** el PR NO SHALL poder mergearse

#### Scenario: cobertura sobre el umbral pasa

- **GIVEN** un PR cuya cobertura se mantiene igual o por encima de todos los thresholds declarados
- **WHEN** corre el step de tests con cobertura
- **THEN** el step SHALL terminar con exit code 0

#### Scenario: package sin código instrumentable no declara umbral vacuo

- **GIVEN** `@romanmartinidev/tokens`, cuyos tests validan el artefacto emitido por Style Dictionary y que no expone módulos TypeScript propios
- **WHEN** se inspecciona su configuración de cobertura
- **THEN** SHALL tener provider y reporters declarados
- **AND** NO SHALL declarar thresholds que ninguna corrida pueda incumplir

### Requirement: Typecheck de specs y stories en CI

Cada workspace SHALL exponer un script `typecheck` que ejecute el compilador de TypeScript **sin emitir** sobre una configuración que incluya los archivos excluidos del build de la librería — `*.spec.ts` y `*.stories.ts` entre ellos. El root SHALL exponer un `typecheck` que los agregue a todos.

El workflow `pr.yml` SHALL ejecutar el typecheck recursivo como step bloqueante: un error de tipos en un spec o en una story SHALL fallar el PR.

Toda configuración de typecheck referenciada por el script SHALL ser ejecutable en un checkout limpio: los type libraries que declare SHALL estar instalados como dependencias del workspace.

#### Scenario: rename de input rompe una story y falla CI

- **GIVEN** un PR que renombra un input público de un componente sin actualizar su story
- **WHEN** corre el step de typecheck
- **THEN** el step SHALL fallar señalando el archivo de la story
- **AND** el resultado SHALL ser rojo aunque el build de la librería sea exitoso

#### Scenario: error de tipos en un spec falla CI

- **GIVEN** un PR con un spec que referencia un tipo inexistente
- **WHEN** corre el step de typecheck
- **THEN** el step SHALL fallar señalando el archivo del spec

#### Scenario: el typecheck corre en un checkout limpio

- **GIVEN** un runner que acaba de correr `pnpm install --frozen-lockfile`
- **WHEN** se ejecuta `pnpm typecheck` en el root
- **THEN** SHALL typechequear los tres workspaces
- **AND** NO SHALL abortar por un type library declarado pero no instalado

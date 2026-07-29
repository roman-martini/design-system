---
name: ci-cd-pipeline
type: spec
status: active
created: 2026-06-01
---

# ci-cd-pipeline

## Purpose

Define los requisitos del pipeline de CI/CD del repo: dos workflows GitHub Actions (`pr.yml` para validacion de PRs y `release.yml` para release con Changesets, este ultimo partido en un job de versionado y uno de publish con gate de aprobacion), composite action de setup compartido, secret `NPM_TOKEN` en el environment `npm-publish`, cache de pnpm habilitado, version de Node leida desde `.nvmrc`, branch protection y environment documentados en CONTRIBUTING.md, y los gates obligatorios de cada PR: `actionlint`, Conventional Commits, typecheck de specs y stories, cobertura con umbral, packaging, validacion OpenSpec y changeset obligatorio en PRs que tocan packages publicables.

Cubre ademas el hardening del pipeline: permisos de least-privilege y `timeout-minutes` por job, actions externas pineadas por SHA de commit completo, y actualizacion automatizada de dependencias vía Dependabot como contraparte de ese pinning.

## Requirements

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

### Requirement: Verificación de packaging en cada PR

El repo SHALL incluir un script `scripts/verify-packaging.mjs`, invocable como `pnpm verify:packaging`, que verifica sobre el **artefacto emitido** que ambos packages publicables son publicables de forma correcta. El workflow `pr.yml` SHALL ejecutarlo como step posterior al build recursivo, y SHALL fallar si el script retorna exit code distinto de 0.

La verificación SHALL correr contra el **directorio de publicación real** de cada package — `dist/` para `@romanmartinidev/components` (que publica vía `publishConfig.directory`) y el root del package para `@romanmartinidev/tokens` — y SHALL usar `npm pack --dry-run --json` para calcular el contenido del tarball, porque npm es quien lo arma en el publish real.

El script SHALL verificar, como mínimo:

1. **Compilation mode**: ningún bundle `dist/fesm2022/*.mjs` de components contiene `ɵɵdefineComponent`, y al menos uno contiene `ɵɵngDeclareComponent`.
2. **Manifest sin envenenar**: ningún `package.json` bajo `dist/` declara `scripts.prepublishOnly` — firma del guard que ng-packagr escribe al detectar full compilation mode.
3. **Contenido del tarball**: presencia de `package.json`, `README.md`, `LICENSE`, `CHANGELOG.md` y los artefactos de todos los entry points; ausencia de sources, specs, stories y configs de build.
4. **Exports resolubles**: cada path declarado en el `exports` del manifest publicado existe dentro del tarball.
5. **LICENSE sin drift**: la copia de cada package es byte a byte idéntica al `LICENSE` del root del monorepo.

La verificación SHALL ser ejecutable en local con el mismo comando, sin depender del entorno de CI ni contactar al registry de npm.

#### Scenario: PR que reintroduce full compilation mode falla CI

- **GIVEN** un PR que quita `compilationMode: "partial"` de `packages/components/tsconfig.lib.json`
- **WHEN** se dispara el workflow `pr.yml`
- **THEN** el step de verificación de packaging SHALL fallar al encontrar `ɵɵdefineComponent` en el FESM emitido
- **AND** SHALL fallar también por el `scripts.prepublishOnly` que ng-packagr escribe en `dist/package.json`

#### Scenario: PR que rompe el contenido del tarball falla CI

- **GIVEN** un PR que agrega un entry point al `exports` sin su artefacto correspondiente, o que quita `LICENSE` de `files`
- **WHEN** se dispara el workflow
- **THEN** el step SHALL fallar identificando el path faltante y el package afectado

#### Scenario: verificación local antes de pushear

- **GIVEN** un desarrollador con el build recursivo ya ejecutado
- **WHEN** corre `pnpm verify:packaging`
- **THEN** SHALL obtener el mismo veredicto que CI, sin publicar nada ni contactar al registry

### Requirement: Conventional Commits validados en CI

El workflow `pr.yml` SHALL validar con `commitlint` que todos los commits del PR cumplen Conventional Commits, reutilizando la configuración del repo. La validación SHALL correr sobre el rango **real del PR** — de `pull_request.base.sha` a `pull_request.head.sha` — y NO SHALL incluir el merge commit sintético que GitHub genera para el evento, cuyo mensaje no cumple la convención por construcción.

El hook local `commit-msg` sigue siendo la primera línea de defensa; este gate cubre el bypass con `--no-verify`.

#### Scenario: PR con un commit malformado falla CI

- **GIVEN** un PR cuya rama contiene un commit con mensaje `arreglos varios`
- **WHEN** se dispara `pr.yml`
- **THEN** el step de commitlint SHALL fallar identificando el commit y la regla violada

#### Scenario: el merge commit del evento no invalida el PR

- **GIVEN** un PR cuyos commits cumplen todos la convención
- **WHEN** se dispara `pr.yml` sobre el merge commit sintético del evento
- **THEN** el step de commitlint SHALL pasar

### Requirement: Changeset obligatorio en PRs que tocan packages publicables

El workflow `pr.yml` SHALL contener un step que verifica que si el PR modifica archivos bajo `packages/*` (excepto `packages/*/README.md` y `packages/*/CHANGELOG.md`), entonces el PR SHALL incluir al menos un changeset agregado en `.changeset/*.md`. Si no, el workflow SHALL fallar con mensaje claro indicando que se debe agregar un changeset.

La detección SHALL basarse **exclusivamente en la lista de archivos modificados** (`git diff --name-only` entre `pull_request.base.sha` y `pull_request.head.sha`). NO SHALL inferirse el veredicto parseando la salida de `changeset status` ni de ningún otro CLI, porque ese output es texto decorado sin contrato de estabilidad. Un fallo del comando `git` SHALL abortar el step; NO SHALL tratarse como "no hubo cambios".

El step SHALL omitirse cuando el PR proviene del branch `changeset-release/main` — el PR autogenerado por `changesets/action`, que por construcción bumpea `packages/*/package.json` **después** de consumir los changesets y por lo tanto nunca puede satisfacer el gate.

#### Scenario: PR sin changeset que toca packages/ falla

- **GIVEN** un PR que modifica `packages/components/src/lib/button/button.component.ts` sin agregar `.changeset/*.md`
- **WHEN** se dispara el workflow
- **THEN** el step de changeset enforcement SHALL fallar
- **AND** el mensaje SHALL indicar exactamente cómo agregar el changeset (`pnpm changeset`)

#### Scenario: PR con changeset que toca packages/ pasa

- **GIVEN** un PR que modifica `packages/components/...` y agrega `.changeset/foo.md`
- **WHEN** se dispara el workflow
- **THEN** el step de changeset enforcement SHALL pasar

#### Scenario: el PR de release de Changesets no requiere changeset

- **GIVEN** el PR autogenerado desde el branch `changeset-release/main`, que bumpea `packages/*/package.json`, actualiza los CHANGELOG y elimina los `.changeset/*.md` consumidos
- **WHEN** se dispara el workflow
- **THEN** el step de changeset enforcement SHALL omitirse (skipped), no fallar
- **AND** el resto de los checks de `pr.yml` SHALL correr normalmente

#### Scenario: PR que solo modifica docs/ NO requiere changeset

- **GIVEN** un PR que solo modifica archivos bajo `docs/`, `openspec/`, o el README root
- **WHEN** se dispara el workflow
- **THEN** el step de changeset enforcement SHALL pasar sin exigir changeset

#### Scenario: PR que solo modifica README de un package NO requiere changeset

- **GIVEN** un PR que solo modifica `packages/components/README.md` (cambio doc, sin tocar API)
- **WHEN** se dispara el workflow
- **THEN** el step de changeset enforcement SHALL pasar sin exigir changeset
- **AND** el step SHALL aclarar en el output que se reconoció la excepción "solo README/CHANGELOG de package"

#### Scenario: PR que modifica CHANGELOG de un package NO requiere changeset

- **GIVEN** un PR autogenerado por `changesets/action` que actualiza `packages/<name>/CHANGELOG.md`
- **WHEN** se dispara el workflow
- **THEN** el step de changeset enforcement SHALL pasar sin exigir changeset (el changelog es output, no input)

#### Scenario: un fallo de git no deja pasar el PR en silencio

- **GIVEN** un entorno donde el `git diff` del step no puede resolverse
- **WHEN** corre el changeset enforcement
- **THEN** el step SHALL fallar con el error de git
- **AND** NO SHALL interpretar la salida vacía como "el PR no toca packages"

### Requirement: Workflow de release con Changesets

El repo SHALL incluir un workflow `.github/workflows/release.yml` que se dispara en `push` a `main` y usa [`changesets/action`](https://github.com/changesets/action). El workflow SHALL separar sus dos modos en **dos jobs distintos**:

1. **Job de versionado** (sin gate de aprobación): cuando hay changesets pendientes en `.changeset/`, abre o actualiza un PR titulado "chore(repo): version packages" con los bumps de versión y CHANGELOGs actualizados. SHALL exponer como output si quedaban changesets pendientes.
2. **Job de publish** (con gate de aprobación): condicionado a que el job anterior reporte que **no** quedan changesets pendientes, ejecuta el build recursivo y `changeset publish` contra el npm registry.

El job de publish SHALL declarar `environment: npm-publish`, un GitHub Environment con **required reviewer**, de modo que ninguna publicación ocurra sin aprobación humana explícita (D-018(b)). El `NPM_TOKEN` SHALL ser secret **de ese environment**, no del repositorio, de forma que ningún otro job pueda leerlo.

El job de publish SHALL declarar el permiso **`id-token: write`**, requerido para emitir la attestation de procedencia (npm provenance) al publicar desde GitHub Actions, junto con `publishConfig.provenance: true` en los packages publicables (D-018(c)).

La configuración de changesets SHALL usar el generador **`@changesets/changelog-github`**, de modo que cada entrada del CHANGELOG publicado enlace su commit, PR y autor en lugar de mostrar un hash sin link.

#### Scenario: changesets pendientes generan PR de release sin pedir aprobación

- **GIVEN** main tiene merges con changesets pendientes en `.changeset/`
- **WHEN** se dispara `release.yml`
- **THEN** el job de versionado SHALL crear o actualizar un PR titulado "chore(repo): version packages" sin requerir aprobación manual
- **AND** el PR SHALL contener bumps de versión en `packages/*/package.json`
- **AND** el PR SHALL contener CHANGELOG.md actualizado por package
- **AND** los archivos `.changeset/*.md` consumidos SHALL ser eliminados en el PR
- **AND** el job de publish SHALL omitirse

#### Scenario: merge del PR de release pide aprobación antes de publicar

- **GIVEN** el PR "Version Packages" es mergeado a main (no quedan changesets pendientes)
- **WHEN** se dispara `release.yml`
- **THEN** el job de publish SHALL quedar en espera de aprobación del required reviewer del environment `npm-publish`
- **AND** SHALL ejecutar el build recursivo y `changeset publish` únicamente después de que la aprobación se otorgue
- **AND** los packages que tienen nueva versión SHALL publicarse a npm

#### Scenario: sin aprobación no hay publicación

- **GIVEN** un run de `release.yml` con el job de publish esperando aprobación
- **WHEN** el reviewer rechaza la aprobación o el run expira
- **THEN** ningún package SHALL publicarse a npm
- **AND** el `NPM_TOKEN` NO SHALL haber sido expuesto a ningún job

#### Scenario: components se publica desde su dist

- **GIVEN** `packages/components/package.json` declara `publishConfig.directory: "dist"`
- **WHEN** `changeset publish` publica el package
- **THEN** SHALL ejecutar el publish sobre `packages/components/dist/`, de modo que el manifest publicado sea el generado por ng-packagr
- **AND** el contrato publicado (`exports`, `module`, `typings`) SHALL ser el generado, no el del manifest raíz

#### Scenario: las entradas del CHANGELOG enlazan su origen

- **GIVEN** `.changeset/config.json` con el generador `@changesets/changelog-github`
- **WHEN** `changeset version` genera el CHANGELOG de un release
- **THEN** cada entrada SHALL incluir link al commit o PR que la introdujo y a su autor

#### Scenario: workspace:\* se reescribe al publicar

- **GIVEN** `packages/components/package.json` declara `@romanmartinidev/tokens: workspace:*`
- **WHEN** Changesets publica components
- **THEN** el `package.json` del tarball publicado SHALL tener `@romanmartinidev/tokens` con una versión semver real (ej. `^0.1.0`), NO `workspace:*`

### Requirement: Secret NPM_TOKEN configurado

El repo SHALL requerir el secret de GitHub `NPM_TOKEN` con permisos de publish sobre el scope `@romanmartinidev`. El secret SHALL configurarse en el **environment `npm-publish`**, no a nivel repositorio, y SHALL ser referenciado únicamente por el job de publish de `release.yml`.

#### Scenario: release falla sin NPM_TOKEN configurado

- **GIVEN** el secret `NPM_TOKEN` NO está configurado en el environment `npm-publish`
- **WHEN** el job de publish ejecuta `changeset publish` con versiones nuevas
- **THEN** el step SHALL fallar con error de autenticación de npm

#### Scenario: NPM_TOKEN inyectado correctamente

- **GIVEN** `NPM_TOKEN` configurado como secret del environment `npm-publish`
- **WHEN** el job de publish, ya aprobado, corre el step de publish
- **THEN** el step SHALL crear `.npmrc` temporal con `//registry.npmjs.org/:_authToken=${NPM_TOKEN}` (o equivalente vía `setup-node`)
- **AND** `changeset publish` SHALL autenticar y publicar

#### Scenario: el token no es legible desde el job de versionado

- **GIVEN** `NPM_TOKEN` como secret del environment `npm-publish`
- **WHEN** corre el job de versionado, que no declara ese environment
- **THEN** el secret NO SHALL estar disponible en su contexto

### Requirement: Least-privilege y timeout en todos los jobs

Ambos workflows SHALL declarar un bloque `permissions` explícito con el mínimo necesario, en lugar de heredar el default del repo. `pr.yml` SHALL declarar `contents: read`. En `release.yml`, los permisos SHALL declararse **por job**: el job de versionado con `contents: write` y `pull-requests: write` (necesarios para abrir el PR de release), y el job de publish con `contents: write` (el publish pushea los tags de release y crea los GitHub releases) e `id-token: write`.

Todo job de ambos workflows SHALL declarar `timeout-minutes` con un valor acotado, para que un proceso colgado no consuma el default de 360 minutos.

#### Scenario: pr.yml no puede escribir en el repositorio

- **GIVEN** el workflow `pr.yml` con `permissions: contents: read`
- **WHEN** un step intenta pushear un commit o abrir un PR con el `GITHUB_TOKEN`
- **THEN** la operación SHALL fallar por permisos insuficientes

#### Scenario: un job colgado se corta antes del límite del runner

- **GIVEN** un job con `timeout-minutes` declarado
- **WHEN** un step queda bloqueado más allá de ese valor
- **THEN** GitHub Actions SHALL cancelar el job en ese punto y no a los 360 minutos

### Requirement: Actions externas pineadas por SHA

Toda action de terceros referenciada por los workflows o por la composite action SHALL pinearse por **SHA de commit completo (40 caracteres)**, con la versión legible como comentario en la misma línea (`uses: owner/action@<sha> # vX.Y.Z`). NO SHALL usarse tags mutables (`@v1`, `@v4`) ni ramas, porque un tag puede reapuntarse a código distinto sin cambio alguno en este repo.

#### Scenario: ninguna referencia a action usa tag mutable

- **WHEN** se inspeccionan `.github/workflows/*.yml` y `.github/actions/**/action.yml`
- **THEN** toda directiva `uses:` que apunte a un repositorio externo SHALL referenciar un SHA de 40 caracteres
- **AND** SHALL llevar la versión correspondiente como comentario

### Requirement: Actualización automatizada de dependencias

El repo SHALL incluir `.github/dependabot.yml` configurando, como mínimo, los ecosistemas **`github-actions`** y **`npm`**, con cadencia semanal. Los updates de tipo minor y patch SHALL agruparse para acotar el volumen de PRs; los majors SHALL llegar como PRs individuales.

Este requirement es la contraparte operativa del pinning por SHA: sin actualización automatizada, pinear congela las versiones indefinidamente.

#### Scenario: un bump de action llega como PR revisable

- **GIVEN** `.github/dependabot.yml` con el ecosistema `github-actions`
- **WHEN** una de las actions pineadas publica una versión nueva
- **THEN** Dependabot SHALL abrir un PR que actualiza el SHA y su comentario de versión
- **AND** ese PR SHALL pasar por `pr.yml` como cualquier otro

### Requirement: Cache de pnpm habilitado

Ambos workflows (`pr.yml` y `release.yml`) SHALL usar el cache nativo de `setup-node` con `cache: 'pnpm'` para acelerar instalaciones. La cache key SHALL basarse en `pnpm-lock.yaml`.

#### Scenario: segundo run del workflow reusa cache

- **GIVEN** un primer run completo de `pr.yml` con cache fría
- **WHEN** un segundo PR dispara `pr.yml` sin cambios en `pnpm-lock.yaml`
- **THEN** el step `pnpm install --frozen-lockfile` SHALL completar significativamente más rápido por hit de cache (objetivo: <30s vs >2min en cold)

### Requirement: Versión de Node alineada con .nvmrc

Los workflows SHALL leer la versión de Node desde `.nvmrc` (`node-version-file: '.nvmrc'`) — NO SHALL hardcodear la versión en el YAML. Cambiar la versión de Node en el repo se hace en un solo lugar (`.nvmrc`).

#### Scenario: cambio en .nvmrc impacta el CI

- **GIVEN** un PR que sube `.nvmrc` de `22` a `24`
- **WHEN** el workflow `pr.yml` corre
- **THEN** `setup-node` SHALL usar Node 24 (sin tocar el YAML)

### Requirement: Workflows validados con actionlint

El repo SHALL ser validable con [`actionlint`](https://github.com/rhysd/actionlint) — herramienta estándar de lint para GitHub Actions YAML. Los workflows SHALL pasar `actionlint .github/workflows/*.yml` sin errores, tanto en la ejecución local del desarrollador como en el step de CI que lo hace obligatorio.

#### Scenario: PR con YAML de workflow inválido es detectable

- **GIVEN** un dev modifica `pr.yml` con sintaxis incorrecta
- **WHEN** corre `actionlint .github/workflows/pr.yml` localmente
- **THEN** SHALL detectar el error antes del push

#### Scenario: el mismo veredicto local y en CI

- **GIVEN** un workflow que actionlint reporta como válido en local
- **WHEN** el PR corre el step de actionlint en CI
- **THEN** SHALL obtener el mismo veredicto

### Requirement: actionlint ejecutado en CI

El workflow `pr.yml` SHALL ejecutar `actionlint` sobre `.github/workflows/*.yml` y SHALL fallar si reporta errores. El binario SHALL obtenerse en una **versión fija** y su descarga SHALL verificarse contra el checksum SHA256 publicado por el proyecto **antes** de extraerlo o ejecutarlo.

El alcance excluye las composite actions (`.github/actions/**/action.yml`): actionlint solo entiende el schema de workflow y reporta una action como inválida por no declarar `on` ni `jobs`. Su verificación queda cubierta por el resto de los gates, que fallan si la action deja de funcionar.

Este requirement convierte en enforcement automático el SHALL de validez de workflows que hasta ahora solo se cumplía manualmente.

#### Scenario: PR que introduce una expresión inválida en un workflow falla CI

- **GIVEN** un PR que agrega un step con una referencia a un contexto inexistente en `pr.yml`
- **WHEN** se dispara el workflow
- **THEN** el step de actionlint SHALL fallar señalando archivo, línea y regla

#### Scenario: binario de actionlint con checksum inesperado aborta el step

- **GIVEN** un artefacto descargado cuyo SHA256 no coincide con el declarado en el workflow
- **WHEN** corre el step de actionlint
- **THEN** el step SHALL fallar antes de extraer o ejecutar el binario

### Requirement: Branch protection documentada en CONTRIBUTING

El archivo `CONTRIBUTING.md` SHALL contener una sección con el checklist de **branch protection rules** que el mantenedor debe configurar manualmente en GitHub Settings → Branches. El checklist SHALL incluir como mínimo: require PR antes de merge, require status checks de `pr.yml`, no force push, no deletions.

`CONTRIBUTING.md` SHALL documentar además la configuración manual del **environment `npm-publish`** (creación, required reviewer y `NPM_TOKEN` como secret del environment), aclarando que hasta que se configure el gate de publish **no ofrece protección**: GitHub crea implícitamente un environment inexistente, sin reviewers, en el primer run que lo referencia.

#### Scenario: CONTRIBUTING.md tiene la sección de branch protection

- **WHEN** se inspecciona `CONTRIBUTING.md`
- **THEN** SHALL existir una sección titulada "Branch protection" (o similar)
- **AND** SHALL listar los requisitos a aplicar en GitHub UI
- **AND** SHALL aclarar que la configuración es responsabilidad del mantenedor (no se aplica por código)

#### Scenario: CONTRIBUTING.md documenta el environment de publish

- **WHEN** se inspecciona la sección de release de `CONTRIBUTING.md`
- **THEN** SHALL describir cómo crear el environment `npm-publish` con required reviewer
- **AND** SHALL advertir que el gate no protege hasta que esa configuración exista

### Requirement: Composite action o steps reutilizables

Para evitar duplicación entre `pr.yml` y `release.yml`, los steps comunes (checkout + setup pnpm + setup node con cache + install) SHALL extraerse a una composite action en `.github/actions/setup/action.yml` O definirse en un step inicial idéntico en ambos workflows con comentario que lo señale como "mantener sincronizado".

#### Scenario: cambio en pnpm version aplica a ambos workflows

- **GIVEN** una composite action `.github/actions/setup/`
- **WHEN** un dev sube la versión de pnpm en la action
- **THEN** ambos workflows SHALL usar la nueva versión sin requerir edición en cada YAML por separado

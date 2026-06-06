---
name: ci-cd-pipeline
type: spec
status: active
created: 2026-06-01
---

# ci-cd-pipeline

## Purpose

Define los requisitos del pipeline de CI/CD del repo: dos workflows GitHub Actions (`pr.yml` para validacion de PRs y `release.yml` para release con Changesets), composite action de setup compartido, secret `NPM_TOKEN` requerido, cache de pnpm habilitado, version de Node leida desde `.nvmrc`, validez con `actionlint`, branch protection documentada en CONTRIBUTING.md, y enforcement de changeset obligatorio en PRs que tocan packages publicables.

## Requirements

### Requirement: Workflow de validación en cada PR

El repo SHALL incluir un workflow `.github/workflows/pr.yml` que se dispara en cada `pull_request` apuntado a `main`. El workflow SHALL ejecutar al menos: instalación de deps con lockfile congelado, format check, lint, build recursivo de todos los workspaces, tests, y validación de OpenSpec. El workflow SHALL fallar si cualquier paso reporta exit code distinto de 0.

#### Scenario: PR con código que rompe build falla CI

- **GIVEN** un PR que introduce un error de TypeScript en `packages/components/`
- **WHEN** el PR se abre o actualiza
- **THEN** el workflow `pr.yml` SHALL fallar en el step de `pnpm -r build`
- **AND** el status de "All checks passed" del PR SHALL ser rojo

#### Scenario: PR con tests fallidos falla CI

- **GIVEN** un PR que rompe un test existente
- **WHEN** se dispara el workflow
- **THEN** el step `pnpm -r test` SHALL fallar con exit code distinto de 0

#### Scenario: PR con OpenSpec inválido falla CI

- **GIVEN** un PR que modifica una spec base sin respetar el formato (ej. quita `## Purpose`)
- **WHEN** se dispara el workflow
- **THEN** el step `openspec validate --all` SHALL fallar

#### Scenario: PR con format incorrecto falla CI

- **GIVEN** un PR con archivos no formateados según Prettier
- **WHEN** se dispara el workflow
- **THEN** el step `pnpm format:check` SHALL fallar

### Requirement: Changeset obligatorio en PRs que tocan packages publicables

El workflow `pr.yml` SHALL contener un step que verifica que si el PR modifica archivos bajo `packages/*` (excepto `packages/*/README.md` puramente), entonces el PR SHALL incluir al menos un changeset en `.changeset/*.md`. Si no, el workflow SHALL fallar con mensaje claro indicando que se debe agregar un changeset.

#### Scenario: PR sin changeset que toca packages/ falla

- **GIVEN** un PR que modifica `packages/components/src/lib/button/button.component.ts` sin agregar `.changeset/*.md`
- **WHEN** se dispara el workflow
- **THEN** el step de changeset enforcement SHALL fallar
- **AND** el mensaje SHALL indicar exactamente cómo agregar el changeset (`pnpm changeset`)

#### Scenario: PR con changeset que toca packages/ pasa

- **GIVEN** un PR que modifica `packages/components/...` y agrega `.changeset/foo.md`
- **WHEN** se dispara el workflow
- **THEN** el step de changeset enforcement SHALL pasar

#### Scenario: PR que solo modifica docs/ NO requiere changeset

- **GIVEN** un PR que solo modifica archivos bajo `docs/`, `openspec/`, o el README root
- **WHEN** se dispara el workflow
- **THEN** el step de changeset enforcement SHALL pasar sin exigir changeset

#### Scenario: PR que solo modifica README de un package NO requiere changeset

- **GIVEN** un PR que solo modifica `packages/components/README.md` (cambio doc, sin tocar API)
- **WHEN** se dispara el workflow
- **THEN** el step de changeset enforcement SHALL pasar sin exigir changeset
- **AND** el step SHALL aclarar en el output que se reconoció la excepción "solo README de package"

#### Scenario: PR que modifica CHANGELOG de un package NO requiere changeset

- **GIVEN** un PR autogenerado por `changesets/action` que actualiza `packages/<name>/CHANGELOG.md`
- **WHEN** se dispara el workflow
- **THEN** el step de changeset enforcement SHALL pasar sin exigir changeset (el changelog es output, no input)

### Requirement: Workflow de release con Changesets

El repo SHALL incluir un workflow `.github/workflows/release.yml` que se dispara en `push` a `main` y usa [`changesets/action`](https://github.com/changesets/action). El workflow SHALL operar en uno de dos modos según el estado del repo:

1. **Hay changesets pendientes en `.changeset/`**: abrir o actualizar un PR titulado "chore(repo): version packages" con los bumps de versión y CHANGELOGs actualizados.
2. **No hay changesets pendientes (post-merge del PR de release)**: ejecutar `pnpm release` para buildear y publicar al npm registry.

#### Scenario: changesets pendientes generan PR de release

- **GIVEN** main tiene merges con changesets pendientes en `.changeset/`
- **WHEN** se dispara `release.yml`
- **THEN** `changesets/action` SHALL crear o actualizar un PR titulado "chore(repo): version packages"
- **AND** el PR SHALL contener bumps de versión en `packages/*/package.json`
- **AND** el PR SHALL contener CHANGELOG.md actualizado por package
- **AND** los archivos `.changeset/*.md` consumidos SHALL ser eliminados en el PR

#### Scenario: merge del PR de release dispara publish

- **GIVEN** el PR "Version Packages" es mergeado a main (no quedan changesets pendientes)
- **WHEN** se dispara `release.yml`
- **THEN** el workflow SHALL ejecutar `pnpm release` (que internamente corre `pnpm -r build && changeset publish`)
- **AND** los packages que tienen nueva versión SHALL publicarse a npm

#### Scenario: workspace:\* se reescribe al publicar

- **GIVEN** `packages/components/package.json` declara `@romanmartinidev/tokens: workspace:*`
- **WHEN** Changesets publica components
- **THEN** el `package.json` del tarball publicado SHALL tener `@romanmartinidev/tokens` con una versión semver real (ej. `^0.1.0`), NO `workspace:*`

### Requirement: Secret NPM_TOKEN configurado

El repo SHALL requerir el secret de GitHub `NPM_TOKEN` con permisos de publish sobre el scope `@romanmartinidev`. El workflow `release.yml` SHALL referenciar este secret en el step de publish.

#### Scenario: release falla sin NPM_TOKEN configurado

- **GIVEN** el secret `NPM_TOKEN` NO está configurado en GitHub Settings → Secrets
- **WHEN** `release.yml` intenta ejecutar `pnpm release` con changesets aplicados
- **THEN** el step SHALL fallar con error de autenticación de npm

#### Scenario: NPM_TOKEN inyectado correctamente

- **GIVEN** `NPM_TOKEN` configurado
- **WHEN** `release.yml` corre el step de publish
- **THEN** el step SHALL crear `.npmrc` temporal con `//registry.npmjs.org/:_authToken=${NPM_TOKEN}` (o equivalente vía `setup-node`)
- **AND** `changeset publish` SHALL autenticar y publicar

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

El repo SHALL ser validable con [`actionlint`](https://github.com/rhysd/actionlint) — herramienta estándar de lint para GitHub Actions YAML. Los workflows SHALL pasar `actionlint .github/workflows/*.yml` sin errores.

#### Scenario: PR con YAML de workflow inválido es detectable

- **GIVEN** un dev modifica `pr.yml` con sintaxis incorrecta
- **WHEN** corre `actionlint .github/workflows/pr.yml` localmente
- **THEN** SHALL detectar el error antes del push

### Requirement: Branch protection documentada en CONTRIBUTING

El archivo `CONTRIBUTING.md` SHALL contener una sección con el checklist de **branch protection rules** que el mantenedor debe configurar manualmente en GitHub Settings → Branches. El checklist SHALL incluir como mínimo: require PR antes de merge, require status checks de `pr.yml`, no force push, no deletions.

#### Scenario: CONTRIBUTING.md tiene la sección de branch protection

- **WHEN** se inspecciona `CONTRIBUTING.md`
- **THEN** SHALL existir una sección titulada "Branch protection" (o similar)
- **AND** SHALL listar los requisitos a aplicar en GitHub UI
- **AND** SHALL aclarar que la configuración es responsabilidad del mantenedor (no se aplica por código)

### Requirement: Composite action o steps reutilizables

Para evitar duplicación entre `pr.yml` y `release.yml`, los steps comunes (checkout + setup pnpm + setup node con cache + install) SHALL extraerse a una composite action en `.github/actions/setup/action.yml` O definirse en un step inicial idéntico en ambos workflows con comentario que lo señale como "mantener sincronizado".

#### Scenario: cambio en pnpm version aplica a ambos workflows

- **GIVEN** una composite action `.github/actions/setup/`
- **WHEN** un dev sube la versión de pnpm en la action
- **THEN** ambos workflows SHALL usar la nueva versión sin requerir edición en cada YAML por separado

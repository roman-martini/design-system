# Delta — ci-cd-pipeline (components-fix-apf-packaging)

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Workflow de release con Changesets

El repo SHALL incluir un workflow `.github/workflows/release.yml` que se dispara en `push` a `main` y usa [`changesets/action`](https://github.com/changesets/action). El workflow SHALL operar en uno de dos modos según el estado del repo:

1. **Hay changesets pendientes en `.changeset/`**: abrir o actualizar un PR titulado "chore(repo): version packages" con los bumps de versión y CHANGELOGs actualizados.
2. **No hay changesets pendientes (post-merge del PR de release)**: ejecutar `pnpm release` para buildear y publicar al npm registry.

El job SHALL declarar el permiso **`id-token: write`**, requerido para emitir la attestation de procedencia (npm provenance) al publicar desde GitHub Actions, junto con `publishConfig.provenance: true` en los packages publicables (D-018(c)).

La configuración de changesets SHALL usar el generador **`@changesets/changelog-github`**, de modo que cada entrada del CHANGELOG publicado enlace su commit, PR y autor en lugar de mostrar un hash sin link.

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

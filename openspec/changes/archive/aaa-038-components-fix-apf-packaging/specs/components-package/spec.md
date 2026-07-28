# Delta — components-package (components-fix-apf-packaging)

## MODIFIED Requirements

### Requirement: Identidad del package publicable

El package SHALL llamarse `@romanmartinidev/components`. Su `package.json` SHALL declarar `name`, `version`, `description`, `author`, `license` (MIT), `keywords`, `repository` (con `type`, `url` y `directory` apuntando a `packages/components`), `homepage`, `bugs`, `publishConfig` y `sideEffects: false`.

El `publishConfig` SHALL declarar `access: "public"` y **`directory: "dist"`**: el artefacto publicado es el output de ng-packagr, y su `dist/package.json` generado es la **fuente única** del contrato publicado (exports, module, typings).

El manifest raíz **NO SHALL** declarar `main`, que apunta a una ruta inexistente dentro de `dist/`. SHALL declarar `files` con las rutas **relativas al contenido de `dist/`** (`fesm2022`, `types`, `router`, `README.md`, `LICENSE`, `CHANGELOG.md`), porque ng-packagr lo copia sin reescribir al manifest generado: dejar el valor apuntando a `dist` produciría un tarball vacío, y omitirlo haría que `npm-packlist` descarte `dist/router/package.json` — el mini-manifest de fallback del entry point secundario — al tratar ese subdirectorio como package anidado.

El sub-path `"./package.json"` del `exports` SHALL declararse en forma de objeto (`{ "default": "./package.json" }`); la forma de string plano hace fallar la generación del manifest de ng-packagr.

El manifest raíz SHALL conservar `module`, `types` y `exports` (incluido `"./package.json"`): dentro del monorepo son lo que resuelve el package para playground y Storybook, ya que no hay `paths` de tsconfig. Estos campos son **detalle de resolución interna**, no contrato publicado: ng-packagr los reescribe con rutas relativas a `dist/` en el manifest generado.

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
- **THEN** todos SHALL existir — la verificación que ADR-017 declaró como mitigación del entry point secundario

#### Scenario: el tarball incluye el texto de la licencia

- **WHEN** se inspecciona el tarball publicable
- **THEN** SHALL contener un `LICENSE` byte a byte idéntico al `LICENSE` del root del monorepo
- **AND** SHALL contener `CHANGELOG.md`

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

# Delta — design-tokens-package (components-fix-apf-packaging)

## MODIFIED Requirements

### Requirement: Surface de exports granular

El `package.json` SHALL declarar el campo `exports` con sub-paths separados para JS, CSS base y cada theme. El sub-path raíz (`"."`) SHALL exponer el JS y los types. El sub-path `"./css"` SHALL exponer el CSS base. Cada theme SHALL exponerse bajo `"./themes/<nombre>"`. El `exports` SHALL declarar además `"./package.json"`: con `exports` cerrado, todo sub-path no listado queda encapsulado, y el tooling que resuelve el manifest del package (schematics, bundlers, analizadores de versión) falla con `ERR_PACKAGE_PATH_NOT_EXPORTED`.

#### Scenario: consumidor importa solo el CSS base

- **WHEN** un consumidor escribe `import '@romanmartinidev/tokens/css';`
- **THEN** el bundler SHALL resolver a `dist/tokens.css`

#### Scenario: consumidor importa un theme específico

- **WHEN** un consumidor escribe `import '@romanmartinidev/tokens/themes/dark';`
- **THEN** el bundler SHALL resolver a `dist/themes/dark.css`

#### Scenario: consumidor importa tokens JS

- **WHEN** un consumidor escribe `import { ... } from '@romanmartinidev/tokens';`
- **THEN** el bundler SHALL resolver a `dist/tokens.js` con tipos desde `dist/tokens.d.ts`

#### Scenario: el manifest del package es resoluble

- **WHEN** una herramienta resuelve `@romanmartinidev/tokens/package.json`
- **THEN** SHALL resolver al `package.json` del package sin error de export

#### Scenario: import a sub-path no declarado falla

- **WHEN** un consumidor escribe `import '@romanmartinidev/tokens/internal';`
- **THEN** el bundler SHALL fallar con error de export no encontrado (Node resolution con `exports` cerrado)

### Requirement: Contenido publicable limitado a dist/

El package SHALL publicarse **desde el root del package** (a diferencia de `@romanmartinidev/components`, que publica su `dist/` — ver ADR-021): Style Dictionary no genera un `package.json`, y el manifest escrito a mano es el contrato publicado.

El `package.json` SHALL declarar `files` con `dist/`, `README.md`, `LICENSE` y `CHANGELOG.md`. El `node_modules/`, sources (`src/`), tests (`test/`), configs de build (`sd.config.mjs`, `vitest.config.ts`) y archivos de desarrollo NO SHALL incluirse en el tarball publicado.

El package SHALL incluir un `LICENSE` propio en su directorio, byte a byte idéntico al del root del monorepo: npm solo auto-incluye el `LICENSE` que vive en el directorio del package, y publicar `"license": "MIT"` sin el texto ni el copyright notice incumple la condición de atribución de la licencia.

El manifest **NO SHALL** declarar `engines`: los requisitos de Node y pnpm son del monorepo, no del consumidor de un package de CSS y constantes JS.

El package SHALL declarar un script `prepublishOnly` que aborte la publicación si `dist/` no existe o no contiene los artefactos declarados en `exports`, dado que publicar desde el root no ofrece garantía estructural de que el build haya corrido.

#### Scenario: pnpm pack incluye solo lo declarado

- **WHEN** se ejecuta `npm pack --dry-run` desde el directorio del package
- **THEN** el listado SHALL contener `dist/`, `package.json`, `README.md`, `LICENSE` y `CHANGELOG.md`
- **AND** SHALL NO contener `src/`, `test/`, `sd.config.mjs`, `vitest.config.ts` ni archivos `.json` de tokens

#### Scenario: el tarball incluye el texto de la licencia

- **WHEN** se inspecciona el tarball publicable
- **THEN** SHALL contener un `LICENSE` byte a byte idéntico al `LICENSE` del root del monorepo

#### Scenario: publicar sin build previo aborta

- **GIVEN** `packages/tokens/dist/` inexistente o incompleto
- **WHEN** se intenta publicar el package
- **THEN** el script `prepublishOnly` SHALL fallar con exit code distinto de 0 y mensaje explicando que falta el build

#### Scenario: cada path del exports existe en el tarball

- **WHEN** se resuelve cada path declarado en `exports` contra el contenido del tarball
- **THEN** todos SHALL existir

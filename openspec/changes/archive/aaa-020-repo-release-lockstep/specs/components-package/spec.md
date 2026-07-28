# Delta — components-package (repo-release-lockstep)

## MODIFIED Requirements

### Requirement: Angular y tokens como peerDependencies

El `package.json` SHALL declarar `@angular/core`, `@angular/common` y `@romanmartinidev/tokens` como `peerDependencies`. Angular SHALL declararse con rango `^21.0.0`. `@romanmartinidev/tokens` SHALL declararse con el rango semver plano **`>=0.1.0 <1.0.0`** mientras el par esté pre-1.0 (al saltar a 1.0 pasa a `^1.0.0`), publicado **tal cual** (sin pin exacto ni protocol de workspace). Ambos packages versionan en **lockstep** (ADR-015): la versión hermana siempre satisface el rango, y el consumidor SHALL instalar ambos en la misma versión (documentado en README). NO SHALL declararse ninguna de estas tres como `dependencies` regular (evitar duplicación en el bundle del consumidor; convención de ng-packagr y del ecosistema Angular libs).

#### Scenario: instalar el package en un consumidor con Angular

- **GIVEN** un proyecto consumidor con Angular 21 y `@romanmartinidev/tokens` instalados
- **WHEN** se ejecuta `npm install @romanmartinidev/components`
- **THEN** npm SHALL satisfacer las peer deps sin instalar otra copia de Angular ni de tokens

#### Scenario: tokens debe instalarse explícitamente

- **GIVEN** un consumidor que no tiene `@romanmartinidev/tokens` instalado
- **WHEN** se ejecuta `npm install @romanmartinidev/components`
- **THEN** npm SHALL emitir warning de peer dep faltante exigiendo instalar `@romanmartinidev/tokens` explícitamente

#### Scenario: el tarball publica el rango del peer, no un pin

- **WHEN** se publica el package vía `pnpm release` (Changesets)
- **THEN** el `package.json` del tarball SHALL tener `@romanmartinidev/tokens` con el rango declarado (`>=0.1.0 <1.0.0`), no un protocol de workspace ni una versión exacta pinneada

### Requirement: Reglas de dependencia respetadas

El package SHALL NO depender de ninguna app en `apps/*`. SHALL declarar `@romanmartinidev/tokens` como `peerDependencies` con el rango de la política lockstep (**`>=0.1.0 <1.0.0`** pre-1.0, ADR-015). SHALL declarar Angular como `peerDependencies`. SHALL NO crear ciclo con `tokens` (tokens no consume components).

#### Scenario: components depende de tokens como peer dep

- **WHEN** se inspecciona `packages/components/package.json` campo `peerDependencies`
- **THEN** SHALL contener `@romanmartinidev/tokens: ">=0.1.0 <1.0.0"`, `@angular/core: "^21.0.0"`, `@angular/common: "^21.0.0"`
- **AND** SHALL NO contener referencias a `playground` ni a apps en `apps/*`
- **AND** SHALL NO declarar `dependencies` regulares

#### Scenario: tokens no depende de components

- **WHEN** se inspecciona `packages/tokens/package.json`
- **THEN** SHALL NO mencionar `@romanmartinidev/components` en `dependencies`, `peerDependencies` ni `devDependencies`

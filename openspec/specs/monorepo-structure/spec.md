---
name: monorepo-structure
type: spec
status: active
created: 2026-05-30
---

# monorepo-structure

## Purpose

Define los requisitos estructurales del monorepo `design-system`: elección y uso de package manager, declaración de workspaces, fijación de versiones de runtime, hooks de calidad (commits, lint, format), scripts uniformes de test y typecheck por workspace, estrategia de versionado/publicación, y reglas de dependencia entre packages internos. Esta capability captura el contrato que debe cumplir el repo para que las librerías publicables (`packages/*`) y la app de prueba (`apps/playground`) coexistan de forma escalable y mantenible.

## Requirements

### Requirement: pnpm como package manager único

El monorepo SHALL usar `pnpm` como único package manager. La versión SHALL estar fija en el campo `packageManager` del `package.json` root y SHALL coincidir con la versión de pnpm de los desarrolladores y el CI.

#### Scenario: clonado fresco usa pnpm correctamente

- **GIVEN** un desarrollador clona el repo en una máquina limpia
- **WHEN** ejecuta `nvm use` seguido de `pnpm install`
- **THEN** la instalación completa sin errores y crea `pnpm-lock.yaml` único en root

#### Scenario: intento de usar npm o yarn es bloqueado

- **GIVEN** el monorepo configurado
- **WHEN** un desarrollador ejecuta `npm install` o `yarn install` en root
- **THEN** el comando SHALL fallar o emitir warning explícito (vía `engine-strict` y `packageManager` enforcement) antes de modificar lockfiles

### Requirement: Workspaces declarados explícitamente

El archivo `pnpm-workspace.yaml` SHALL declarar `packages/*` y `apps/*` como workspaces. Toda librería publicable vive en `packages/`. Toda app consumidora vive en `apps/`.

#### Scenario: agregar un nuevo package

- **GIVEN** el workspace configurado
- **WHEN** un desarrollador agrega `packages/icons/package.json`
- **THEN** `pnpm install` lo reconoce automáticamente como workspace sin modificar `pnpm-workspace.yaml`

#### Scenario: dependencia interna usa workspace:\*

- **GIVEN** `packages/components` necesita `packages/tokens`
- **WHEN** se declara la dependencia en `package.json`
- **THEN** se usa el protocolo `"@romanmartinidev/tokens": "workspace:*"` (no una versión semver hardcodeada)

### Requirement: Versión de Node fija

El repo SHALL declarar la versión de Node a usar en `.nvmrc`. Cada `package.json` (root + workspaces) SHALL declarar `engines.node` compatible con esa versión. `.npmrc` SHALL tener `engine-strict=true`.

#### Scenario: Node version mismatch falla install

- **GIVEN** un desarrollador tiene Node 18 instalado
- **WHEN** ejecuta `pnpm install` en el repo
- **THEN** pnpm SHALL abortar con error explicando que `engines.node` no se cumple

### Requirement: Conventional Commits validados por hook

Todo commit SHALL seguir [Conventional Commits](https://www.conventionalcommits.org/). El hook `commit-msg` de Husky SHALL ejecutar commitlint con `@commitlint/config-conventional` y abortar commits malformados.

#### Scenario: commit malformado rechazado

- **GIVEN** Husky y commitlint configurados
- **WHEN** un desarrollador ejecuta `git commit -m "arreglo cosas"`
- **THEN** el commit SHALL ser rechazado por commitlint con mensaje explicando el formato esperado

#### Scenario: commit válido aceptado

- **GIVEN** Husky y commitlint configurados
- **WHEN** un desarrollador ejecuta `git commit -m "feat(tokens): add neutral color scale"`
- **THEN** el commit SHALL pasar sin errores

### Requirement: Pre-commit corre lint y format en staged files

El hook `pre-commit` de Husky SHALL ejecutar `lint-staged`. `lint-staged` SHALL aplicar `eslint --fix` y `prettier --write` a archivos `*.{ts,js}` staged, y `prettier --write` a `*.{md,json,yaml,yml}` staged.

#### Scenario: archivo con errores de lint es corregido o rechazado

- **GIVEN** un archivo TS staged con un error auto-fixable (ej. comilla doble en vez de simple)
- **WHEN** el desarrollador commitea
- **THEN** lint-staged SHALL auto-corregir antes del commit y re-stagear el archivo

#### Scenario: archivo con error no auto-fixable bloquea commit

- **GIVEN** un archivo TS staged con un error no auto-fixable (ej. variable no usada con regla `error`)
- **WHEN** el desarrollador commitea
- **THEN** el commit SHALL ser abortado con mensaje de lint apuntando al error

### Requirement: Versionado y publicación con Changesets

El repo SHALL usar `@changesets/cli` para gestionar versiones y changelogs de los packages publicables. La configuración SHALL declarar `access: "public"` y `baseBranch: "main"`. Toda PR que afecte un package publicable SHALL incluir un changeset.

#### Scenario: crear un changeset

- **GIVEN** Changesets configurado
- **WHEN** un desarrollador ejecuta `pnpm changeset`
- **THEN** el CLI SHALL preguntar qué packages cambiaron, qué tipo de bump (`patch`/`minor`/`major`) y una descripción, generando un archivo en `.changeset/`

#### Scenario: changeset version actualiza package.json y CHANGELOG

- **GIVEN** uno o más changesets pendientes en `.changeset/`
- **WHEN** se ejecuta `pnpm version`
- **THEN** Changesets SHALL actualizar las versiones en los `package.json` afectados, regenerar CHANGELOG.md por package y borrar los changesets consumidos

### Requirement: Configuración de lint y format compartida

El repo SHALL tener `eslint.config.js` y `.prettierrc` en root. Estos SHALL servir como configuración base que cualquier workspace puede extender. Las reglas de ESLint SHALL no entrar en conflicto con Prettier (vía `eslint-config-prettier`).

#### Scenario: workspace extiende config base

- **GIVEN** `eslint.config.js` en root con reglas base
- **WHEN** `packages/components/eslint.config.js` extiende la base
- **THEN** las reglas base aplican + las específicas del package se suman sin duplicación

### Requirement: Scripts de test y typecheck uniformes por workspace

Todo workspace del monorepo que tenga tests SHALL exponer el mismo juego de scripts con semántica idéntica:

| Script          | Semántica                                                                 |
| --------------- | ------------------------------------------------------------------------- |
| `test`          | corre la suite **una vez** y retorna exit code; nunca queda en modo watch |
| `test:watch`    | corre la suite en modo watch, para desarrollo local                       |
| `test:coverage` | corre la suite una vez recolectando cobertura                             |
| `typecheck`     | typechequea sin emitir los archivos excluidos del build de la librería    |

El root SHALL agregar estos scripts de forma recursiva, de modo que el comando documentado en `CLAUDE.md` se comporte igual en local que en CI.

`test` SHALL retornar control al terminar en cualquier entorno: un script que entra en watch cuando corre en una terminal interactiva NO satisface este requirement, porque bloquea la ejecución recursiva desde el root.

#### Scenario: pnpm test del root termina en local

- **GIVEN** una terminal interactiva en la raíz del monorepo
- **WHEN** se ejecuta `pnpm test`
- **THEN** SHALL correr la suite de los tres workspaces
- **AND** SHALL retornar el control con un exit code, sin quedar en watch

#### Scenario: cada workspace expone el mismo juego de scripts

- **GIVEN** los `package.json` de `packages/tokens`, `packages/components` y `apps/playground`
- **WHEN** se inspeccionan sus scripts
- **THEN** los cuatro nombres SHALL estar presentes en los tres
- **AND** SHALL tener la misma semántica en todos

#### Scenario: typecheck recursivo desde el root

- **GIVEN** la raíz del monorepo
- **WHEN** se ejecuta `pnpm typecheck`
- **THEN** SHALL ejecutar el `typecheck` de cada workspace
- **AND** SHALL fallar si cualquiera de ellos reporta un error de tipos

### Requirement: ADRs documentan decisiones one-way door

Toda decisión arquitectónica que es one-way door o afecta ≥2 packages SHALL generar un ADR en `docs/architecture/adr/` siguiendo formato MADR. Los ADRs SHALL ser inmutables una vez aceptados.

#### Scenario: cambio de package manager requiere nuevo ADR

- **GIVEN** ADR-001 acepta pnpm workspaces
- **WHEN** alguien propone cambiar a Nx
- **THEN** SHALL crearse un ADR nuevo con el siguiente ID disponible que referencia y reemplaza el ADR-001 (sin editar el ADR-001 original más allá de marcar estado "Reemplazado por ADR-NNN")

### Requirement: Grafo de dependencias internas es un DAG

El grafo de dependencias entre workspaces internos (paquetes y apps del monorepo, declaradas con protocolo `workspace:*`) SHALL ser un Grafo Acíclico Dirigido (DAG). No SHALL existir ciclos directos ni transitivos.

Las apps en `apps/*` SHALL poder depender de packages en `packages/*`. Los packages en `packages/*` SHALL NO depender de ninguna app en `apps/*`. Un package en `packages/*` SHALL poder depender de otro package en `packages/*` siempre que no se forme un ciclo.

#### Scenario: app consume packages internos vía workspace:\*

- **GIVEN** `apps/playground` necesita `@romanmartinidev/tokens` y `@romanmartinidev/components`
- **WHEN** se declaran las dependencias en su `package.json`
- **THEN** ambas SHALL usar el protocolo `"workspace:*"` y `pnpm install` las resuelve a los workspaces locales

#### Scenario: dependencia circular es detectada

- **GIVEN** existe `packages/components` que depende de `packages/tokens`
- **WHEN** alguien agrega `packages/tokens` con dependencia a `packages/components`
- **THEN** la build SHALL fallar (por loop de resolución) o un check de CI SHALL reportar el ciclo antes del merge

#### Scenario: package no depende de una app

- **GIVEN** `packages/components` está siendo modificado
- **WHEN** alguien agrega `"playground": "workspace:*"` a su `package.json`
- **THEN** SHALL ser rechazado por revisión (regla arquitectónica: los packages publicables no pueden depender de apps internas)

### Requirement: angular-app/ no existe post-bootstrap

La carpeta `angular-app/` en root SHALL NO existir. La app de prueba SHALL vivir en `apps/playground/` con Angular 21.

#### Scenario: ningún workspace conflictúa con apps/playground

- **GIVEN** post-bootstrap Fase 1
- **WHEN** se inspecciona el repo
- **THEN** no existe `angular-app/` en ningún nivel; `apps/playground/` se crea en Fase 4

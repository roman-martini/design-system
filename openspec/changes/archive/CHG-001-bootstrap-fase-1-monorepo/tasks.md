# Tasks — Bootstrap Fase 1

Cada tarea es ≤2 h y tiene criterio de aceptación binario. Marcar `[x]` al cerrar.

## 1. Limpieza pre-instalación

- [x] 1.1 Backup de `angular-app/src/stories/` a `docs/_archive/angular-app-stories/` (preservar trabajo previo)
- [x] 1.2 Verificar que `.git/` y `.gitignore` existentes no tengan estado sucio sin auditar (`git status`, `git log`)
- [x] 1.3 Borrar `packages/tokens/node_modules/`
- [x] 1.4 Borrar `packages/tokens/package-lock.json`
- [x] 1.5 Borrar carpeta `angular-app/` completa
- [x] 1.6 Confirmar limpieza: no quedan `node_modules/` ni `package-lock.json` en ningún workspace

**Criterio**: `find . -name node_modules -not -path "./.git/*"` no devuelve nada (excepto root, que aún no existe).

## 2. Estructura base del monorepo

- [x] 2.1 Crear `package.json` root con: `"private": true`, `name: "agent-design-sistem"`, `packageManager: "pnpm@9.x"`, scripts agregados (`lint`, `format`, `build`, `test`)
- [x] 2.2 Crear `pnpm-workspace.yaml` con `packages/*` y `apps/*`
- [x] 2.3 Crear `.nvmrc` con `22`
- [x] 2.4 Crear `.npmrc` con `engine-strict=true`, `auto-install-peers=true`, `strict-peer-dependencies=true`, `prefer-workspace-packages=true`
- [x] 2.5 Crear `.editorconfig` (UTF-8, LF, 2 spaces, final newline)
- [x] 2.6 Reemplazar `.gitignore` existente con versión completa (node_modules, dist, .angular, coverage, .DS_Store, etc.)

**Criterio**: `pnpm install` sin packages todavía corre sin errores y crea `pnpm-lock.yaml`.

## 3. Lint, format y editor

- [x] 3.1 Instalar devDeps: `eslint`, `@eslint/js`, `typescript-eslint`, `prettier`, `eslint-config-prettier`
- [x] 3.2 Crear `eslint.config.js` (flat config) con TS base + integración con Prettier
- [x] 3.3 Crear `.prettierrc` (printWidth 100, singleQuote, trailingComma all)
- [x] 3.4 Crear `.prettierignore` (dist, node_modules, .changeset, pnpm-lock.yaml)
- [x] 3.5 Agregar scripts root: `"lint": "eslint ."`, `"format": "prettier --write ."`, `"format:check": "prettier --check ."`

**Criterio**: `pnpm format:check` corre y reporta el estado (puede haber archivos a formatear, pero no debe crashear).

## 4. Hooks de Git y commits

- [x] 4.1 Instalar devDeps: `husky`, `@commitlint/cli`, `@commitlint/config-conventional`, `lint-staged`
- [x] 4.2 Inicializar Husky: `pnpm exec husky init`
- [x] 4.3 Crear `commitlint.config.js` con `extends: ['@commitlint/config-conventional']`
- [x] 4.4 Crear `lint-staged.config.js` con reglas para `*.{ts,js}`, `*.{md,json,yaml,yml}`
- [x] 4.5 Configurar `.husky/pre-commit` → `pnpm lint-staged`
- [x] 4.6 Configurar `.husky/commit-msg` → `pnpm commitlint --edit $1`
- [x] 4.7 Agregar `"prepare": "husky"` a scripts del root package.json (auto-agregado por `husky init`)

**Criterio**:

- Commit con mensaje malformado (`bad message`) se rechaza por commitlint.
- Commit con mensaje válido (`chore: setup commitlint`) pasa.

## 5. Versionado (Changesets)

- [x] 5.1 Instalar devDep: `@changesets/cli`
- [x] 5.2 Ejecutar `pnpm exec changeset init`
- [x] 5.3 Editar `.changeset/config.json`: `access: "public"`, `baseBranch: "main"`, `updateInternalDependencies: "patch"`
- [x] 5.4 Agregar scripts root: `"changeset": "changeset"`, `"version": "changeset version"`, `"release": "pnpm -r build && changeset publish"`

**Criterio**: `pnpm changeset` arranca el prompt interactivo sin error (cancelar con Ctrl+C después de validar).

## 6. Metadocumentación

- [x] 6.1 Crear `LICENSE` (MIT, año 2026, autor "Roman Martini")
- [x] 6.2 Crear `README.md` root con: qué es el repo, estructura, getting started (clonar, `nvm use`, `pnpm install`), links a `docs/architecture/README.md` y `CONTRIBUTING.md`
- [x] 6.3 Crear `CONTRIBUTING.md` con: flujo de PR, Conventional Commits (con ejemplos válidos/inválidos), cómo agregar un changeset, cómo correr lint/format/test

**Criterio**: README root + CONTRIBUTING + LICENSE existen y se referencian entre sí coherentemente.

## 7. ADRs

- [x] 7.1 Redactar `docs/architecture/adr/ADR-001-monorepo-pnpm-workspaces.md` (formato MADR, ≥2 opciones evaluadas con pnpm/npm/yarn workspaces, decisión = pnpm, consecuencias)
- [x] 7.2 Redactar `docs/architecture/adr/ADR-002-conventional-commits-changesets.md` (formato MADR, opciones = manual semver / semantic-release / Changesets, decisión = Changesets + Conventional Commits)
- [x] 7.3 Actualizar `docs/architecture/decisions-log.md`: reemplazar "pendiente ADR-001/002" con links reales y marcar como aceptados

**Criterio**: ambos ADRs siguen el formato MADR documentado en `docs/architecture/adr/README.md`.

## 8. Validación de cierre

- [x] 8.1 Correr `pnpm install` desde root sin errores
- [x] 8.2 Probar commit dummy malformado → rechazado por commitlint
- [x] 8.3 Probar commit dummy válido → aceptado
- [x] 8.4 `pnpm changeset` arranca correctamente (CLI instalado y `pnpm exec changeset --help` funcional)
- [x] 8.5 `pnpm lint` y `pnpm format:check` corren sin crash (lint pass; format autoaplicado a archivos del bootstrap)
- [x] 8.6 Marcar Fase 1 ✅ en `docs/bootstrap-plan.md`
- [x] 8.7 Primer commit oficial del repo: `47fed7e chore(repo): bootstrap fase 1 - monorepo base, lint, hooks, changesets`

**Criterio**: el repo queda en un estado donde Fase 2 (migrar `packages/tokens`) puede arrancar sin retrabajo.

## 9. Archivar este change

- [x] 9.1 Mover `openspec/changes/bootstrap-fase-1-monorepo/` → `openspec/changes/archive/2026-05-30-bootstrap-fase-1-monorepo/`
- [x] 9.2 Integrar deltas de spec en `openspec/specs/monorepo-structure/spec.md` (deltas `ADDED` promovidos a spec base, sync directo porque la spec no preexistía)

**Criterio**: el change está archivado y los specs reflejan el nuevo estado del repo.

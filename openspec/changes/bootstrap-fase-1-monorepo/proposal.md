# Bootstrap Fase 1 — Estructura base del monorepo

## Intent

Establecer la infraestructura base del monorepo `agent-design-sistem` para que sirva como cimiento estable de las librerías (`packages/tokens`, `packages/components`) y la app de prueba (`apps/playground`) que se desarrollarán en fases posteriores.

Sin esta infraestructura, las decisiones tomadas en el kickoff (pnpm workspaces, Conventional Commits, Changesets, ng-packagr, etc.) no tienen dónde aterrizar y cualquier trabajo posterior arrastraría deuda técnica desde el día uno.

Respalda las **tres prioridades estrictas** del repo:

1. **Buenas prácticas** — incorpora los estándares del ecosistema (Conventional Commits, semver vía Changesets, lint/format consistentes).
2. **Escalar ordenado** — pnpm workspaces permite agregar packages/apps sin reescribir nada.
3. **Mantenibilidad** — convenciones y validaciones automatizadas (Husky + commitlint + lint-staged) impiden divergencia.

## Scope

### Incluido

- Inicializar repositorio git con `.gitignore` correcto para monorepo Node/Angular.
- Crear `package.json` root del monorepo con metadata, scripts agregados y devDependencies compartidas.
- Configurar `pnpm-workspace.yaml` con `packages/*` y `apps/*`.
- Fijar versión de Node con `.nvmrc` (alineada con Angular 21 → Node 22).
- Configurar pnpm con `.npmrc` (`engine-strict=true`, `auto-install-peers=true`, `strict-peer-dependencies=true`).
- `.editorconfig` para alineación cross-IDE.
- ESLint config base + Prettier config base compartidos desde root.
- Husky + commitlint (`@commitlint/config-conventional`) + lint-staged.
- Inicializar Changesets (`@changesets/cli`).
- LICENSE (MIT), README root, CONTRIBUTING.md.
- Borrar `node_modules/` distribuidos en `packages/tokens/` y `angular-app/`.
- Borrar carpeta `angular-app/` completa (se regenera en Fase 4).
- Generar **ADR-001** (Adoptar pnpm workspaces) y **ADR-002** (Conventional Commits + Changesets).
- Actualizar `decisions-log.md` con los ADRs cerrados.

### Explícitamente excluido (otras fases)

- Migración/renombrado de `packages/tokens` → **Fase 2**.
- Creación de `packages/components` → **Fase 3**.
- Regeneración de `apps/playground` → **Fase 4**.
- GitHub Actions / CI → **Fase 5**.
- Visual regression testing → diferido post-Fase 5.

### No goals

- No se publica nada a npm en esta fase.
- No se ejecuta build de ningún package todavía (tokens se migra en Fase 2).
- No se decide la estructura interna de los componentes ni de los tokens más allá de lo ya existente.

## Approach

Ejecución en orden estricto para minimizar estados intermedios rotos:

1. **Limpieza primero**: borrar `node_modules/` distribuidos y `angular-app/` antes de instalar nada nuevo (evita conflicto de lockfiles).
2. **Cimiento de gobernanza**: `package.json` root + `pnpm-workspace.yaml` + dotfiles (`.nvmrc`, `.npmrc`, `.editorconfig`, `.gitignore`).
3. **Calidad automatizada**: instalar y configurar ESLint + Prettier + Husky + commitlint + lint-staged en un solo `pnpm install`.
4. **Versionado**: `pnpm changeset init` para crear `.changeset/config.json` con configuración alineada al scope `@romanmartinidev`.
5. **Metadocumentación**: LICENSE + README + CONTRIBUTING (este último referencia el flujo Conventional Commits + Changesets recién configurado).
6. **ADRs**: redactar ADR-001 y ADR-002 con opciones evaluadas explícitas. Actualizar `decisions-log.md`.
7. **Validación final**: `pnpm install` limpio + intento de commit dummy para confirmar que Husky/commitlint funcionan.

Al cierre, el repo queda en un estado donde Fase 2 (migrar tokens) puede arrancar sin retrabajo.

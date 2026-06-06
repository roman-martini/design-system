---
id: aaa-005
name: bootstrap-fase-5-ci
type: change
status: archived
archived: 2026-06-01
introduces-specs:
  - ci-cd-pipeline
related-adrs:
  - ADR-006
---

## Why

Después de Fase 4 (CHG-004), el repo tiene libs publicables (`@romanmartinidev/tokens`, `@romanmartinidev/components`), una app de prueba (`apps/playground`), tests Vitest, y todo el versionado configurado con Changesets — pero **sin pipeline de CI**. Eso significa:

- Cualquier PR puede mergear con tests rotos, build roto, format incorrecto, o openspec inválido.
- El publishing a npm es 100% manual (riesgo de error humano + dependencia del entorno local).
- Sin enforcement automático de Conventional Commits ni de changesets en PRs que tocan packages publicables.

Fase 5 cierra esa brecha con el **mínimo viable**: dos workflows de GitHub Actions (PR validation + release con Changesets). Sin scope adicional (Storybook deploy, a11y CI, bundle budget, visual regression) — esos se proponen como changes posteriores cuando aparezca necesidad concreta.

Esta propuesta respalda las tres prioridades del repo:

1. **Buenas prácticas**: workflows de GH Actions con cache pnpm + setup-node + Changesets es el patrón estándar del ecosistema npm moderno.
2. **Escalar ordenado**: con CI verde como gate, cualquier dev futuro puede mergear con confianza sin coordinación previa.
3. **Mantenibilidad**: branch protection rules + changesets enforcement evitan que el repo entre en estados rotos sin intervención.

Corresponde a **Fase 5 del bootstrap-plan** y cierra el bootstrap completo del monorepo.

## What Changes

### Workflow `pr.yml` — Validación en cada PR

Trigger: `pull_request` sobre `main`.

Steps:

1. Checkout (full history para changesets diff).
2. Setup pnpm + Node (versión de `.nvmrc`) con cache de pnpm.
3. `pnpm install --frozen-lockfile`.
4. `pnpm format:check`.
5. `pnpm lint`.
6. `pnpm -r build` (orden topológico: tokens → components → playground).
7. `pnpm -r test` (Vitest en components + playground).
8. `openspec validate --all`.
9. **Changeset enforcement**: si el PR toca `packages/*` pero no agrega un changeset, el step falla. Vía [`changesets/action`](https://github.com/changesets/action) con flag `requireChangeset`, o step custom con `changeset status --since=origin/main`.

### Workflow `release.yml` — Release con Changesets

Trigger: `push` a `main`.

Steps:

1. Checkout (full history).
2. Setup pnpm + Node + cache (igual que pr.yml).
3. `pnpm install --frozen-lockfile`.
4. `pnpm -r build`.
5. [`changesets/action@v1`](https://github.com/changesets/action) con:
   - `publish: pnpm release` — corre cuando el PR de release ya fue mergeado (no hay changesets pendientes → publica al npm).
   - `version: pnpm version` — corre cuando hay changesets pendientes (genera/actualiza PR "Version Packages").
   - `commit: "chore(repo): version packages"`.
   - `title: "chore(repo): version packages"`.
   - `setupGitUser: true`.
6. Secret requerido: `NPM_TOKEN` con scope `@romanmartinidev` + permisos de publish.

**Flow esperado**:

```
1. Dev abre PR cualquiera con changeset
   ↓
2. Merge a main
   ↓
3. release.yml corre, detecta changesets pendientes
   ↓
4. changesets/action abre/actualiza PR "Version Packages" con:
   - Bump de versiones en packages/*/package.json
   - CHANGELOG.md actualizado por package
   - .changeset/*.md borrados
   ↓
5. Vos revisás + aprobás + mergeás ese PR
   ↓
6. release.yml corre de nuevo, ya no hay changesets pendientes
   ↓
7. Ejecuta `pnpm release` → publica a npm con `workspace:*` reescritos a versiones reales
```

### Branch protection en `main` (acción del mantenedor)

Documentado en `CONTRIBUTING.md` como **checklist a aplicar en GitHub UI** (no se configura por código):

- Require pull request antes de merge a `main`.
- Require status checks: `pr.yml` (todos los jobs).
- No force push.
- No deletions.
- Optional: require linear history (rebase merge only).

### ADR-006 — Estrategia de CI/CD

Formaliza:

- GitHub Actions como provider (vs CircleCI, GitLab, etc.).
- Dos workflows (PR + release) como mínimo viable.
- Modelo de release con Changesets que abre PR (vs auto-publish).
- Secret `NPM_TOKEN` como mecanismo de auth a npm.
- Posterga deploy de Storybook + a11y CI + bundle budget a changes futuros.

### Validación de cierre

- `.github/workflows/pr.yml` y `release.yml` existen y pasan `actionlint` (lint de workflows).
- Un PR de prueba (cualquier change trivial) corre pr.yml completo sin errores.
- README del repo actualizado con sección "CI / Release".

## Capabilities

### New Capabilities

- `ci-cd-pipeline` (SPC-005): el pipeline de CI/CD del repo. Cubre identidad y triggers de cada workflow, jobs/steps esperados, política de release con Changesets, secrets requeridos, política de branch protection, reglas de enforcement de PRs (changeset obligatorio en PRs que tocan packages publicables).

### Modified Capabilities

Ninguna. SPC-001 .. SPC-004 no cambian.

## Impact

### Código

- **Creados**:
  - `.github/workflows/pr.yml`.
  - `.github/workflows/release.yml`.
  - `docs/architecture/adr/ADR-006-estrategia-ci-cd.md`.
- **Modificados**:
  - `CONTRIBUTING.md` — sección "CI / Release" + checklist de branch protection para el mantenedor.
  - `README.md` (root) — sección "CI / Release" con badges (opcional).
  - `docs/architecture/decisions-log.md` — fila para ADR-006.
  - `docs/architecture/README.md` — actualizar sección "Pipeline de releases" con la decisión real.
  - `docs/architecture/FUTURE-WORK.md` — marcar items del Nivel 3 como completados.
  - `docs/bootstrap-plan.md` — marcar Fase 5 ✅.
- **No tocados**: contenido de packages ni playground.

### APIs públicas

Sin cambios en las libs publicables. Sin cambios en specs existentes.

### Dependencias

- Sin nuevas runtime deps.
- Sin nuevas devDeps en `package.json` del root (Changesets ya está instalado desde CHG-001).
- **Secrets de GitHub** requeridos (acción del mantenedor):
  - `NPM_TOKEN` — token con scope `@romanmartinidev` + permisos publish.

### Sistemas / fases siguientes

- **Bootstrap del monorepo queda CERRADO** después de Fase 5.
- **Cambios posteriores** (componentes nuevos, tokens nuevos, mejoras) usan el pipeline establecido sin retrabajo.
- **Storybook deploy** queda como follow-up (`playground-storybook-deploy`).
- **A11y CI, bundle budget, visual regression** quedan como follow-ups (Nivel 2 del FUTURE-WORK).

## Alternativas evaluadas

### Opción A — Solo lint en CI, sin release automation

- **Pros**: setup más simple.
- **Contras**: el publishing manual es propenso a error (olvidar bumps, publicar desde rama incorrecta, etc.). El beneficio real de Changesets no se materializa.

### Opción B — Mínimo viable: PR validation + release con Changesets (esta propuesta)

- **Pros**: cubre lo crítico (validar PRs + automatizar releases). Pipeline estándar del ecosistema npm.
- **Contras**: ninguno significativo en el scope. Lo que queda fuera (Storybook deploy, a11y, bundle budget) se suma incremental.

### Opción C — Pipeline completo: + Storybook deploy + a11y CI + bundle budget

- **Pros**: cobertura full desde día 1.
- **Contras**: scope demasiado grande. Múltiples decisiones agrupadas (Chromatic vs GH Pages, axe vs Pa11y, size-limit vs bundlesize). Mejor escalonar.

### Opción D — Auto-publish al merge a main (sin PR de release)

- **Pros**: velocidad — cada merge con changeset publica inmediatamente.
- **Contras**: pierde el "checkpoint humano" antes de publicar. Riesgo alto de publicar versión no intencional. Pre-1.0 es razonable, post-1.0 es peligroso.

**Decisión**: Opción B (Roman lo aprobó en kickoff de la propuesta).

## ADRs y follow-ups

- **Se crea**: ADR-006 Estrategia de CI/CD.
- **Se proponen follow-ups** (changes futuros, fuera del scope):
  - `playground-storybook-deploy`: deploy de Storybook (Chromatic o GH Pages).
  - `ci-a11y-checks`: a11y en CI con `@storybook/test-runner` + axe.
  - `ci-bundle-budget`: enforcement de bundle size con size-limit.
  - `ci-visual-regression`: Chromatic o Playwright snapshots.
  - `ci-pr-title-validation`: validar título del PR sigue Conventional Commits (no solo los commits internos).

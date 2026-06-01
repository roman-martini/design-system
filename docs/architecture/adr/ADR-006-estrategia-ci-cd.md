# ADR-006 — Estrategia de CI/CD

- **Fecha**: 2026-06-01
- **Estado**: Aceptado
- **Dominio**: transversal / ci
- **ADRs relacionados**: [ADR-001](ADR-001-monorepo-pnpm-workspaces.md), [ADR-002](ADR-002-conventional-commits-changesets.md)

## Contexto

El repo tiene todo el plumbing local para que las libs sean publicables (Changesets configurado en CHG-001, ng-packagr APF en CHG-003, Vitest tests en CHG-003 y CHG-004, OpenSpec validate, format y lint), pero **nada de eso se valida automáticamente**: cualquier PR podría mergear con build roto, tests rotos, OpenSpec inválido, o sin changeset (que rompería el flow de release).

El publishing es 100% manual y depende del entorno local del mantenedor. Eso es:

- Frágil — error humano al olvidar bumpear versiones, publicar desde rama incorrecta, etc.
- No reproducible — depende de cuál versión de Node tenga el mantenedor en su máquina.
- Sin trazabilidad — no queda registro en CI de qué se publicó cuándo.

Fase 5 cierra esa brecha con un pipeline de CI/CD en GitHub Actions. La decisión es **one-way door en su núcleo** (cambiar de provider futuro implica reescribir workflows + secrets + branch protection) y afecta a todos los packages publicables. Cumple los criterios de ADR obligatorio.

## Opciones consideradas

### Opción A — Sin CI, solo hooks locales

Mantener Husky + commitlint + lint-staged como única validación. El mantenedor corre lint/test/build manualmente antes de mergear.

- **Pros**: cero setup adicional.
- **Contras**:
  - Los hooks locales NO se aplican si alguien usa `git commit --no-verify`.
  - Cualquier merge desde GitHub UI (sin pasar por local) bypassa los hooks.
  - Sin enforcement de tests/build/openspec — el repo puede entrar en estado roto.
  - Publishing manual depende de entorno local, no reproducible.

### Opción B — Mínimo viable: PR validation + release con Changesets (esta propuesta)

Dos workflows GitHub Actions: `pr.yml` (lint + test + build + openspec + changeset enforcement) y `release.yml` (changesets/action que abre PR de release; merge dispara publish).

- **Pros**:
  - Cubre lo crítico — bloquea PRs rotos antes del merge, automatiza release.
  - Patrón estándar del ecosistema npm (Astro, Remix, Storybook, TanStack, Vue, Svelte lo usan así).
  - PR de release da checkpoint humano antes de publicar (mantenedor revisa CHANGELOG).
  - Scope chico y enfocado — no agrupa decisiones ortogonales.
- **Contras**:
  - Sin Storybook deploy en esta fase (queda para follow-up).
  - Sin a11y CI, bundle budget, visual regression (todos follow-ups).

### Opción C — Pipeline completo: + Storybook deploy + a11y CI + bundle budget + visual regression

Suma todos los workflows del Nivel 2 del FUTURE-WORK.

- **Pros**: cobertura full desde día 1.
- **Contras**:
  - Scope demasiado grande — agrupa decisiones ortogonales (Chromatic vs GH Pages para Storybook, axe vs Pa11y para a11y, size-limit vs bundlesize para budget).
  - Cada feature merece su propio change con análisis de trade-offs.
  - Riesgo de no cerrar la fase nunca.

### Opción D — Auto-publish al merge a main (sin PR de release intermedio)

Cada merge a main que tiene changesets pendientes publica inmediatamente.

- **Pros**: velocidad — cero fricción para hacer release.
- **Contras**:
  - Pierde el checkpoint humano antes de publicar.
  - Riesgo alto de publicar versión no intencional (ej. mantenedor mergea un cambio crítico al final del día sin querer disparar publish).
  - Pre-1.0 es razonable hacer auto-publish; post-1.0 es peligroso.
  - Reverso requiere despublicar de npm o publicar parche correctivo.

### Opción E — Provider alternativo (CircleCI / GitLab / Travis)

CircleCI, GitLab CI, Travis, etc.

- **Pros**: features específicas (parallelization, cache distribuido, etc.).
- **Contras**:
  - El repo está en GitHub → integración nativa con GH Actions es default.
  - Costo de configurar provider externo + integrar con PRs no se justifica a esta escala.

## Decisión

Se adopta la **Opción B** con las siguientes decisiones explícitas:

### 1. Provider: **GitHub Actions**

Integración nativa con PRs, status checks, branch protection, secrets. El repo ya está en GitHub.

### 2. Workflows: **dos** — `pr.yml` y `release.yml`

- `pr.yml` trigger: `pull_request` sobre `main`. Steps: format check + lint + build recursivo + tests recursivos + openspec validate + changeset enforcement.
- `release.yml` trigger: `push` a `main`. Steps: build recursivo + changesets/action (modo dual: abrir PR de release o publicar).

Patrón estándar del ecosistema npm. Separa concerns: PR es validation pura; release es release pura.

### 3. Modelo de release: **Changesets abre PR; merge dispara publish**

Flow:

1. Dev abre PR con changeset → `pr.yml` valida → merge a main.
2. `release.yml` detecta changesets pendientes → abre/actualiza PR "Version Packages" con bumps + CHANGELOGs.
3. Mantenedor revisa el PR de release → mergea.
4. `release.yml` detecta que ya no hay changesets pendientes → ejecuta `pnpm release` → publica a npm.

**Trade-off aceptado**: pierde velocidad respecto a auto-publish, gana checkpoint humano antes de publicar.

### 4. Composite action `.github/actions/setup/`

Steps comunes (setup pnpm + setup-node + install) extraídos a una composite action reutilizable. Reusada en `pr.yml` y `release.yml`. Si en el futuro se agregan más workflows, reusan la setup sin duplicar YAML.

### 5. Versión de Node desde `.nvmrc`

`setup-node` con `node-version-file: '.nvmrc'`. Cambiar Node en un solo lugar.

### 6. Changeset enforcement con bash script

Step en `pr.yml` que:

- Detecta archivos modificados bajo `packages/*` (excluyendo `README.md` y `CHANGELOG.md` de cada package).
- Si hay cambios pero `pnpm changeset status --since=origin/main` reporta cero changesets nuevos → falla con mensaje claro.
- Si no hay cambios en `packages/*` → pasa sin verificar.

Excepciones documentadas: PRs solo-docs (incluyendo READMEs de packages) y PRs autogenerados por `changesets/action` (que actualizan CHANGELOG sin tocar fuentes).

### 7. Branch protection: documentada, NO automatizada

Las reglas (require PR + status checks + no force push + no deletions) se configuran en GitHub UI por el mantenedor. Documentadas como checklist en `CONTRIBUTING.md`.

**Por qué no automatizada**: aplicarlas por código requiere Terraform + GitHub provider o GitHub Apps con permisos especiales. Overkill a esta escala.

### 8. Secret `NPM_TOKEN`

Configurado por mantenedor en GitHub Settings → Secrets and variables → Actions. Token con scope `@romanmartinidev` y permisos publish. Documentado en `CONTRIBUTING.md` cómo generarlo.

### 9. Out of scope (follow-ups documentados)

- Storybook deploy (Chromatic o GH Pages) → `playground-storybook-deploy`.
- A11y CI con axe → `ci-a11y-checks`.
- Bundle size budget con size-limit → `ci-bundle-budget`.
- Visual regression (Chromatic snapshots o Playwright) → `ci-visual-regression`.
- Sigstore provenance para supply chain → `ci-supply-chain-security`.
- Validar título del PR contra Conventional Commits → `ci-pr-title-validation`.

## Consecuencias

### Positivas

- **Bloquea PRs rotos**: build, tests, format, lint, openspec — todo validado antes del merge.
- **Release reproducible**: misma versión de Node, mismo pnpm, mismo OS (Ubuntu) en cada release.
- **Trazabilidad**: cada release queda registrado en el historial de workflows.
- **Checkpoint humano**: el mantenedor revisa el PR de release antes de publicar a npm.
- **Cache de pnpm acelera CI**: instalación tarda <30s en runs subsiguientes vs >2min cold.
- **Composite action evita duplicación**: subir versión de pnpm aplica a ambos workflows.

### Negativas / trade-offs aceptados

- **Sin Storybook deploy en esta fase**: los devs deben correr Storybook localmente. Diferido a follow-up.
- **Sin a11y/bundle/visual regression**: confianza en el código depende de tests locales + revisión humana. Follow-ups documentados.
- **Branch protection requiere acción manual del mantenedor**: cualquier dev nuevo tiene que configurar el repo en GitHub UI. Mitigado por checklist en CONTRIBUTING.md.
- **changesets/action puede tener breaking changes en patches**: pinear `@v1` (major). Monitorear releases.
- **Sin matrix Node/OS**: no detectamos issues en otras versiones. Aceptado mientras `engines.node` declare la versión soportada estrictamente.
- **GitHub Actions outages bloquean release**: aceptado — todos los providers tienen outages. GH Actions tiene >99% uptime histórico.

### Acciones de seguimiento

- Documentar acciones del mantenedor en `CONTRIBUTING.md` (branch protection + NPM_TOKEN). ✅ ya cubierto en CHG-005 task 5.
- Si aparece necesidad concreta de algún follow-up (Storybook deploy, a11y, etc.), crear el change correspondiente.
- Reevaluar `provenance: true` para supply chain security en un ADR futuro si el repo crece a uso público amplio.
- Considerar matrix de Node si se publican packages que deban soportar Node ≥20 (no aplica hoy).

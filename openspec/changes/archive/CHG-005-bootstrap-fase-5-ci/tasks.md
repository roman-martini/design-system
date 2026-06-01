# Tasks — CHG-005 — Bootstrap Fase 5 — CI + Release

Cada tarea es ≤2 h y tiene criterio de aceptación binario. Marcar `[x]` al cerrar.

## 1. Composite action de setup compartido

- [ ] 1.1 Crear directorio `.github/actions/setup/`
- [ ] 1.2 Crear `.github/actions/setup/action.yml` (composite) con steps: setup pnpm (desde `packageManager` field del root `package.json`), setup-node (`node-version-file: '.nvmrc'`, `cache: 'pnpm'`), `pnpm install --frozen-lockfile`. Sin inputs por ahora (agregar si aparece necesidad concreta)

**Criterio**: `.github/actions/setup/action.yml` existe, sintaxis YAML válida (verificable con `actionlint` local). Ambos workflows van a usarla en sus primeros steps.

## 2. Workflow `pr.yml`

- [ ] 2.1 Crear `.github/workflows/pr.yml` con `on: pull_request: branches: [main]`
- [ ] 2.2 Job `validate` runs-on `ubuntu-latest` con steps:
  - `actions/checkout@v4` (con `fetch-depth: 0` — necesario para detectar cambios staged en packages/\* y validar changesets)
  - `uses: ./.github/actions/setup`
  - `pnpm format:check`
  - `pnpm lint`
  - `pnpm -r build`
  - `pnpm -r test`
  - `openspec validate --all`
- [ ] 2.3 Step `changeset-check` bash: usar `pnpm changeset status --since=origin/main` para detectar si hay changesets nuevos. Combinar con `git diff --name-only origin/main...HEAD` filtrando paths bajo `packages/*` (excluyendo `packages/*/README.md` puramente y `packages/*/CHANGELOG.md`). Si hay cambios en `packages/*` pero `changeset status` reporta cero changesets nuevos → fallar con mensaje claro: `Este PR toca packages/* sin agregar un changeset. Corré pnpm changeset y agregá el resultado al PR.`. Si no hay cambios en `packages/*`, el step pasa sin verificar
- [ ] 2.4 Concurrency group para cancelar runs previos del mismo PR: `concurrency: { group: 'pr-${{ github.event.pull_request.number }}', cancel-in-progress: true }`

**Criterio**: workflow YAML válido (actionlint pasa). Al simular un PR (push a una branch + pull request), todos los steps deberían ejecutarse en orden y reportar status verde si el repo está sano.

## 3. Workflow `release.yml`

- [ ] 3.1 Crear `.github/workflows/release.yml` con `on: push: branches: [main]`
- [ ] 3.2 Permissions: `contents: write` (para que changesets/action pueda commitear el PR de release), `pull-requests: write` (para abrir/actualizar PR). NO incluir `id-token: write` — sigstore provenance queda fuera de scope (follow-up `ci-supply-chain-security`)
- [ ] 3.3 Job `release` con steps:
  - `actions/checkout@v4` con `fetch-depth: 0`
  - `uses: ./.github/actions/setup`
  - `pnpm -r build`
  - `uses: changesets/action@v1` con:
    - `version: pnpm version`
    - `publish: pnpm release`
    - `commit: "chore(repo): version packages"`
    - `title: "chore(repo): version packages"`
    - `setupGitUser: true`
  - Env: `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}`, `NPM_TOKEN: ${{ secrets.NPM_TOKEN }}`
- [ ] 3.4 Concurrency group para evitar runs paralelos: `concurrency: { group: 'release', cancel-in-progress: false }`

**Criterio**: workflow YAML válido. Hasta que el mantenedor configure `NPM_TOKEN` y mergee un changeset, el workflow va a fallar en el step de publish — esto es esperado y se documenta.

## 4. ADR-006 — Estrategia de CI/CD

- [ ] 4.1 Crear `docs/architecture/adr/ADR-006-estrategia-ci-cd.md` (formato MADR) con:
  - **Contexto**: necesidad de validación automatizada + release automatizado; relación con ADR-001 (pnpm), ADR-002 (Changesets)
  - **Opciones evaluadas** (≥2): GitHub Actions vs CircleCI/Travis; dos workflows vs uno con condicionales; modelo de release con PR vs auto-publish; mínimo viable vs completo
  - **Decisión**: GitHub Actions + dos workflows + Changesets con PR de release + scope mínimo
  - **Consecuencias positivas / negativas**
  - **ADRs relacionados**: ADR-001, ADR-002
- [ ] 4.2 Actualizar `docs/architecture/decisions-log.md` con fila para ADR-006

**Criterio**: ADR sigue formato MADR; decisions-log tiene fila con link funcional.

## 5. Actualizar CONTRIBUTING.md

- [ ] 5.1 Agregar sección "CI / Release" en `CONTRIBUTING.md` con:
  - Resumen de los dos workflows (≤200 palabras por workflow): cuándo se dispara, qué valida, qué pasa si un step falla
  - Flujo de release paso a paso (changeset → PR → merge → "Version Packages" PR → merge → publish), diagrama Mermaid si aporta claridad
  - Cómo agregar un changeset (`pnpm changeset`) con ejemplo de cada bump (patch/minor/major)
- [ ] 5.2 Agregar sección "Branch protection" (checklist para el mantenedor):
  - Require PR antes de merge a main
  - Require status checks: pr.yml
  - Require branches up to date before merging
  - Require linear history (opcional)
  - No force push, no deletions
  - Aclarar: se configura en GitHub UI (Settings → Branches), no por código
- [ ] 5.3 Agregar sección "Secrets requeridos" para el mantenedor:
  - `NPM_TOKEN` — cómo generar (`npm token create --read-only=false`), permisos requeridos, dónde configurar
- [ ] 5.4 Documentar comando opcional para lint local de workflows con actionlint

**Criterio**: CONTRIBUTING.md cubre las 4 secciones nuevas. El mantenedor puede seguir el checklist sin asistencia externa.

## 6. Actualizar otros docs

- [ ] 6.1 `README.md` (root): agregar sección "CI / Release" con resumen corto (1 párrafo) y badges opcionales (workflow status, npm version cuando se publique). Linkear a `CONTRIBUTING.md § CI / Release` para detalle
- [ ] 6.2 `docs/architecture/README.md` § "Pipeline de releases": reemplazar el TBD con la decisión real (linkear a ADR-006)
- [ ] 6.3 `docs/architecture/FUTURE-WORK.md` § "Nivel 3": marcar items como completados; mover follow-ups (storybook deploy, a11y CI, bundle budget, visual regression) explícitos al Nivel 2
- [ ] 6.4 `docs/bootstrap-plan.md`: marcar Fase 5 ✅
- [ ] 6.5 `openspec/IDS.md`: agregar fila para CHG-005 + SPC-005 (cuando se promueva el spec al archivar). Actualizar "próximo ID disponible" a `CHG-006` / `SPC-006`

**Criterio**: 5 docs actualizados, links coherentes, no quedan TBD para Fase 5.

## 7. Validación de cierre

- [ ] 7.1 `openspec validate --changes` pasa para `bootstrap-fase-5-ci`
- [ ] 7.2 `pnpm lint` pasa (con los nuevos archivos del repo)
- [ ] 7.3 `pnpm format:check` pasa
- [ ] 7.4 `pnpm -r build` pasa (sin cambios en builds, todo sigue OK)
- [ ] 7.5 Tests siguen OK: `pnpm -F @romanmartinidev/components exec vitest run` (3/3) + `pnpm -F playground exec vitest run` (2/2)
- [ ] 7.6 `actionlint .github/workflows/*.yml` pasa localmente (instrucciones de instalación en CONTRIBUTING.md). Skip si no está instalado; verificar sintaxis YAML al menos con `yamllint` o lectura manual
- [ ] 7.7 Marcar Fase 5 ✅ en `docs/bootstrap-plan.md`
- [ ] 7.8 Proponer mensaje de commit y esperar OK de Roman (regla: cero commits sin permiso explícito)

**Criterio**: los 8 puntos pasan; Roman aprueba el mensaje del commit antes de ejecutar.

## 8. Acciones del mantenedor post-merge (documentadas, no son tasks del bootstrap)

> Estas no son tareas del change — son los pasos que el mantenedor (Roman) debe hacer en GitHub UI **después** de mergear este change. Se listan acá para checklist.

- [ ] 8.1 Crear el secret `NPM_TOKEN` en Settings → Secrets and variables → Actions
- [ ] 8.2 Configurar branch protection en `main` siguiendo el checklist de CONTRIBUTING.md § Branch protection
- [ ] 8.3 (Opcional) Verificar que el workflow `pr.yml` está activo abriendo un PR de prueba con un changeset trivial
- [ ] 8.4 (Cuando esté listo) Hacer el primer release v0.1.0 de tokens + components:
  - Crear changesets para ambos packages
  - Merge a main
  - Esperar PR "Version Packages"
  - Revisar bumps + CHANGELOG
  - Merge → workflow publica a npm

**Criterio**: estos items no afectan el cierre del change; quedan documentados para que el mantenedor los ejecute cuando decida.

## 9. Archivar este change

> Vía `/opsx:archive bootstrap-fase-5-ci` o flujo manual.

- [ ] 9.1 Mover `openspec/changes/bootstrap-fase-5-ci/` → `openspec/changes/archive/CHG-005-bootstrap-fase-5-ci/`
- [ ] 9.2 Promover `ADDED Requirements` del delta a `openspec/specs/SPC-005-ci-cd-pipeline/spec.md` con header `## Purpose` y frontmatter YAML (id: SPC-005, name: ci-cd-pipeline, type: spec, status: active, introduced-by: CHG-005, created: 2026-XX-XX)
- [ ] 9.3 Actualizar `openspec/IDS.md` con el path final del CHG-005 archivado + SPC-005 promovido
- [ ] 9.4 `openspec validate --all` pasa para 5 specs base
- [ ] 9.5 Proponer mensaje del commit del archive y esperar OK de Roman

**Criterio**: change archivado, spec base creada y validada, commit aprobado por Roman.

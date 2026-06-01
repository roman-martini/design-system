# Bootstrap plan — agent-design-sistem

> **Documento de referencia operativo.** Capta el estado del kickoff (2026-05-29) y el plan de fases acordado para llevar el repo de su estado inicial a un monorepo `pnpm` operativo con librerías publicables y app de prueba (`playground`).
>
> Este archivo **no es un ADR ni un spec**. Es el índice del bootstrap (alto nivel, narrativo). Una vez completado, se archiva (mover a `docs/_archive/` o eliminar) y la fuente de verdad pasa a `docs/architecture/` (decisiones) + `openspec/specs/` (contratos del sistema).

## Modelo de ejecución

**Cada fase del bootstrap se ejecuta como un change de OpenSpec:**

```
openspec/changes/
├── CHG-001-bootstrap-fase-1-monorepo/   ← Fase 1 (archivado)
├── CHG-002-bootstrap-fase-2-tokens/     ← Fase 2 (archivado)
├── CHG-003-bootstrap-fase-3-components/ ← Fase 3 (archivado)
├── CHG-004-bootstrap-fase-4-playground/ ← Fase 4 (archivado)
└── CHG-005-bootstrap-fase-5-ci/         ← Fase 5 (futuro)
```

Cada change contiene `proposal.md` + `design.md` + `tasks.md` + spec deltas. Este documento es solo el índice y la justificación del orden. **El detalle ejecutable vive en cada change.**

Al cerrar cada fase, su change se archiva en `openspec/changes/_archive/`.

## Propósito del repo

Desarrollo de librerías con alcance **arquitectura frontend**. Prioridades en estricto orden:

1. Aplicar buenas prácticas.
2. Diseños/arquitecturas que escalen ordenado.
3. Mantenibilidad: estándares y convenciones claras.

## Decisiones tomadas en el kickoff

| Tema                         | Decisión                                                                                                   |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Monorepo tool                | **pnpm workspaces** (sin Nx ni Turborepo de entrada)                                                       |
| Estructura                   | `packages/*` (libs) + `apps/*` (apps) + `docs/` (gobernanza)                                               |
| Publishing                   | **npm público**, scope `@romanmartinidev` (org creada)                                                     |
| Build Angular lib            | **ng-packagr** (Angular Package Format)                                                                    |
| Versionado                   | **Changesets**                                                                                             |
| Docs arquitectura            | Archivo general `docs/architecture/README.md` + ADRs MADR en `docs/architecture/adr/` + `decisions-log.md` |
| Commits                      | **Conventional Commits** + commitlint                                                                      |
| Pre-commit                   | **Husky** + lint-staged                                                                                    |
| Lint/format                  | ESLint + Prettier compartidos en root                                                                      |
| Specs/cambios significativos | **OpenSpec** (`openspec/changes/`)                                                                         |
| Stack pinning                | `.nvmrc`, `.npmrc` con `engine-strict`, `engines` en cada `package.json`                                   |
| `angular-app/`               | **Regenerar desde cero** en `apps/playground/`                                                             |
| `packages/tokens/`           | Migrar al monorepo (renombrar a `@romanmartinidev/tokens`)                                                 |
| `packages/components/`       | **Crear desde cero** con ng-packagr                                                                        |
| LICENSE                      | MIT (default para libs FE públicas)                                                                        |

## Stack identificado (a heredar)

- Angular **21**
- Vitest **4**
- Storybook **10**
- Compodoc **1.2**
- TypeScript **5.9**
- Style Dictionary **4.x**

## Cosas adicionales identificadas

Algunas no entran en el bootstrap inmediato pero quedan registradas para no olvidarlas:

- **LICENSE** (MIT) — Fase 1.
- **README en root** — punto de entrada del repo.
- **CONTRIBUTING.md** — cómo agregar un componente/token, política de PRs.
- **`.editorconfig`** en root — alineación entre IDEs.
- **GitHub Actions / CI** — workflow de PR (lint + test + build) + workflow de release con Changesets. Fase 5.
- **Storybook deploy** — Chromatic o GH Pages. A decidir en Fase 5.
- **Visual regression testing** — **diferido**. Cuando el repo esté maduro, revisar y proponer Chromatic vs Playwright + Storybook.
- **`SECURITY.md` y `CODE_OF_CONDUCT.md`** — opcionales, posterior al primer release público.
- **Política de versionado pre-1.0** — definir antes del primer release.

## Plan de fases

Cada fase cierra con commit + verificación antes de pasar a la siguiente. No saltar fases.

### Fase 0 — Gobernanza (antes de tocar bits)

1. Llenar `CLAUDE.md` con prioridades, estructura y comandos del repo.
2. Llenar `openspec/config.yaml` con project context.
3. Crear estructura `docs/architecture/`:
   - `README.md` — visión general arquitectónica.
   - `decisions-log.md` — índice tabular de decisiones.
   - `adr/` — directorio con README explicando formato MADR.
4. Mover `DESIGN_SYSTEM_ROADMAP.md` (28KB) de root a `docs/`.
5. Registrar este `bootstrap-plan.md` (el archivo que estás leyendo).

### Fase 1 — Estructura base monorepo

1. `git init` + `.gitignore` correcto + primer commit (estado pre-monorepo).
2. `package.json` root (metadata, scripts, devDependencies compartidas).
3. `pnpm-workspace.yaml`.
4. `.nvmrc`, `.npmrc` (`engine-strict=true`, `auto-install-peers=true`, `strict-peer-dependencies=true`).
5. `.editorconfig`.
6. ESLint config base + Prettier config base en root.
7. Husky + commitlint + lint-staged.
8. Changesets init.
9. LICENSE (MIT) + README root + CONTRIBUTING.md.
10. Borrar `node_modules/` de `packages/tokens/` y `angular-app/` (se reinstalan desde root).
11. Borrar `angular-app/` completo (se regenera en Fase 4).
12. **ADR-001** Adoptar pnpm workspaces.
13. **ADR-002** Adoptar Conventional Commits + Changesets.

### Fase 2 — Migrar `packages/tokens` al monorepo

1. Renombrar `@ds/tokens` → `@romanmartinidev/tokens` en su `package.json`.
2. Agregar `engines`, `publishConfig`, `repository`, `license`, `keywords`, `author`.
3. README del package (uso, exports, qué incluye, cómo construirlo).
4. Validar build con `pnpm -F @romanmartinidev/tokens build`.
5. **ADR-003** Arquitectura de tokens (primitives/semantic/component/theme + Style Dictionary).

### Fase 3 — Crear `packages/components` desde cero

1. Scaffold con ng-packagr siguiendo Angular Package Format:
   - `src/public-api.ts`
   - `src/lib/` con la estructura definida en el ADR.
   - `ng-package.json` + `package.json` correctos.
2. Configurar `peerDependencies` Angular (no `dependencies`).
3. Configurar dependencia a `@romanmartinidev/tokens` con `workspace:*`.
4. README del package.
5. **ADR-004** Arquitectura de components (decidir entre atomic, feature-based, etc., con opciones evaluadas).

### Fase 4 — Regenerar `apps/playground`

1. `ng new playground` con Angular 21, ubicado en `apps/playground/`.
2. Configurarlo como workspace del monorepo, consumir libs con `workspace:*`.
3. Migrar setup de Storybook 10 + Vitest desde el `angular-app/` viejo.
4. Decidir si se mantiene Compodoc.
5. Configurar consumo de `@romanmartinidev/tokens` (CSS + JS).

### Fase 5 — CI y release

1. GitHub Actions: workflow PR (lint + test + build de todos los workspaces).
2. Workflow de release con Changesets (publica packages que cambiaron).
3. Workflow de deploy de Storybook (Chromatic o GH Pages — a decidir).
4. Status badges en README root.

### Posterior a Fase 5 (cuando el repo esté maduro)

- Visual regression testing.
- `SECURITY.md`, `CODE_OF_CONDUCT.md`.
- Política de versionado pre-1.0 → 1.0.

## Anti-patrones del estado inicial (a corregir)

Identificados al diagnosticar el repo. Algunos ya están resueltos en el plan; quedan listados para referencia:

- `node_modules/` distribuidos sin workspaces → resuelto en Fase 1.
- `DESIGN_SYSTEM_ROADMAP.md` en root junto a `CLAUDE.md` y `contexto_inicial.md` → resuelto en Fase 0 (mover a `docs/`).
- Falta de fuente de verdad de convenciones → resuelto en Fase 0 (CLAUDE.md + docs/architecture/).
- Scope `@ds/` genérico → resuelto en Fase 2 (renombrar a `@romanmartinidev/tokens`).
- Falta de ADRs → resuelto progresivamente en Fases 1-3.
- Repo no es git → resuelto en Fase 1.

## Estado actual del plan

- [x] Fase 0 — **completada** (2026-05-29)
- [x] Fase 1 — **completada** (2026-05-30)
- [x] Fase 2 — **completada** (2026-05-31)
- [x] Fase 3 — **completada** (2026-05-31)
- [x] Fase 4 — **completada** (2026-06-01)
- [x] Fase 5 — **completada** (2026-06-01)

**Bootstrap del repo: COMPLETO.** Este documento puede archivarse a `docs/_archive/` o eliminarse — su rol terminó. La fuente de verdad vigente es [`docs/architecture/`](architecture/) (síntesis + ADRs + specs).

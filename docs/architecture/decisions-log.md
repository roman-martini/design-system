# Decisions log

Índice de decisiones arquitectónicas del repo. Una fila por decisión (con o sin ADR). El ADR es obligatorio si la decisión es one-way door o afecta ≥2 packages.

| Fecha      | Dominio     | Resumen                                                                                                                                                                                      | ADR                                                          |
| ---------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 2026-05-30 | transversal | Monorepo pnpm workspaces (sin Nx ni Turborepo de entrada)                                                                                                                                    | [ADR-001](adr/ADR-001-monorepo-pnpm-workspaces.md) ✅        |
| 2026-05-30 | transversal | Conventional Commits + commitlint + Husky + lint-staged + Changesets                                                                                                                         | [ADR-002](adr/ADR-002-conventional-commits-changesets.md) ✅ |
| 2026-05-29 | transversal | Scope npm `@romanmartinidev` (org propia en npm)                                                                                                                                             | —                                                            |
| 2026-05-29 | frontend    | `packages/components` se construye con ng-packagr (APF)                                                                                                                                      | —                                                            |
| 2026-05-29 | frontend    | `apps/playground` se regenera desde cero con Angular 21                                                                                                                                      | —                                                            |
| 2026-05-29 | transversal | Docs arquitectura: README + ADRs MADR + decisions-log (este archivo)                                                                                                                         | —                                                            |
| 2026-05-29 | transversal | OpenSpec para cambios significativos en `openspec/changes/`                                                                                                                                  | —                                                            |
| 2026-05-31 | frontend    | Arquitectura de design tokens: SD 4 + jerarquía primitives→semantic→component→theme + prefix `--ds-*` + theming via CSS vars y `[data-theme]`/`[data-brand]`                                 | [ADR-003](adr/ADR-003-arquitectura-design-tokens.md) ✅      |
| 2026-05-31 | frontend    | Arquitectura de components: ng-packagr + flat por componente + standalone+signals + prefix `rmd-` + CSS plain con tokens vía vars + tokens como peerDependency                               | [ADR-004](adr/ADR-004-arquitectura-components.md) ✅         |
| 2026-06-01 | frontend    | Arquitectura del playground: ng new Angular 21 zoneless + Storybook 10 + stories co-ubicadas en `packages/components/` + Vitest + single page + tokens vía `@import`                         | [ADR-005](adr/ADR-005-arquitectura-playground.md) ✅         |
| 2026-06-01 | transversal | Estrategia CI/CD: GitHub Actions + 2 workflows (PR validation + release con Changesets que abre PR) + composite action de setup + branch protection documentada                              | [ADR-006](adr/ADR-006-estrategia-ci-cd.md) ✅                |
| 2026-06-01 | frontend    | Unificación de prefijos del Design System bajo `Ds`/`ds-`/`--ds-*`. Drop del sufijo `Component` en class TS (`DsButton`, `DsCheckbox`). Supersede parcial de ADR-004 §4 y §5.                | [ADR-007](adr/ADR-007-naming-prefijos.md) ✅                 |
| 2026-06-06 | transversal | Convención de IDs de OpenSpec: changes con `<bloque>-<numero>` (aaa-NNN..zzz-NNN, cap ~17.5M); specs sin IDs (identificadas por nombre de carpeta). Rename retroactivo CHG/SPC → aaa/nombre. | [ADR-008](adr/ADR-008-convencion-ids-openspec.md) ✅         |

## Cómo agregar una entrada

1. Si la decisión afecta ≥2 packages o es one-way door → crear ADR en [adr/](adr/) siguiendo formato MADR.
2. Agregar fila acá con: fecha ISO, dominio (`frontend`/`tokens`/`components`/`build`/`ci`/`transversal`), resumen ≤3 líneas, link al ADR si aplica.
3. Si la decisión reemplaza una previa: agregar nueva fila + actualizar la fila del ADR reemplazado en su archivo.

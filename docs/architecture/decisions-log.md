# Decisions log

Índice de decisiones arquitectónicas del repo. Una fila por decisión (con o sin ADR). El ADR es obligatorio si la decisión es one-way door o afecta ≥2 packages.

| Fecha      | Dominio     | Resumen                                                                                                                                                      | ADR                                                          |
| ---------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| 2026-05-30 | transversal | Monorepo pnpm workspaces (sin Nx ni Turborepo de entrada)                                                                                                    | [ADR-001](adr/ADR-001-monorepo-pnpm-workspaces.md) ✅        |
| 2026-05-30 | transversal | Conventional Commits + commitlint + Husky + lint-staged + Changesets                                                                                         | [ADR-002](adr/ADR-002-conventional-commits-changesets.md) ✅ |
| 2026-05-29 | transversal | Scope npm `@romanmartinidev` (org propia en npm)                                                                                                             | —                                                            |
| 2026-05-29 | frontend    | `packages/components` se construye con ng-packagr (APF)                                                                                                      | —                                                            |
| 2026-05-29 | frontend    | `apps/playground` se regenera desde cero con Angular 21                                                                                                      | —                                                            |
| 2026-05-29 | transversal | Docs arquitectura: README + ADRs MADR + decisions-log (este archivo)                                                                                         | —                                                            |
| 2026-05-29 | transversal | OpenSpec para cambios significativos en `openspec/changes/`                                                                                                  | —                                                            |
| 2026-05-31 | frontend    | Arquitectura de design tokens: SD 4 + jerarquía primitives→semantic→component→theme + prefix `--ds-*` + theming via CSS vars y `[data-theme]`/`[data-brand]` | [ADR-003](adr/ADR-003-arquitectura-design-tokens.md) ✅      |

## Cómo agregar una entrada

1. Si la decisión afecta ≥2 packages o es one-way door → crear ADR en [adr/](adr/) siguiendo formato MADR.
2. Agregar fila acá con: fecha ISO, dominio (`frontend`/`tokens`/`components`/`build`/`ci`/`transversal`), resumen ≤3 líneas, link al ADR si aplica.
3. Si la decisión reemplaza una previa: agregar nueva fila + actualizar la fila del ADR reemplazado en su archivo.

# EP-005 — Calidad profesional

**Estado**: En desarrollo (primera tanda entregada el 2026-07-11)

## Contexto

Nivel 2 del roadmap de madurez de [FUTURE-WORK](../../../backlog/FUTURE-WORK.md): pasar de "componentes que funcionan y se testean" a "calidad verificada automáticamente" — a11y auditada, consistencia de tokens vigilada, y el flujo de crear componentes asistido. El beneficiario directo es el mantenedor; el indirecto, todo consumidor.

## Alcance

Tooling de calidad sobre el kit existente: auditoría WCAG de componentes, detección de drift de tokens (huérfanos, hardcodeos, bypass de jerarquía), workflow guiado para sumar componentes. Son **skills de tooling** (`/ds:*`), no changes del kit — van por commit directo según el BACKLOG. Queda afuera: los tests unitarios por componente (ya son parte de cada change de EP-002).

## Historias de usuario

Sin HUs con archivo aún — los tres items viven en [docs/backlog/BACKLOG.md](../../../backlog/BACKLOG.md) con sus disparadores:

| Item (BACKLOG)                              | Disparador                            | Estado                                                                                         |
| ------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `/ds:add-component` — workflow guiado       | ≥3 changes "add component" archivados | **Hecho** (2026-07-11) — skill + command creados                                               |
| `/ds:check-a11y` — auditoría WCAG           | ≥5 componentes                        | **Hecho** (2026-07-11) — skill + [primera auditoría](../../../design/a11y/2026-07-11-audit.md) |
| `/ds:audit-tokens` — consistencia de tokens | >100 tokens o primer drift detectado  | Pendiente (posible activación por el hardcode detectado en la auditoría)                       |

Los items derivados de la auditoría ya se encauzaron: `components-fix-a11y-minor` cerrado por commit directo (2026-07-11) y `tokens-fix-contrast-aa` como [HU-004](../EP-001-fundamentos-tokens/HU-004-contraste-aa-tokens.md) (EP-001, change [aaa-015](../../../../openspec/changes/archive/aaa-015-tokens-fix-contrast-aa/) archivado 2026-07-11, aprobado por [D-008](../../decisiones.md)).

## Decisiones aplicables

[D-002, D-005, D-007](../../decisiones.md).

## Orden sugerido

`/ds:check-a11y` primero (materializa D-007 y audita los 5 componentes existentes), después `/ds:add-component` (acelera EP-002). `/ds:audit-tokens` espera su disparador.

# EP-005 — Calidad profesional

**Estado**: Identificada (disparadores activados el 2026-07-10)

## Contexto

Nivel 2 del roadmap de madurez de [FUTURE-WORK](../../../backlog/FUTURE-WORK.md): pasar de "componentes que funcionan y se testean" a "calidad verificada automáticamente" — a11y auditada, consistencia de tokens vigilada, y el flujo de crear componentes asistido. El beneficiario directo es el mantenedor; el indirecto, todo consumidor.

## Alcance

Tooling de calidad sobre el kit existente: auditoría WCAG de componentes, detección de drift de tokens (huérfanos, hardcodeos, bypass de jerarquía), workflow guiado para sumar componentes. Son **skills de tooling** (`/ds:*`), no changes del kit — van por commit directo según el BACKLOG. Queda afuera: los tests unitarios por componente (ya son parte de cada change de EP-002).

## Historias de usuario

Sin HUs con archivo aún — los tres items viven en [docs/backlog/BACKLOG.md](../../../backlog/BACKLOG.md) con sus disparadores:

| Item (BACKLOG)                              | Disparador                            | Estado                                                    |
| ------------------------------------------- | ------------------------------------- | --------------------------------------------------------- |
| `/ds:add-component` — workflow guiado       | ≥3 changes "add component" archivados | **ACTIVADO** (Checkbox, Radio, Modal)                     |
| `/ds:check-a11y` — auditoría WCAG           | ≥5 componentes                        | **ACTIVADO** (Button, Checkbox, Radio, RadioGroup, Modal) |
| `/ds:audit-tokens` — consistencia de tokens | >100 tokens o primer drift detectado  | Pendiente                                                 |

Si el PO prioriza esta épica, cada item se refina como HU (actor: mantenedor).

## Decisiones aplicables

[D-002, D-005, D-007](../../decisiones.md).

## Orden sugerido

`/ds:check-a11y` primero (materializa D-007 y audita los 5 componentes existentes), después `/ds:add-component` (acelera EP-002). `/ds:audit-tokens` espera su disparador.

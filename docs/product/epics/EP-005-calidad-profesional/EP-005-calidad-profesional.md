---
estado: En desarrollo (primera tanda de tooling entregada 2026-07-11; tanda de gates automáticos aprobada 2026-07-26 por D-021, 4/7 entregadas -- HU-032 /ds:audit-tokens el 2026-07-27, HU-026 coverage+typecheck el 2026-07-29, HU-027 gate de contraste AA el 2026-07-30 y HU-028 fase 1 (axe sobre el DOM) el 2026-07-31)
actor: Mantenedor
---

# EP-005 — Calidad profesional

## Contexto

Nivel 2 del [roadmap de madurez](../../../reference/roadmap-madurez-ds.md) (referencia): pasar de "componentes que funcionan y se testean" a **calidad verificada automáticamente** — a11y auditada, consistencia de tokens vigilada, contratos con enforcement real. El beneficiario directo es el mantenedor; el indirecto, todo consumidor.

La [review integral del 2026-07-26](../../../reviews/2026-07-26-review-integral/plan-de-accion.md) puso el foco de esta épica: varios contratos que las specs declaran **verificables** (contraste AA, jerarquía de tokens, coverage, a11y) dependían en realidad de disciplina manual. Un contrato sin gate es papel mojado. [D-021](../../decisiones.md) aprobó cerrar esa brecha con una HU por gate.

## Alcance

Dos clases de trabajo:

- **Gates automáticos en CI** — coverage, typecheck, contraste WCAG AA, accesibilidad con axe, lint de templates, presupuesto de bundle, Storybook publicado. Lo que no pasa el gate no entra a `main`.
- **Tooling de calidad** (`/ds:*`) sobre el kit existente — auditoría WCAG, detección de drift de tokens, workflow guiado para sumar componentes. Van por commit directo, no por change del kit.

Queda afuera: los tests unitarios por componente (parte de cada change de EP-002) y la regresión visual automatizada, diferida explícitamente por D-021 y en exploración en [intake/regresion-visual.md](../../intake/regresion-visual.md).

## Historias de usuario

| HU                                        | Título                                                   | Estado                                          | Ejecuta      |
| ----------------------------------------- | -------------------------------------------------------- | ----------------------------------------------- | ------------ |
| [HU-026](HU-026-coverage-typecheck-ci.md) | Coverage con thresholds y typecheck en CI                | **Hecha** (2026-07-29)                          | Parte F1-a   |
| [HU-027](HU-027-gate-contraste-aa-ci.md)  | Gate de contraste WCAG AA en CI                          | **Hecha** (2026-07-30)                          | Parte F1-b   |
| [HU-028](HU-028-a11y-automatizada-axe.md) | Accesibilidad automatizada con axe (2 fases)             | **Fase 1 hecha** (2026-07-31); fase 2 pendiente | Parte F2 y L |
| [HU-029](HU-029-angular-eslint.md)        | angular-eslint con reglas de template y a11y             | Refinada (2026-07-26)                           | Parte N      |
| [HU-030](HU-030-bundle-size-budget.md)    | Presupuesto de tamaño de bundle                          | Refinada (2026-07-26)                           | Parte F3     |
| [HU-031](HU-031-storybook-publicado.md)   | Storybook publicado y regresión visual                   | Refinada (2026-07-26)                           | Parte L      |
| [HU-032](HU-032-audit-tokens-skill.md)    | Auditoría de consistencia de tokens (`/ds:audit-tokens`) | **Hecha** (2026-07-27)                          | Parte M      |

Las siete nacen de [D-021](../../decisiones.md) (2026-07-26). Las cuatro que exigían OK explícito del PO por [D-015](../../decisiones.md) —a11y en CI, presupuesto de bundle, Storybook publicado y `/ds:audit-tokens`— venían de la ex Cantera del BACKLOG y quedaron aprobadas en esa misma decisión.

### Tooling ya entregado (sin HU con archivo)

| Item                                  | Disparador                            | Estado                                                                                         |
| ------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `/ds:add-component` — workflow guiado | ≥3 changes "add component" archivados | **Hecho** (2026-07-11) — skill + command creados                                               |
| `/ds:check-a11y` — auditoría WCAG     | ≥5 componentes                        | **Hecho** (2026-07-11) — skill + [primera auditoría](../../../design/a11y/2026-07-11-audit.md) |

Los items derivados de aquella auditoría ya se encauzaron: `components-fix-a11y-minor` cerrado por commit directo (2026-07-11) y `tokens-fix-contrast-aa` como [HU-004](../EP-001-fundamentos-tokens/HU-004-contraste-aa-tokens.md) (EP-001, change [aaa-015](../../../../openspec/changes/archive/aaa-015-tokens-fix-contrast-aa/) archivado 2026-07-11, aprobado por [D-008](../../decisiones.md)). El hardcode que esa auditoría detectó (`white` en Checkbox y Radio) es hoy el caso de prueba de HU-032.

## Decisiones aplicables

[D-002, D-007, D-015, D-017, D-021, D-022](../../decisiones.md), y [D-030](../../decisiones.md) — surgida al ejecutar HU-027: el primer gate que se instala encuentra un incumplimiento real y su corrección se decide como decisión de producto, igual que D-008/D-012/D-016.

## Orden sugerido

Los gates baratos primero, porque protegen todo lo que viene después: **HU-026 (coverage + typecheck)** y **HU-027 (contraste AA)**, que solo portan al repo lógica que ya existe. **Ambas entregadas** (2026-07-29 y 2026-07-31). **HU-028 fase 1** (axe sobre los specs que ya corren) se entregó el 2026-07-31; queda **HU-030** (presupuesto de bundle). **HU-032** (`/ds:audit-tokens`) es independiente y puede intercalarse en cualquier punto; su corrida formal está en el backlog como `tokens-audit-formal`, con disparador antes de la Parte H.

> Nota de HU-027 sobre "solo portan lógica que ya existe": portarla fue la mitad del trabajo. La otra mitad fue derivar los pares de los requirements de las specs y **decidir cuáles no corresponden** — 6 de los 111 pares de la primera enumeración eran ampliaciones que ninguna spec exige (bordes decorativos de contenedor) y 2 eran un incumplimiento real ([D-030](../../decisiones.md)). Vale tenerlo en cuenta al planificar HU-028: "la herramienta ya existe" no implica que instalar el gate sea mecánico.

Quedan para el final las que traen infraestructura nueva: **HU-031** (Storybook publicado, prerequisito de la fase 2 de a11y) y **HU-028 fase 2**. **HU-029** (angular-eslint) va aparte, en la Parte N: no es solo configurar el linter, es corregir lo que emerja en los 23 componentes existentes, y eso merece su propio change.

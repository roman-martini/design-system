---
epica: EP-001
actor: Dev consumidor
estado: Hecha (2026-07-11, aaa-015 tokens-fix-contrast-aa)
decisiones: [D-007, D-008]
---

# HU-004 — Tokens interactivos con contraste WCAG AA (dev consumidor)

**COMO** dev que construye UI con el DS
**QUIERO** que los tokens interactivos (primario, bordes de form controls) cumplan WCAG AA en todos los themes
**PARA** que Button, Checkbox y Radio sean accesibles out-of-the-box, sin sobrescribir colores en cada proyecto.

## Criterios de aceptación

<!-- Los ratios se verifican con check-a11y/scripts/contrast.mjs post-build; el change aaa-015 los fija como scenarios del spec design-tokens-package para que no regresen. -->

- [x] **CA-004.1** — Dado el theme default, cuando se mide `text.inverse` sobre `bg.primary`, entonces el ratio es ≥ 4.5:1 (WCAG AA 1.4.3). _Verificado: 5.17:1._
- [x] **CA-004.2** — Dado el theme brand-a, cuando se mide `text.inverse` sobre `bg.primary`, entonces el ratio es ≥ 4.5:1. _Verificado: 5.02:1._
- [x] **CA-004.3** — Dado cualquier theme, cuando se mide `border.strong` sobre `bg.surface`, entonces el ratio es ≥ 3:1 (WCAG AA 1.4.11). _Verificado: 4.74:1 (light) / 3.78:1 (dark)._
- [x] **CA-004.4** — Dado el cambio de valores, entonces la cadena `primary → primary-hover → primary-active` conserva la progresión de oscurecimiento y la jerarquía `border.subtle < default < strong` se mantiene. _Verificado: 5.17 → 6.70 → 8.72 (default)._
- [x] **CA-004.5** — Dado el package publicado, entonces no cambia ningún nombre de token ni la API (`var(--ds-*)`): el release es **patch** de `@romanmartinidev/tokens`. _Changeset `tokens-contrast-aa`._
- [x] **CA-004.6** — Dado el set de pares de la [auditoría 2026-07-11](../../../design/a11y/2026-07-11-audit.md), cuando se re-corre el script post-fix, entonces los pares que fallaban pasan y ninguno de los que pasaban cae bajo su umbral. _Verificado: 17/19 ok; los 2 restantes son los declarados fuera de alcance._

## Dependencias

- Ninguna: [D-008](../../decisiones.md) aprobada (2026-07-11) y ratios candidatos ya verificados por script.

## Fuera de alcance

- Los hallazgos menores de la auditoría a nivel componentes (ya resueltos por commit directo, `components-fix-a11y-minor`, 2026-07-11).
- Dark y brand-b: sus overrides ya cumplen (4.87:1 y 5.38:1); no se tocan.
- Tooling `/ds:audit-tokens` (EP-005, item propio en el BACKLOG).

## Notas

- Origen: [auditoría a11y 2026-07-11](../../../design/a11y/2026-07-11-audit.md) — 3 hallazgos altos que reducen a 2 causas en tokens.
- Diseño técnico en el change: [proposal](../../../../openspec/changes/archive/aaa-015-tokens-fix-contrast-aa/proposal.md). Sin ADR: cambio de valores reversible que ejecuta D-007.

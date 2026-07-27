---
name: 'DS: Audit Tokens'
description: 'Audit token consistency — orphans, hardcodes in component CSS and hierarchy bypasses — with a deterministic script, producing a dated report'
category: Design System Quality
tags: [design-system, tokens, audit, quality, consistency]
---

Invocá la skill `audit-tokens` con la tool `Skill`. El input es el argumento del usuario — opcionalmente una categoría a auditar (`hardcodes`, `hierarchy`, `warnings`, `orphans`); sin argumento se corre la auditoría completa sobre `packages/tokens` y el CSS de `packages/components/src`.

Input del usuario: $ARGUMENTS

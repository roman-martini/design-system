---
name: "DS: Check A11y"
description: "Audit the design system components against WCAG AA and the repo's accessibility ADRs, producing a dated report"
category: Design System Quality
tags: [design-system, a11y, wcag, audit, quality]
---

Invocá la skill `check-a11y` con la tool `Skill`. El input es el argumento del usuario — opcionalmente un subset de componentes a auditar (ej. `modal` o `checkbox radio`); sin argumento se auditan todos los componentes de `packages/components/src/lib/`.

Input del usuario: $ARGUMENTS

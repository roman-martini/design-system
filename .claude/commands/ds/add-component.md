---
name: "DS: Add Component"
description: "Guided workflow to add a new Angular component to the kit following the repo's ADRs and the OpenSpec change pattern"
category: Design System Workflow
tags: [design-system, components, angular, openspec, workflow]
---

Invocá la skill `add-component` con la tool `Skill`. El input es el argumento del usuario — el nombre del componente a agregar (ej. `select`), opcionalmente con notas de API/alcance.

Si no hay argumento, pedile el nombre del componente al usuario antes de invocar la skill.

Input del usuario: $ARGUMENTS

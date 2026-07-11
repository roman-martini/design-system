---
name: "DS: Auto Backlog"
description: "Ejecuta en automático los items Now de docs/backlog/BACKLOG.md. Args opcionales: commit=ask|auto|none, decisiones=defer|inline"
category: Design System Tooling
tags: [backlog, automation, openspec, now]
---

Invocá la skill `backlog-auto` con la tool `Skill`, pasando los argumentos del usuario tal cual (configuran los modos `commit` y `decisiones`).

No delegar a un sub-agent: la skill orquesta skills `opsx:*` y puede necesitar interacción con el usuario según la configuración.

Input del usuario: $ARGUMENTS

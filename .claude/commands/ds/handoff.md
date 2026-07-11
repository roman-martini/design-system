---
name: "DS: Session Handoff"
description: "Guarda el estado de la sesión en .claude/session-handoff.md para poder hacer /clear y retomar con /ds:resume"
category: Design System Tooling
tags: [session, handoff, clear, context]
---

Invocá la skill `session-handoff` con la tool `Skill`, modo `save`. Los argumentos del usuario (si hay) indican el punto de arranque para la próxima sesión ("EMPEZÁ POR").

No delegar a un sub-agent: la skill necesita el contexto de esta conversación.

Input del usuario: save $ARGUMENTS

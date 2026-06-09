---
paths:
  - ".claude/agents/ng-*.md"
  - ".claude/skills/ng-change/**"
  - ".claude/commands/ng/**"
  - ".claude/knowledge/ng-*.md"
  - ".claude/rules/ng-*.md"
---

# Restricciones del grupo `ng-*` (calidad de componentes Angular)

- **Prefijo `ng-`**: todos los artefactos (agentes, skill, knowledge, rule) llevan el prefijo. Comandos: todos namespaced en `commands/ng/` — `/ng:ask` (router), `/ng:create`, `/ng:review`, `/ng:change`, `/ng:sync`. No hay comando pelado `/ng` en la raíz.
- **Leer el knowledge primero**: `ng-router`, `ng-component`, `ng-review` y `ng-sync` leen `ng-best-practices.md` y `ng-stack-profile.md` antes de operar; fallan rápido si faltan. `ng-change` opera sobre el review: lee `ng-stack-profile.md` para describir el diseño según el stack, pero no bloquea si falta (deriva el contexto del review).
- **Knowledge como fuente única**: las buenas prácticas no se reinventan de memoria; viven en `ng-best-practices.md` con su URL. Solo `ng-sync` lo modifica, y solo tras mostrar el diff.
- **Web solo en `ng-sync`**: es la única pieza con `WebFetch`/`WebSearch`. Ningún otro `ng-*` accede a Internet.
- **Sin dependencias externas**: el grupo no conoce OpenSpec ni ninguna herramienta de terceros. El artefacto de cambio es Markdown autocontenido, sin imports ni formatos propietarios.
- **Artefacto de cambio = un solo archivo**: `ng-change` produce un único Markdown con propuesta + diseño + tareas, implementable sin contexto adicional.
- **Crear y revisar con el mismo rasero**: lo que `ng-review` marcaría como hallazgo, `ng-component` no lo produce.
- **Scope de escritura**: `ng-component` escribe solo el entorno del componente; `ng-review`/`ng-change` el artefacto en el path indicado; `ng-sync` solo el knowledge `ng-best-practices.md`. Ningún `ng-*` toca configuración global del proyecto sin pedido explícito.
- **Angular moderno es el estándar**: standalone, signals-first, control flow nativo, OnPush/zoneless, `inject()`, TS estricto. Legacy es hallazgo, no preferencia.

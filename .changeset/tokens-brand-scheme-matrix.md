---
'@romanmartinidev/tokens': minor
---

Matriz brand × scheme (aaa-054): la combinación dark + marca deja de estar rota. Antes, todo token que una marca overrideaba perdía su variante oscura — un radio card seleccionado en dark+brand quedaba con fondo claro y texto invisible, y los links de marca eran ilegibles sobre fondo oscuro.

- **Nuevos overlays** `themes/brand-a-dark.css` y `themes/brand-b-dark.css`, emitidos bajo el selector combinado `[data-theme="dark"][data-brand="…"]`: subtle profundo, links/íconos/focus más claros y hovers que aclaran (la dirección tonal de dark). Una app con marca + dark importa el overlay de su marca además de los tres CSS existentes.
- **El gate de contraste ahora evalúa los scopes combinados** (`dark+brand-a`, `dark+brand-b`) componiendo la cascada real. En su primera corrida encontró dos violaciones más que nadie había visto (fill de progress y slider en dark+brand-b) — corregidas subiendo el tono del link violeta.
- Par nuevo en el gate: `text.primary` sobre `bg.primary-subtle` (el del bug reportado).

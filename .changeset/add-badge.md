---
'@romanmartinidev/components': minor
'@romanmartinidev/tokens': minor
---

`DsBadge` (HU-021, aaa-034, tanda 3) — primera implementación del modelo de variantes `tone × appearance` (ADR-019, estándar del kit para componentes de estado). Ejes: `tone` (`neutral | primary | danger | success | warning | info`, default `neutral`) × `appearance` (`subtle | solid | outline`, default `subtle`) × `size` (`sm | md | lg`). Ícono leading por proyección (`[dsBadgeIcon]`, hereda el color del tono) y `dot` (punto de estado). Sin `role`: el significado va en el texto.

Contraste: las 18 combinaciones cumplen WCAG AA en los 4 themes (gate por script) — `subtle`/`outline` referencian semantic (adaptan a dark); `solid` usa primitives (invariante) con texto por tono (blanco salvo `warning`, que va oscuro). Tokens: `component.badge.*` reestructurado a dos ejes + `semantic.color.bg.neutral-subtle` nuevo (completa el set de tonos). Lockstep (ADR-015).

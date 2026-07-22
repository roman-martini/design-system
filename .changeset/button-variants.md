---
'@romanmartinidev/components': minor
'@romanmartinidev/tokens': minor
---

`DsButton` 4 variantes nuevas (HU-020, aaa-033, tanda 3): `outline` (borde + interacción de ghost), `danger` sólida (estrena el bloque `component.button.danger.*` del bootstrap), `danger-outline` y `danger-ghost` (texto/borde danger, hover `danger-subtle`). API previa intacta; disabled accesible (ADR-011) y `loading` funcionan idéntico en todas.

Tokens (D-016): la cadena de fondos danger corrige AA **en la fuente** — default `bg.danger/hover/active` `red.500/600/700 → red.600/700/800` (par con texto inverso 3.76:1 → 4.83:1 ✓) y dark aclara un paso (`red.600/500/400 → red.500/400/300`, base 3.71:1 → 4.76:1 ✓). Gate de contraste verde en los 4 themes, sin regresiones. Bloques aditivos `button.outline/danger-outline/danger-ghost`. Lockstep (ADR-015).

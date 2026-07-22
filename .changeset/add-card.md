---
'@romanmartinidev/components': minor
'@romanmartinidev/tokens': minor
---

Familia `DsCard` (HU-019, aaa-032, primera entrega de la tanda 3 D-014): contenedor `ds-card` con variantes `outline` (default, borde + sombra sutil) | `elevated` | `flat` y padding `comfortable` | `compact`, más sub-partes opcionales `ds-card-header`/`ds-card-content`/`ds-card-footer` y `dsCardTitle`/`dsCardDescription` con selector híbrido (elemento o atributo — `<h2 dsCardTitle>` conserva el heading real en el árbol de accesibilidad). Todo tokenizado, sin pares de contraste nuevos.

Tokens: `component.card.*` del bootstrap reutilizado sin renombrar + 2 aditivos (`card.gap`, `card.shadow-elevated`). Lockstep (ADR-015).

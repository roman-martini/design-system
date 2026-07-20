---
'@romanmartinidev/components': minor
'@romanmartinidev/tokens': minor
---

Familia `DsAccordion` (HU-013, segunda pieza de la tanda 2 D-011): accordion de contenido colapsable con patrón APG — `DsAccordion` (contenedor con `multiple` default single y `headingLevel` configurable) y `DsAccordionItem` (header heading+button con `aria-expanded`/`aria-controls`, panel `role="region"`, `expanded` two-way, disabled accesible ADR-011). Teclado ↑/↓ con wrap y Home/End entre headers de la instancia; accordions anidados con exclusividad, navegación y jerarquía de headings independientes; animación de altura 100% CSS (grid `0fr→1fr`) con `prefers-reduced-motion`.

Tokens: `component.accordion.*` nuevos (header, panel, border, motion) referenciando semantic/primitives, sin pares de contraste nuevos.

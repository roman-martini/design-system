---
'@romanmartinidev/components': minor
'@romanmartinidev/tokens': minor
---

`DsToastService` (HU-008): sistema de toasts — primera service del kit, con `provideDsToasts` (posición global, default `bottom-right`), stack en top layer vía popover manual (ADR-014), danger persistente, auto-dismiss pausable por hover/foco (WCAG 2.2.1) y acción única opcional.

Tokens: `component.toast.*` nuevos + fix de contraste AA (3:1) de `semantic.color.border.success/warning/info` en light (`*-600`/`*-700`) y dark (`*-400`).

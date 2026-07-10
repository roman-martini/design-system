---
'@romanmartinidev/components': minor
---

feat: add `DsModal` — first overlay component, built on native `<dialog>`/`showModal()` (top layer, platform focus trap, focus restore, inert background). Two-way `[(open)]`, 4 sizes via tokens, ESC/overlay/X close (each configurable), `heading` with `aria-labelledby`, body scroll lock, fade+scale animation with overlay tokens and `prefers-reduced-motion` support. Adds `@lucide/angular` as peerDependency (close button icon, per ADR-012).

---
'@romanmartinidev/tokens': patch
---

fix: `component.modal.overlay-bg` now references `{semantic.color.bg.overlay}` instead of duplicating the raw value (same resolved color; respects the component→semantic hierarchy rule).

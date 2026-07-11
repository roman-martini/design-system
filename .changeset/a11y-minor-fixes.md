---
'@romanmartinidev/components': patch
---

fix(a11y): minor fixes from the 2026-07-11 accessibility audit — radio dot color via `var(--ds-color-white)` instead of hardcoded `white`, `prefers-reduced-motion` blocks for the transitions of `ds-button`/`ds-checkbox`/`ds-radio`, and RadioGroup stories now demonstrate the required accessible name (`aria-label`) with a passthrough test.

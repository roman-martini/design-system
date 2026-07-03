---
'@romanmartinidev/components': minor
---

feat(button): accessible disabled state — `ds-button` now uses `aria-disabled` (stays focusable and announced) instead of the native `disabled` attribute, with a click guard and a new `disabledReason` input that renders a visible reason associated via `aria-describedby`. Form controls (`ds-checkbox`, `ds-radio`) keep their native `disabled`. See ADR-011.

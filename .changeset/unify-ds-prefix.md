---
'@romanmartinidev/components': minor
---

BREAKING (pre-1.0): unify prefix under `Ds` across selector, class and types.

- Selector: `rmd-button` -> `ds-button`, `rmd-checkbox` -> `ds-checkbox`.
- Class names drop `Component` suffix and add `Ds` prefix: `ButtonComponent` -> `DsButton`, `CheckboxComponent` -> `DsCheckbox`.
- Type exports prefixed: `ButtonVariant` -> `DsButtonVariant`, `ButtonSize` -> `DsButtonSize`, `CheckboxSize` -> `DsCheckboxSize`.

CSS custom properties `--ds-*` unchanged. Folder/file naming unchanged.

See [ADR-007](../docs/architecture/adr/ADR-007-naming-prefijos.md) for rationale. Supersedes parts of ADR-004 (§4 selector prefix, §5 class naming).

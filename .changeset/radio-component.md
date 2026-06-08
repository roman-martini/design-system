---
'@romanmartinidev/components': minor
---

feat: add DsRadio + DsRadioGroup components with full ControlValueAccessor support on the group, 3 sizes (sm/md/lg), generic typed value, keyboard navigation (Arrow keys + Home/End following WAI-ARIA APG radiogroup pattern, skipping disabled), context injection pattern (DsRadio injects DsRadioGroup ancestor as optional dependency). Radio standalone emits `selected` output when no group ancestor exists. Group provides auto-generated `name` for cross-form isolation.

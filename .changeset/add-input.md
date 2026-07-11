---
'@romanmartinidev/components': minor
---

feat(input): new `DsInput` — complete text field (label, native input, hint and error programmatically associated). CVA via NgControl self-registration, whitelisted types (`text|email|password|tel|url|search`), automatic invalid state from the NgControl (`invalid && touched`) with manual override, native `disabled` (ADR-011 form-control branch), passive prefix/suffix slots, sizes by tokens, focus ring via `:focus-within`.

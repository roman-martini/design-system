---
'@romanmartinidev/tokens': patch
---

fix(tabs): `component.tabs` alignment — raw px sizes now reference `{dimension.*}` primitives (same emitted values) and new `pills.text-hover`/`contained.text-hover` tokens (`text.primary`) so the hover state passes AA in dark (was 4.11:1 with `text-default` over `primary-subtle`, now 9.92:1). Verified per theme by script.

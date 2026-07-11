---
'@romanmartinidev/tokens': patch
---

fix(contrast): WCAG AA for interactive tokens — `semantic.color.bg.primary` chain darkened one step in the default theme (`blue-600/700/800`, white text now 5.17:1, was 3.68:1) and brand-a (`green-700/800/900`, 5.02:1, was 3.30:1); `semantic.color.border.strong` is now `neutral-500` (4.74:1 vs surface, was 2.52:1 — WCAG 1.4.11 for checkbox/radio borders). Visual change only, no token renamed. Dark and brand-b unchanged (already passing).

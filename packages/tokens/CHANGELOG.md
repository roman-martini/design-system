# @romanmartinidev/tokens

## 0.2.0

### Minor Changes

- df00efa: feat(select): new `component.select.*` tokens (trigger sizes/colors, listbox, option states) referencing semantic tokens. Contrast verified per theme: trigger text 17.93:1, placeholder 7.81:1 (text.secondary — text.tertiary fails AA), border 4.74:1 (border.strong — 1.4.11), option states ≥ 9.9:1.
- 2f03495: feat(tooltip): new `component.tooltip.*` tokens — inverse theme-aware surface by pairing semantics (`bg` ← `text.primary`, `text` ← `bg.surface`, ~17:1 contrast in all 4 themes, verified by script), `delay` ← `motion.duration.slower` (500ms), plus padding, radius, font-size, max-width, shadow and offset.
- 6826a42: feat: formalize z-index hierarchy in design-tokens-package spec + add semantic motion tokens for overlays (`transition.overlay-enter`, `transition.overlay-exit`) + add semantic effect tokens (`effect.blur.overlay`) preparing the system for Modal/Toast/Tooltip components. Adds Vitest tests validating the contract.

### Patch Changes

- 788732f: fix(contrast): AA for the input field and danger borders — `component.input.text-placeholder` → `text.secondary` (7.81:1, was 2.52:1), `component.input.border` → `border.strong` (4.74:1, was 1.48:1), and `semantic.color.border.danger` → `red-500` (3.76:1 light) with dark override → `red-400` (6.48:1, was `red-800` at 2.16:1). Verified per theme by script.
- d36b800: fix: `component.modal.overlay-bg` now references `{semantic.color.bg.overlay}` instead of duplicating the raw value (same resolved color; respects the component→semantic hierarchy rule).
- 0360740: fix(tabs): `component.tabs` alignment — raw px sizes now reference `{dimension.*}` primitives (same emitted values) and new `pills.text-hover`/`contained.text-hover` tokens (`text.primary`) so the hover state passes AA in dark (was 4.11:1 with `text-default` over `primary-subtle`, now 9.92:1). Verified per theme by script.
- cd220fa: fix(contrast): WCAG AA for interactive tokens — `semantic.color.bg.primary` chain darkened one step in the default theme (`blue-600/700/800`, white text now 5.17:1, was 3.68:1) and brand-a (`green-700/800/900`, 5.02:1, was 3.30:1); `semantic.color.border.strong` is now `neutral-500` (4.74:1 vs surface, was 2.52:1 — WCAG 1.4.11 for checkbox/radio borders). Visual change only, no token renamed. Dark and brand-b unchanged (already passing).

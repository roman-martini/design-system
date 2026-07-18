# @romanmartinidev/components

## 0.2.0

### Minor Changes

- 5f98b7e: feat(button): accessible disabled state — `ds-button` now uses `aria-disabled` (stays focusable and announced) instead of the native `disabled` attribute, with a click guard and a new `disabledReason` input that renders a visible reason associated via `aria-describedby`. Form controls (`ds-checkbox`, `ds-radio`) keep their native `disabled`. See ADR-011.
- 788732f: feat(input): new `DsInput` — complete text field (label, native input, hint and error programmatically associated). CVA via NgControl self-registration, whitelisted types (`text|email|password|tel|url|search`), automatic invalid state from the NgControl (`invalid && touched`) with manual override, native `disabled` (ADR-011 form-control branch), passive prefix/suffix slots, sizes by tokens, focus ring via `:focus-within`.
- d36b800: feat: add `DsModal` — first overlay component, built on native `<dialog>`/`showModal()` (top layer, platform focus trap, focus restore, inert background). Two-way `[(open)]`, 4 sizes via tokens, ESC/overlay/X close (each configurable), `heading` with `aria-labelledby`, body scroll lock, fade+scale animation with overlay tokens and `prefers-reduced-motion` support. Adds `@lucide/angular` as peerDependency (close button icon, per ADR-012).
- df00efa: feat(select): new `DsSelect` (single-select combobox, ARIA APG pattern) + `DsOption` (projected options with per-option disabled and rich content). Integrates with Angular Forms via CVA, full keyboard navigation (arrows/Home/End/Enter/ESC), `aria-activedescendant`, chevron per ADR-012. The listbox renders in the top layer via the native Popover API (no clipping by overflow containers, native light-dismiss) with a minimal JS positioning fallback — no new dependencies. Disabled state follows the ADR-011 button branch (`aria-disabled` + guard: focusable and announced).
- 0360740: feat(tabs): new `DsTabs` + `DsTab` — ARIA APG tabs pattern with automatic activation and roving tabindex (single tab stop, arrows with wrap skipping disabled tabs, Home/End). Three visual variants from tokens (`underline | pills | contained`), `[(value)]` two-way by tab id with first-enabled fallback, inactive panels stay in the DOM with `hidden` (state preserved), disabled tabs follow the ADR-011 button branch (`aria-disabled`, perceivable). Also fixes the library build to actually use the strict `tsconfig.lib.json` (`ng-packagr -c`) — published typings now preserve nullable types (e.g. `ModelSignal<string | null>`).
- 2f03495: feat(tooltip): new `DsTooltip` directive (`[dsTooltip]`) — the kit's first directive. WCAG 1.4.13 compliant tooltip (dismissable with ESC without moving focus, hoverable, persistent), hover trigger with tokenized 500ms delay (`dsTooltipDelay` override) and immediate open on keyboard focus, composable `aria-describedby` (never clobbers consumer values), 4 placements with viewport flip, top layer via manual popover (ADR-014). The visual panel is an internal non-exported component — the public API is the directive only.
- a620ab4: feat: add Checkbox component with ControlValueAccessor full support, 3 sizes (sm/md/lg), label slot or string input, ARIA `aria-checked="mixed"` for indeterminate state. Adds `@angular/forms@^21.0.0` as peer dependency.
- 1970f1f: feat: add DsRadio + DsRadioGroup components with full ControlValueAccessor support on the group, 3 sizes (sm/md/lg), generic typed value, keyboard navigation (Arrow keys + Home/End following WAI-ARIA APG radiogroup pattern, skipping disabled), context injection pattern (DsRadio injects DsRadioGroup ancestor as optional dependency). Radio standalone emits `selected` output when no group ancestor exists. Group provides auto-generated `name` for cross-form isolation.
- 88dd0ee: BREAKING (pre-1.0): unify prefix under `Ds` across selector, class and types.
  - Selector: `rmd-button` -> `ds-button`, `rmd-checkbox` -> `ds-checkbox`.
  - Class names drop `Component` suffix and add `Ds` prefix: `ButtonComponent` -> `DsButton`, `CheckboxComponent` -> `DsCheckbox`.
  - Type exports prefixed: `ButtonVariant` -> `DsButtonVariant`, `ButtonSize` -> `DsButtonSize`, `CheckboxSize` -> `DsCheckboxSize`.

  CSS custom properties `--ds-*` unchanged. Folder/file naming unchanged.

  See [ADR-007](../docs/architecture/adr/ADR-007-naming-prefijos.md) for rationale. Supersedes parts of ADR-004 (§4 selector prefix, §5 class naming).

### Patch Changes

- aab223d: fix(a11y): minor fixes from the 2026-07-11 accessibility audit — radio dot color via `var(--ds-color-white)` instead of hardcoded `white`, `prefers-reduced-motion` blocks for the transitions of `ds-button`/`ds-checkbox`/`ds-radio`, and RadioGroup stories now demonstrate the required accessible name (`aria-label`) with a passthrough test.
- 7f56586: refactor: rename internal component files to Angular v20+ style (`button.ts` instead of `button.component.ts`). No public API changes — consumers import from the package barrel.

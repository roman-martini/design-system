---
'@romanmartinidev/components': minor
---

feat(select): new `DsSelect` (single-select combobox, ARIA APG pattern) + `DsOption` (projected options with per-option disabled and rich content). Integrates with Angular Forms via CVA, full keyboard navigation (arrows/Home/End/Enter/ESC), `aria-activedescendant`, chevron per ADR-012. The listbox renders in the top layer via the native Popover API (no clipping by overflow containers, native light-dismiss) with a minimal JS positioning fallback — no new dependencies. Disabled state follows the ADR-011 button branch (`aria-disabled` + guard: focusable and announced).

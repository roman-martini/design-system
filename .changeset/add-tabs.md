---
'@romanmartinidev/components': minor
---

feat(tabs): new `DsTabs` + `DsTab` — ARIA APG tabs pattern with automatic activation and roving tabindex (single tab stop, arrows with wrap skipping disabled tabs, Home/End). Three visual variants from tokens (`underline | pills | contained`), `[(value)]` two-way by tab id with first-enabled fallback, inactive panels stay in the DOM with `hidden` (state preserved), disabled tabs follow the ADR-011 button branch (`aria-disabled`, perceivable). Also fixes the library build to actually use the strict `tsconfig.lib.json` (`ng-packagr -c`) — published typings now preserve nullable types (e.g. `ModelSignal<string | null>`).

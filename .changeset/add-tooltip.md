---
'@romanmartinidev/components': minor
---

feat(tooltip): new `DsTooltip` directive (`[dsTooltip]`) — the kit's first directive. WCAG 1.4.13 compliant tooltip (dismissable with ESC without moving focus, hoverable, persistent), hover trigger with tokenized 500ms delay (`dsTooltipDelay` override) and immediate open on keyboard focus, composable `aria-describedby` (never clobbers consumer values), 4 placements with viewport flip, top layer via manual popover (ADR-014). The visual panel is an internal non-exported component — the public API is the directive only.

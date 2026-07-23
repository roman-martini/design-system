---
'@romanmartinidev/components': minor
'@romanmartinidev/tokens': minor
---

`DsSwitch` (HU-023, aaa-035, tanda 3) — toggle on/off de acción inmediata integrado a Angular Forms (`ControlValueAccessor`, mismo molde que `DsCheckbox`). Base `<input type="checkbox" role="switch">` estilizado (track + thumb), `size` sm/md/lg, `label` opcional clickable, `disabled` nativo (ADR-011). Transición del thumb con reduced-motion. El estado on/off se comunica por la posición del thumb + contraste del thumb sobre el track (≥3:1, gate en los 4 themes).

Tokens: `component.switch.*` extendido (agrega size `lg`, `bg-off`/`bg-off-hover` ahora themables en dark). Lockstep (ADR-015).

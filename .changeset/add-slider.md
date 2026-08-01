---
'@romanmartinidev/components': minor
'@romanmartinidev/tokens': minor
---

`DsSlider` (`ds-slider`): slider de valor único integrado a Angular Forms, séptimo y último componente de la tanda 3 (HU-025, `aaa-044`).

- **Patrón híbrido**: un `<input type="range">` nativo invisible es el motor — semántica (`role="slider"`, `aria-value*`), teclado completo (flechas, Home/End, PageUp/PageDown), arrastre por pointer y participación en forms, sin reimplementar nada en JS. La capa visual (track, fill, thumb) son elementos propios tokenizados, sincronizados por la custom property `--ds-slider-pct` con corrección por ancho de thumb.
- **CVA tipado a `number`**: propaga números (nunca strings) con `[(ngModel)]` y `formControlName`; `disabled` nativo (ADR-011). Inputs `min`/`max`/`step`, `label`, `size` (`sm | md | lg`), `valueText` (formateador que alimenta `aria-valuetext`), aliases `aria-label`/`aria-labelledby`.
- **Extras opt-in** (el default es el slider mínimo de la referencia): `showValue` (`<output>` asociado, tabular-nums), `ticks` (marcas alineadas a steps con etiqueta opcional), `valueTooltip` (burbuja de valor sobre el thumb en arrastre y foco — indicador del propio control, no usa `DsTooltip` ni Popover API).
- **Tokens `component.slider.*`** (33 vars): thumb themable sobre la cadena semántica (sin `{color.white}`); el fill usa `{semantic.color.text.link}` porque `bg.primary` incumplía el ≥3:1 contra el track en dark (2.12, medido) — misma cadena que el fill de `DsProgress`. Contraste verificado en los 4 themes.
- Área interactiva ≥24px en las tres sizes; `prefers-reduced-motion` anula las transiciones; cero violaciones de axe (default y con extras).

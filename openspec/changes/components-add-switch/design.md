# Design — components-add-switch (aaa-035)

Decisiones técnicas del change. Muere al archivar.

## Context

`DsSwitch` es el toggle de acción inmediata; molde = `DsCheckbox` (CVA sobre `<input>`, `model` `checked`/`disabled`, `setDisabledState`, `viewChild` del input). HU-023 fijó: base input+`role="switch"`, sizes sm/md/lg, label opcional, disabled nativo. El bootstrap dejó `component/switch.json` en sm/md con `bg-off` primitive (no themable) — se completa.

## Goals / Non-Goals

**Goals:**

- Paridad de patrón con `DsCheckbox` (CVA, forms, disabled nativo).
- 3 sizes tokenizados + label; transición con reduced-motion.
- Estados on/off distinguibles ≥3:1 (gate) y token off themable.

**Non-Goals:**

- 3 estados / indeterminado; `loading`; ícono en el thumb.

## Decisions

### 1. API pública (paridad Checkbox)

```ts
DsSwitch; // ds-switch — CVA
type DsSwitchSize = 'sm' | 'md' | 'lg';
// model: checked (default false), disabled (default false)
// input: label (default ''), size (default 'md')
```

- `NG_VALUE_ACCESSOR` + `forwardRef`, `writeValue`/`registerOnChange`/`registerOnTouched`/`setDisabledState`, `handleInput` — copiados del patrón de `DsCheckbox` (sin `indeterminate`).

### 2. Estructura: input real + track/thumb estilizados

- `<label>` envuelve: `<input type="checkbox" role="switch" #inputEl>` visualmente oculto (opacity 0, sobre el track) + `<span class="ds-switch__track"><span class="ds-switch__thumb">` + `@if(label()) <span class="ds-switch__label">`.
- El input real recibe foco/teclado (Space) y es el CVA; el track/thumb son visuales. `:checked` del input mueve el thumb vía `translateX`.
- `aria-checked` lo maneja el input `role="switch"` nativo (el browser lo deriva de `checked`).

### 3. Tokens `component.switch.*` (extensión del bootstrap)

| Token                                | Estado     | Valor                                                                                                 |
| ------------------------------------ | ---------- | ----------------------------------------------------------------------------------------------------- |
| `track.width/height.sm/md`           | existente  | 32×18 / 44×24                                                                                         |
| `track.width.lg` / `track.height.lg` | **nuevo**  | `{dimension.56}` / `{dimension.28}`                                                                   |
| `thumb.size.sm/md`                   | existente  | 14 / 20                                                                                               |
| `thumb.size.lg`                      | **nuevo**  | `{dimension.24}`                                                                                      |
| `track.bg-on` / `bg-on-hover`        | existente  | `bg.primary` / `bg.primary-hover` (themable ✓)                                                        |
| `track.bg-off`                       | **cambia** | `{color.neutral.300}` → `{semantic.color.bg.secondary-active}` (neutral.200 light / neutral.600 dark) |
| `track.bg-off-hover`                 | **cambia** | `{color.neutral.400}` → `{semantic.color.border.strong}`                                              |
| `thumb.bg` / `shadow`                | existente  | `white` / `shadow.sm`                                                                                 |
| `focus-ring`, `label-*`              | existente  | sin cambios (label-font-size por size en el CSS)                                                      |

- **thumb travel**: `translateX(track.width - thumb.size - 2*padding)`; padding del thumb = `{dimension.2}` (constante, no token propio).
- **motion**: transición `transform`/`background-color` con `{motion.duration.fast}` + `{motion.easing.ease-out}` (tokens existentes); bloque `@media (prefers-reduced-motion: reduce) { transition: none }`.

### 4. Gate de contraste (WCAG 1.4.11 — estados de UI)

Pares (nivel `ui`, ≥3:1):

- `switch-on-vs-off`: `bg-on` vs `bg-off` — los dos estados se distinguen.
- `switch-thumb-on`: `thumb.bg` vs `bg-on` — el thumb es visible en on.

El thumb sobre off (blanco sobre gris claro) se delinea por la `shadow` del thumb (patrón estándar); la distinguibilidad de estado la garantiza el par on/off.

## Risks / Trade-offs

- [bg-off-hover en dark corre en dirección sutil distinta] → hover del switch es feedback menor, no lo muestra la referencia; aceptado, el gate cubre on/off base.
- [jsdom no computa transform/colores] → tests asertan estructura, `role="switch"`, CVA (checked/disabled) y tokens en CSS fuente; geometría del thumb en playground.

## Open Questions

(ninguna — HU-023 cerró base, sizes, label, disabled)

# Design — components-add-progress (aaa-029)

Decisiones técnicas del change. Muere al archivar; lo one-way door se promueve a ADR si aparece.

## Context

Última pieza de la tanda 2 (D-011). HU-016 refinada (PO 2026-07-20) fija: determinada + indeterminada con guía de uso vs spinner, `showValue` opt-in, sizes sm/md/lg, tonos primary/success/danger, label opt-out (patrón HU-009) y reduced-motion por pulso (patrón aaa-023). Componente de feedback puro: sin acciones, sin foco, sin proyección — el reto es la disciplina ARIA de progressbar y el primer uso del nivel `ui` (3:1) del gate.

## Goals / Non-Goals

**Goals:**

- `progressbar` correcto en ambas variantes (con/sin `aria-valuenow`).
- Animación indeterminada 100% CSS con reemplazo por pulso bajo reduced-motion.
- Pares fill/track verificados como UI no-texto (3:1) para los 3 tonos.

**Non-Goals:**

- Circular, buffer, stepper (fuera de alcance de HU-016).
- Live regions o anuncios de avance: el rol progressbar ya expone el valor; anunciar cada cambio sería ruido (el consumidor decide si anuncia hitos).

## Decisions

### 1. API pública

```ts
// public-api.ts
DsProgress; // selector ds-progress
// inputs: value (number | null, default null = indeterminada), max (default 100),
//         size ('sm' | 'md' | 'lg', default 'md'), tone ('primary' | 'success' | 'danger', default 'primary'),
//         showValue (default false), label (default 'Progreso'; '' = opt-out decorativo)
DsProgressSize;
DsProgressTone; // types
```

- **`value: null` = indeterminada** (una sola vía: sin input `indeterminate` booleano paralelo que pueda contradecir al value).
- Clamp de `value` a `[0, max]` en un `computed` (`percent`); `max <= 0` degrada a barra vacía determinada (documentado, sin throw).
- Sin `[(value)]`: el progreso es entrada pura del consumidor (no hay interacción que lo mute) — input simple, no model.

### 2. Render y ARIA

- Template: wrapper flex (barra + `showValue` opcional) → track `role="progressbar"` con `[attr.aria-valuemin]="0"`, `[attr.aria-valuemax]="max()"`, `[attr.aria-valuenow]="value() === null ? null : percent()"`... el `aria-valuenow` expone el **valor clampeado real** (no el porcentaje) para respetar min/max; fill como hijo con `width: percent%` por style binding.
- **Label opt-out** (calco de `DsSpinner`, aaa-023): `[attr.aria-label]="label() || null"` — `label=""` deja el progressbar sin nombre propio (el contexto visible es dueño del anuncio).
- `showValue`: `<span>` con el porcentaje redondeado (`Math.round`), oculto en indeterminada. `data-size`/`data-tone` en el host alimentan el CSS (estado en el elemento propio, lección aaa-026).

### 3. Animaciones

- **Determinada**: `transition: width` tokenizada (motion.duration/easing del componente) — el avance se ve fluido sin JS.
- **Indeterminada**: keyframes de desplazamiento (fill parcial que recorre el track en loop, `translateX` −100%→100% sobre un fill al ~40%). Duración raw documentada (~1.5s — la escala de motion termina en 500ms; precedente de raws documentados: `menu.submenu-delay`).
- **Reduced-motion por reemplazo** (regla aaa-023): bajo `prefers-reduced-motion`, la indeterminada apaga el desplazamiento y pasa a **pulso de opacidad** del fill (estático al ~100% de ancho); la determinada apaga la transición de width (cambio instantáneo).

### 4. Tokens `component.progress.*`

| Grupo  | Tokens                                   | Referencia                                                                                 |
| ------ | ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| track  | bg, radius                               | `{color.neutral.200}` (vía semantic si existe par), `{semantic.radius.lg}`                 |
| fill   | primary, success, danger                 | `{semantic.color.bg.primary}`, `{semantic.color.bg.success}`, `{semantic.color.bg.danger}` |
| size   | sm-height, md-height, lg-height          | `{dimension.4}`, `{dimension.8}`, `{dimension.12}`                                         |
| value  | font-size, text, gap                     | `{semantic.font.size.body-sm}`, `{semantic.color.text.secondary}`, `{semantic.space.sm}`   |
| motion | duration, easing, indeterminate-duration | `{motion.duration.slow}`, `{motion.easing.ease-in-out}`, `1500ms` raw documentado          |

- **Gate (primer uso del nivel `ui`, WCAG 1.4.11 — 3:1)**: fill-primary/track, fill-success/track, fill-danger/track en los 4 scopes. Si un tono falla, el fix es **local al component token** (referenciar un step más oscuro del primitive, precedente aaa-027) — no se toca semantic sin D-008.

## Risks / Trade-offs

- [`bg.success` (green.500) puede no dar 3:1 sobre el track claro] → el gate decide; fix local al token del componente si falla (documentado en tasks).
- [Track sobre superficies no-blancas (cards)] → el track es neutral fijo; contraste track/superficie no es requisito 1.4.11 (el borde perceptual lo da el fill); si un caso real lo pide, se agrega token de borde.
- [jsdom no computa animaciones] → keyframes/reduced-motion se verifican sobre la fuente CSS (patrón establecido); verificación visual del PO en playground.

## Open Questions

(ninguna — el refinamiento de HU-016 cerró todas las decisiones; las técnicas quedan resueltas arriba)

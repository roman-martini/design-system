# HU-025 — Slider (range) (dev consumidor)

**Épica**: [EP-002 — Kit de componentes Angular](EP-002-kit-componentes.md)
**Actor**: Dev consumidor
**Estado**: Identificada — tanda 3 ([D-014](../../decisiones.md), 2026-07-22). CAs binarios al refinar, justo antes de su change.
**Decisiones que aplica**: [D-005, D-007](../../decisiones.md) · Técnica: [ADR-004](../../../architecture/adr/ADR-004-arquitectura-components.md), [ADR-011](../../../architecture/adr/ADR-011-estado-disabled-accesible.md)

---

**COMO** dev que deja elegir un valor en un rango (settings, filtros, volumen)
**QUIERO** un `ds-slider` integrado a Angular Forms y accesible por teclado
**PARA** capturar un número dentro de límites sin construir el control ni su a11y a mano.

## Origen

Tanda 3 ([D-014](../../decisiones.md)), referencia [`moder-minimal`](../../../reference/components/moder-minimal/) img 1 (slider con fill). Sale de la [Cantera del BACKLOG](../../../backlog/BACKLOG.md#cantera-sin-disparador) al ganar el disparador de la tanda.

## Criterios de aceptación (candidatos)

- [ ] **CA-025.1 (control accesible)** — `<ds-slider>` (standalone, OnPush) implementa `ControlValueAccessor`; expone `role="slider"` + `aria-valuemin/valuemax/valuenow` (y `aria-valuetext` si aplica); inputs `min`, `max`, `step`.
- [ ] **CA-025.2 (teclado y pointer)** — Flechas (±step), Home/End (min/max), PageUp/PageDown (salto), y arrastre por pointer.
- [ ] **CA-025.3 (visual tokenizado)** — Track, fill y thumb por tokens `component.slider.*`; contraste AA del fill; respeta `prefers-reduced-motion`.
- [ ] **CA-025.4 (estados)** — Disabled accesible ([ADR-011](../../../architecture/adr/ADR-011-estado-disabled-accesible.md)); nombre accesible por label asociado.
- [ ] **CA-025.5 (showcase)** — El showcase reproduce el slider de la referencia.

## Decisiones a resolver al refinar

1. **Base**: `<input type="range">` nativo estilizado (teclado y a11y gratis, coherente con la preferencia de plataforma del repo — ADR-013/ADR-014; el styling del fill exige truco de gradiente o vendor pseudo-elements) vs. thumb/track custom con `role="slider"` (control visual total, más código y a11y a mano).
2. Single value vs. range de dos thumbs (la referencia es single → v1 single).
3. Marcas/ticks y etiquetas.
4. Tooltip de valor sobre el thumb.
5. Sizes.

## Dependencias

- Ninguna bloqueante. Es el componente más complejo de la tanda.

## Fuera de alcance

- Range de dos valores (v2) y orientación vertical.

## Notas

- Change tentativo: `components-add-slider`. Referencia de a11y: APG "Slider" pattern.

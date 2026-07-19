# HU-009 — Spinner de carga (dev consumidor)

**Épica**: [EP-002 — Kit de componentes Angular](EP-002-kit-componentes.md)
**Actor**: Dev consumidor
**Estado**: Hecha (2026-07-19) — [`aaa-023 components-add-spinner`](../../../../openspec/changes/archive/aaa-023-components-add-spinner/) archivado; 10 tests, review sin altas ni medias, sin pares de contraste nuevos (currentColor). Verificación manual pendiente del PO: pulso reduced-motion y geometría del arco en playground
**Decisiones que aplica**: [D-005, D-007, D-009](../../decisiones.md)

---

**COMO** dev que dispara operaciones asíncronas
**QUIERO** un `ds-spinner` accesible
**PARA** comunicar espera indeterminada de forma consistente (inline, en botones, o a pantalla).

## Decisiones de refinamiento (PO, 2026-07-19)

1. **Spinner solo en este change**: `ds-button` no se toca. El spinner garantiza el caso embebido (size `xs` + color heredado) y el estado `loading` de `ds-button` queda como item propio del backlog (`components-button-loading`) con disparador independiente. Mantiene la regla "un change por componente" de la tanda.
2. **Color por `currentColor`**: el indicador hereda del contexto (funciona automático dentro de botones, alerts, texto); el track usa el mismo color con opacidad tokenizada. Sin API de color — el consumidor lo controla con `color` CSS o un wrapper.
3. **`prefers-reduced-motion` → pulso de opacidad**: sin rotación; el spinner queda estático y pulsa suavemente la opacidad (~2s). Comunica actividad sin movimiento espacial.
4. **Anuncio con opt-out**: `role="status"` + input `label` (default "Cargando") como texto visually-hidden. Con `label=""` pasa a decorativo (`aria-hidden`) para evitar doble anuncio cuando el contexto ya comunica la carga (ej. botón "Guardando…").
5. **Sizes `xs/sm/md/lg`** por tokens (base FUTURE-WORK); `xs` es el que habilita el uso inline/en botones.
6. **"A pantalla completa" por composición**: el consumidor centra el spinner donde lo necesite; no hay variante overlay/fullscreen (D-005).

## Criterios de aceptación

<!-- Al implementar, estos CAs se vuelven scenarios del spec components-package (delta del change components-add-spinner). -->

- [x] **CA-009.1** — Dado `<ds-spinner />` (standalone, OnPush), cuando se renderiza con `size` `xs | sm | md | lg` (default `md`), entonces diámetro y grosor de trazo salen de tokens `component.spinner.*` para cada size.
- [x] **CA-009.2** — Dado un spinner dentro de un contexto con `color` definido (ej. un botón primary), entonces el indicador hereda `currentColor` y el track usa el mismo color con opacidad tokenizada; el componente no expone API de color.
- [x] **CA-009.3** — Dado un spinner con `label` default, entonces se expone como `role="status"` con el texto "Cargando" visually-hidden (anuncio cortés, sin robar foco); dado `label` custom, se anuncia ese texto; dado `label=""`, el spinner es decorativo (`aria-hidden="true"`, sin role).
- [x] **CA-009.4** — Dada la animación de rotación, entonces su duración/easing salen de tokens y bajo `prefers-reduced-motion` la rotación se reemplaza por un pulso de opacidad (~2s) sin movimiento espacial.
- [x] **CA-009.5** — Dado el CSS del componente, entonces todo valor sale de tokens (`component.spinner.*` nuevos + primitives/semantic existentes); al usar `currentColor` no introduce pares de contraste propios (el contraste lo gobierna el contexto que lo contiene).
- [x] **CA-009.6** — Dado el playground, entonces el showcase (EP-006) incluye la página de `ds-spinner` con los 4 sizes, el caso embebido en un botón (composición, sin tocar `DsButton`) y el comportamiento reduced-motion documentado.

## Dependencias

- Ninguna bloqueante.

## Fuera de alcance

- Progreso determinado (barra con porcentaje): es `ds-progress`, candidata aparte (D-005).
- Estado `loading` de `ds-button`: item `components-button-loading` del backlog (decisión 1).
- Variantes de color semánticas y variante overlay/fullscreen (decisiones 2 y 6).

## Notas

- Change OpenSpec: `components-add-spinner` (próximo ID en [openspec/README.md](../../../../openspec/README.md)).
- Referencias de implementación: variantes por tokens de `tabs.css`; bloque `prefers-reduced-motion` de `toast.css` (aaa-021); patrón visually-hidden del kit.

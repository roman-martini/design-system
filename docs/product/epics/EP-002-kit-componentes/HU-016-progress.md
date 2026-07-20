# HU-016 — Progress de avance medible (dev consumidor)

**Épica**: [EP-002 — Kit de componentes Angular](EP-002-kit-componentes.md)
**Actor**: Dev consumidor
**Estado**: Refinada (2026-07-20) — tanda 2, [D-011](../../decisiones.md)
**Decisiones que aplica**: [D-005, D-007, D-011](../../decisiones.md)

---

**COMO** dev que muestra operaciones con avance medible (upload, importación, wizard)
**QUIERO** un `ds-progress` accesible
**PARA** comunicar progreso determinado — o indeterminado cuando no hay medida — de forma consistente.

## Decisiones de refinamiento (PO, 2026-07-20)

1. **Determinada + indeterminada, con delimitación documentada**: el PO pidió el criterio de mejor práctica — el estándar de la industria (Material/Carbon/Atlassian) incluye ambas en el progress bar y el rol ARIA las contempla (sin `aria-valuenow` = indeterminada). El solape con `DsSpinner` se resuelve con **guía de uso** (en spec y showcase): spinner para esperas cortas o inline (botones, cards); progress indeterminada para procesos largos con contexto de página; determinada siempre que haya medida.
2. **Porcentaje visible opt-in**: input `showValue` (default `false`) muestra el porcentaje redondeado junto a la barra — solo en determinada. El valor accesible (`aria-valuenow`) existe siempre que haya medida.
3. **Sizes sm/md/lg**: tres alturas tokenizadas (patrón tabs/spinner).
4. **Tonos primary + success + danger**: input `tone` (default `primary`) con los tres colores semánticos desde v1 (upload completado, error). Introduce pares fill/track nuevos al gate como **UI no-texto** (WCAG 1.4.11, 3:1).
5. **Label accesible con opt-out sin re-decidir**: patrón de [HU-009](HU-009-spinner.md) (spinner) — nombre accesible por default, removible cuando el contexto visible ya lo provee.
6. **Reduced-motion por reemplazo sin re-decidir**: la animación de la indeterminada pasa a pulso de opacidad bajo `prefers-reduced-motion` (mismo criterio que el spinner, aaa-023 — la actividad sigue comunicada sin movimiento).

## Criterios de aceptación

<!-- Al implementar, estos CAs se vuelven scenarios del spec components-package (delta del change components-add-progress). -->

- [ ] **CA-016.1 (determinada accesible)** — Dado un `ds-progress` con `value` (y `max`, default 100), entonces expone `role="progressbar"` con `aria-valuenow`/`aria-valuemin`/`aria-valuemax` correctos, el fill es proporcional a `value/max` y `value` se clampa a `[0, max]`.
- [ ] **CA-016.2 (indeterminada)** — Dado un `ds-progress` sin `value`, entonces expone `role="progressbar"` sin `aria-valuenow` y anima el fill de forma continua; la guía de uso (spinner vs progress) queda documentada en el showcase.
- [ ] **CA-016.3 (label accesible)** — Dado el default, entonces el componente tiene nombre accesible ("Progreso", configurable); dado el opt-out explícito, entonces no expone label propio (el contexto visible lo provee).
- [ ] **CA-016.4 (porcentaje visible)** — Dado `showValue` en una barra determinada, entonces se muestra el porcentaje redondeado como texto tokenizado; en indeterminada no se muestra valor.
- [ ] **CA-016.5 (sizes)** — Dado `size` sm/md/lg (default md), entonces la altura de la barra sale de tokens por size.
- [ ] **CA-016.6 (tonos)** — Dado `tone` primary/success/danger (default primary), entonces el fill usa el color semántico tokenizado y cada par fill/track pasa el gate como UI no-texto (3:1, WCAG 1.4.11).
- [ ] **CA-016.7 (reduced-motion)** — Dada la variante indeterminada bajo `prefers-reduced-motion`, entonces la animación de desplazamiento se reemplaza por un pulso de opacidad (sin movimiento, actividad comunicada).
- [ ] **CA-016.8 (tokens)** — Dado el CSS del componente, entonces todo valor sale de tokens (`component.progress.*` nuevos + primitives/semantic existentes), sin hardcodes.
- [ ] **CA-016.9 (showcase)** — Dado el playground, entonces el showcase (EP-006) incluye la página de `ds-progress` con: determinada interactiva, `showValue`, sizes, tonos, indeterminada y la guía "cuándo spinner, cuándo progress".

## Dependencias

- Ninguna bloqueante.

## Fuera de alcance

- Progress circular: sin caso real (D-005); si aparece, change propio (probable variante de DsSpinner con medida).
- Stepper de pasos discretos: candidata aparte en [FUTURE-WORK](../../../backlog/FUTURE-WORK.md).
- Buffer/segundo valor (estilo video streaming): sin caso real (D-005).

## Notas

- Change OpenSpec: `components-add-progress` (próximo ID en [openspec/README.md](../../../../openspec/README.md)).
- Referencias de implementación: label con opt-out y reduced-motion por pulso de `spinner/` (aaa-023); sizes tokenizados de `tabs/`; niveles "ui" del gate de contraste (`check-a11y`, WCAG 1.4.11).
- Completa el trío de feedback (Spinner/Skeleton/Progress) y **cierra la tanda 2** (D-011).

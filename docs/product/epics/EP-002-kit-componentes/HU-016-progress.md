# HU-016 — Progress de avance medible (dev consumidor)

**Épica**: [EP-002 — Kit de componentes Angular](EP-002-kit-componentes.md)
**Actor**: Dev consumidor
**Estado**: Identificada (tanda 2, [D-011](../../decisiones.md))
**Decisiones que aplica**: [D-005, D-007, D-011](../../decisiones.md)

---

**COMO** dev que muestra operaciones con avance medible (upload, importación, wizard)
**QUIERO** un `ds-progress` accesible
**PARA** comunicar progreso determinado — o indeterminado cuando no hay medida — de forma consistente.

## Criterios de aceptación

Pendientes de refinamiento. Temas a cubrir (base [FUTURE-WORK](../../../backlog/FUTURE-WORK.md)): barra determinada (`value`/`max` con `role="progressbar"` + `aria-valuenow/min/max`) e indeterminada (delimitar contra `ds-spinner` — cuándo va cada uno), label accesible con opt-out (patrón de HU-009), animación de la variante indeterminada bajo `prefers-reduced-motion`, sizes por tokens, tokens `component.progress.*`. Completa el trío de feedback de la tanda 1 (Spinner/Skeleton).

## Dependencias

- Ninguna bloqueante.

## Fuera de alcance

- Progress circular: a evaluar en el refinamiento — probablemente fuera (D-005).
- Stepper de pasos discretos: candidata aparte en [FUTURE-WORK](../../../backlog/FUTURE-WORK.md).

## Notas

- Al refinarse, se crea su change OpenSpec (`components-add-progress`).

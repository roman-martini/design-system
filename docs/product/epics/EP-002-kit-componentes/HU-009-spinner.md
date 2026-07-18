# HU-009 — Spinner de carga (dev consumidor)

**Épica**: [EP-002 — Kit de componentes Angular](EP-002-kit-componentes.md)
**Actor**: Dev consumidor
**Estado**: Identificada (tanda 1, [D-009](../../decisiones.md))
**Decisiones que aplica**: [D-005, D-007, D-009](../../decisiones.md)

---

**COMO** dev que dispara operaciones asíncronas
**QUIERO** un `ds-spinner` accesible
**PARA** comunicar espera indeterminada de forma consistente (inline, en botones, o a pantalla).

## Criterios de aceptación

Pendientes de refinamiento. Temas a cubrir (base [FUTURE-WORK](../../../backlog/FUTURE-WORK.md)): sizes xs/sm/md/lg por tokens, color heredado o semántico, a11y (`role="status"` + label accesible configurable), `prefers-reduced-motion` (alternativa no animada), uso dentro de `ds-button` (estado loading) como caso a evaluar en el refinamiento.

## Dependencias

- Ninguna bloqueante.

## Fuera de alcance

- Progreso determinado (barra con porcentaje): es `ds-progress`, candidata aparte (D-005).

## Notas

- Al refinarse, se crea su change OpenSpec (`components-add-spinner`).

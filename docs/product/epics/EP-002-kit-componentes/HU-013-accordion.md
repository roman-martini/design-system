# HU-013 — Accordion de contenido colapsable (dev consumidor)

**Épica**: [EP-002 — Kit de componentes Angular](EP-002-kit-componentes.md)
**Actor**: Dev consumidor
**Estado**: Identificada (tanda 2, [D-011](../../decisiones.md))
**Decisiones que aplica**: [D-005, D-007, D-011](../../decisiones.md)

---

**COMO** dev que organiza contenido extenso en una página
**QUIERO** un `ds-accordion` accesible con secciones colapsables
**PARA** mantener escaneables páginas de settings, FAQs y detalles opcionales.

## Criterios de aceptación

Pendientes de refinamiento. Temas a cubrir (base [FUTURE-WORK](../../../backlog/FUTURE-WORK.md)): modo single vs multi expand, patrón APG accordion (headers como botones, jerarquía de headings configurable), evaluación de `<details>/<summary>` nativo como base (mismo criterio de plataforma que [ADR-013](../../../architecture/adr/ADR-013-overlays-dialog-nativo.md)), animación de expansión con `prefers-reduced-motion`, tokens `component.accordion.*`.

## Dependencias

- Ninguna bloqueante.

## Fuera de alcance

- Accordions anidados: a evaluar en el refinamiento — probablemente fuera (D-005).

## Notas

- Al refinarse, se crea su change OpenSpec (`components-add-accordion`).

# HU-012 — Menu/Dropdown de acciones (dev consumidor)

**Épica**: [EP-002 — Kit de componentes Angular](EP-002-kit-componentes.md)
**Actor**: Dev consumidor
**Estado**: Identificada (tanda 2, [D-011](../../decisiones.md))
**Decisiones que aplica**: [D-005, D-007, D-011](../../decisiones.md)

---

**COMO** dev que construye interfaces con acciones contextuales
**QUIERO** un `ds-menu` accesible disparado desde un botón
**PARA** agrupar acciones secundarias (editar, duplicar, eliminar) sin saturar la UI principal.

## Criterios de aceptación

Pendientes de refinamiento. Temas a cubrir (base [FUTURE-WORK](../../../backlog/FUTURE-WORK.md)): patrón APG menu button (no confundir con Select — acciones, no selección), keyboard nav completa (↑ ↓ Home End Esc, typeahead a evaluar), anclaje con Popover API reutilizando [ADR-014](../../../architecture/adr/ADR-014-overlays-anclados-popover-api.md), items con icono opcional (convención [ADR-012](../../../architecture/adr/ADR-012-iconografia-lucide.md)), separadores, items disabled accesibles ([ADR-011](../../../architecture/adr/ADR-011-estado-disabled-accesible.md)), tokens `component.menu.*`.

## Dependencias

- Ninguna bloqueante.

## Fuera de alcance

- Submenús anidados y context menu (click derecho): candidatos a evaluar en el refinamiento — probablemente fuera (D-005).
- Selección persistente de opciones: eso es `ds-select` (aaa-016).

## Notas

- Al refinarse, se crea su change OpenSpec (`components-add-menu`).

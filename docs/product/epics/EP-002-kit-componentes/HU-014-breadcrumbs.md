# HU-014 — Breadcrumbs de ubicación (dev consumidor)

**Épica**: [EP-002 — Kit de componentes Angular](EP-002-kit-componentes.md)
**Actor**: Dev consumidor
**Estado**: Identificada (tanda 2, [D-011](../../decisiones.md))
**Decisiones que aplica**: [D-005, D-007, D-011](../../decisiones.md)

---

**COMO** dev que construye jerarquías de páginas
**QUIERO** un `ds-breadcrumbs` accesible
**PARA** ubicar al usuario en la jerarquía y permitirle volver a niveles superiores.

## Criterios de aceptación

Pendientes de refinamiento. Temas a cubrir (base [FUTURE-WORK](../../../backlog/FUTURE-WORK.md)): `<nav aria-label>` + item actual con `aria-current="page"`, separador tokenizado (icono [ADR-012](../../../architecture/adr/ADR-012-iconografia-lucide.md) o carácter), API agnóstica del router (href/RouterLink por content projection) vs integrada, truncamiento/colapso en jerarquías largas, tokens `component.breadcrumbs.*`.

## Dependencias

- Ninguna bloqueante.

## Fuera de alcance

- Generación automática desde la configuración de rutas Angular: a evaluar en el refinamiento — probablemente fuera (acopla al router, D-005).

## Notas

- Al refinarse, se crea su change OpenSpec (`components-add-breadcrumbs`).

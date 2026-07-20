# HU-015 — Pagination de listados (dev consumidor)

**Épica**: [EP-002 — Kit de componentes Angular](EP-002-kit-componentes.md)
**Actor**: Dev consumidor
**Estado**: Identificada (tanda 2, [D-011](../../decisiones.md))
**Decisiones que aplica**: [D-005, D-007, D-011](../../decisiones.md)

---

**COMO** dev que renderiza listados largos de resultados
**QUIERO** un `ds-pagination` accesible
**PARA** navegar entre páginas de resultados sin construir la lógica de paginado visual a mano.

## Criterios de aceptación

Pendientes de refinamiento. Temas a cubrir (base [FUTURE-WORK](../../../backlog/FUTURE-WORK.md)): modelo de API (página actual + total vs pageSize/totalItems), elipsis para rangos largos, `<nav aria-label>` + `aria-current="page"`, labels accesibles configurables (anterior/siguiente), variante compacta (solo prev/next + contador) a evaluar, tokens `component.pagination.*`.

## Dependencias

- Ninguna bloqueante.

## Fuera de alcance

- Data fetching y estado de datos: el componente solo navega; los datos los maneja el consumidor.
- Infinite scroll / virtual scroll: otro patrón, no entra (D-005).

## Notas

- Al refinarse, se crea su change OpenSpec (`components-add-pagination`).

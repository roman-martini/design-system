---
'@romanmartinidev/components': minor
'@romanmartinidev/tokens': minor
---

`DsPagination` (HU-015, cuarta pieza de la tanda 2 D-011): navegación de páginas accesible — modelo `[(page)]` two-way (1-based) + `totalPages` (el componente solo navega, sin datos), ventana de páginas con `siblingCount` y "…" decorativo, controles first/prev/next/last con chevrons Lucide y disabled accesible en extremos (ADR-011), variante `compact` (extremos + contador "X de Y") y labels configurables por inputs (defaults en español). Página actual con `aria-current="page"` y nombres accesibles "Página N".

Tokens: `component.pagination.*` nuevos (item, current, disabled, counter, chevron) referenciando semantic/primitives; pares verificados AA en los 4 scopes.

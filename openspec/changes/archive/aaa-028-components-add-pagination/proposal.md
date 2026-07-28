---
id: aaa-028
name: components-add-pagination
type: change
status: archived
archived: 2026-07-20
modifies-specs:
  - components-package (ADDED: DsPagination)
  - design-tokens-package (sin delta de spec; component.pagination nuevo referenciando semantic/primitives)
related-adrs:
  - ADR-007
  - ADR-011
  - ADR-012
---

# Proposal — components-add-pagination

## Why

Cuarta pieza de la **tanda 2** (D-011, criterio "navegación y estructura de apps reales"): todo listado largo necesita paginado, y los paginados caseros fallan siempre en lo mismo — botones sin nombre accesible, página actual sin `aria-current`, extremos deshabilitados con `disabled` nativo (invisibles al teclado) y ventanas de páginas recalculadas a mano en cada app. HU-015 fue refinada con el PO el 2026-07-20 (modelo `page`+`totalPages`, ventana `siblingCount` con "…" estático, **variante compacta y first/last en v1** — completitud aceptada explícitamente). Respalda la prioridad 1 del repo (buenas prácticas: patrón de navegación accesible de serie).

## What Changes

- Nuevo componente **`DsPagination`** (naming ADR-007), navegación de páginas sin datos:
  - Modelo **`[(page)]` two-way (1-based) + `totalPages`**: el componente solo navega — los datos y el cálculo de páginas son del consumidor (fuera de alcance ya fijado en la HU).
  - **Ventana de páginas**: primera y última siempre visibles + `siblingCount` vecinas de la actual (default 1), con **"…" estático decorativo** (no focusable, `aria-hidden`) en los huecos.
  - **Controles de extremo**: first («), prev (‹), next (›), last (») con chevrons Lucide estáticos (ADR-012); en los extremos quedan **disabled accesibles** (ADR-011, rama botón de acción: focusables + `aria-disabled` + guarda).
  - **Variante `compact`**: first/prev/next/last + contador "X de Y" accesible, sin números — mismo modelo y mismos disabled.
  - **A11y**: `<nav>` con nombre accesible configurable, botones de página con "Página N", actual con `aria-current="page"`, **labels configurables** con defaults en español (i18n por inputs).
- Nuevos tokens **`component.pagination.*`** (item, actual, disabled, contador, gap) referenciando semantic/primitives; pares del número actual y hover al gate.
- Showcase del playground (EP-006): página de `ds-pagination` con básico, listado largo con elipsis, compacta y extremos disabled.
- Changesets: **minor** de components y **minor** de tokens. Lockstep (ADR-015).

## Capabilities

### New Capabilities

(ninguna — se extiende la existente)

### Modified Capabilities

- `components-package`: ADDED Requirement "Pagination de listados (DsPagination)" — modelo two-way, ventana con elipsis, navegación con extremos disabled accesibles, variante compacta, labels configurables y tokens — derivado 1:1 de los 8 CAs de HU-015.
- `design-tokens-package`: sin delta de spec — `component/pagination.json` es un archivo component nuevo que cumple la jerarquía existente (ADR-003).

## Alternativas evaluadas

Descartadas en el refinamiento con el PO (2026-07-20, decisiones en HU-015):

1. **Modelo `pageSize`/`totalItems`** (y el doble modo) — descartado: mete semántica de datos en un componente de navegación; derivar `totalPages` es una división del consumidor.
2. **Ventana fija sin configurar / sin elipsis** — descartadas: `siblingCount` con default 1 da el control con API mínima; sin elipsis los listados largos quedan sin resolver.
3. **Compacta y first/last fuera de v1** — recomendación técnica descartada por el PO (prioriza el patrón completo, criterio de HU-012/013/014). Coherencia interna: en la compacta, first/last son la única vía rápida a los extremos.
4. **"…" interactivo** (saltar N páginas) — no se consideró para v1: la primera y la última ya son clickeables; sin caso real (D-005).

## Impact

- **Código**: `packages/components/src/lib/pagination/` (componente único + css + spec + stories), `public-api.ts`, `packages/tokens/src/component/pagination.json` (nuevo), página del showcase en playground.
- **Dependencias**: ninguna nueva (chevrons vía peer `@lucide/angular` ya declarada). Sin secondary entry point (no hay dependencia que aislar, regla 1 de ADR-017).
- **Clasificación** (workflow add-component): componente de **navegación, no overlay** (sin ADR-013/014); botones = **controles de acción** → ADR-011 rama `aria-disabled` + guarda; consume iconos → ADR-012 §1. Sin CVA (el model `page` es two-way de señal, no form control).
- **ADR candidato**: ninguno previsto — reutiliza patrones ya decididos (ADR-011/012, ventana como computed puro estilo aaa-027); si la implementación revela algo one-way door, se para y se escala (regla vigente).

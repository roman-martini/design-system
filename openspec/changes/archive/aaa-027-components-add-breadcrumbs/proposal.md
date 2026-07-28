---
id: aaa-027
name: components-add-breadcrumbs
type: change
status: archived
archived: 2026-07-20
modifies-specs:
  - components-package (ADDED: DsBreadcrumbs, DsBreadcrumbItem + entry point router)
  - design-tokens-package (sin delta de spec; component.breadcrumbs nuevo referenciando semantic/primitives)
related-adrs:
  - ADR-004
  - ADR-017
  - ADR-007
  - ADR-012
---

# Proposal — components-add-breadcrumbs

## Why

Tercera pieza de la **tanda 2** (D-011, criterio "navegación y estructura de apps reales"): toda app con jerarquía de páginas necesita ubicar al usuario y dejarlo volver a niveles superiores, y los breadcrumbs caseros fallan siempre en lo mismo — sin landmark `nav`, item actual sin `aria-current`, separadores anunciados por screen readers y truncamientos que rompen el teclado. HU-014 fue refinada con el PO el 2026-07-20 (links proyectados agnósticos del router, separador por template, **truncamiento opt-in y auto-generación desde rutas en v1** — esta última empaquetada para no acoplar el core al router). Respalda la prioridad 1 del repo (buenas prácticas: patrón APG completo de serie) y la 2 (el secondary entry point escala la estructura del package sin encarecer a quien no lo usa).

## What Changes

- Nueva familia **`DsBreadcrumbs`** (naming ADR-007), primer componente de navegación jerárquica del kit:
  - **`DsBreadcrumbs`** — landmark `<nav>` con nombre accesible configurable (default "breadcrumb") + lista `<ol>`; inputs `maxItems` (truncamiento opt-in) y template opcional de separador.
  - **`DsBreadcrumbItem`** — `<li>` declarativo proyectado (registro padre-hijo scoped, patrón aaa-026): proyecta el link del consumidor (`<a href>` o `routerLink`); el último item expone `aria-current="page"` automáticamente.
- **Separador**: default chevron Lucide estático (ADR-012, decorativo); reemplazable por `ng-template` proyectado. Nunca focusable ni anunciado.
- **Truncamiento opt-in**: con `maxItems` superado, los intermedios se ocultan tras un botón "…" con nombre accesible; al activarlo se revelan **inline** (sin overlay) y el foco queda en el primer item revelado.
- **Auto-generación desde rutas** en el **primer secondary entry point** del package: `@romanmartinidev/components/router`, con `@angular/router` como **peer opcional** (`peerDependenciesMeta`) — el core sigue agnóstico (decisión 1 de HU-014). Convención `data.breadcrumb`: string o resolver síncrono `(route) => string`; rutas sin la data se omiten. **La estructura de secondary entry points es one-way door del package (modifica el contrato APF de ADR-004) → ADR al cerrar.**
- Nuevos tokens **`component.breadcrumbs.*`** (item, link, actual, separador) referenciando semantic/primitives; el link introduce al gate los pares link/surface si no estaban verificados.
- Showcase del playground (EP-006): página de `ds-breadcrumbs` con básico, separador custom, truncamiento y auto-generación contra las rutas reales del playground (aaa-022).
- Changesets: **minor** de components (familia nueva + entry point) y **minor** de tokens (`component.breadcrumbs.*`). Lockstep (ADR-015).

## Capabilities

### New Capabilities

(ninguna — se extiende la existente)

### Modified Capabilities

- `components-package`: ADDED Requirement "Breadcrumbs de ubicación (DsBreadcrumbs)" — landmark + lista APG, links proyectados con `aria-current` automático, separador default/template, truncamiento opt-in inline, auto-generación vía entry point `router` con peer opcional, tokens — derivado 1:1 de los 7 CAs de HU-014.
- `design-tokens-package`: sin delta de spec — `component/breadcrumbs.json` es un archivo component nuevo que cumple la jerarquía existente (ADR-003).

## Alternativas evaluadas

Descartadas en el refinamiento con el PO (2026-07-20, decisiones en HU-014):

1. **Input `href` / API de datos `[items]`** — descartados: recarga completa u obligaba a acoplar el router; rompe el patrón declarativo del kit y limita contenido rico.
2. **Separador solo carácter o solo icono fijo** — el PO eligió template proyectado (máxima flexibilidad); el default sigue siendo el chevron ADR-012 sin configurar nada.
3. **Truncamiento fuera de v1 / menú dropdown / colapso por espacio** — el PO eligió "…" con expansión inline: sin overlay dentro del nav, sin ResizeObserver; el colapso automático por ancho queda como change futuro si aparece el caso.
4. **Auto-rutas con `@angular/router` como peer duro del entry principal** — descartado: toda app del kit pagaría el router; contradice la decisión 1. El secondary entry point con peer opcional compatibiliza ambas.
5. **Auto-rutas fuera de v1** — recomendación técnica descartada por el PO: acepta el alcance (prioriza el patrón completo, mismo criterio que HU-012/HU-013); el costo asumido es el primer secondary entry point y su ADR.

## Impact

- **Código**: `packages/components/src/lib/breadcrumbs/` (nav + item, css, spec, stories), `public-api.ts`, **`packages/components/router/`** (secondary entry point ng-packagr con su `ng-package.json` y public-api propio), `package.json` de components (`@angular/router` peer opcional), `packages/tokens/src/component/breadcrumbs.json` (nuevo), página del showcase en playground.
- **Dependencias**: `@angular/router` como **peerDependency opcional** — primera peer opcional del package; ninguna dependency dura nueva.
- **Clasificación** (workflow add-component): componente de **navegación, no overlay** (sin ADR-013/014); links = navegación nativa del consumidor (sin ADR-011 — no hay controles disabled); separador/chevron → ADR-012 §1. Sin CVA.
- **ADR candidato confirmado**: estructura de secondary entry points + peers opcionales (modifica el alcance de ADR-004 §surface) — se escribe al archivar, con el criterio para futuros entry points (p.ej. `components/forms` si apareciera).

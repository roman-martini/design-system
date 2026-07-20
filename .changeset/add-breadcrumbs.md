---
'@romanmartinidev/components': minor
'@romanmartinidev/tokens': minor
---

Familia `DsBreadcrumbs` (HU-014, tercera pieza de la tanda 2 D-011): breadcrumbs de ubicación con patrón APG — `DsBreadcrumbs` (landmark `nav` + lista, `maxItems` para truncamiento opt-in con "…" que expande inline), `DsBreadcrumbItem` (link proyectado por el consumidor, `aria-current="page"` automático en el último) y `DsBreadcrumbsSeparator` (separador por template; default chevron ADR-012). **Primer secondary entry point del package**: `@romanmartinidev/components/router` con `DsBreadcrumbsRouter` (auto-generación desde `data.breadcrumb` de las rutas, string o resolver) y `@angular/router` como peerDependency **opcional** — el core sigue sin depender del router.

Tokens: `component.breadcrumbs.*` nuevos (item, link, current, separator, ellipsis) referenciando semantic/primitives; pares del link verificados AA en los 4 scopes.

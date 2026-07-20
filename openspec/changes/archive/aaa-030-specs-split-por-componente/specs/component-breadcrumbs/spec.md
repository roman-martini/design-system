## ADDED Requirements

### Requirement: Breadcrumbs de ubicación (DsBreadcrumbs)

El package SHALL exponer la familia `DsBreadcrumbs` (`ds-breadcrumbs`), `DsBreadcrumbItem` (`ds-breadcrumb-item`) y `DsBreadcrumbsSeparator` (template de separador), naming por ADR-007, implementando el patrón APG _breadcrumb_: landmark `<nav>` con nombre accesible, lista con roles explícitos, links proyectados por el consumidor (core sin dependencia de `@angular/router`) y `aria-current="page"` automático en el último item. El package SHALL exponer además el secondary entry point `@romanmartinidev/components/router` con `DsBreadcrumbsRouter` (auto-generación desde rutas) y `@angular/router` como peerDependency **opcional**. Los estilos SHALL salir exclusivamente de tokens (`component.breadcrumbs.*` + primitives/semantic).

#### Scenario: estructura accesible (CA-014.1)

- **GIVEN** un `ds-breadcrumbs` con items proyectados
- **THEN** el landmark SHALL ser `<nav>` con nombre accesible configurable (default "breadcrumb")
- **AND** los items SHALL renderizarse como lista (`role="list"` en el contenedor de items, `role="listitem"` en cada item)

#### Scenario: links agnósticos e item actual (CA-014.2)

- **GIVEN** un item con un link proyectado (`<a href>` o `routerLink`)
- **THEN** la navegación SHALL ser la que declare el consumidor (el componente no la intercepta)
- **GIVEN** el último item de la lista
- **THEN** SHALL exponer `aria-current="page"` automáticamente y renderizarse con el estilo de ubicación actual, sin requerir link

#### Scenario: separador default y por template (CA-014.3)

- **GIVEN** un breadcrumbs sin template de separador
- **THEN** cada item posterior al primero SHALL renderizar el chevron Lucide decorativo (`aria-hidden="true"`, tamaño y color tokenizados)
- **GIVEN** un `ng-template` con `dsBreadcrumbsSeparator` proyectado
- **THEN** ese markup SHALL renderizarse como separador entre items
- **AND** en ambos casos el separador SHALL quedar fuera del tab order y del árbol de accesibilidad

#### Scenario: truncamiento opt-in con expansión inline (CA-014.4)

- **GIVEN** un breadcrumbs con `maxItems` y más items que `maxItems`
- **THEN** SHALL mostrarse el primer item, un botón "…" con nombre accesible que indica cuántos niveles oculta, y los últimos `maxItems - 1` items; los intermedios SHALL quedar fuera del render visible, del tab order y de AT
- **WHEN** se activa el botón "…"
- **THEN** los items ocultos SHALL revelarse inline, el botón SHALL desaparecer y el foco SHALL quedar en el link del primer item revelado
- **GIVEN** un breadcrumbs sin `maxItems`
- **THEN** SHALL renderizar todos los items sin colapso

#### Scenario: estilos exclusivamente por tokens con pares del link al gate (CA-014.5)

- **WHEN** se inspecciona el CSS de la familia
- **THEN** todo valor visual SHALL referenciarse vía `var(--ds-*)`
- **AND** SHALL NO existir hex codes, px hardcodeados (excepto `0`) ni colores literales
- **AND** los pares de contraste link/surface, link-hover/surface y current/surface SHALL pasar el gate AA por script

#### Scenario: auto-generación desde rutas con peer opcional (CA-014.6)

- **GIVEN** una app con rutas que declaran `data: { breadcrumb: 'Etiqueta' }` o `data: { breadcrumb: (route) => string }`
- **WHEN** se usa `<ds-breadcrumbs-router>` (entry point `@romanmartinidev/components/router`)
- **THEN** los items SHALL generarse desde el árbol de rutas activo en cada navegación, omitiendo rutas sin la data, con el item de la ruta activa como actual
- **GIVEN** un consumidor que no importa el entry point `router`
- **THEN** el core SHALL funcionar sin `@angular/router` instalado (peer declarada opcional y sin imports de router fuera del entry point)

#### Scenario: exportado desde los public-api (CA-014.1/CA-014.6)

- **WHEN** se inspecciona `packages/components/src/public-api.ts`
- **THEN** SHALL contener `export * from './lib/breadcrumbs';`
- **WHEN** se inspecciona el public-api del entry point `router`
- **THEN** SHALL exportar `DsBreadcrumbsRouter`
- **AND** un consumidor SHALL poder importar `DsBreadcrumbs`, `DsBreadcrumbItem` y `DsBreadcrumbsSeparator` del entry principal

## ADDED Requirements

### Requirement: Menú de acciones (DsMenu)

El package SHALL exponer la familia `DsMenuTrigger` (directiva `[dsMenuTriggerFor]`), `DsMenu` (`ds-menu`), `DsMenuItem` (`ds-menu-item`) y `DsMenuSeparator` (`ds-menu-separator`), naming por ADR-007. El panel SHALL implementar el patrón APG _menu button_ sobre la Popover API (ADR-014): `role="menu"` en top layer, foco DOM real entre items, light-dismiss nativo. Los items SHALL soportar icono opcional (ADR-012), variante `danger`, disabled accesible (ADR-011, rama de acción) y submenús anidados sobre popovers de plataforma. Los estilos SHALL salir exclusivamente de tokens (`component.menu.*` + primitives/semantic).

#### Scenario: apertura desde el trigger (CA-012.1)

- **GIVEN** un botón con `[dsMenuTriggerFor]` apuntando a un `ds-menu`
- **WHEN** se activa por click, Enter, Space o ↓
- **THEN** el panel SHALL abrirse vía Popover API con `role="menu"` y el foco en el primer item habilitado
- **AND** el trigger SHALL exponer `aria-haspopup="menu"` y `aria-expanded="true"` (y `"false"` cerrado)

#### Scenario: navegación por teclado con typeahead (CA-012.2)

- **GIVEN** un menú abierto con foco en un item
- **WHEN** se presiona ↑/↓/Home/End
- **THEN** el foco DOM SHALL moverse al item anterior/siguiente (con wrap) o al primero/último
- **WHEN** se tipea un carácter imprimible
- **THEN** el foco SHALL saltar al siguiente item cuyo texto empiece con el buffer tipeado (case-insensitive)
- **WHEN** se presiona Esc
- **THEN** el panel SHALL cerrarse y el foco SHALL volver al trigger

#### Scenario: activación de un item (CA-012.3)

- **GIVEN** un item habilitado (`role="menuitem"`)
- **WHEN** se activa por click, Enter o Space
- **THEN** SHALL emitir su output `selected`
- **AND** todo el árbol de menús SHALL cerrarse devolviendo el foco al trigger

#### Scenario: contenido de items — icono, danger y separador (CA-012.4)

- **GIVEN** un item con un icono Lucide proyectado según la convención ADR-012 (import por icono, 16/1.5, `currentColor`)
- **THEN** el icono SHALL renderizarse decorativo (`aria-hidden="true"`) alineado con gap tokenizado, sin API de icono en el item
- **GIVEN** un item con `danger`
- **THEN** SHALL usar los tokens `component.menu.danger-*` (rojo semántico)
- **GIVEN** un `ds-menu-separator`
- **THEN** SHALL exponer `role="separator"` y NO SHALL ser focusable

#### Scenario: item disabled accesible (CA-012.5)

- **GIVEN** un item con `disabled`
- **WHEN** recibe foco por teclado
- **THEN** SHALL ser focusable y exponer `aria-disabled="true"`
- **WHEN** se intenta activar
- **THEN** NO SHALL emitir `selected` ni cerrar el menú

#### Scenario: submenú anidado (CA-012.6)

- **GIVEN** un item con submenú (`aria-haspopup="menu"` + `aria-expanded`)
- **WHEN** se activa por →, Enter o hover sostenido
- **THEN** el panel hijo SHALL abrirse como popover anidado con el foco en su primer item habilitado
- **WHEN** se presiona ← o Esc en el submenú
- **THEN** SHALL cerrarse solo ese nivel devolviendo el foco al item padre
- **WHEN** se activa un item hoja del submenú
- **THEN** todo el árbol SHALL cerrarse

#### Scenario: light-dismiss del árbol (CA-012.7)

- **GIVEN** cualquier nivel de menú abierto
- **WHEN** se interactúa fuera del árbol de menús
- **THEN** el árbol completo SHALL cerrarse (light-dismiss de plataforma)
- **AND** el estado interno SHALL sincronizarse vía el evento `toggle` (regla 1 de ADR-014)

#### Scenario: estilos exclusivamente por tokens con pares danger al gate (CA-012.8)

- **WHEN** se inspecciona el CSS de la familia
- **THEN** todo valor visual SHALL referenciarse vía `var(--ds-*)`
- **AND** SHALL NO existir hex codes, px hardcodeados (excepto `0`) ni colores literales
- **AND** la animación de entrada/salida SHALL usar los tokens de overlay con bloque `@media (prefers-reduced-motion: reduce)`
- **AND** los pares de contraste del item danger (texto danger sobre panel elevado y sobre hover danger-subtle) SHALL pasar el gate AA por script

#### Scenario: exportado desde public-api.ts

- **WHEN** se inspecciona `packages/components/src/public-api.ts`
- **THEN** SHALL contener `export * from './lib/menu';`
- **AND** un consumidor SHALL poder importar `DsMenuTrigger`, `DsMenu`, `DsMenuItem` y `DsMenuSeparator`

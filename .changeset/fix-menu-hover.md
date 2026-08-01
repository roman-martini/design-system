---
'@romanmartinidev/components': patch
'@romanmartinidev/tokens': patch
---

`DsMenu`: la apertura de submenú por hover ya no sobrevive al cierre ni al cambio de item (`aaa-045`, Parte G de la review integral).

- **Bug corregido**: `DsMenuItem` agendaba la apertura de su submenú tras el delay de hover intent y no la cancelaba nunca. Si el puntero pasaba a otro item antes de que venciera, el submenú del primero abría igual y le robaba el foco al item bajo el puntero; si el menú se cerraba con Esc en esa ventana, quedaba un panel de submenú huérfano en el top layer. Ahora la apertura pendiente se cancela cuando el puntero abandona el item y cuando el menú se cierra por cualquier vía (Esc, ←, Tab, activación de un item o light-dismiss).
- **Sin cambios de API**: la cancelación va en `closeOwnSubmenu()`, que ya era el punto único de cierre; el contrato público `DsMenuItemRegistration` no suma miembros.
- **Sin barras de scroll al reabrir un menú con submenús**: el panel declaraba `display: flex` a secas, lo que pisa la regla del UA que oculta un `[popover]` cerrado (el origen de autor gana sobre el del UA). El panel del submenú cerrado seguía existiendo para el layout con el `position: fixed` que le dejó el posicionador, y como el panel padre tiene `transform` durante la animación de apertura —lo que lo vuelve containing block de sus descendientes fixed—, el submenú lo desbordaba y disparaba las barras. Ahora el panel es `display: none` y pasa a `display: flex` solo en `:popover-open`.
- **El panel acota su alto**: `max-height` nuevo (`component.menu.panel.max-height`, 320px, el mismo valor que el listbox de select) con `overflow-y: auto` y `overflow-x: clip`, para que un menú más largo que el viewport se scrollee en vez de salirse de pantalla.
- **Superficie pública curada**: `menu/index.ts` y `slider/index.ts` pasan de `export *` a exports con nombre. Los ocho símbolos que ya exponían siguen exportados —`DsMenu`, `DsMenuItemRegistration`, `DsMenuItem`, `DsMenuSeparator`, `DsMenuTrigger`, `DsSlider`, `DsSliderSize`, `DsSliderTick`—, así que ningún consumidor cambia. Un test verifica la convención sobre los 24 índices del kit: lo que no esté escrito en el índice no entra al contrato semver por accidente.

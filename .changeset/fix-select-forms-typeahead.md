---
'@romanmartinidev/components': patch
'@romanmartinidev/tokens': patch
---

Cinco fixes en `DsSelect` (segundo change de la Parte G de la review integral). Sin cambios en la API pública.

- **El control pasa a `touched` al perder el foco**: hasta ahora `DsSelect` marcaba touched solo al cerrar el listado, así que enfocar el select y tabular sin abrirlo dejaba el control sin tocar — el patrón `invalid && touched` de las apps consumidoras nunca mostraba el error de un select requerido. El light-dismiss tampoco marcaba (no pasa por `closeList`). Ahora lo marcan el blur con listado cerrado y el cierre por cualquier vía, alineando el contrato de forms con el de `DsFieldBase`.
- **Typeahead por caracteres imprimibles**, el que el patrón APG _select-only combobox_ especifica y `DsMenu` ya tenía: tipear mueve la opción activa a la que empieza con lo tipeado, con listado abierto o cerrado (cerrado lo abre y posiciona), sin cambiar el valor hasta confirmar. Saltea opciones deshabilitadas y repetir la inicial cicla entre las que la comparten.
- **La separación entre trigger y overlay sale de un token** en los dos posicionadores que la tenían hardcodeada en JS: `component.select.listbox.offset` y `component.menu.panel.offset` (ambos 4px, sin cambio visual). El submenú y el tooltip ya la leían de su token; ahora un rediseño del espaciado de overlays llega a los cuatro.
- **El listbox cerrado deja de ocupar layout**: declaraba `display: flex` fuera de `:popover-open` y pisaba la regla del navegador que oculta un popover cerrado — el mismo defecto que en el menú disparaba barras de scroll, acá latente porque el listbox no anida overlays. La convención pasa a estar verificada por un test que barre todos los CSS de overlay del kit.
- **El control deja de contraerse al elegir una opción de label corto** (único cambio visible): su ancho se dimensionaba por el label seleccionado —medido en Chromium, 133 px con el placeholder y 79 px tras elegir "Chile"— y el listado heredaba esa contracción partiendo las opciones largas en dos líneas. El trigger gana un piso de ancho (`component.select.trigger.min-width`, 180 px, el mismo que el panel del menú) y el listado usa el ancho del trigger como mínimo en vez de como medida exacta. Si querés un ancho distinto, declaralo sobre `<ds-select>`: el piso solo evita el colapso del caso por defecto.

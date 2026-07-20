---
'@romanmartinidev/components': minor
'@romanmartinidev/tokens': minor
---

Familia `DsMenu` (HU-012, primera pieza de la tanda 2 D-011): menú de acciones APG sobre Popover API — `DsMenuTrigger` (directiva `[dsMenuTriggerFor]` para cualquier botón), `DsMenu` (panel `role="menu"` en top layer, raíz o submenú anidado), `DsMenuItem` (icono por proyección ADR-012, variante `danger`, disabled accesible ADR-011, submenú vía `[submenu]`) y `DsMenuSeparator`. Teclado completo con wrap, Home/End, typeahead, Esc/← por nivel y cierre de árbol al activar.

Tokens: `component.menu.*` nuevos (panel, item, danger, separator, submenu). **Ajuste visual D-012**: `semantic.color.text.danger` sube un paso (light `red.600`→`red.700`, dark `red.400`→`red.300`) para cumplir AA sobre superficies `danger-subtle` — afecta también el texto de error de `DsInput` (mejora su contraste).

---
'@romanmartinidev/components': patch
'@romanmartinidev/tokens': patch
---

**`DsModal` acepta `aria-label` y `aria-labelledby`**: un modal sin `heading` ya no queda sin nombre accesible (cuarto change de la Parte G de la review integral).

`labelledBy` devolvía `null` cuando no había `heading` y no existía ninguna vía alternativa, así que un modal de confirmación con contenido proyectado —el caso más común de modal sin título— se anunciaba solo como "diálogo". Es violación de WCAG 4.1.2 y de la regla `dialog-name` de axe. El kit ya había resuelto esto dos veces (`DsSelect` y `DsFieldBase` exponen los mismos alias); el modal no lo había adoptado.

La precedencia es explícita: **`aria-labelledby` > `heading` > `aria-label`**. Un `aria-labelledby` del consumidor es una instrucción directa y gana sobre el título del componente; el `heading` gana sobre `aria-label` porque cuando hay título visible el nombre accesible debe coincidir con él (WCAG 2.5.3). Nunca se emiten los dos atributos a la vez.

El nombre se aplica al `<dialog>` interno, que es el elemento con rol, y **se limpia del host**: `aria-label` sobre un `<ds-modal>` sin rol es inerte para nombrar el diálogo y además una violación por atributo ARIA no permitido. Si venías pasando `aria-label` al componente y no hacía nada, ahora funciona.

El ancho de borde del CSS pasa a salir del token `--ds-dimension-1`, el mismo que usa el menú: era el último valor dimensional hardcodeado del archivo, y un theme que engrose bordes por accesibilidad no llegaba al modal. El valor no cambia.

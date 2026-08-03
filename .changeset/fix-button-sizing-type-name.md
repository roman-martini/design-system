---
'@romanmartinidev/components': minor
'@romanmartinidev/tokens': patch
---

**`DsButton` se dimensiona con sus propios tokens, acepta `type` y admite nombre accesible** (quinto change de la Parte G de la review integral).

**Cambio visual**: el botón pasa a medir lo que su token de altura declara — 32/40/48 px según el size — en lugar de derivar su alto del padding. En `md` crece de 38 a 40 px, que es lo que lo alinea con `ds-select` y con los campos de texto al ponerlos en una misma fila. El `padding-x` del size `sm` pasa de 8 a 12 px, también por token.

El PO había reportado que el texto no se veía centrado verticalmente. Medido en Chromium: el `line-height` resolvía a 20 px mientras el alto natural del texto es 21, así que la caja de línea recortaba el texto y el sobrante negativo, repartido en medio píxel por lado, se iba hacia arriba por redondeo. Con el alto ya fijado por token, el `line-height` puede contener el texto sin cambiar el tamaño del control: el espacio libre queda **8 px arriba y 8 abajo** donde antes era 8 y 9.

La causa de fondo era que **los tokens `component.button.*` de altura, padding, tamaño de fuente y gap existían desde el bootstrap y nadie los consumía**: el CSS se dimensionaba con `semantic.space.*` y primitives de tipografía, contra la jerarquía que el sistema declara. Al conectarlos apareció que `component.button.radius` decía 6 px mientras el render usaba 8: se corrigió el token al valor real, así que **la curvatura no cambia**.

Además:

- **`type`** (`'button' | 'submit' | 'reset'`, default `'button'`): el kit ya no obliga a usar un `<button>` nativo para el submit de un formulario. Con `disabled` o `loading`, la guarda impide también el envío nativo, no solo la emisión de `clicked`.
- **`aria-label` / `aria-labelledby`** reenviados al `<button>` interno: un botón cuyo único contenido es un icono ya puede tener nombre accesible. El atributo se limpia del host, donde era inerte y además una violación por atributo ARIA no permitido.

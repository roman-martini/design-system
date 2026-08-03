---
'@romanmartinidev/components': patch
'@romanmartinidev/tokens': patch
---

**La marca del checkbox y del radio sigue al theme** (séptimo change de la Parte G, que cierra la parte).

El checkmark estaba pintado con `stroke='white'` dentro de un SVG en data URI, y el punto del radio con el primitive `--ds-color-white`. En el theme oscuro el fondo del control marcado **aclara** a `blue-500`, así que una marca blanca perdía contraste justo en el único elemento que distingue "marcado" de "sin marcar" (medido: pasa de ~3.7:1 a ~4.9:1).

Un SVG embebido en `url("data:…")` se resuelve como documento aislado y **no ve las custom properties** del documento que lo referencia, así que no alcanzaba con reemplazar el literal por un `var()`: la marca pasa a dibujarse con el SVG como **máscara** y el color puesto por CSS desde `component.checkbox.check-color`. En light el render no cambia.

Al conectarlo apareció el problema de fondo: **ninguno de los dos componentes consumía sus tokens `component.*`**. Estaban declarados y huérfanos mientras el CSS estilizaba con `semantic.*` directo, y por eso varios habían derivado hasta contradecir lo que se ve — `radio.bg-on` declaraba fondo blanco cuando el control marcado se pinta azul, y `radio.dot-color` declaraba el mismo color del fondo, es decir un punto invisible. Los tokens se corrigieron al render, que es el diseño aprobado, y ahora el CSS los consume.

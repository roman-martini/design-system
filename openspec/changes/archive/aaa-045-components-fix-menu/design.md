# Design — components-fix-menu

Se crea `design.md` por dos razones: la corrección del hover-timer tiene una decisión no obvia sobre **dónde** cancelar (con consecuencias sobre la superficie pública), y el segundo ítem instala una regla **transversal** al package.

## 1. Dónde se cancela la apertura pendiente

`DsMenuItem.onMouseEnter()` arma un `setTimeout` que abre el submenú tras el delay tokenizado. El efecto pendiente sobrevive a todo lo que ocurra en esos ~150 ms porque nadie lo cancela: `clearHoverTimer()` solo se invoca desde el `mouseenter` del propio item y desde su `DestroyRef`.

El hallazgo proponía extender el contrato `DsMenuItemRegistration` con un `cancelPendingOpen()` y llamarlo desde `DsMenu`. Es correcto en el diagnóstico y caro en la superficie: ese tipo **se exporta** desde el package, así que sumarle un miembro rompe a cualquiera que lo implemente, y obliga a `DsMenu` a invocar dos métodos en cada camino de cierre — dos llamadas que hay que acordarse de mantener juntas para siempre.

La observación que lo resuelve más barato: **`closeOwnSubmenu()` ya es el punto único** por el que el menú pide cerrar el submenú de un item, y ya está invocado en todos los caminos de cierre existentes:

| Camino                                     | Cómo llega a `closeOwnSubmenu()`                   |
| ------------------------------------------ | -------------------------------------------------- |
| Esc, ←, Tab, activación de item, `close()` | `close()` → `closeOpenSubmenus()`                  |
| Light-dismiss nativo                       | `onPopoverToggle()` → `closeOpenSubmenus()`        |
| Hover sobre un item hermano                | `closeSiblingSubmenus()` → `closeSubmenusExcept()` |
| Cierre del árbol desde un nivel anidado    | `closeTree()` → `close()` recursivo                |

Cancelar dentro de `closeOwnSubmenu()` cubre las cuatro filas **sin tocar el contrato ni agregar una llamada nueva**. La semántica se sostiene: "cerrá tu submenú" incluye "y desistí del que estabas por abrir" — un submenú con apertura agendada está tan abierto como uno visible, solo que todavía no se ve.

## 2. Por qué además hace falta `mouseleave`

`closeOwnSubmenu()` cubre los cierres, pero **no cubre al puntero que se va sin cerrar nada**: sacar el mouse del menú hacia la página no dispara ningún camino de cierre, y hoy eso deja el submenú abriéndose solo, medio segundo después de que el usuario se fue. `mouseleave` en el host del item es la otra mitad, y es la que corresponde al concepto de _hover intent_: la intención se cancela cuando el puntero deja de sostenerla.

Las dos mitades no se solapan: `mouseleave` cubre la salida del puntero, `closeOwnSubmenu()` cubre el teclado y el cierre programático (donde no hay `mouseleave` alguno). Cancelar es idempotente, así que que ambas se disparen en secuencia no tiene efecto secundario.

**Descartado**: guardar dentro del callback del timer (`if (!menu.isOpen()) return`). Evita el panel huérfano pero deja intacta la secuencia del foco robado —ahí el menú sigue abierto— y mantiene el timer corriendo: sería una guarda contra el síntoma en lugar de la cancelación del efecto.

## 3. Tests: relojes falsos y las dos secuencias

El componente lee el delay de una CSS custom property con fallback a 150 ms para jsdom, así que las secuencias son deterministas con `vi.useFakeTimers()`: entrar al item, avanzar **menos** que el delay, ejecutar la acción que debe cancelar, avanzar **más** que el delay y verificar que el submenú siguió cerrado y el foco no se movió. El test existente de hover (`aaa-025`) verifica el camino feliz — que tras el delay el submenú abre sin robar el foco —, así que los nuevos verifican la ausencia del efecto, que es lo que hoy falla.

## 4. La convención de índices como requirement transversal

El segundo ítem del change es de severidad baja y, tomado literalmente, es una línea en `menu/index.ts`. Se ejecuta con más alcance porque **la reincidencia ya ocurrió**: `slider/index.ts`, escrito el 2026-08-01 en aaa-044, nació con `export *` — un día antes de este change y con la convención vigente en los otros 22 componentes. Una convención que se cumple por imitación se rompe cada vez que alguien no tiene un vecino a mano para imitar.

Por eso el delta va a `components-package` y no a `component-menu`: por la regla de partición de ADR-018, un requirement que gobierna el package entero es transversal. `component-menu` solo recibe el comportamiento del hover.

**Qué queda público**: los cinco símbolos que `menu/index.ts` ya exportaba, incluido `DsMenuItemRegistration`. Se conserva a propósito y con el mismo criterio que `select/index.ts` aplica a `DsOptionRegistration`: es el contrato mínimo que un item alternativo cumpliría para participar del registro, navegación y typeahead del panel sin que el menú importe la clase concreta. Enumerarlo lo vuelve una decisión escrita en lugar de un efecto colateral de `export *`.

## 5. El panel cerrado que seguía ocupando (fix del PO)

El PO reportó barras de scroll al abrir el menú, que desaparecen a los milisegundos (`docs/backlog/fixs/menu/fix-menu.md`, con captura). **La primera hipótesis fue incorrecta** y conviene dejarla escrita, porque el error es instructivo: se atribuyó al `overflow: auto` que el UA aplica a todo `[popover]` y que el panel heredaba. Era plausible y falso — medido en Chromium sobre el playground, un menú sin submenús abre con `scrollHeight === clientHeight` en todos los frames: no hay desborde que justifique una barra.

Lo que destrabó el diagnóstico fue la secuencia exacta que dio el PO: la barra aparece **solo tras haber abierto un submenú por hover, cerrar el menú y volver a abrirlo**. Con esos pasos reproducidos en Playwright, el panel del submenú cerrado mide así:

```
{ id: "ds-menu-panel-3", abierto: false,
  display: "flex",                                   // no display:none
  inline: "position: fixed; left: 496px; top: 512px" }
```

Son dos hechos que se combinan:

1. **El panel cerrado generaba caja.** `.ds-menu__panel { display: flex }` es una declaración de **autor**, y el origen de autor gana sobre el del UA sin importar la especificidad: la regla `[popover]:not(:popover-open) { display: none }` quedaba pisada. El panel cerrado no se veía solo por su `opacity: 0`, pero seguía existiendo para el layout.
2. **El transform del padre lo capturaba.** Un elemento con `transform` distinto de `none` se vuelve containing block de sus descendientes `position: fixed`. Durante la animación de entrada el panel padre tiene transform, así que el panel del submenú —que conserva el `left`/`top` inline que le escribió el posicionador la primera vez— pasa a medirse **dentro** del padre y lo desborda. Terminada la animación, `transform: none` devuelve el submenú al viewport y la barra desaparece.

Eso explica cada detalle del reporte: por qué solo pasa después de abrir un submenú (antes no hay `left`/`top` inline), por qué solo dura unos milisegundos (es la ventana de la animación) y por qué se veían las dos barras (el `left` desborda en X y el `top` en Y).

**El fix**: `display: none` en el panel y `display: flex` en `:popover-open`, que es como debe declararse un popover con transición `display allow-discrete`. Verificado con la misma medición: en la segunda apertura el panel pasa a `scrollHeight === clientHeight` y el submenú cerrado a `display: none`.

**Esta convención también existía y tampoco se había propagado** (tercera vez en este change, después de los índices y el overflow): `toast-container.css` la declara con el comentario "display solo en abierto: no pisar el display:none del UA para popover cerrado". `menu` y `select` no la siguen. En select el defecto es latente —su listbox no contiene overlays anidados, así que nadie lo desborda—, y por eso se registra como ítem de `components-fix-select` en lugar de arreglarse acá.

**El `overflow` y el `max-height` se conservan**, ya no como el fix sino por su valor propio: sin `max-height` un menú más largo que el viewport se sale de pantalla sin poder scrollearse. Va con el mismo valor y criterio que `select.listbox.max-height` (320px, raw documentado), y `overflow-x: clip` porque un menú no scrollea en horizontal — el ancho lo definen los labels.

## 6. Sin ADR

No hay decisión one-way door. El fix vive dentro de ADR-014 y ADR-016; la regla de índices es la lectura explícita de la surface que ADR-004 ya define, no una decisión nueva que la contradiga.

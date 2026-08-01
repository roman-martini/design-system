---
id: aaa-046
name: components-fix-select
type: change
status: archived
archived: 2026-08-01
modifies-specs:
  - component-select
  - component-menu
  - components-package
  - design-tokens-package (sin delta de spec; agrega component.select.listbox.offset y component.menu.panel.offset)
related-adrs:
  - ADR-014
  - ADR-016
  - ADR-018
  - ADR-020
related-decisions:
  - D-022
  - D-031
---

# Proposal — components-fix-select

# Why

`DsSelect` incumple el contrato de Reactive Forms que el propio kit ya estandarizó: el único llamado a `onTouched()` vive en `closeList()`, y el trigger no tiene handler de `blur` [components-03]. Si el usuario enfoca el select y tabula sin abrirlo, el control jamás pasa a `touched` — el patrón estándar `invalid && touched` de las apps consumidoras nunca muestra el error de un select requerido no tocado. `DsFieldBase` sí marca touched en blur (ADR-020): el contrato de forms es inconsistente entre controles hermanos del kit. Es severidad **alta** y es el segundo change de la Parte G del plan de la review integral 2026-07-26, ordenado por severidad.

En el mismo componente hay tres deudas más, todas verificadas con el código delante:

- **Sin typeahead** [components-07]: el patrón APG _select-only combobox_ que el componente declara seguir (`role="combobox"` + `aria-activedescendant`) especifica navegación por caracteres imprimibles, y `DsMenu` ya la implementa completa (buffer + reset de 500 ms). La paridad interna quedó rota: el menú es navegable por tipeo y el select —donde más rinde, con listas largas— no.
- **Gap de posicionamiento mágico** [components-13]: `select.position()` usa `const gap = 4` y `menu.ts` define `ROOT_GAP_PX = 4`, mientras el submenú y el tooltip leen su offset de un token (`--ds-component-menu-submenu-offset`, `--ds-component-tooltip-offset`). El mismo concepto tiene dos mecanismos según el overlay.
- **El listbox cerrado genera caja** (detectado al cerrar `aaa-045`): `.ds-select__listbox` declara `display: flex` fuera de `:popover-open` y pisa el `display: none` del UA — el mismo defecto que desbordaba el menú, acá latente solo porque el listbox no contiene overlays anidados. Con el menú corregido, el select es **el último overlay del kit** que viola la convención que `toast-container.css` documenta y tooltip cumple.
- **El control se contrae al seleccionar un label corto** (fix del PO, reportado durante la ejecución de este change): el ancho del trigger es el intrínseco de su contenido, así que cambia con la selección — medido en Chromium, 133 px con el placeholder y **79 px tras elegir "Chile"**. Y como el posicionador le clava al listbox `style.width = rect.width`, el listado hereda la contracción: "Uruguay (sin stock)" pasaba de 36 a 60 px de alto **partido en dos líneas**. Un control que salta de ancho al usarlo es exactamente lo que separa un kit de un DS profesional.

**Prioridad respaldada**: la 1 (buenas prácticas: contrato de forms, patrón APG completo) para los dos primeros; la 3 (mantenibilidad vía convenciones escritas) para el offset tokenizado y el `display` — la lección de `aaa-045` es que una convención que solo existe por imitación se rompe donde el autor no tiene un vecino a mano.

# What Changes

- **`onTouched` en blur**: el trigger marca el control como touched cuando pierde el foco con el listado cerrado; el cierre del listado lo sigue marcando como hasta hoy. Test de regresión: focus + Tab sin abrir → `control.touched === true`.
- **Typeahead APG en `DsSelect`**: tipear caracteres imprimibles mueve la opción activa a la próxima habilitada cuyo label empiece con el buffer (case-insensitive, reset a los 500 ms, una letra repetida cicla entre opciones con la misma inicial); con el listado cerrado, el primer carácter lo abre y posiciona la opción activa en el match, sin cambiar el valor hasta confirmar. Implementación portada de `DsMenu` adaptada a `aria-activedescendant` — **la extracción del helper compartido queda para la Parte J** (components-05/07), que depende de que G termine.
- **Offset trigger↔overlay tokenizado** [components-13 completo]: tokens nuevos `component.select.listbox.offset` y `component.menu.panel.offset` (ambos `{dimension.4}`, valor visual sin cambio), leídos desde el posicionador con fallback jsdom — mismo mecanismo que `submenu.offset`. Incluye el menú raíz porque el hallazgo es uno solo y este change es su único ejecutor en la Parte G (mismo criterio que `slider/index.ts` en `aaa-045`).
- **El listbox cerrado deja de generar caja**: `display: none` en el bloque base + `display: flex` en `:popover-open`, replicando el fix de `aaa-045`.
- **El ancho del control deja de depender de la selección** (fix del PO): piso tokenizado en el trigger (`component.select.trigger.min-width`, 180px, mismo valor y criterio que `menu.panel.min-width`) y el posicionador pasa a usar el ancho del trigger como **`min-width` del listbox, no como ancho exacto**, con clamp horizontal y `max-width` al viewport. Verificado en Chromium: 180 px con placeholder y 180 px tras elegir "Chile"; la opción larga se muestra entera. Para un ancho totalmente estable frente a labels más anchos que el piso, el consumidor declara el suyo sobre `<ds-select>` — misma doctrina que Radix y Material (ver design §6).
- **La convención del `display` pasa a ser un requirement de `components-package`**: todo CSS de overlay sobre Popover API declara su `display` solo en el estado abierto (o `display: none` en el cerrado), con un test que barre los CSS del kit que usan `:popover-open` — el equivalente del test de named exports de `aaa-045`: convierte "los cuatro overlays lo cumplen" en algo verificable para el quinto.
- Changeset: **patch** de `components` (fixes de comportamiento y conformidad con el patrón APG que la spec ya declara; sin cambios de API pública) y de `tokens` (tres tokens aditivos; lockstep ADR-015). Los tres tokens **excedieron los dos techos de `size-limit` de `tokens`** (CSS por 18 B, JS por 34 B) tal como `aaa-045` anticipó al consumir el margen previo: se recalculan con la regla de D-031 en este mismo PR. El techo de `components` no se toca — nadie lo excedió, aunque el margen queda en 35 B.

# Capabilities

## Modified Capabilities

- `component-select`: el scenario de integración CVA suma el touched en blur; la navegación por teclado suma el typeahead; el posicionamiento declara su offset tokenizado; nuevo scenario de que el listbox cerrado no genera caja.
- `component-menu`: el posicionamiento del panel raíz declara su offset tokenizado (paridad con `submenu.offset`).
- `components-package`: nuevo requirement transversal — los overlays sobre Popover API no generan caja cerrados (el `display` de autor vive solo en `:popover-open`).

# Alternativas evaluadas

1. **Extraer ya el helper de typeahead compartido select/menú** (lo que sugiere el hallazgo como ideal) — descartada. La extracción está asignada a la Parte J (refactors internos compartidos), que depende explícitamente de que G no esté tocando ese código. Extraerlo acá acopla un fix de severidad alta a un refactor transversal. Se porta la implementación con duplicación consciente y temporal; components-11/components-05 ya catalogan la deuda.
2. **Typeahead solo con el listado abierto** — descartada. El patrón APG select-only especifica typeahead también con el combobox cerrado (abre y posiciona), y el hallazgo lo pide "con y sin listbox abierto". Implementar la mitad deja el mismo gap de paridad que motivó el ítem.
3. **Tokenizar solo el gap del select y dejar `ROOT_GAP_PX` del menú para otro change** — descartada. `components-13` es un hallazgo único y ningún otro change de la Parte G vuelve a pasar por el menú: quedaría huérfano. `aaa-045` sentó el criterio inverso con `slider/index.ts` — cuando el hallazgo es una convención, se corrige la convención completa.
4. **Escribir el scenario del `display` solo en `component-select`, sin requirement transversal** — descartada. Con el select corregido, los cuatro overlays del kit cumplen la convención; dejarla implícita es exactamente el estado que hizo reincidir a `slider/index.ts` y al propio select. Un test que barre los CSS con `:popover-open` la hace verificable para el próximo overlay (popover genérico, datepicker).

# Impact

- **Código**: `packages/components/src/lib/select/{select.ts, select.html, select.css, select.spec.ts}`, `packages/components/src/lib/menu/menu.ts` (ROOT_GAP → token), `packages/tokens/src/component/{select.json, menu.json}`, test transversal del `display` (junto al de named exports), un changeset. Posible ajuste de techos en la config de `size-limit` de `tokens` (D-031).
- **Consumidores**: ninguno rompe. Sin cambios de API pública ni de superficie de exports; el valor visual del offset no cambia (4px).
- **Bundle**: el typeahead y el handler de blur suman ~0.5 kB estimado sobre ~2.1 kB de margen del techo de `components`; los tokens nuevos pueden exigir subir los techos de `tokens` en este PR (previsto por D-031).
- **ADR**: no genera. Todo cae dentro de ADR-014/ADR-016 (overlays), ADR-018 (partición de specs del package) y ADR-020 (contrato de forms); ninguno se contradice.
- **Gate visual del PO (D-022)**: aplica — el archive queda bloqueado hasta el OK visual sobre el select en el playground (typeahead, apertura/cierre, separación trigger↔listbox sin cambio perceptible).

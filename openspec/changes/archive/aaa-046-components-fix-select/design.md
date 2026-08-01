# Design — components-fix-select

## Context

Motivación en `proposal.md` § Why. Estado actual relevante:

- `DsSelect` llama `onTouched()` solo desde `closeList()` (`select.ts`). El cierre por light-dismiss va por `onPopoverToggle()` —la sincronización del evento `toggle` nativo—, que hoy **no** marca touched: solo `open.set(false)` + detach de listeners. El trigger no bindea `blur`.
- `DsMenu` ya tiene el typeahead completo (`menu.ts`): buffer acumulativo, reset a 500 ms (`TYPEAHEAD_RESET_MS`, constante interna documentada como no-token), búsqueda con wrap desde el item enfocado, offset 1 con buffer de una letra (ciclar iniciales) y 0 con buffer más largo (refinar).
- El posicionador del select (`select.position()`) hardcodea `const gap = 4`; el del menú raíz usa `ROOT_GAP_PX = 4`. El submenú (`--ds-component-menu-submenu-offset`) y el tooltip (`--ds-component-tooltip-offset`) ya leen su offset por CSS var con `readCssNumber` + fallback jsdom.
- `select.css` declara `display: flex` en el bloque base de `.ds-select__listbox`; menú (post `aaa-045`), toast-container y tooltip ya cumplen la convención de declarar el `display` solo en `:popover-open`.
- El test transversal de superficie de exports de `aaa-045` vive en `packages/components/src/testing/public-surface.spec.ts` — el patrón a imitar para el test del `display`.

## Goals / Non-Goals

**Goals:**

- Contrato de forms consistente: touched en **todo** camino en que el usuario "pasó por" el select — blur sin abrir, y cierre por cualquier vía (selección, Esc, light-dismiss).
- Typeahead conforme APG select-only, con paridad de comportamiento con el del menú (mismos tiempos, misma semántica de buffer).
- Offset trigger↔overlay tokenizado en los dos posicionadores que faltan, con el mecanismo ya probado (CSS var + fallback).
- Convención del `display` de popovers escrita y verificada transversalmente.

**Non-Goals:**

- **No** se extrae el helper compartido de typeahead ni `readCssNumber` (components-05/07/11): la Parte J depende de que G no esté tocando ese código. Acá se duplica de forma consciente y catalogada.
- **No** se toca el algoritmo de posicionamiento (flip, ancho, clamps) ni la API pública de `DsSelect`.
- **No** se migran los overlays a CSS anchor positioning (ADR-014 fija el disparador: Safari 18 fuera de ventana).

## Decisions

### 1. Touched: blur guardado por estado + cierre por toggle

`(blur)` en el trigger llama `onTouched()` **solo si el listado está cerrado**. Con el listado abierto el foco DOM permanece en el trigger (`aria-activedescendant`), así que un blur con listado abierto solo ocurre en medio de una secuencia de cierre (light-dismiss, Tab-out) cuyo dueño es el propio cierre. Para que ese dueño exista en todos los caminos, `onPopoverToggle()` pasa a llamar `onTouched()` cuando sincroniza un cierre — hoy el light-dismiss no marca touched (gap del hallazgo components-03 que aparece con el código delante: `closeList()` no corre en ese camino). `onTouched` es idempotente en Angular Forms: la doble marca blur+cierre es inocua.

**Alternativa descartada**: marcar touched en todo blur sin guarda — funciona por idempotencia, pero deja el orden de eventos `toggle`/`blur` (que difiere entre navegadores y jsdom) como única garantía de que el light-dismiss marque; la guarda + el toggle hacen cada camino explícito y testeable por separado.

### 2. Typeahead portado de DsMenu, adaptado a aria-activedescendant

Misma mecánica que `menu.ts` (buffer, reset 500 ms, offset 1/0 según largo del buffer, wrap, case-insensitive) con dos adaptaciones:

- **Mueve `activeIndex`, no foco DOM**: el select navega por `aria-activedescendant`; el match actualiza la opción activa, nunca el valor (`commitSelection` sigue siendo la única vía de commit).
- **Saltea opciones disabled**: a diferencia del menú (donde los items disabled son focusables por descubribilidad, ADR-011 rama de acción), en el select una opción disabled no puede ser activa ni seleccionable — el typeahead respeta la misma regla que `moveActive`.
- **Same-letter cycling** (mejora sobre el portado): repetir la inicial dentro de la ventana de reset busca con la letra sola en vez de acumular `"aa"` sin match — es lo que el APG especifica para el select-only combobox. El menú hoy solo cicla tras el reset de 500 ms; la unificación queda para el helper de la Parte J.

Con el listado **cerrado**, un carácter imprimible abre el listado y posiciona la opción activa en la primera coincidencia (APG select-only: "opens the listbox and moves visual focus to the first match"), sin cambiar el valor. Implementación: `openList()` seguido de la búsqueda con el buffer ya cargado.

**`Space` no participa del typeahead**: cerrado abre el listado y abierto confirma la selección (comportamiento actual, conforme APG). Un label con espacios sigue siendo alcanzable por el prefijo anterior al espacio ("new" matchea "New York"). El APG contempla capturar Space con buffer activo; se descarta por complejidad desproporcionada al caso de uso — decisión reversible si aparece demanda real.

### 3. Tokens de offset: dos tokens component, mismo mecanismo que submenu.offset

`component.select.listbox.offset` y `component.menu.panel.offset`, ambos `{dimension.4}` (valor visual sin cambio). Se leen en el posicionador con `getComputedStyle(...).getPropertyValue(...)` + `parseFloat` + fallback `4` para jsdom — copia del `readCssNumber` de `menu.ts` en `select.ts` (cuarta instancia del patrón, catalogada en components-11; la extracción es de la Parte J). En `menu.ts`, `ROOT_GAP_PX` se reemplaza por la lectura del token nuevo reutilizando su `readCssNumber` existente.

**Alternativa descartada**: un único token semantic `overlay.offset` compartido — rompería la posibilidad de ajustar la separación por overlay (el tooltip ya usa 8px vía su propio token) y no hay señal de que los cuatro deban moverse juntos.

### 4. Display del listbox: replicar el fix de aaa-045 literal

`display: none` en el bloque base de `.ds-select__listbox` (con el comentario-convención, como `menu.css`) y `display: flex` dentro de `:popover-open`. `flex-direction`, `gap` y el resto quedan en el bloque base: sin `display`, no generan caja. Las transiciones `allow-discrete` ya declaradas siguen funcionando (mismo esquema que menú).

### 5. Test transversal del display en testing/

Nuevo spec junto a `public-surface.spec.ts` (p. ej. `packages/components/src/testing/popover-display.spec.ts`): barre los `.css` bajo `src/lib/` cuyo fuente contiene `:popover-open`, y para cada uno verifica que toda declaración `display:` fuera de un bloque `:popover-open` sea `display: none` (comentarios excluidos antes de asertar, como el test de `aaa-045` en `menu.spec.ts`). Verificación source-based: jsdom no computa CSS de archivo — mismo criterio declarado en los tests de tokens y del menú. El quinto overlay que nazca con `display: flex` a secas falla la suite con la lista de archivos ofensores.

### 6. Ancho estable: piso tokenizado en el trigger + el listbox usa ese ancho como mínimo

El PO reportó durante la ejecución que el componente se contrae al elegir un label corto. **Medido en Chromium** antes de tocar nada (la lección de `aaa-045` es no confiar en la hipótesis de código): trigger 133 px con el placeholder → **79 px** con "Chile"; el listbox hereda ese ancho porque `position()` le clava `style.width = rect.width`, y "Uruguay (sin stock)" pasa de 36 a 60 px de alto **partido en dos líneas**. Son dos defectos encadenados, no uno.

- **El listbox** pasa a recibir el ancho del trigger como **`min-width`**, no como `width`, más `max-width: calc(100vw - 2 * offset)` y clamp horizontal en el posicionador. Una opción más larga que el trigger se muestra entera. Es lo que hace Radix con `--radix-select-trigger-width`. Costo: cero bytes de lógica nueva salvo el clamp.
- **El trigger** recibe un piso `component.select.trigger.min-width` (180px, mismo valor y comentario que `menu.panel.min-width`). Con el caso reportado —placeholder 133 px, label 79 px, ambos bajo el piso— el salto **desaparece por completo**.

**Alternativas evaluadas para el ancho del trigger:**

1. **Dimensionar por la opción más larga**, como hace el `<select>` nativo — es la solución conceptualmente correcta y la única que elimina el salto también con labels más largos que el piso. Se descarta **ahora**: exige renderizar todos los labels ocultos en un grid-stack (DOM extra por opción) o medirlos en JS con su reflow, y el bundle de `components` quedó con 35 B de margen bajo el techo. Queda como candidata explícita si el PO ve el salto con labels largos; no hay nada en este fix que la impida después.
2. **Solo `min-width` del listbox, sin tocar el trigger** — resuelve las opciones partidas pero deja el síntoma que el PO reportó (el control encogiéndose). Media solución.
3. **`:host { display: block }`** para que ocupe el contenedor — elimina el salto pero cambia el layout de todo consumidor que hoy lo usa en línea, sin que nadie lo haya pedido. Es una decisión de layout que corresponde al consumidor, no al kit.
4. **Solo documentar que el consumidor declare el ancho** (`ds-select { width: … }`) — es la doctrina de Radix y Material y sigue valiendo como recomendación, pero un default que colapsa el control no es un default aceptable en un DS profesional.

### 7. Techos de size-limit de tokens: subir en este PR si hace falta

Los techos de `tokens` quedaron con ~60 B y ~50 B de margen tras `aaa-045`. **Medido: los tres tokens los excedieron** (CSS 6168 B sobre 6150; JS 5844 B sobre 5810). D-031 prevé exactamente esto: el PR que agrega el token sube el techo aplicando `medido × 1.05` redondeado al múltiplo de 10 B → 6.48 kB y 6.14 kB. El techo de `components` (48.41 kB) **no se mueve**: mide 48.38 kB, no lo excede, y subirlo sin exceder es lo que el trinquete existe para evitar.

## Risks / Trade-offs

- **[jsdom no resuelve los tokens de offset]** → fallback `4` constante (mismo valor actual: cero cambio de comportamiento en tests) y verificación visual real en el playground como parte del gate D-022 — con rebuild de la lib y restart del dev server antes de mirar (lección de `aaa-045`: el playground consume `dist/`).
- **[El typeahead duplicado en select y menú puede derivar]** → duplicación acotada a un change y catalogada dos veces (components-07 en Parte J, components-11); los tests de ambos componentes fijan la semántica compartida (500 ms, ciclo de iniciales, refinamiento).
- **[Orden de eventos blur/toggle difiere entre navegadores]** → cada camino tiene su dueño explícito (decisión 1) y touched es idempotente: cualquier orden termina en el mismo estado.
- **[El test transversal del display parsea CSS con heurística de slices, no un parser real]** → mismo trade-off ya aceptado en `menu.spec.ts` y los tests de tokens; si un CSS legítimo necesitara otro `display` en estado base (no hay caso hoy), el test se ajusta con la justificación a la vista.

## Open Questions

Ninguna — el valor del offset no cambia (4px), los nombres de tokens siguen la convención existente (`submenu.offset`, `tooltip.offset`) y el alcance del typeahead está fijado por APG + paridad con el menú.

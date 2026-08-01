---
id: aaa-045
name: components-fix-menu
type: change
status: proposed
modifies-specs:
  - component-menu
  - components-package
  - design-tokens-package (sin delta de spec; agrega component.menu.panel.max-height)
related-adrs:
  - ADR-004
  - ADR-014
  - ADR-016
  - ADR-018
related-decisions:
  - D-022
---

# Proposal — components-fix-menu

# Why

`DsMenuItem` arma un `setTimeout` de hover-intent para abrir su submenú y **no lo cancela en ningún camino de salida**: el host solo bindea `click`, `keydown` y `mouseenter`, y el `clearHoverTimer()` que existe solo se invoca desde el `mouseenter` del propio item y desde su destrucción. Hay dos secuencias reales, ambas verificadas leyendo el código [components-02]:

- **Foco robado**: hover sobre un item con submenú → mover el puntero a otro item antes del delay → el timer del primero dispara igual, abre su submenú y ejecuta `hostElement().focus()` sobre sí mismo, arrancándole el foco al item donde está el puntero.
- **Panel huérfano**: hover sobre un item con submenú → Esc cierra el menú → el timer dispara sobre un menú ya cerrado y deja un popover de submenú visible en el top layer, sin árbol que lo contenga.

Es severidad **alta**: rompe el foco (a11y) y contradice el patrón APG que el propio componente implementa (CA-012.6). Es el primer change de la Parte G del plan de la review integral 2026-07-26, ordenado por severidad.

En el mismo componente, `menu/index.ts` es el único índice del kit que hace `export *` de sus cuatro archivos [components-14]. El resto cura su superficie con named exports deliberados, pero **esa convención no está escrita en ninguna spec** — y por eso se reincidió: `slider/index.ts`, agregado el 2026-08-01 (aaa-044), nació con `export *`. Con la lib ya publicada (0.2.0), cualquier símbolo futuro exportado desde un archivo de componente entra al contrato semver sin decisión: quitarlo después es breaking.

**Prioridad respaldada**: la 1 (buenas prácticas) para el bug de foco; la 3 (mantenibilidad vía convenciones) para la superficie pública — escribir la regla es lo que evita la tercera reincidencia.

# What Changes

- **Cancelación de la apertura pendiente en todo camino de salida**: el item cancela su timer cuando el puntero lo abandona, y `closeOwnSubmenu()` —el único punto por el que el menú pide cerrar el submenú de un item, ya invocado desde `close()`, `closeOpenSubmenus()`, `closeSubmenusExcept()` y la sincronización del light-dismiss— pasa a cancelar también la apertura pendiente. **Sin cambios en la superficie pública**: no se agrega ningún miembro a `DsMenuItemRegistration`, que es un tipo exportado (ver design §1).
- **Tests de regresión** para las dos secuencias del hallazgo (foco robado entre hermanos, panel huérfano tras Esc) más el light-dismiss, con timers falsos.
- **Named exports curados en `menu/index.ts`**, conservando exactamente los cinco símbolos que hoy salen (`DsMenu`, `DsMenuItemRegistration`, `DsMenuItem`, `DsMenuSeparator`, `DsMenuTrigger`) — cero breaking. `DsMenuItemRegistration` queda público con el mismo criterio explícito con el que `select/index.ts` exporta `DsOptionRegistration`: es el contrato que un item alternativo cumpliría.
- **Misma corrección en `slider/index.ts`** (`DsSlider`, `DsSliderSize`, `DsSliderTick`), el otro índice con `export *`.
- **El panel cerrado deja de generar caja** (fix del PO, `docs/backlog/fixs/menu/fix-menu.md`): `display: none` + `display: flex` en `:popover-open`. Declarar `display: flex` a secas pisaba la regla del UA que oculta un `[popover]` cerrado, así que el panel del submenú seguía existiendo para el layout con el `position: fixed` que le dejó el posicionador; mientras el panel padre anima su transform —que lo vuelve containing block de sus descendientes fixed— el submenú cerrado lo desbordaba y le disparaba las barras de scroll. Diagnóstico medido en Chromium reproduciendo la secuencia del PO (design §5).
- **El panel acota su alto**: `max-height` tokenizado nuevo (`component.menu.panel.max-height`, 320px, igual que el listbox de select) con `overflow-y: auto` y `overflow-x: clip`. No es el fix del bug —eso lo resuelve el `display`— sino la corrección de un defecto latente: hoy un menú más largo que el viewport se sale de pantalla sin poder scrollearse.
- **La convención pasa a ser un requirement de `components-package`**: cada `index.ts` de componente enumera sus exports. Es transversal por la regla de partición de ADR-018 (gobierna el package, no un componente), y es lo que convierte "todos los índices auditados lo hacen" en algo verificable.
- Changeset: **patch** de `components` (y de `tokens` por el lockstep de ADR-015) — corrige comportamiento y no altera la superficie pública.

# Capabilities

## Modified Capabilities

- `component-menu`: el scenario de submenú anidado suma el comportamiento observable de la apertura por hover pendiente — se cancela cuando el puntero abandona el item y cuando el menú se cierra por cualquier vía, sin abrir el panel ni mover el foco.
- `components-package`: el requirement de surface de exports suma un scenario que exige named exports enumerados en cada `index.ts` de componente.

# Alternativas evaluadas

1. **Extender `DsMenuItemRegistration` con `cancelPendingOpen()`** (lo que recomendaba el hallazgo) — descartada. Es la lectura correcta del problema, pero `DsMenuItemRegistration` se exporta desde el package: agregarle un miembro es breaking para cualquier implementador externo del contrato, y obliga a `DsMenu` a llamar dos métodos donde hoy llama uno. `closeOwnSubmenu()` ya está invocado en **todos** los caminos de cierre y su semántica ("cerrá tu submenú") contiene naturalmente "y cancelá el que estabas por abrir". Se consigue la misma cobertura sin tocar el contrato.
2. **Guardar en el callback del timer** (verificar `menu.isOpen()` antes de abrir) — descartada como solución principal. Tapa la secuencia del panel huérfano pero no la del foco robado, porque ahí el menú sigue abierto y el item hermano es un estado que el callback no conoce. Deja además el timer corriendo: sería una guarda contra el síntoma, no la cancelación del efecto pendiente.
3. **Cancelar solo en `mouseleave`, sin tocar `closeOwnSubmenu()`** — descartada. Cubre el puntero pero no el teclado: Esc, Tab y la activación de un item cierran el menú sin que se dispare ningún `mouseleave`, y el timer sobrevive. Ambas mitades son necesarias y cubren cosas distintas (ver design §2).
4. **Dejar `export *` y documentar la convención en `CONTRIBUTING.md`** — descartada. Es exactamente lo que ya pasaba: la convención existía de hecho en el resto del kit y se violó dos veces igual. Un requirement con scenario es verificable; una línea de prosa en una guía no lo es.

# Impact

- **Código**: `packages/components/src/lib/menu/{menu-item.ts, index.ts, menu.spec.ts}`, `packages/components/src/lib/slider/index.ts`, un changeset.
- **Consumidores**: ninguno rompe. Se conservan los cinco símbolos que `menu/index.ts` ya exportaba y los tres de `slider/index.ts`; el barrel raíz `public-api.ts` no cambia.
- **Bundle**: cambio neutro a la baja — el fix suma un handler y una llamada; los named exports no agregan código. El techo de `size-limit` (48.41 kB, D-031) no se toca.
- **ADR**: no genera. Es un fix de comportamiento dentro de ADR-014/ADR-016 y una convención que ADR-004 ya implica; ningún ADR se contradice ni se supersede.
- **Gate visual del PO (D-022)**: aplica — el archive queda bloqueado hasta el OK explícito sobre el árbol de submenús en el playground.

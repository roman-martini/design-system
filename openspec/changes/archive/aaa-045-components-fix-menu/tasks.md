# Tasks — aaa-045 — Fix del menú (hover-timer + superficie de exports)

Cada tarea es ≤2 h con criterio binario. Diseño: dónde se cancela (design §1), las dos mitades (§2), estrategia de test (§3), la convención de índices como requirement transversal (§4).

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: 924 tests (tokens 504, components 387, playground 33).
- [x] 1.2 Cuatro tests escritos primero y **rojos por la causa correcta** (`expected 'true' to be 'false'` en el `aria-expanded` del item con submenú): puntero que abandona el item, hover en un hermano, Esc y light-dismiss, todos con una apertura en curso. **Dato verificado en el camino**: el token `component.menu.submenu.delay` sí existe (150 ms) — el fallback del componente coincide con él, así que en jsdom la ventana es de 150 ms y avanzar 100 ms cae dentro sin fragilidad.

**Criterio**: base verde y dos tests rojos que describen el bug (rojo por la causa correcta, no por el arreglo del test).

## 2. Fix del hover-timer (components-02)

- [x] 2.1 `(mouseleave)` en el host de `DsMenuItem` cancelando el timer pendiente (design §2).
- [x] 2.2 `closeOwnSubmenu()` cancela la apertura pendiente antes de cerrar (design §1) — cubre Esc, ←, Tab, activación de item, light-dismiss y hover sobre un hermano sin agregar miembros a `DsMenuItemRegistration`, que es un tipo público.
- [x] 2.3 Los cuatro tests pasan y el test de hover feliz de aaa-025 sigue verde (el submenú abre tras el delay sin robar el foco): 24 tests en `menu.spec.ts`.

**Criterio**: las dos secuencias del hallazgo quedan cubiertas por tests que fallan sin el fix; el camino feliz intacto.

## 3. Superficie de exports (components-14)

- [x] 3.1 `menu/index.ts` a named exports con los cinco símbolos que ya salían: `DsMenu`, `DsMenuItemRegistration` (como `type` inline, estilo de `select/index.ts`), `DsMenuItem`, `DsMenuSeparator`, `DsMenuTrigger`.
- [x] 3.2 `slider/index.ts` a named exports (`DsSlider`, `DsSliderSize`, `DsSliderTick`) — el otro índice con `export *` (design §4).
- [x] 3.3 `src/testing/public-surface.spec.ts`: enumera el filesystem (mismo patrón que `axe-coverage.spec.ts`) y falla si algún `src/lib/*/index.ts` usa `export *`.
- [x] 3.4 Verificado sobre el artefacto emitido: los 8 símbolos siguen en `dist/types/romanmartinidev-components.d.ts`. Cero pérdida de superficie.

**Criterio**: cero `export *` en índices de componente; la superficie pública emitida no pierde ni gana símbolos.

## 3-bis. Fix del PO: barras de scroll al abrir (`docs/backlog/fixs/menu/fix-menu.md`)

Reportado por el PO durante la ejecución de este change, con captura. Entra acá y no como pendiente suelto: es del menú y el change está abierto.

- [x] 3b.1 **Primera hipótesis descartada por medición**: se atribuyó al `overflow: auto` que el UA da a `[popover]`. Medido en Chromium sobre el playground, un menú sin submenús abre con `scrollHeight === clientHeight` en todos los frames — no había desborde. Queda registrada en design §5 porque el error es instructivo.
- [x] 3b.2 **Causa real**, hallada reproduciendo en Playwright la secuencia exacta del PO (abrir → hover hasta que abre el submenú → cerrar → reabrir): el panel del submenú cerrado medía `display: flex` con `position: fixed; left: 496px; top: 512px` inline. `display: flex` de autor pisa la regla del UA que oculta un popover cerrado, y el transform del panel padre durante la animación lo vuelve containing block de ese hijo fixed, que entonces lo desborda (design §5).
- [x] 3b.3 Fix: `display: none` en el panel, `display: flex` en `:popover-open`. **Verificado con la misma medición**: en la segunda apertura el panel queda en `scrollHeight === clientHeight` y el submenú cerrado en `display: none`. Test sobre el fuente (jsdom no computa estilos).
- [x] 3b.4 Se conserva el `max-height` tokenizado (`component.menu.panel.max-height`, 320px) con `overflow-y: auto` + `overflow-x: clip`, ya no como el fix sino por su valor propio: un menú más largo que el viewport hoy se sale de pantalla sin poder scrollearse. Scenario nuevo en el delta de `component-menu`.
- [x] 3b.5 **Pendiente derivado registrado**: `select.css` tiene el mismo `display: flex` sin `:popover-open` (defecto latente — su listbox no contiene overlays anidados, así que nadie lo desborda). Va como ítem de `components-fix-select` en la tabla de la Parte G, no acá.
- [x] 3b.6 Verificación visual del PO sobre la secuencia que reportó: **OK el 2026-08-01**.

**Criterio**: el panel cerrado no genera caja; el alto máximo sale de un token; el PO confirma que las barras no aparecen en su secuencia.

## 4. Validación de cierre

- [x] 4.1 `pnpm openspec validate components-fix-menu --strict`, `pnpm lint` y `pnpm format:check` pasan.
- [x] 4.2 `pnpm -r build` y `pnpm -r test` pasan: **931 tests** (tokens 504, components 394, playground 33) — +7 (4 de regresión del hover, 2 del spec de superficie, 1 del reset de overflow).
- [x] 4.3 `pnpm typecheck` y `pnpm storybook:build` verdes. `pnpm size` verde en los 5 targets, ninguno movido: components **46.4 kB** / 48.41; tokens css **6.09 kB** / 6.15; tokens js **5.76 kB** / 5.81.
  - **Dato para la próxima entrega de tokens**: el token del panel dejó los dos techos de `tokens` con ~60 B y ~50 B de margen. Bajo el trinquete de D-031, el próximo token que entre va a tener que subirlos en su propio PR — el mismo aviso que F3 dejó para los componentes.
- [x] 4.4 `pnpm verify:packaging` (el gate del repo sobre el artefacto emitido, aaa-038): 2 packages sin observaciones.
- [x] 4.5 Changeset `fix-menu-hover.md`: **patch** de components + patch de tokens (lockstep ADR-015).
- [x] 4.6 Mensaje de commit propuesto; **OK del PO el 2026-08-01**. Dos commits: `5e67bad` (hover-timer + superficie de exports) y `f7bd42c` (panel cerrado que generaba caja).

**Criterio**: automáticos verdes; changeset correcto; commit propuesto y aprobado.

## 5. Gate visual del PO (D-022 — bloqueante)

- [x] 5.1 El PO verificó en el showcase `/menu` el hover entre hermanos, el Esc con una apertura en curso, su secuencia de las barras de scroll y el árbol de submenús sin regresión: **OK explícito el 2026-08-01**.
  - **Dato operativo**: el playground consume el `dist/` de la lib, no el fuente, así que el dev server sirve el bundle anterior hasta que se reinicia. Costó una vuelta de verificación en falso; conviene rebuildear y reiniciar antes de pedir el gate visual de un change que toca CSS o tokens.

**Criterio**: OK visual explícito del PO registrado. El archive no arranca sin él.

## 6. Archive

- [x] 6.1 Movido a `archive/aaa-045-components-fix-menu/` (`status: archived`, 2026-08-01); specs base `component-menu` (3 scenarios nuevos) y `components-package` (párrafo del requirement + 1 scenario) sincronizadas scenario por scenario.
- [x] 6.2 Verificado por grep: cero links markdown relativos en los artefactos archivados.
- [x] 6.3 Registros: `openspec/README.md` (aaa-045 fuera de IDs en vuelo), catálogo de changes, nota de cierre en HU-012, EP-002 (fila de valor del menú + tabla de HUs), README de producto (foto táctica, última entrega, avance del plan) y grooming del BACKLOG — la Parte G pasa a **En curso 1/7** con tabla de detalle propia y las dos lecciones operativas registradas.
- [x] 6.4 `pnpm openspec validate --all` pasa (28 items); suite completa **931 tests** verdes (tokens 504, components 395, playground 33); lint y format verdes.
- [ ] 6.5 Proponer el mensaje de commit del archive y esperar el OK del PO.

**Criterio**: change archivado, specs base sincronizadas, registros al día y Parte G con su primer change cerrado.

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

## 4. Validación de cierre

- [x] 4.1 `pnpm openspec validate components-fix-menu --strict`, `pnpm lint` y `pnpm format:check` pasan.
- [x] 4.2 `pnpm -r build` y `pnpm -r test` pasan: **930 tests** (tokens 504, components 393, playground 33) — +6 (4 de regresión del hover, 2 del spec de superficie).
- [x] 4.3 `pnpm typecheck` y `pnpm storybook:build` verdes. `pnpm size`: **46.37 kB** gzip contra el techo de 48.41 kB (+270 B por el handler y la cancelación) — el techo no se mueve.
- [x] 4.4 `pnpm verify:packaging` (el gate del repo sobre el artefacto emitido, aaa-038): 2 packages sin observaciones.
- [x] 4.5 Changeset `fix-menu-hover.md`: **patch** de components + patch de tokens (lockstep ADR-015).
- [ ] 4.6 Proponer el mensaje de commit de implementación y **esperar el OK del PO**.

**Criterio**: automáticos verdes; changeset correcto; commit propuesto y aprobado.

## 5. Gate visual del PO (D-022 — bloqueante)

- [ ] 5.1 El PO verifica en el showcase `/menu`: hover entre items hermanos con submenú (el foco no salta hacia atrás), Esc con una apertura en curso (no queda panel huérfano), salir del menú con el puntero durante el delay, y el camino feliz del árbol de submenús sin regresión.

**Criterio**: OK visual explícito del PO registrado. El archive no arranca sin él.

## 6. Archive

- [ ] 6.1 Mover a `archive/aaa-045-components-fix-menu/` con `status: archived` + fecha; sincronizar las specs base `component-menu` y `components-package` con los deltas, scenario por scenario.
- [ ] 6.2 Verificar que los artefactos archivados no tengan links markdown relativos (referencias por ID).
- [ ] 6.3 Registros del checklist de archive de `docs/product/README.md`: `openspec/README.md` (próximo ID e IDs en vuelo), catálogo de `docs/architecture/catalog.md`, nota de cierre en HU-012, EP-002, README de producto (foto táctica y última entrega) y grooming del BACKLOG (avance de la Parte G en la tabla de estado por parte).
- [ ] 6.4 `pnpm openspec validate --all` pasa; suite completa, lint y format verdes.
- [ ] 6.5 Proponer el mensaje de commit del archive y esperar el OK del PO.

**Criterio**: change archivado, specs base sincronizadas, registros al día y Parte G con su primer change cerrado.

# Tasks — components-fix-select

## 1. Tokens de offset

- [x] 1.1 Agregar `component.select.listbox.offset` (`{dimension.4}`) en `packages/tokens/src/component/select.json` y `component.menu.panel.offset` (`{dimension.4}`) en `packages/tokens/src/component/menu.json`; build de tokens verde y vars `--ds-component-select-listbox-offset` / `--ds-component-menu-panel-offset` presentes en el CSS emitido
- [x] 1.2 Medir los bundles de `tokens` con `size-limit` post-build; si algún techo se excede, subirlo con margen mínimo sobre lo medido en la config de `size-limit` (trinquete D-031) — mismo commit que los tokens (medido: css 6.1/6.15 kB, js 5.77/5.81 kB — los techos alcanzan, no se suben)

## 2. Touched en blur y light-dismiss (components-03)

- [x] 2.1 `select.html`: bindear `(blur)` en el trigger; `select.ts`: handler que llama `onTouched()` solo con el listado cerrado (design §1)
- [x] 2.2 `select.ts`: `onPopoverToggle()` marca `onTouched()` al sincronizar un cierre (paridad con `closeList()`)
- [x] 2.3 Tests: focus + blur sin abrir → `control.touched === true`; light-dismiss → touched; abrir sin blur → not touched hasta cerrar

## 3. Typeahead APG (components-07)

- [x] 3.1 `select.ts`: portar el typeahead de `menu.ts` adaptado a `activeIndex` (design §2): buffer + reset 500 ms, case-insensitive, offset 1/0 según largo del buffer, wrap, saltea disabled, nunca cambia el valor
- [x] 3.2 `select.ts`: con listado cerrado, un carácter imprimible abre y posiciona la opción activa en la primera coincidencia; limpieza del timer en `DestroyRef` y reset del buffer al cerrar
- [x] 3.3 Tests con fake timers: salto al match con listado abierto, ciclo de iniciales repetidas, refinamiento multi-carácter, skip de disabled, apertura por tipeo con posicionamiento, reset a los 500 ms, valor intacto hasta confirmar

## 4. Offset tokenizado en los posicionadores (components-13)

- [x] 4.1 `select.ts`: reemplazar `const gap = 4` por lectura de `--ds-component-select-listbox-offset` con `readCssNumber` propio + fallback `4` (copia consciente, design §3)
- [x] 4.2 `menu.ts`: reemplazar `ROOT_GAP_PX` por lectura de `--ds-component-menu-panel-offset` con el `readCssNumber` existente + fallback `4`
- [x] 4.3 Tests: el posicionamiento con fallback conserva la separación actual (sin regresión en los specs de posicionamiento existentes de select y menú)

## 5. Display del listbox cerrado + convención transversal

- [x] 5.1 `select.css`: `display: none` en el bloque base de `.ds-select__listbox` (con el comentario-convención de `menu.css`) y `display: flex` dentro de `:popover-open`
- [x] 5.2 `select.spec.ts`: test source-based de que el `display` de autor vive solo en `:popover-open` (patrón del test equivalente en `menu.spec.ts`)
- [x] 5.3 Nuevo `packages/components/src/testing/popover-display.spec.ts`: barre los `.css` de `src/lib/` con `:popover-open` y falla nombrando los archivos cuyo bloque base declare un `display` distinto de `none` (design §5) — verificado que falla al reintroducir el defecto en `select.css`

## 5b. Ancho estable del control (fix del PO, agregado el 2026-08-01)

- [x] 5b.1 Diagnóstico medido en Chromium antes de tocar código: trigger 133 px → 79 px al seleccionar "Chile"; el listbox hereda el ancho por `style.width` y parte la opción larga en dos líneas
- [x] 5b.2 Token `component.select.trigger.min-width` (180px, criterio de `menu.panel.min-width`) + `min-width` en el trigger
- [x] 5b.3 `position()`: el ancho del trigger pasa a ser `min-width` del listbox, con clamp horizontal; `max-width` al viewport en el CSS
- [x] 5b.4 Tests: el posicionador setea `minWidth` y no `width`; el CSS declara el piso tokenizado
- [x] 5b.5 Re-medición en Chromium: 180 px con placeholder y 180 px tras seleccionar; la opción larga entra en una línea

## 6. Verificación integral y changeset

- [x] 6.1 Crear changeset patch de `components` + `tokens` (lockstep ADR-015) describiendo los cinco fixes
- [x] 6.2 Validación completa: `pnpm openspec validate --all`, `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm test` (945 tests verdes: tokens 504, components 410, playground 33), `pnpm storybook:build`, `pnpm verify:packaging`, `pnpm size` (techos de `tokens` recalculados por D-031)
- [x] 6.3 Verificación medida en Chromium con el dist rebuildeado y el dev server reiniciado: listbox cerrado con caja 0×0, offset de 4 px del token, ancho estable 180 px antes y después de seleccionar, opción larga en una línea

## 7. Commit (requiere OK del PO)

- [ ] 7.1 `git status` fresco + staging con paths explícitos (el PO trabaja en paralelo); proponer mensaje de commit Conventional (`fix(components): …`, header ≤100 chars, sin trailer) y **esperar el OK explícito del PO**

## 8. Gate visual y archive (bloqueado por D-022)

- [ ] 8.1 Gate visual del PO sobre el select en el playground — el archive no se ejecuta sin su OK explícito
- [ ] 8.2 Archive con el checklist completo de `docs/product/README.md` § "Checklist de archive": sync de specs base (component-select, component-menu, components-package), artefactos sin links relativos, `openspec/README.md` (próximo ID e IDs en vuelo), `docs/architecture/catalog.md`, HU-003 (estado según lo que la HU declare pendiente), doc de EP correspondiente, README de producto (Foto táctica y Última entrega), grooming de `docs/backlog/BACKLOG.md` (tabla Parte G → 2/7)
- [ ] 8.3 Proponer el commit de archive (`chore(openspec): archivar aaa-046 …`) y esperar el OK del PO — mismo patrón de sesión que `aaa-045`

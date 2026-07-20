# Tasks — aaa-025 — Menú de acciones (DsMenu)

Cada tarea es ≤2 h con criterio binario. Diseño: API por directiva + panel (design §1), foco real (§2), submenús sobre popovers anidados (§3), posicionamiento propio extendido con freno explícito (§4), items (§5), tokens (§6).

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan (11 + 156 + 9 = 176).
- [x] 1.2 Verificado en `test-setup.ts` (líneas 27-45): el polyfill cubre `showPopover`/`hidePopover` + `toggle`; alcanza para el cableado propio — se extiende solo si la implementación lo pide.

**Criterio**: baseline verde; límites jsdom conocidos antes de empezar.

## 2. Tokens

- [x] 2.1 Creado `packages/tokens/src/component/menu.json` según la tabla del design §6 (20 vars emitidas); `submenu-delay` `150ms` y `panel.min-width` `180px` raw documentados (la escala de dimension termina en 128; precedente select.listbox.max-height).
- [x] 2.2 Build + test de tokens verdes (11/11). **Gate ejecutado y escalado**: el par danger/danger-subtle falló (4.41 light / 3.62 dark) → parado y resuelto con el PO como **[D-012](../../../docs/product/decisiones.md)** (text.danger sube un paso: red.700 light / red.300 dark, calco de D-008). Re-verificado: los 4 pares del menú pasan en los 4 scopes (panel 6.47/7.97, hover 5.91/5.28) y el par de error de Input mejora (6.47/9.45), sin regresiones. Bonus: sanea el par latente de alert.

**Criterio**: tokens nuevos emitidos; jerarquía ADR-003 respetada; pares danger verificados o escalados.

## 3. Componente

- [x] 3.1 `menu/` — `DsMenu` (panel `role="menu"`, `popover="auto"`, animación overlay con reduced-motion) + `DsMenuTrigger` (directiva: `aria-haspopup`/`aria-expanded`/`aria-controls`, apertura click/↓/↑ con guarda pointerdown de DsSelect, retorno de foco) + registro de items (patrón anti-ciclo `DsMenuItemRegistration`).
- [x] 3.2 `DsMenuItem` (`role="menuitem"`, `tabindex="-1"`, icono por proyección ADR-012 + chevron estático `LucideChevronRight` para submenú, variante danger, disabled ADR-011 con guarda) + `DsMenuSeparator` (`role="separator"`, `aria-orientation`).
- [x] 3.3 Navegación por teclado en el panel: ↑/↓ con wrap (sin saltear disabled — descubribilidad), Home/End, typeahead con buffer y reset 500 ms (constante interna documentada), Esc con `stopPropagation` (cierra solo su nivel) y retorno de foco al ancla.
- [x] 3.4 Submenús: item invocador (`aria-haspopup` + `aria-expanded`), apertura →/Enter/hover con delay tokenizado (foco no roba en hover), ←/Esc cierran el nivel al item padre, hoja cierra el árbol vía `closeTree()`; posicionamiento lateral con flip horizontal + clamp vertical extendiendo el posicionador propio (~35 líneas, freno de floating-ui no cruzado).
- [x] 3.5 CSS 100% tokenizado (`component.menu.*` + overlay tokens, `:host display: contents` en el panel); `export * from './lib/menu';` en `public-api.ts`; build APF verde; typings exportan `DsMenu`, `DsMenuItem`, `DsMenuSeparator`, `DsMenuTrigger` (+ `DsMenuItemRegistration`).

**Criterio**: compila y buildea; API pública = 4 clases; cero hardcodes; freno de §4 respetado.

## 4. Tests de comportamiento (`menu.spec.ts`)

- [x] 4.1 Un test por scenario del delta (18 tests): apertura y aria del trigger (click/↓/↑), teclado con wrap sin saltear disabled, typeahead (salto, no-retorno al actual y refinado de buffer), Esc con retorno de foco, activación (click y Enter) con cierre de árbol, icono proyectado decorativo, danger, separador no focusable, disabled con guarda, submenú (aria del invocador, →/←/Esc por nivel, hoja cierra árbol, hover con delay sin robar foco + cierre por hermano), sincronización por `toggle`, no-hardcodes + reduced-motion + `@starting-style` sobre la fuente CSS, export público. Límite jsdom declarado: top layer, anidamiento real y posicionamiento lateral → playground.
- [x] 4.2 Suite completa verde: `pnpm -F @romanmartinidev/components test` (174/174).

**Criterio**: cada scenario cubierto (o su límite jsdom declarado); suite verde.

## 5. Story + showcase

- [x] 5.1 `menu.stories.ts` (CSF 3, title `Components/Menu`): Default, WithIcons, GroupedWithSeparators, DangerItem, DisabledItems, Submenu.
- [x] 5.2 Showcase del playground: ruta lazy `/menu` con menú de acciones (iconos ADR-012 + feedback de última acción), grupos con separador + disabled + danger, submenú anidado y referencia de teclado en el hint, cada caso con snippet copiable + entrada `menu` en `SHOWCASE_ENTRIES` (CA-012.9).
- [x] 5.3 `pnpm -F playground build-storybook`, `pnpm -F playground test` (9/9) y `pnpm -F playground build` pasan; **pendiente de ojo del PO**: verificación manual del árbol de submenús (posicionamiento lateral, flip, hover intent), light-dismiss y animación reduced-motion — límite jsdom declarado.

**Criterio**: stories compilan; vista del showcase funcional; verificación manual del árbol anotada para el PO.

## 6. Validación de cierre

- [x] 6.1 `pnpm openspec validate components-add-menu --strict`, `pnpm lint` (fix: `no-this-alias` en `closeTree`, reescrito recursivo) y `pnpm format:check` pasan.
- [x] 6.2 `pnpm -r build` y `pnpm -r test` pasan (11 + 174 + 9).
- [x] 6.3 Auditoría **`/ng:review`** sobre `src/lib/menu/` — 0 altas, 1 media, 1 baja; **ambas aplicadas**: `case 'Tab'` en `onPanelKeydown` (APG: Tab cierra el árbol antes de ceder el foco, sin `preventDefault`) + test nuevo (175/175), y `open` de `protected` a `private` (no se usa en template). Excepciones de consistencia del repo documentadas por el review (naming de handlers por evento, roles custom, ADR-011/014) — sin cambios.
- [x] 6.4 `npm pack --dry-run`: tarball limpio (7 archivos, solo dist + README, sin `*.spec.ts`/`*.stories.ts`).
- [x] 6.5 Changeset único `.changeset/add-menu.md` con **minor** de components (familia DsMenu) y **minor** de tokens (`component.menu.*` + ajuste D-012). Lockstep (ADR-015). **Sin publicar** (veto del PO 2026-07-19 vigente).
- [ ] 6.6 Proponer mensaje de commit (split docs/feat como la tanda 1) y **esperar OK del PO**.

**Criterio**: automáticos verdes; gates resueltos; changeset correcto; aprobación explícita antes del commit.

## 7. ADR + archive

- [x] 7.1 Promoción confirmada por el PO: **[ADR-016](../../../docs/architecture/adr/ADR-016-posicionamiento-placements-por-overlay.md)** (posicionamiento propio con placements por tipo de overlay; umbral de floating-ui y migración a anchor positioning reafirmados) + fila en `decisions-log.md`.
- [x] 7.2 Movido a `archive/aaa-025-components-add-menu/`; frontmatter `archived: 2026-07-19` + ADR-016 en related-adrs; spec base `components-package` sincronizada (ADDED autocontenido).
- [x] 7.3 Registros: `openspec/README.md` (línea de IDs en vuelo eliminada), catálogo en `docs/architecture/README.md`, grooming del BACKLOG (Menu sale de Now; `components-add-accordion` — HU-013 — promovido a Now), HU-012 → Hecha con CAs tildados, EP-002 actualizado.
- [x] 7.4 `pnpm openspec validate --all` pasa.
- [x] 7.5 Commit del archive propuesto y aprobado por el PO.

**Criterio**: change archivado, spec base sincronizada, ADR resuelto, registros al día.

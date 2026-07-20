# Tasks — aaa-025 — Menú de acciones (DsMenu)

Cada tarea es ≤2 h con criterio binario. Diseño: API por directiva + panel (design §1), foco real (§2), submenús sobre popovers anidados (§3), posicionamiento propio extendido con freno explícito (§4), items (§5), tokens (§6).

## 1. Pre-flight

- [ ] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan.
- [ ] 1.2 Verificar en `test-setup.ts` que el polyfill de Popover API (ADR-014 regla 6) cubre lo que la familia usa (`showPopover`/`hidePopover`/`toggle`); extenderlo solo si falta algo puntual.

**Criterio**: baseline verde; límites jsdom conocidos antes de empezar.

## 2. Tokens

- [ ] 2.1 Crear `packages/tokens/src/component/menu.json` según la tabla del design §6 (panel, item, danger, separator, submenu) referenciando semantic/primitives; `submenu-delay` `150ms` raw documentado.
- [ ] 2.2 Build + test de tokens verdes: vars `--ds-component-menu-*` emitidas. **Gate de contraste**: agregar los pares danger (texto danger / bg elevated; texto danger / bg danger-subtle) al script y verificar AA. Si un par falla, **parar** y tratar el ajuste de token semántico con el PO (precedente D-008) — no ajustar en silencio.

**Criterio**: tokens nuevos emitidos; jerarquía ADR-003 respetada; pares danger verificados o escalados.

## 3. Componente

- [ ] 3.1 `menu/` — `DsMenu` (panel `role="menu"`, `popover="auto"`, animación overlay con reduced-motion) + `DsMenuTrigger` (directiva: `aria-haspopup`/`aria-expanded`, apertura click/Enter/Space/↓, retorno de foco) + registro de items (patrón anti-ciclo `DsMenuItemRegistration`, design §1).
- [ ] 3.2 `DsMenuItem` (`role="menuitem"`, `tabindex="-1"`, icono opcional ADR-012, variante danger, disabled ADR-011 con guarda) + `DsMenuSeparator` (`role="separator"`).
- [ ] 3.3 Navegación por teclado en el panel: ↑/↓ con wrap, Home/End, typeahead con buffer y timeout (design §2), Esc → cierra y devuelve foco al trigger.
- [ ] 3.4 Submenús (design §3): item invocador (`aria-haspopup` + `aria-expanded`), apertura →/Enter/hover con delay tokenizado, ←/Esc cierran el nivel, activación de hoja cierra el árbol vía raíz; posicionamiento lateral extendiendo el posicionador propio (design §4 — **freno**: si degenera en middleware real, parar y escribir el ADR de floating-ui antes de seguir).
- [ ] 3.5 CSS 100% tokenizado (`component.menu.*` + overlay tokens); `export * from './lib/menu';` en `public-api.ts`; build APF verde con typings de las 4 clases.

**Criterio**: compila y buildea; API pública = 4 clases; cero hardcodes; freno de §4 respetado.

## 4. Tests de comportamiento (`menu.spec.ts`)

- [ ] 4.1 Un test por scenario del delta: apertura y aria del trigger, teclado completo (↑↓/Home/End/wrap), typeahead, activación con cierre y retorno de foco, icono decorativo, danger tokenizado, separador no focusable, disabled focusable con guarda, submenú (aria del invocador, apertura/cierre por teclado, cierre del árbol), sincronización por `toggle`, no-hardcodes sobre la fuente CSS, export público. Límites jsdom declarados (anidamiento real y posicionamiento → playground).
- [ ] 4.2 Suite completa verde: `pnpm -F @romanmartinidev/components test`.

**Criterio**: cada scenario cubierto (o su límite jsdom declarado); suite verde.

## 5. Story + showcase

- [ ] 5.1 `menu.stories.ts` (CSF 3, title `Components/Menu`): Default, WithIcons, GroupedWithSeparators, DangerItem, DisabledItems, Submenu.
- [ ] 5.2 Showcase del playground (registro de aaa-022): ruta lazy `/menu` con menú de acciones básico, grupos con separador, iconos, danger, disabled, submenú anidado y referencia de teclado, cada caso con snippet copiable (`app-showcase-case`) + entrada en `SHOWCASE_ENTRIES` (CA-012.9).
- [ ] 5.3 `pnpm -F playground build-storybook` y `pnpm -F playground test` pasan; **pendiente de ojo del PO**: verificación manual del árbol de submenús (posicionamiento lateral, flip, hover intent) y light-dismiss — límite jsdom declarado.

**Criterio**: stories compilan; vista del showcase funcional; verificación manual del árbol anotada para el PO.

## 6. Validación de cierre

- [ ] 6.1 `pnpm openspec validate components-add-menu --strict`, `pnpm lint`, `pnpm format:check` pasan.
- [ ] 6.2 `pnpm -r build` y `pnpm -r test` pasan.
- [ ] 6.3 Auditoría **`/ng:review`** sobre `src/lib/menu/` — sin hallazgos de severidad alta ni media (excepciones solo documentadas en design §Risks).
- [ ] 6.4 `npm pack --dry-run`: tarball sin `*.spec.ts`/`*.stories.ts`.
- [ ] 6.5 Changeset único con **minor** de components (familia DsMenu) y **minor** de tokens (`component.menu.*`). Lockstep (ADR-015). **Sin publicar** (veto del PO 2026-07-19 vigente).
- [ ] 6.6 Proponer mensaje de commit (split docs/feat como la tanda 1) y **esperar OK del PO**.

**Criterio**: automáticos verdes; gates resueltos; changeset correcto; aprobación explícita antes del commit.

## 7. ADR + archive

- [ ] 7.1 Evaluar la promoción a ADR de la extensión del posicionamiento (design §4: placements por tipo de overlay). Si corresponde (esperado: sí — modifica el alcance del patrón ADR-014), escribir el ADR + actualizar `decisions-log.md`.
- [ ] 7.2 Mover a `archive/aaa-025-components-add-menu/`; frontmatter `archived`; sincronizar spec base `components-package` con el delta.
- [ ] 7.3 Registros: `openspec/README.md` (ID en vuelo fuera, próximo ID), catálogo en `docs/architecture/README.md`, grooming del BACKLOG (Menu sale de Now; siguiente de la tanda 2 — Accordion — se promueve a Now), HU-012 → Hecha con CAs tildados, EP-002 actualizado.
- [ ] 7.4 `pnpm openspec validate --all` pasa.
- [ ] 7.5 Proponer commit del archive y **esperar OK del PO**.

**Criterio**: change archivado, spec base sincronizada, ADR resuelto, registros al día.

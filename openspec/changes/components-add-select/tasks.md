# Tasks — aaa-016 — Componente DsSelect + DsOption

Cada tarea es ≤2 h con criterio binario. Diseño: Popover API + anchor positioning con fallback (design.md §1-2), `<ds-option>` proyectadas (§4), `aria-activedescendant` (§5).

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan (80/80).
- [x] 1.2 **Evaluación de plataforma** (decide la rama de design.md §2): anchor positioning es Baseline 2026 (Chrome/Edge 125+, Firefox 147+, Safari parcial en 18.x — `@position-try` recién 18.4+/26). El target del repo (2 majors de Safari: 26 y 18) incluye Safari 18.0–18.3 sin soporte completo → **rama elegida: fallback JS propio**. Revisitar (migrar a anchor positioning en change propio) cuando Safari 18 salga de la ventana de soporte. Fuente: caniuse.com/css-anchor-positioning (2026-07-11).
- [x] 1.3 Popover API en jsdom 27.4: **sin soporte** (`showPopover`/`hidePopover`/`popover` ausentes) → polyfill mínimo en `test-setup.ts` (precedente dialog, ADR-013 §6).

**Criterio**: baseline verde; rama de posicionamiento decidida y anotada; estrategia de test resuelta.

## 2. Tokens

- [x] 2.1 Crear `packages/tokens/src/component/select.json`: `trigger` (height/padding-x/font-size por size sm/md/lg espejando `component.input`, radius, border-width, bg, bg-disabled, text, text-placeholder, text-disabled, border, border-hover, border-open, icon), `listbox` (bg `{semantic.color.bg.elevated}`, border, radius, shadow `{semantic.shadow.dropdown}`, padding, max-height), `option` (height, padding-x, font-size, text, text-disabled, bg-hover `{semantic.color.bg.secondary-hover}`, bg-selected `{semantic.color.bg.primary-subtle}`). Todo referenciando semantic o primitives (jerarquía ADR-003).
- [x] 2.2 `pnpm -F @romanmartinidev/tokens build` emite `--ds-component-select-*` (35 variables) en `dist/tokens.css`; `pnpm -F @romanmartinidev/tokens test` pasa.
- [x] 2.3 Contraste de los pares nuevos — **con 2 ajustes por el gate**: `text-placeholder` → `text.secondary` (2.52 → 7.81) y `trigger.border` → `border.strong` (1.48 → 4.74, es el único límite visible del control). Resto de pares con `check-a11y/scripts/contrast.mjs` (4 scopes): `trigger.text`/`trigger.bg`, `trigger.text-placeholder`/`trigger.bg` (informativo), `option.text`/`listbox.bg`, `option.text`/`option.bg-hover`, `option.text`/`option.bg-selected`, `trigger.border`/`bg.surface` (ui). Los de texto ≥4.5, ui ≥3.

**Criterio**: tokens emitidos, jerarquía respetada, pares de contraste calculados y en verde (o ajustados antes de seguir).

## 3. Componente DsOption

- [x] 3.1 Crear `option.ts`/`option.html`/`option.css`: standalone, OnPush, signals (`value` requerido, `disabled`, `label`), interfaz `DsOptionRegistration` para el padre (sin import circular — patrón DsRadioRegistration), `role="option"`, `aria-selected`, `aria-disabled`, id único para `aria-activedescendant`, contenido proyectado con fallback a `label`.
- [x] 3.2 CSS de option 100% tokenizado (hover, selected, disabled).

**Criterio**: DsOption compila; estados expuestos por ARIA; cero hardcodes.

## 4. Componente DsSelect

- [x] 4.1 Crear `select.ts`: standalone, OnPush, signals — `value` (model), `placeholder`, `disabled` (model), `size`; CVA (`writeValue`, `registerOnChange/Touched`, `setDisabledState` → disabled model); registración de options; label del trigger derivado de la opción seleccionada (`computed`).
- [x] 4.2 Apertura/cierre sobre Popover API (`popover="auto"`, `showPopover()`/`hidePopover()`, sincronización con evento `toggle` para light-dismiss); guarda de `aria-disabled` (ADR-011 rama botón, design.md §3); posicionamiento según la rama de 1.2 (anchor positioning CSS o fallback `getBoundingClientRect` + reposición en scroll/resize).
- [x] 4.3 Navegación por teclado en el trigger: `ArrowDown`/`Enter`/`Space` abren; `ArrowUp/Down`, `Home`/`End` mueven la opción activa (saltando disabled); `Enter` selecciona y cierra; `Escape` cierra sin cambiar; `aria-activedescendant` sincronizado.
- [x] 4.4 Crear `select.html` (trigger `<button role="combobox">` + chevron `LucideChevronDown` 16/1.5 `aria-hidden` + listado `role="listbox"` con `<ng-content />`) y `select.css` (trigger por sizes con tokens, listbox en top layer, animación con tokens overlay + bloque `prefers-reduced-motion`).
- [x] 4.5 `index.ts` + `export * from './lib/select';` en `public-api.ts`; `pnpm -F @romanmartinidev/components build` (APF verde).

**Criterio**: componente compila y buildea; estructura ADR-010; clasificación de design.md aplicada; cero hardcodes.

## 5. Tests de comportamiento (`select.spec.ts`)

- [x] 5.1 Un test por scenario del delta: CVA (setValue/elección de usuario/disable), apertura por teclado, navegación (flechas/Home/End/skip disabled), Enter selecciona, ESC no cambia, ARIA (roles, `aria-expanded`, `aria-activedescendant`, `aria-selected`), chevron, disabled perceptible, light-dismiss (click fuera), label fallback vs proyectado, export.
- [x] 5.2 Suite completa verde: `pnpm -F @romanmartinidev/components test` (65 previos + nuevos).

**Criterio**: cada scenario del delta cubierto; suite verde.

## 6. Story + playground

- [x] 6.1 `select.stories.ts` (CSF 3, title `Components/Select`): Default (con `aria-label`, documentando el nombre accesible como responsabilidad del consumidor), Sizes, WithFormControl, DisabledOptions, Disabled.
- [x] 6.2 Playground: sección "Select" en un form real (con `ds-checkbox`/`ds-radio` existentes) demostrando CVA.
- [x] 6.3 `pnpm -F playground build-storybook` y `pnpm -F playground test` pasan.

**Criterio**: stories compilan; demo funcional integrada al form del playground.

## 7. Validación de cierre

- [x] 7.1 `pnpm openspec validate components-add-select --strict`, `pnpm lint`, `pnpm format:check` pasan.
- [x] 7.2 `pnpm -r build` y `pnpm -r test` pasan.
- [x] 7.3 Auditoría **`/ng:review`** sobre `src/lib/select/` — 1 alta (aria-label inerte en el host → **corregida**: reenvío al trigger vía inputs con alias, design.md §6), 2 bajas mecánicas corregidas (`activeIndex` privado, computeds agrupados), 1 media + 1 baja como **excepciones justificadas** (design.md §6). Re-verificado: build + 83/83 + lint verdes.
- [x] 7.4 `npm pack --dry-run` en components: tarball sin `*.spec.ts`/`*.stories.ts`, con select compilado.
- [x] 7.5 Changesets: **minor** de components (DsSelect + DsOption) y **minor** de tokens (`component.select.*` aditivo).
- [ ] 7.6 Proponer mensaje de commit (implementación) y esperar OK del usuario.

**Criterio**: automáticos verdes; gate de review sin altos/medios; changesets correctos; aprobación explícita antes del commit.

## 8. ADR + archive

- [ ] 8.1 Crear **ADR-014** "Overlays anclados no modales sobre Popover API": opciones evaluadas (Popover API / floating-ui / DOM local), rama de posicionamiento aplicada (anchor positioning o fallback JS, según 1.2), extensión de la tabla ADR-011 al caso "form control operado por botón", alcance del patrón (Tooltip, dropdown-menu, popover futuros). Estado `Aceptado`.
- [ ] 8.2 Fila en `docs/architecture/decisions-log.md`.
- [ ] 8.3 Mover a `archive/aaa-016-components-add-select/`; frontmatter `archived`; sincronizar spec base `components-package` (2 Requirements ADDED).
- [ ] 8.4 Registros: `openspec/README.md` (próximo ID → `aaa-017`), catálogo en `docs/architecture/README.md`, grooming del BACKLOG (Select sale de Now; **promover `components-add-tabs` de la tanda D-009 y desbloquear `components-add-tooltip`** — su bloqueo era esta decisión de posicionamiento), HU-003 → Hecha con CAs tildados.
- [ ] 8.5 `pnpm openspec validate --all` pasa.
- [ ] 8.6 Proponer commit del archive y esperar OK.

**Criterio**: change archivado, ADR-014 aceptado, specs sincronizadas, tanda D-009 avanzada en el backlog.

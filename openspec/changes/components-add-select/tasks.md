# Tasks — aaa-016 — Componente DsSelect + DsOption

Cada tarea es ≤2 h con criterio binario. Diseño: Popover API + anchor positioning con fallback (design.md §1-2), `<ds-option>` proyectadas (§4), `aria-activedescendant` (§5).

## 1. Pre-flight

- [ ] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan.
- [ ] 1.2 **Evaluación de plataforma** (decide la rama de design.md §2): verificar soporte de CSS anchor positioning (`anchor-name`, `position-anchor`, `position-try`) en los engines target del repo. Criterio binario: si algún engine target no lo soporta → rama fallback JS. Documentar la rama elegida en este archivo y en el borrador de ADR-014.
- [ ] 1.3 Verificar soporte de Popover API en jsdom (`showPopover`, `hidePopover`, atributo `popover`, evento `toggle`). Si falta, escribir el polyfill mínimo en `test-setup.ts` (precedente dialog, ADR-013 §6).

**Criterio**: baseline verde; rama de posicionamiento decidida y anotada; estrategia de test resuelta.

## 2. Tokens

- [ ] 2.1 Crear `packages/tokens/src/component/select.json`: `trigger` (height/padding-x/font-size por size sm/md/lg espejando `component.input`, radius, border-width, bg, bg-disabled, text, text-placeholder, text-disabled, border, border-hover, border-open, icon), `listbox` (bg `{semantic.color.bg.elevated}`, border, radius, shadow `{semantic.shadow.dropdown}`, padding, max-height), `option` (height, padding-x, font-size, text, text-disabled, bg-hover `{semantic.color.bg.secondary-hover}`, bg-selected `{semantic.color.bg.primary-subtle}`). Todo referenciando semantic o primitives (jerarquía ADR-003).
- [ ] 2.2 `pnpm -F @romanmartinidev/tokens build` emite `--ds-component-select-*` en `dist/tokens.css`; `pnpm -F @romanmartinidev/tokens test` pasa.
- [ ] 2.3 Contraste de los pares nuevos con `check-a11y/scripts/contrast.mjs` (4 scopes): `trigger.text`/`trigger.bg`, `trigger.text-placeholder`/`trigger.bg` (informativo), `option.text`/`listbox.bg`, `option.text`/`option.bg-hover`, `option.text`/`option.bg-selected`, `trigger.border`/`bg.surface` (ui). Los de texto ≥4.5, ui ≥3.

**Criterio**: tokens emitidos, jerarquía respetada, pares de contraste calculados y en verde (o ajustados antes de seguir).

## 3. Componente DsOption

- [ ] 3.1 Crear `option.ts`/`option.html`/`option.css`: standalone, OnPush, signals (`value` requerido, `disabled`, `label`), interfaz `DsOptionRegistration` para el padre (sin import circular — patrón DsRadioRegistration), `role="option"`, `aria-selected`, `aria-disabled`, id único para `aria-activedescendant`, contenido proyectado con fallback a `label`.
- [ ] 3.2 CSS de option 100% tokenizado (hover, selected, disabled).

**Criterio**: DsOption compila; estados expuestos por ARIA; cero hardcodes.

## 4. Componente DsSelect

- [ ] 4.1 Crear `select.ts`: standalone, OnPush, signals — `value` (model), `placeholder`, `disabled` (model), `size`; CVA (`writeValue`, `registerOnChange/Touched`, `setDisabledState` → disabled model); registración de options; label del trigger derivado de la opción seleccionada (`computed`).
- [ ] 4.2 Apertura/cierre sobre Popover API (`popover="auto"`, `showPopover()`/`hidePopover()`, sincronización con evento `toggle` para light-dismiss); guarda de `aria-disabled` (ADR-011 rama botón, design.md §3); posicionamiento según la rama de 1.2 (anchor positioning CSS o fallback `getBoundingClientRect` + reposición en scroll/resize).
- [ ] 4.3 Navegación por teclado en el trigger: `ArrowDown`/`Enter`/`Space` abren; `ArrowUp/Down`, `Home`/`End` mueven la opción activa (saltando disabled); `Enter` selecciona y cierra; `Escape` cierra sin cambiar; `aria-activedescendant` sincronizado.
- [ ] 4.4 Crear `select.html` (trigger `<button role="combobox">` + chevron `LucideChevronDown` 16/1.5 `aria-hidden` + listado `role="listbox"` con `<ng-content />`) y `select.css` (trigger por sizes con tokens, listbox en top layer, animación con tokens overlay + bloque `prefers-reduced-motion`).
- [ ] 4.5 `index.ts` + `export * from './lib/select';` en `public-api.ts`; `pnpm -F @romanmartinidev/components build` (APF verde).

**Criterio**: componente compila y buildea; estructura ADR-010; clasificación de design.md aplicada; cero hardcodes.

## 5. Tests de comportamiento (`select.spec.ts`)

- [ ] 5.1 Un test por scenario del delta: CVA (setValue/elección de usuario/disable), apertura por teclado, navegación (flechas/Home/End/skip disabled), Enter selecciona, ESC no cambia, ARIA (roles, `aria-expanded`, `aria-activedescendant`, `aria-selected`), chevron, disabled perceptible, light-dismiss (click fuera), label fallback vs proyectado, export.
- [ ] 5.2 Suite completa verde: `pnpm -F @romanmartinidev/components test` (65 previos + nuevos).

**Criterio**: cada scenario del delta cubierto; suite verde.

## 6. Story + playground

- [ ] 6.1 `select.stories.ts` (CSF 3, title `Components/Select`): Default (con `aria-label`, documentando el nombre accesible como responsabilidad del consumidor), Sizes, WithFormControl, DisabledOptions, Disabled.
- [ ] 6.2 Playground: sección "Select" en un form real (con `ds-checkbox`/`ds-radio` existentes) demostrando CVA.
- [ ] 6.3 `pnpm -F playground build-storybook` y `pnpm -F playground test` pasan.

**Criterio**: stories compilan; demo funcional integrada al form del playground.

## 7. Validación de cierre

- [ ] 7.1 `pnpm openspec validate components-add-select --strict`, `pnpm lint`, `pnpm format:check` pasan.
- [ ] 7.2 `pnpm -r build` y `pnpm -r test` pasan.
- [ ] 7.3 Auditoría **`/ng:review`** sobre `src/lib/select/` — quality gate: sin hallazgos de severidad alta ni media.
- [ ] 7.4 `npm pack --dry-run` en components: tarball sin `*.spec.ts`/`*.stories.ts`, con select compilado.
- [ ] 7.5 Changesets: **minor** de components (DsSelect + DsOption) y **minor** de tokens (`component.select.*` aditivo).
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

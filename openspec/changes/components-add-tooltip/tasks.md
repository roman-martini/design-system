# Tasks — aaa-019 — Directiva DsTooltip

Cada tarea es ≤2 h con criterio binario. Diseño: directiva pública + panel interno (design.md §1), `popover="manual"` (§2), ciclo 1.4.13 (§3), delay por token con fallback (§4), describedby componible (§5), 4 placements con flip (§6).

## 1. Pre-flight

- [ ] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan.
- [ ] 1.2 Confirmar el polyfill de Popover API en `test-setup.ts` (existe desde aaa-016) y la estrategia de fake timers de vitest para el delay.

**Criterio**: baseline verde; estrategia de test confirmada.

## 2. Tokens

- [ ] 2.1 Crear `packages/tokens/src/component/tooltip.json`: `bg` → `{semantic.color.text.primary}`, `text` → `{semantic.color.bg.surface}` (inverso theme-aware), `delay` → `{motion.duration.slower}`, `padding-x`/`padding-y` (`{dimension.*}`/`{semantic.space.*}`), `radius` → `{semantic.radius.sm}`, `font-size` → `{font.size.xs}` o `sm`, `max-width` (raw px documentado, como modal sizes), `shadow` → `{semantic.shadow.dropdown}`, `offset` → `{dimension.4}`.
- [ ] 2.2 Build + test de tokens; contraste por script del par `text`/`bg` (4 scopes, umbral texto 4.5) — esperado ~17:1 por el pareo invertido.

**Criterio**: tokens emitidos referenciando semantic/primitives; contraste calculado en verde.

## 3. Directiva DsTooltip + panel interno

- [ ] 3.1 Crear el panel interno (`tooltip-panel.ts`/`.html`/`.css`, **sin export en index/public-api**): texto por signal/input, `role="tooltip"`, `[id]`, `popover="manual"`, CSS 100% tokenizado (inverso, radius, shadow, max-width, padding, font) con transición de overlay + bloque `prefers-reduced-motion`.
- [ ] 3.2 Crear `tooltip.ts` (directiva `DsTooltip`, standalone): inputs `dsTooltip` (string), `dsTooltipPlacement` (default `top`), `dsTooltipDelay` (number opcional); string vacío → inerte (CA-007.1); creación perezosa del panel con `createComponent` al primer show + destroy en `OnDestroy`.
- [ ] 3.3 Ciclo de vida §3: `mouseenter` (timer con delay §4) / `mouseleave` / `focusin` (inmediato) / `focusout`; hoverable (enter/leave del panel); ESC a nivel `document` solo mientras visible, sin mover el foco; `aria-describedby` componible (§5); `showPopover`/`hidePopover` + posicionamiento 4 placements con flip y reposición en scroll/resize (§6).
- [ ] 3.4 `index.ts` (`export { DsTooltip, type DsTooltipPlacement }`) + `export * from './lib/tooltip';` en `public-api.ts`; build APF verde y `npm pack` sin exponer el panel en los typings públicos del barrel.

**Criterio**: compila y buildea; API pública = solo la directiva; cero hardcodes; ADR-014 aplicado sin re-decidir.

## 4. Tests de comportamiento (`tooltip.spec.ts`)

- [ ] 4.1 Un test por scenario del delta (fake timers para el delay): texto/inerte con vacío, hover con delay + cancelación, foco inmediato, cierre por leave/blur, ESC sin mover foco, hoverable, describedby componible (con valor preexistente), placements (estilos aplicados; flip queda como cableado no testeable en jsdom — documentar), panel no exportado, limpieza en destroy.
- [ ] 4.2 Suite completa verde: `pnpm -F @romanmartinidev/components test` (125 previos + nuevos).

**Criterio**: cada scenario cubierto (o su límite jsdom declarado); suite verde.

## 5. Story + playground

- [ ] 5.1 `tooltip.stories.ts` (CSF 3, title `Components/Tooltip`): Default, Placements (los 4), OnIconButton (botón ícono-only **con su `aria-label` propio** — documenta que el tooltip es descripción, no label), WithDelay (delay custom), OnDisabledContext (documenta la limitación touch/disabled).
- [ ] 5.2 Playground: tooltips sobre los iconos de la sección de iconografía y sobre un `ds-button`.
- [ ] 5.3 `pnpm -F playground build-storybook` y `pnpm -F playground test` pasan.

**Criterio**: stories compilan; demo funcional.

## 6. Validación de cierre

- [ ] 6.1 `pnpm openspec validate components-add-tooltip --strict`, `pnpm lint`, `pnpm format:check` pasan.
- [ ] 6.2 `pnpm -r build` y `pnpm -r test` pasan.
- [ ] 6.3 Auditoría **`/ng:review`** sobre `src/lib/tooltip/` — quality gate: sin hallazgos alta/media (o excepciones justificadas en design.md con aviso al PO).
- [ ] 6.4 `npm pack --dry-run`: tarball sin `*.spec.ts`/`*.stories.ts`.
- [ ] 6.5 Changesets: **minor** de components (DsTooltip) y **minor** de tokens (`component.tooltip.*` nuevo).
- [ ] 6.6 Proponer mensaje de commit (implementación) y esperar OK del usuario.

**Criterio**: automáticos verdes; gate resuelto; changesets correctos; aprobación explícita antes del commit.

## 7. Archive

- [ ] 7.1 Sin ADR nuevo previsto; si el reuso destapa un gap de ADR-014, anotarlo como acción de seguimiento del ADR (no editarlo).
- [ ] 7.2 Mover a `archive/aaa-019-components-add-tooltip/`; frontmatter `archived`; sincronizar spec base (1 Requirement ADDED, referencias a design.md convertidas a texto autocontenido).
- [ ] 7.3 Registros: `openspec/README.md` (próximo ID → `aaa-020`), catálogo, grooming del BACKLOG (Tooltip sale de Now; Toast ya está en Now — sin promociones nuevas), HU-007 → Hecha con CAs tildados, EP-002 actualizado.
- [ ] 7.4 `pnpm openspec validate --all` pasa.
- [ ] 7.5 Proponer commit del archive y esperar OK.

**Criterio**: change archivado, spec base sincronizada, registros al día.

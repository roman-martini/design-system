# Tasks — aaa-028 — Pagination de listados (DsPagination)

Cada tarea es ≤2 h con criterio binario. Diseño: componente único sin proyección (design §1), ventana como función pura (§2), a11y y variantes (§3), tokens (§4).

## 1. Pre-flight

- [ ] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan (11 + 201 + 9 = 221).
- [ ] 1.2 Sin polyfills ni harness nuevos (sin overlay, sin router): confirmado por diseño.

**Criterio**: baseline verde.

## 2. Tokens

- [ ] 2.1 Crear `packages/tokens/src/component/pagination.json` según la tabla del design §4 (item, current, disabled, counter, chevron) referenciando semantic/primitives; cero raws.
- [ ] 2.2 Build + test de tokens verdes. **Gate de contraste ejecutado** (item/surface, item/bg-hover, current inverse/primary) en los 4 scopes; si algo falla, parar y escalar al PO (D-008) salvo fix local de component token (precedente aaa-027).

**Criterio**: tokens nuevos emitidos; jerarquía ADR-003 respetada; pares verificados o escalados.

## 3. Componente

- [ ] 3.1 `pagination/` — función pura `pageWindow(current, total, siblings)` con su suite de casos borde propia (total ≤ ventana, current en extremos, siblings 0/1/2, regla anti-parpadeo del hueco de 1).
- [ ] 3.2 `DsPagination` — model `page` two-way + `totalPages` + `siblingCount` + `variant` + labels configurables; página efectiva con clamp de vista (patrón activeValue de tabs, sin pisar el model); template numbered: nav + ul/li, botones "Página N", actual `aria-current`, "…" `aria-hidden`.
- [ ] 3.3 Extremos first/prev/next/last: chevrons Lucide estáticos (ADR-012, `aria-hidden`) + `aria-label` configurable; disabled accesible en extremos (ADR-011: focusable + `aria-disabled` + guarda). Variante `compact`: mismos extremos + contador "X de Y".
- [ ] 3.4 CSS 100% tokenizado (`component.pagination.*` + semantic; estado en el elemento propio — `[aria-current]`/`[aria-disabled]`, sin clases de estado por descendencia desde `:host`); `export * from './lib/pagination';` en `public-api.ts`; build APF verde.

**Criterio**: compila; API = 1 componente + 1 type; cero hardcodes; ventana correcta por función pura.

## 4. Tests de comportamiento (`pagination.spec.ts` + suite de `pageWindow`)

- [ ] 4.1 Un test por scenario del delta: estructura (nav label default/custom, botones con nombre, aria-current), modelo (click actualiza, set programático refleja, emisiones acotadas, page fuera de rango normaliza vista sin pisar model), navegación con extremos disabled accesibles (guarda verificada), ventana con elipsis (casos de la función pura + render con aria-hidden), variante compacta (controles + contador, sin números), labels configurables, no-hardcodes + sin `:host` de estado sobre la fuente CSS, export público.
- [ ] 4.2 Suite completa verde: `pnpm -F @romanmartinidev/components test`.

**Criterio**: cada scenario cubierto; suite verde.

## 5. Story + showcase

- [ ] 5.1 `pagination.stories.ts` (CSF 3, title `Components/Pagination`): Default, ManyPages (elipsis + siblingCount), Compact, Edges (primera/última página).
- [ ] 5.2 Showcase del playground: ruta lazy `/pagination` con básico interactivo, listado largo con elipsis, compacta y estado en extremos, cada caso con snippet copiable + entrada en `SHOWCASE_ENTRIES` (CA-015.8).
- [ ] 5.3 `pnpm -F playground build-storybook`, `pnpm -F playground test` y `pnpm -F playground build` pasan; **pendiente de ojo del PO**: verificación visual de la ventana al navegar (sin saltos de layout), hover/current en light y dark, y la compacta.

**Criterio**: stories compilan; showcase funcional; verificación manual anotada.

## 6. Validación de cierre

- [ ] 6.1 `pnpm openspec validate components-add-pagination --strict`, `pnpm lint` y `pnpm format:check` pasan.
- [ ] 6.2 `pnpm -r build` y `pnpm -r test` pasan.
- [ ] 6.3 Auditoría **`/ng:review`** sobre `src/lib/pagination/` — 0 hallazgos altos o medios (los que salgan se aplican o se justifican por escrito).
- [ ] 6.4 `npm pack --dry-run`: tarball limpio (sin `*.spec.ts`/`*.stories.ts`).
- [ ] 6.5 Changeset único `.changeset/add-pagination.md` con **minor** de components y **minor** de tokens. Lockstep (ADR-015). **Sin publicar** (veto del PO vigente).
- [ ] 6.6 Proponer mensaje de commit (split docs/feat) y **esperar OK del PO**.

**Criterio**: automáticos verdes; gates resueltos; changeset correcto; aprobación explícita antes del commit.

## 7. Archive

- [ ] 7.1 Confirmar que no surgió nada one-way door (sin ADR previsto); si surgió, escribirlo antes de archivar.
- [ ] 7.2 Mover a `archive/aaa-028-components-add-pagination/`; frontmatter `archived` + spec base `components-package` sincronizada.
- [ ] 7.3 Registros: `openspec/README.md`, catálogo en `docs/architecture/README.md`, grooming del BACKLOG (Pagination sale de Now; `components-add-progress` — HU-016 — promovido a Now, cierra la tanda 2), HU-015 → Hecha con CAs tildados, EP-002 actualizado (4/5).
- [ ] 7.4 `pnpm openspec validate --all` pasa.
- [ ] 7.5 Commit del archive propuesto y aprobado por el PO.

**Criterio**: change archivado, spec base sincronizada, registros al día.

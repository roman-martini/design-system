# Tasks — aaa-028 — Pagination de listados (DsPagination)

Cada tarea es ≤2 h con criterio binario. Diseño: componente único sin proyección (design §1), ventana como función pura (§2), a11y y variantes (§3), tokens (§4).

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan (11 + 201 + 9 = 221).
- [x] 1.2 Sin polyfills ni harness nuevos (sin overlay, sin router): confirmado por diseño.

**Criterio**: baseline verde.

## 2. Tokens

- [x] 2.1 Crear `packages/tokens/src/component/pagination.json` según la tabla del design §4 (item, current, disabled, counter, chevron) referenciando semantic/primitives; cero raws.
- [x] 2.2 Build + test de tokens verdes (11/11, 14 vars). **Gate ejecutado**: item/surface 7.11-7.81, item-hover 9.93-16.44, current inverse/primary 4.87-5.38, counter 7.11+ — todos PASS en los 4 scopes, sin escalamiento.

**Criterio**: tokens nuevos emitidos; jerarquía ADR-003 respetada; pares verificados o escalados.

## 3. Componente

- [x] 3.1 `pagination/` — función pura `pageWindow(current, total, siblings)` con su suite de casos borde propia (7 tests). Fix durante tests: atajo "total ≤ 2·siblings+5 → todas las páginas" (la elipsis no ahorra nada ahí).
- [x] 3.2 `DsPagination` — model `page` two-way + `totalPages` + `siblingCount` + `variant` + labels configurables; página efectiva con clamp de vista (patrón activeValue de tabs, sin pisar el model); template numbered: nav + ul/li, botones "Página N", actual `aria-current`, "…" `aria-hidden`.
- [x] 3.3 Extremos first/prev/next/last: chevrons Lucide estáticos (ADR-012, `aria-hidden`) + `aria-label` configurable; disabled accesible en extremos (ADR-011: focusable + `aria-disabled` + guarda). Variante `compact`: mismos extremos + contador "X de Y".
- [x] 3.4 CSS 100% tokenizado (`component.pagination.*` + semantic; estado en el elemento propio — `[aria-current]`/`[aria-disabled]`, sin clases de estado por descendencia desde `:host`); `export * from './lib/pagination';` en `public-api.ts`; build APF verde.

**Criterio**: compila; API = 1 componente + 1 type; cero hardcodes; ventana correcta por función pura.

## 4. Tests de comportamiento (`pagination.spec.ts` + suite de `pageWindow`)

- [x] 4.1 Un test por scenario del delta: estructura (nav label default/custom, botones con nombre, aria-current), modelo (click actualiza, set programático refleja, emisiones acotadas, page fuera de rango normaliza vista sin pisar model), navegación con extremos disabled accesibles (guarda verificada), ventana con elipsis (casos de la función pura + render con aria-hidden), variante compacta (controles + contador, sin números), labels configurables, no-hardcodes + sin `:host` de estado sobre la fuente CSS, export público.
- [x] 4.2 Suite completa verde: `pnpm -F @romanmartinidev/components test`.

**Criterio**: cada scenario cubierto; suite verde.

## 5. Story + showcase

- [x] 5.1 `pagination.stories.ts` (CSF 3, title `Components/Pagination`): Default, ManyPages (elipsis + siblingCount), Compact, Edges (primera/última página).
- [x] 5.2 Showcase del playground: ruta lazy `/pagination` con básico interactivo, listado largo con elipsis, compacta y estado en extremos, cada caso con snippet copiable + entrada en `SHOWCASE_ENTRIES` (CA-015.8).
- [x] 5.3 `pnpm -F playground build-storybook`, `pnpm -F playground test` y `pnpm -F playground build` pasan; **pendiente de ojo del PO**: verificación visual de la ventana al navegar (sin saltos de layout), hover/current en light y dark, y la compacta.

**Criterio**: stories compilan; showcase funcional; verificación manual anotada.

## 6. Validación de cierre

- [x] 6.1 `pnpm openspec validate components-add-pagination --strict`, `pnpm lint` y `pnpm format:check` pasan.
- [x] 6.2 `pnpm -r build` y `pnpm -r test` pasan.
- [x] 6.3 Auditoría **`/ng:review`** — 0 altas, 0 medias, 2 bajas; **ambas aplicadas**: `@empty` en el @for (caso `totalPages ≤ 0` + test) y helpers del spec por rol/label. Excepciones de consistencia documentadas (onX, ADR-011, track compuesto, pageWindow co-ubicada) — sin cambios. Fix colateral de aaa-027: import de `DsBreadcrumbsSeparator` en su story (roto tras la extracción a archivo propio, detectado por build-storybook). Suite final 219/219.
- [x] 6.4 `npm pack --dry-run`: tarball limpio (sin `*.spec.ts`/`*.stories.ts`).
- [x] 6.5 Changeset único `.changeset/add-pagination.md` con **minor** de components y **minor** de tokens. Lockstep (ADR-015). **Sin publicar** (veto del PO vigente).
- [x] 6.6 Commits aprobados por el PO: docs `0772913` (propose) y feat `04cd231` (implementación completa).

**Criterio**: automáticos verdes; gates resueltos; changeset correcto; aprobación explícita antes del commit.

## 7. Archive

- [x] 7.1 Confirmado: nada one-way door — solo patrones ya decididos (ADR-011/012, computed puro). Sin ADR.
- [x] 7.2 Movido a `archive/aaa-028-components-add-pagination/`; frontmatter `archived: 2026-07-20` + spec base `components-package` sincronizada (ADDED autocontenido).
- [x] 7.3 Registros: `openspec/README.md`, catálogo en `docs/architecture/README.md`, grooming del BACKLOG (Pagination sale de Now; `components-add-progress` — HU-016 — promovido a Now, cierra la tanda 2), HU-015 → Hecha con CAs tildados, EP-002 actualizado (4/5).
- [x] 7.4 `pnpm openspec validate --all` pasa.
- [x] 7.5 Commit del archive propuesto y aprobado por el PO (2026-07-20).

**Criterio**: change archivado, spec base sincronizada, registros al día.

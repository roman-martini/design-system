# Tasks — aaa-027 — Breadcrumbs de ubicación (DsBreadcrumbs)

Cada tarea es ≤2 h con criterio binario. Diseño: API con links proyectados (design §1), separadores/"…" renderizados por el item con registro indexado (§2), secondary entry point `router` con peer opcional (§3), tokens (§4).

## 1. Pre-flight

- [x] 1.1 Suite verde de partida (verificada tras el fix e0448ce): 11 + 186 + 9 = 206.
- [x] 1.2 Confirmado: `@angular/router` ^21.2.0 en el workspace (playground); se agrega como devDep de components para compilar/testear el entry point. Harness disponible (`provideRouter` + `RouterTestingHarness` de `@angular/router/testing`) — la pieza auto SÍ es testeable en jsdom, sin polyfills nuevos.

**Criterio**: baseline verde; estrategia de test del entry point router confirmada.

## 2. Tokens

- [x] 2.1 Creado `packages/tokens/src/component/breadcrumbs.json` (13 vars: item 2, link 2, current 2, separator 2, ellipsis 5) según la tabla del design §4 (item, link, current, separator, ellipsis) referenciando semantic/primitives; cero raws.
- [x] 2.2 Build + test de tokens verdes (11/11). **Gate ejecutado**: link/surface 5.17-7.05, link-hover 6.7-9.94, current 17.18+, ellipsis reposo 7.11+ — todos PASS. **Un fallo detectado y resuelto localmente** (sin tocar semantic, no aplica D-008): ellipsis text/bg-hover daba 4.11 en dark → se agregó `ellipsis.text-hover` = `{semantic.color.text.primary}` (patrón "hover aclara" de tabs); re-verificado 16.44 light / 9.93 dark.

**Criterio**: tokens nuevos emitidos; jerarquía ADR-003 respetada; pares verificados o escalados.

## 3. Componente core

- [x] 3.1 `breadcrumbs/` — `DsBreadcrumbs` (nav + `aria-label` default "breadcrumb", `<ol role="list">`, registro indexado `DsBreadcrumbItemRegistration`, computed de colapso: `isHidden`/`showEllipsisBefore`/`isLast` por item, estado expandido tras activar "…") + `DsBreadcrumbsSeparator` (directiva de template).
- [x] 3.2 `DsBreadcrumbItem` — host `role="listitem"`; template: separador previo (chevron `LucideChevronRight` estático o `ngTemplateOutlet` del template registrado, wrapper `aria-hidden`), botón "…" cuando `showEllipsisBefore` (nombre accesible con N ocultos, foco al primer revelado al expandir), `<ng-content />` del link/texto, `aria-current="page"` reflejado en el link proyectado del último item (o en el host si es texto).
- [x] 3.3 Truncamiento: con `maxItems` superado, visibles = primero + últimos `maxItems - 1`; ocultos con `display: none`; expandir revela y elimina el botón; sin `maxItems` sin colapso. Reorden/alta/baja de items recomputa índices (registro por signal).
- [x] 3.4 CSS 100% tokenizado (`component.breadcrumbs.*` + semantic; estado en el elemento propio — lección aaa-026, sin selectores de estado por descendencia desde `:host`); `export * from './lib/breadcrumbs';` en `public-api.ts`.

**Criterio**: compila; API core = 3 símbolos; cero hardcodes; colapso correcto con items dinámicos.

## 4. Secondary entry point `router`

- [x] 4.1 Estructura ng-packagr: `packages/components/router/` con `ng-package.json` + `src/public-api.ts`; `@angular/router` a `peerDependencies` de components con `peerDependenciesMeta.optional: true`.
- [x] 4.2 `DsBreadcrumbsRouter` — `Router.events` → signal de items `{label, url}` recorriendo `ActivatedRouteSnapshot` desde raíz (URL acumulada, `data.breadcrumb` string o resolver síncrono, rutas sin data omitidas); renderiza `ds-breadcrumbs` + items con `routerLink` reenviando `maxItems`/`aria-label`/template de separador.
- [x] 4.3 Build APF verde con el entry point secundario emitido; **guardas**: grep `@angular/router` fuera de `router/` = 0; `npm pack --dry-run` lista los bundles de `router/`.

**Criterio**: `@romanmartinidev/components/router` importable; core sin router; pack íntegro.

## 5. Tests de comportamiento (`breadcrumbs.spec.ts` + `breadcrumbs-router.spec.ts`)

- [x] 5.1 Core (11 tests) — un test por scenario del delta: nav + aria-label default/custom, roles list/listitem, aria-current en el último (y recalculado al agregar/quitar items), separador default decorativo + template custom no anunciado, truncamiento (visibles correctos, nombre accesible del "…", expansión inline con foco al primer revelado, sin maxItems sin colapso), no-hardcodes + sin `:host(...)` de estado sobre la fuente CSS, exports de ambos public-api.
- [x] 5.2 Router (4 tests; fix: `routeConfig.data` en vez de `route.data` para no heredar breadcrumb de padres componentless) — con `provideRouter` + rutas de prueba: items generados con labels string y resolver, rutas sin data omitidas, actualización en navegación, item activo como actual.
- [x] 5.3 Suite completa verde: `pnpm -F @romanmartinidev/components test` (201/201).

**Criterio**: cada scenario cubierto; suite verde.

## 6. Story + showcase

- [x] 6.1 `breadcrumbs.stories.ts` (CSF 3, title `Components/Breadcrumbs`): Default, CustomSeparator, Truncated, CurrentOnly. (La story de auto-rutas no aplica en Storybook sin router real — se cubre en el showcase.)
- [x] 6.2 Showcase del playground: ruta lazy `/breadcrumbs` con básico con links, separador custom por template, truncamiento con "…", y **auto-generación contra las rutas reales del playground** (`data.breadcrumb` en las rutas del showcase, CA-014.6/CA-014.7), cada caso con snippet copiable + entrada en `SHOWCASE_ENTRIES`.
- [x] 6.3 `pnpm -F playground build-storybook`, `pnpm -F playground test` (9/9) y `pnpm -F playground build` pasan; **pendiente de ojo del PO**: verificación visual de wrap responsive, truncamiento/expansión y auto-rutas navegando el playground.

**Criterio**: stories compilan; showcase funcional con auto-rutas reales; verificación manual anotada.

## 7. Validación de cierre

- [x] 7.1 `pnpm openspec validate components-add-breadcrumbs --strict`, `pnpm lint` y `pnpm format:check` pasan (fix: Prettier sobre 7 archivos nuevos).
- [x] 7.2 `pnpm -r build` y `pnpm -r test` pasan (11 + 201 + 9 = 221).
- [x] 7.3 Auditoría **`/ng:review`** sobre `src/lib/breadcrumbs/` + `router/` — 0 altas, 1 media, 1 baja; **ambas aplicadas**: `track $index` → `track crumb.url` (colección dinámica; evita arrastrar estado entre crumbs al navegar) y `DsBreadcrumbsSeparator` extraída a `breadcrumbs-separator.ts` (un concepto por archivo). Excepciones de consistencia del repo documentadas por el review (handlers onX, focus imperativo, ::ng-deep único documentado) — sin cambios. Re-verificado: build + 201/201 + lint + format.
- [x] 7.4 `npm pack --dry-run`: tarball íntegro (11 archivos) con FESM + types del entry principal y de `router/`, sin `*.spec.ts`/`*.stories.ts`.
- [x] 7.5 Changeset único `.changeset/add-breadcrumbs.md` con **minor** de components (familia + entry point + peer opcional) y **minor** de tokens. Lockstep (ADR-015). **Sin publicar** (veto del PO vigente).
- [x] 7.6 Commits aprobados por el PO: docs `368a1c7` (propose) y feat `454eda0` (implementación completa).

**Criterio**: automáticos verdes; gates resueltos; changeset correcto; aprobación explícita antes del commit.

## 8. ADR + archive

- [x] 8.1 Escrito **[ADR-017](../../../docs/architecture/adr/ADR-017-secondary-entry-points.md)** (confirmado en proposal §Impact): criterio de creación, estructura ng-packagr, peers opcionales, relación con ADR-004 §surface; fila en `decisions-log.md`.
- [x] 8.2 Movido a `archive/aaa-027-components-add-breadcrumbs/`; frontmatter `archived: 2026-07-20` + ADR-017 en related-adrs + spec base `components-package` sincronizada (ADDED autocontenido).
- [x] 8.3 Registros: `openspec/README.md`, catálogo en `docs/architecture/README.md`, grooming del BACKLOG (Breadcrumbs sale de Now; `components-add-pagination` — HU-015 — promovido a Now), HU-014 → Hecha con CAs tildados, EP-002 actualizado (3/5).
- [x] 8.4 `pnpm openspec validate --all` pasa.
- [x] 8.5 Commit del archive propuesto y aprobado por el PO (2026-07-20).

**Criterio**: change archivado, ADR escrito, spec base sincronizada, registros al día.

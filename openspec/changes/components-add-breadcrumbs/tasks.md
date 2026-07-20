# Tasks — aaa-027 — Breadcrumbs de ubicación (DsBreadcrumbs)

Cada tarea es ≤2 h con criterio binario. Diseño: API con links proyectados (design §1), separadores/"…" renderizados por el item con registro indexado (§2), secondary entry point `router` con peer opcional (§3), tokens (§4).

## 1. Pre-flight

- [ ] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan (11 + 186 + 9 = 206).
- [ ] 1.2 Confirmar que el harness de router para tests está disponible (`provideRouter` + `RouterTestingHarness` de `@angular/router/testing`) — la pieza auto SÍ es testeable en jsdom, sin polyfills nuevos.

**Criterio**: baseline verde; estrategia de test del entry point router confirmada.

## 2. Tokens

- [ ] 2.1 Crear `packages/tokens/src/component/breadcrumbs.json` según la tabla del design §4 (item, link, current, separator, ellipsis) referenciando semantic/primitives; cero raws.
- [ ] 2.2 Build + test de tokens verdes. **Gate de contraste ejecutado** (pares nuevos: link/surface, link-hover/surface — primer uso de `text.link` en el kit — más current/surface y ellipsis text/bg-hover) en los 4 scopes; si algo falla, parar y escalar al PO (D-008).

**Criterio**: tokens nuevos emitidos; jerarquía ADR-003 respetada; pares verificados o escalados.

## 3. Componente core

- [ ] 3.1 `breadcrumbs/` — `DsBreadcrumbs` (nav + `aria-label` default "breadcrumb", `<ol role="list">`, registro indexado `DsBreadcrumbItemRegistration`, computed de colapso: `isHidden`/`showEllipsisBefore`/`isLast` por item, estado expandido tras activar "…") + `DsBreadcrumbsSeparator` (directiva de template).
- [ ] 3.2 `DsBreadcrumbItem` — host `role="listitem"`; template: separador previo (chevron `LucideChevronRight` estático o `ngTemplateOutlet` del template registrado, wrapper `aria-hidden`), botón "…" cuando `showEllipsisBefore` (nombre accesible con N ocultos, foco al primer revelado al expandir), `<ng-content />` del link/texto, `aria-current="page"` reflejado en el link proyectado del último item (o en el host si es texto).
- [ ] 3.3 Truncamiento: con `maxItems` superado, visibles = primero + últimos `maxItems - 1`; ocultos con `display: none`; expandir revela y elimina el botón; sin `maxItems` sin colapso. Reorden/alta/baja de items recomputa índices (registro por signal).
- [ ] 3.4 CSS 100% tokenizado (`component.breadcrumbs.*` + semantic; estado en el elemento propio — lección aaa-026, sin selectores de estado por descendencia desde `:host`); `export * from './lib/breadcrumbs';` en `public-api.ts`.

**Criterio**: compila; API core = 3 símbolos; cero hardcodes; colapso correcto con items dinámicos.

## 4. Secondary entry point `router`

- [ ] 4.1 Estructura ng-packagr: `packages/components/router/` con `ng-package.json` + `src/public-api.ts`; `@angular/router` a `peerDependencies` de components con `peerDependenciesMeta.optional: true`.
- [ ] 4.2 `DsBreadcrumbsRouter` — `Router.events` → signal de items `{label, url}` recorriendo `ActivatedRouteSnapshot` desde raíz (URL acumulada, `data.breadcrumb` string o resolver síncrono, rutas sin data omitidas); renderiza `ds-breadcrumbs` + items con `routerLink` reenviando `maxItems`/`aria-label`/template de separador.
- [ ] 4.3 Build APF verde con el entry point secundario emitido; **guardas**: grep `@angular/router` fuera de `router/` = 0; `npm pack --dry-run` lista los bundles de `router/`.

**Criterio**: `@romanmartinidev/components/router` importable; core sin router; pack íntegro.

## 5. Tests de comportamiento (`breadcrumbs.spec.ts` + `breadcrumbs-router.spec.ts`)

- [ ] 5.1 Core — un test por scenario del delta: nav + aria-label default/custom, roles list/listitem, aria-current en el último (y recalculado al agregar/quitar items), separador default decorativo + template custom no anunciado, truncamiento (visibles correctos, nombre accesible del "…", expansión inline con foco al primer revelado, sin maxItems sin colapso), no-hardcodes + sin `:host(...)` de estado sobre la fuente CSS, exports de ambos public-api.
- [ ] 5.2 Router — con `provideRouter` + rutas de prueba: items generados con labels string y resolver, rutas sin data omitidas, actualización en navegación, item activo como actual.
- [ ] 5.3 Suite completa verde: `pnpm -F @romanmartinidev/components test`.

**Criterio**: cada scenario cubierto; suite verde.

## 6. Story + showcase

- [ ] 6.1 `breadcrumbs.stories.ts` (CSF 3, title `Components/Breadcrumbs`): Default, CustomSeparator, Truncated, CurrentOnly. (La story de auto-rutas no aplica en Storybook sin router real — se cubre en el showcase.)
- [ ] 6.2 Showcase del playground: ruta lazy `/breadcrumbs` con básico con links, separador custom por template, truncamiento con "…", y **auto-generación contra las rutas reales del playground** (`data.breadcrumb` en las rutas del showcase, CA-014.6/CA-014.7), cada caso con snippet copiable + entrada en `SHOWCASE_ENTRIES`.
- [ ] 6.3 `pnpm -F playground build-storybook`, `pnpm -F playground test` y `pnpm -F playground build` pasan; **pendiente de ojo del PO**: verificación visual de wrap responsive, truncamiento/expansión y auto-rutas navegando el playground.

**Criterio**: stories compilan; showcase funcional con auto-rutas reales; verificación manual anotada.

## 7. Validación de cierre

- [ ] 7.1 `pnpm openspec validate components-add-breadcrumbs --strict`, `pnpm lint` y `pnpm format:check` pasan.
- [ ] 7.2 `pnpm -r build` y `pnpm -r test` pasan.
- [ ] 7.3 Auditoría **`/ng:review`** sobre `src/lib/breadcrumbs/` + `router/` — 0 hallazgos altos o medios (los que salgan se aplican o se justifican por escrito).
- [ ] 7.4 `npm pack --dry-run`: tarball con entry principal + `router/`, sin `*.spec.ts`/`*.stories.ts`.
- [ ] 7.5 Changeset único `.changeset/add-breadcrumbs.md` con **minor** de components (familia + entry point + peer opcional) y **minor** de tokens. Lockstep (ADR-015). **Sin publicar** (veto del PO vigente).
- [ ] 7.6 Proponer mensaje de commit (split docs/feat) y **esperar OK del PO**.

**Criterio**: automáticos verdes; gates resueltos; changeset correcto; aprobación explícita antes del commit.

## 8. ADR + archive

- [ ] 8.1 Escribir el **ADR de secondary entry points** (confirmado en proposal §Impact): criterio de creación, estructura ng-packagr, peers opcionales, relación con ADR-004 §surface; fila en `decisions-log.md`.
- [ ] 8.2 Mover a `archive/aaa-027-components-add-breadcrumbs/`; frontmatter `archived` + spec base `components-package` sincronizada.
- [ ] 8.3 Registros: `openspec/README.md`, catálogo en `docs/architecture/README.md`, grooming del BACKLOG (Breadcrumbs sale de Now; `components-add-pagination` — HU-015 — promovido a Now), HU-014 → Hecha con CAs tildados, EP-002 actualizado (3/5).
- [ ] 8.4 `pnpm openspec validate --all` pasa.
- [ ] 8.5 Commit del archive propuesto y aprobado por el PO.

**Criterio**: change archivado, ADR escrito, spec base sincronizada, registros al día.

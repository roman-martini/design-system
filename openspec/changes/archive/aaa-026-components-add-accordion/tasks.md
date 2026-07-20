# Tasks — aaa-026 — Accordion de contenido colapsable (DsAccordion)

Cada tarea es ≤2 h con criterio binario. Diseño: API contenedor+item con header proyectado (design §1), registro scoped por instancia (§2), heading por `role`/`aria-level` (§3), animación grid `0fr→1fr` (§4), disabled y chevron (§5), tokens (§6).

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan (11 + 175 + 9 = 195).
- [x] 1.2 Confirmado: sin polyfill nuevo en `test-setup.ts` (sin Popover/dialog; jsdom no computa layout — la animación queda para verificación visual, límite declarado).

**Criterio**: baseline verde; límites jsdom conocidos antes de empezar.

## 2. Tokens

- [x] 2.1 Creado `packages/tokens/src/component/accordion.json` según la tabla del design §6 (18 vars emitidas: header 10, panel 3, border 3, motion 2); todo referencia semantic/primitives, cero raws.
- [x] 2.2 Build + test de tokens verdes (11/11). **Gate de contraste ejecutado**: header-text/surface 17.93 (dark 17.18), header-text/hover 16.44 (dark 9.93), panel-text/surface 7.81 (dark 7.11) — los 3 pares pasan AA en los 4 scopes (default, brand-a, brand-b, dark). Sin pares nuevos, sin escalamiento.

**Criterio**: tokens nuevos emitidos; jerarquía ADR-003 respetada; pares verificados o escalados.

## 3. Componente

- [x] 3.1 `accordion/` — `DsAccordion` (contenedor: `multiple` default false, `headingLevel` default 3, registro `DsAccordionItemRegistration` anti-ciclo, exclusividad single vía `notifyExpanded` idempotente) + ids únicos con contador módulo (patrón radio-group).
- [x] 3.2 `DsAccordionItem` — `expanded` como `model()` two-way (effect notifica exclusividad ante cualquier vía de expansión), `disabled` (ADR-011: focusable + `aria-disabled` + guarda); template: `role="heading"` + `aria-level` → `<button aria-expanded aria-controls>` con `<ng-content select="[dsAccordionHeader]" />` + chevron estático `LucideChevronDown` (`aria-hidden`, rotación CSS); panel `role="region"` + `aria-labelledby` con `<ng-content />`.
- [x] 3.3 Teclado entre headers de la instancia: ↑/↓ con wrap (sin saltear disabled — descubribilidad), Home/End; scoping de anidados por inyección jerárquica (el hijo registra y navega en su propio contenedor).
- [x] 3.4 Animación: panel grid `0fr→1fr` con transición tokenizada, wrapper interno `min-height: 0; overflow: hidden` + `visibility` con delay (colapsado = fuera de AT y tab order; padding en nivel interior para no sumar altura con 0fr), bloque `prefers-reduced-motion` (cambio instantáneo).
- [x] 3.5 CSS 100% tokenizado (`component.accordion.*` + semantic); `export * from './lib/accordion';` en `public-api.ts`; build APF verde (2.4s); typings exportan `DsAccordion`, `DsAccordionItem` (+ `DsAccordionItemRegistration`).

**Criterio**: compila y buildea; API pública = 2 clases; cero hardcodes; anidados sin código especial (scoping por inyección).

## 4. Tests de comportamiento (`accordion.spec.ts`)

- [x] 4.1 Un test por scenario del delta (11 tests): estructura (heading level default + configurable, button aria-expanded/aria-controls, region aria-labelledby), toggle por click (Enter/Space son activación de plataforma del button — límite declarado en el spec), exclusividad single + programática sin rebote + independencia multi, teclado ↑/↓/Home/End con wrap sin saltear disabled, disabled con guarda, anidado (exclusividad/teclado/headingLevel independientes), no-hardcodes + grid 0fr/1fr + visibility + reduced-motion sobre la fuente CSS, export público. Fix de implementación durante los tests: `untracked()` en el effect de exclusividad (sin él, el effect del item expandido trackeaba el expanded de sus hermanos y re-imponía su exclusividad colapsando al recién abierto).
- [x] 4.2 Suite completa verde: `pnpm -F @romanmartinidev/components test` (186/186).

**Criterio**: cada scenario cubierto (o su límite jsdom declarado); suite verde.

## 5. Story + showcase

- [x] 5.1 `accordion.stories.ts` (CSF 3, title `Components/Accordion`): Default (single), Multiple, DisabledSection, Nested, CustomHeadingLevel.
- [x] 5.2 Showcase del playground: ruta lazy `/accordion` con single (default), multi, sección disabled, accordion anidado y referencia de teclado en el hint, cada caso con snippet copiable + entrada `accordion` en `SHOWCASE_ENTRIES` (CA-013.9).
- [x] 5.3 `pnpm -F playground build-storybook`, `pnpm -F playground test` (9/9) y `pnpm -F playground build` pasan; **pendiente de ojo del PO**: verificación manual de la animación de altura (incluido colapso del padre con hijo expandido) y reduced-motion — límite jsdom declarado.

**Criterio**: stories compilan; vista del showcase funcional; verificación manual anotada para el PO.

## 6. Validación de cierre

- [x] 6.1 `pnpm openspec validate components-add-accordion --strict`, `pnpm lint` y `pnpm format:check` pasan (fix: Prettier sobre accordion-item.html/.ts).
- [x] 6.2 `pnpm -r build` y `pnpm -r test` pasan (11 + 186 + 9 = 206).
- [x] 6.3 Auditoría **`/ng:review`** sobre `src/lib/accordion/` — 0 altas, 0 medias, 1 baja; **aplicada**: template inline del contenedor extraído a `accordion.html` con `templateUrl` (consistencia con radio-group/tabs). Excepciones de consistencia del repo documentadas por el review (naming de handlers por evento, clases con prefijo `ds-` estilo DsMenu) — sin cambios. Build + tests re-verificados (186/186).
- [x] 6.4 `npm pack --dry-run`: tarball limpio (7 archivos, solo dist + README, sin `*.spec.ts`/`*.stories.ts`).
- [x] 6.5 Changeset único `.changeset/add-accordion.md` con **minor** de components (familia DsAccordion) y **minor** de tokens (`component.accordion.*`). Lockstep (ADR-015). **Sin publicar** (veto del PO 2026-07-19 vigente).
- [x] 6.6 Commits aprobados por el PO: docs `3a55dfe` (propose) y feat `9847921` (implementación completa).

**Criterio**: automáticos verdes; gates resueltos; changeset correcto; aprobación explícita antes del commit.

## 7. ADR + archive

- [x] 7.1 Evaluado con el PO (2026-07-20): **sin ADR por ahora** — primer colapsable del kit; el patrón (grid `0fr→1fr` + reduced-motion) se promueve a ADR cuando un segundo componente lo repita (D-005). Documentado en design.md archivado y en el catálogo.
- [x] 7.2 Movido a `archive/aaa-026-components-add-accordion/`; frontmatter `archived: 2026-07-20` + spec base `components-package` sincronizada (ADDED autocontenido).
- [x] 7.3 Registros: `openspec/README.md` (línea de IDs en vuelo eliminada), catálogo en `docs/architecture/README.md`, grooming del BACKLOG (Accordion sale de Now; `components-add-breadcrumbs` — HU-014 — promovido a Now; changesets 4→5), HU-013 → Hecha con CAs tildados, EP-002 actualizado (2/5).
- [x] 7.4 `pnpm openspec validate --all` pasa.
- [x] 7.5 Commit del archive propuesto y aprobado por el PO (2026-07-20).

**Criterio**: change archivado, spec base sincronizada, ADR resuelto, registros al día.

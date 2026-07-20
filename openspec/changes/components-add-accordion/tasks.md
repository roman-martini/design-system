# Tasks — aaa-026 — Accordion de contenido colapsable (DsAccordion)

Cada tarea es ≤2 h con criterio binario. Diseño: API contenedor+item con header proyectado (design §1), registro scoped por instancia (§2), heading por `role`/`aria-level` (§3), animación grid `0fr→1fr` (§4), disabled y chevron (§5), tokens (§6).

## 1. Pre-flight

- [ ] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan (11 + 175 + 9 = 195).
- [ ] 1.2 Confirmar que no se necesita polyfill nuevo en `test-setup.ts` (sin Popover/dialog; jsdom no computa layout — la animación queda para verificación visual, límite declarado).

**Criterio**: baseline verde; límites jsdom conocidos antes de empezar.

## 2. Tokens

- [ ] 2.1 Crear `packages/tokens/src/component/accordion.json` según la tabla del design §6 (header, panel, borde, motion) referenciando semantic/primitives; sin raws salvo justificado y documentado.
- [ ] 2.2 Build + test de tokens verdes. **Gate de contraste ejecutado** (`node .claude/skills/check-a11y/scripts/contrast.mjs --pairs-inline '...'` contra `packages/tokens/dist`): sin pares nuevos previstos, se verifica igual header text/bg y panel text/bg en light y dark; si algo falla, parar y escalar al PO (D-008).

**Criterio**: tokens nuevos emitidos; jerarquía ADR-003 respetada; pares verificados o escalados.

## 3. Componente

- [ ] 3.1 `accordion/` — `DsAccordion` (contenedor: `multiple` default false, `headingLevel` default 3, registro `DsAccordionItemRegistration` anti-ciclo, exclusividad single escribiendo el model de hermanos — idempotente, design §Risks) + ids únicos con contador módulo (patrón radio-group).
- [ ] 3.2 `DsAccordionItem` — `expanded` como `model()` two-way, `disabled` (ADR-011: focusable + `aria-disabled` + guarda); template: `role="heading"` + `aria-level` → `<button aria-expanded aria-controls>` con `<ng-content select="[dsAccordionHeader]" />` + chevron estático `LucideChevronDown` (`aria-hidden`, rotación CSS); panel `role="region"` + `aria-labelledby` con `<ng-content />`.
- [ ] 3.3 Teclado entre headers de la instancia: ↑/↓ con wrap (sin saltear disabled — descubribilidad), Home/End; verificación de scoping con anidado (el hijo no navega ni registra en el padre).
- [ ] 3.4 Animación: panel grid `0fr→1fr` con transición tokenizada, wrapper interno `min-height: 0; overflow: hidden` + `visibility` discreta (colapsado = fuera de AT y tab order), bloque `prefers-reduced-motion` (cambio instantáneo).
- [ ] 3.5 CSS 100% tokenizado (`component.accordion.*` + semantic); `export * from './lib/accordion';` en `public-api.ts`; build APF verde; typings exportan `DsAccordion`, `DsAccordionItem` (+ `DsAccordionItemRegistration`).

**Criterio**: compila y buildea; API pública = 2 clases; cero hardcodes; anidados sin código especial (scoping por inyección).

## 4. Tests de comportamiento (`accordion.spec.ts`)

- [ ] 4.1 Un test por scenario del delta: estructura (heading level, button aria-expanded/aria-controls, region aria-labelledby), toggle (click/Enter/Space) con contenido colapsado fuera de tab order, exclusividad single + independencia multi, models controlados de dos items sin rebote, teclado ↑/↓/Home/End con wrap sin saltear disabled, disabled con guarda, anidado (exclusividad/teclado/headingLevel independientes), no-hardcodes + reduced-motion sobre la fuente CSS, export público. Límite jsdom declarado: animación de altura → playground.
- [ ] 4.2 Suite completa verde: `pnpm -F @romanmartinidev/components test`.

**Criterio**: cada scenario cubierto (o su límite jsdom declarado); suite verde.

## 5. Story + showcase

- [ ] 5.1 `accordion.stories.ts` (CSF 3, title `Components/Accordion`): Default (single), Multiple, DisabledSection, Nested, CustomHeadingLevel.
- [ ] 5.2 Showcase del playground: ruta lazy `/accordion` con single (default), multi, sección disabled, accordion anidado y referencia de teclado en el hint, cada caso con snippet copiable + entrada `accordion` en `SHOWCASE_ENTRIES` (CA-013.9).
- [ ] 5.3 `pnpm -F playground build-storybook`, `pnpm -F playground test` y `pnpm -F playground build` pasan; **pendiente de ojo del PO**: verificación manual de la animación de altura (incluido colapso del padre con hijo expandido) y reduced-motion — límite jsdom declarado.

**Criterio**: stories compilan; vista del showcase funcional; verificación manual anotada para el PO.

## 6. Validación de cierre

- [ ] 6.1 `pnpm openspec validate components-add-accordion --strict`, `pnpm lint` y `pnpm format:check` pasan.
- [ ] 6.2 `pnpm -r build` y `pnpm -r test` pasan.
- [ ] 6.3 Auditoría **`/ng:review`** sobre `src/lib/accordion/` — 0 hallazgos altos o medios (los que salgan se aplican o se justifican por escrito).
- [ ] 6.4 `npm pack --dry-run`: tarball limpio (solo dist + README, sin `*.spec.ts`/`*.stories.ts`).
- [ ] 6.5 Changeset único `.changeset/add-accordion.md` con **minor** de components (familia DsAccordion) y **minor** de tokens (`component.accordion.*`). Lockstep (ADR-015). **Sin publicar** (veto del PO 2026-07-19 vigente).
- [ ] 6.6 Proponer mensaje de commit (split docs/feat como la tanda anterior) y **esperar OK del PO**.

**Criterio**: automáticos verdes; gates resueltos; changeset correcto; aprobación explícita antes del commit.

## 7. ADR + archive

- [ ] 7.1 Evaluar con el PO la promoción a ADR del patrón de colapsable animado (grid `0fr→1fr` + reduced-motion) si quedó reutilizable para futuros Disclosure/Tree (proposal §Impact); registrar en `decisions-log.md` si se crea.
- [ ] 7.2 Mover a `archive/aaa-026-components-add-accordion/`; frontmatter `archived` + spec base `components-package` sincronizada (ADDED autocontenido).
- [ ] 7.3 Registros: `openspec/README.md` (línea de IDs en vuelo eliminada), catálogo en `docs/architecture/README.md`, grooming del BACKLOG (Accordion sale de Now; `components-add-breadcrumbs` — HU-014 — promovido a Now), HU-013 → Hecha con CAs tildados, EP-002 actualizado.
- [ ] 7.4 `pnpm openspec validate --all` pasa.
- [ ] 7.5 Commit del archive propuesto y aprobado por el PO.

**Criterio**: change archivado, spec base sincronizada, ADR resuelto, registros al día.

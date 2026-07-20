# Tasks — aaa-024 — Skeleton de contenido en carga (DsSkeleton)

Cada tarea es ≤2 h con criterio binario. Diseño: API mínima con host bindings (design.md §1), host único sin template (§2), defaults por shape + tokens (§3), pulso apagable (§4).

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan (11 + 148 + 9).

**Criterio**: baseline verde.

## 2. Tokens

- [x] 2.1 Crear `packages/tokens/src/component/skeleton.json` según la tabla del design §3: `bg` → `{semantic.color.bg.disabled}`, `radius` → `{semantic.radius.sm}`, `circle-radius` → `{semantic.radius.full}`, `text-height` `1em` raw, `rect-height` → `{dimension.64}`, `circle-size` → `{dimension.40}`, `duration-pulse` `2000ms` raw, `pulse-opacity` → `{opacity.60}`.
- [x] 2.2 Build + test de tokens verdes (11/11): 8 vars `--ds-component-skeleton-*` emitidas. Gate de contraste: sin pares nuevos (decorativo no textual; solo se referencia el semantic theme-aware `bg.disabled`, sin tocar color).

**Criterio**: tokens nuevos emitidos; jerarquía ADR-003 respetada; gate sin regresión.

## 3. Componente

- [x] 3.1 `skeleton/` (`skeleton.ts/.css` + `index.ts`, template vacío inline): `DsSkeleton` standalone + OnPush, inputs `shape` (default `text`), `width`/`height`/`radius` (strings CSS, default `''`), type `DsSkeletonShape`; host con `aria-hidden="true"` estático, `[attr.data-shape]` y style bindings `width/height/borderRadius` con `|| null` (§1-2).
- [x] 3.2 CSS 100% tokenizado (§3-4): `:host` con bg/radius/animación, defaults por `:host([data-shape])`, `@keyframes ds-skeleton-pulse` (opacity `1 → pulse-opacity → 1`, `duration-pulse`, ease-in-out de tokens) y bloque `@media (prefers-reduced-motion: reduce)` con `animation: none`.
- [x] 3.3 `export * from './lib/skeleton';` en `public-api.ts`; build APF verde; typings del rollup exportan `DsSkeleton` + `DsSkeletonShape`.

**Criterio**: compila y buildea; API pública = componente + type; cero hardcodes.

## 4. Tests de comportamiento (`skeleton.spec.ts`)

- [x] 4.1 Un test por scenario (8 tests) del delta: shapes por `data-shape` + defaults tokenizados en CSS, overrides inline (`width/height/radius` presentes y ausentes), `aria-hidden` sin role ni texto, pulso/reduced-motion y no-hardcodes con assert sobre la fuente CSS por `readFileSync` (mismo criterio y límite jsdom que aaa-023), export público.
- [x] 4.2 Suite completa verde: `pnpm -F @romanmartinidev/components test` (156/156).

**Criterio**: cada scenario cubierto (o su límite jsdom declarado); suite verde.

## 5. Story + showcase

- [x] 5.1 `skeleton.stories.ts` (+ Default) (CSF 3, title `Components/Skeleton`): Shapes (los 3), Paragraph (composición multilínea), CardDemo (compuesta sin componente nuevo), CustomDimensions.
- [x] 5.2 Showcase del playground (utilidades `.playground__stack`/`__skeleton-card` nuevas en styles.css, tokenizadas): ruta lazy `/skeleton` con los 3 shapes, párrafo por composición, card compuesta, patrón del contenedor que anuncia la carga y nota de reduced-motion, cada caso con snippet copiable (CA-010.6; requirement "Showcase navegable" ya lo contrata — sin delta).
- [x] 5.3 `pnpm -F playground build-storybook` y `pnpm -F playground test` pasan (9/9); **pendiente de ojo del PO**: verificación manual del pulso y del apagado con emulación `prefers-reduced-motion` (límite jsdom).

**Criterio**: stories compilan; vista del showcase funcional; reduced-motion verificado a mano.

## 6. Validación de cierre

- [x] 6.1 `pnpm openspec validate components-add-skeleton --strict`, `pnpm lint`, `pnpm format:check` pasan (prettier reformateó design.md y el html del showcase en el camino).
- [x] 6.2 `pnpm -r build` y `pnpm -r test` pasan (11 + 156 + 9).
- [x] 6.3 Auditoría **`/ng:review`** sobre `src/lib/skeleton/` — **0 hallazgos** (0/0/0). Excepciones declaradas y aceptadas, todas documentadas en design.md: `template: ''` inline (host único decorativo, §2), asserts de CSS por readFileSync (límite jsdom, precedente aaa-023), `100%`/`1em` raw no tokenizables (§3). Tokens sin referencias huérfanas.
- [x] 6.4 `npm pack --dry-run`: tarball sin `*.spec.ts`/`*.stories.ts` (7 archivos, solo dist + README).
- [x] 6.5 Changeset único `.changeset/add-skeleton.md` con **minor** de components (DsSkeleton) y **minor** de tokens (`component.skeleton.*`). Lockstep (ADR-015).
- [ ] 6.6 Proponer mensaje de commit (implementación) y esperar OK del usuario.

**Criterio**: automáticos verdes; gates resueltos; changeset correcto; aprobación explícita antes del commit.

## 7. Archive

- [ ] 7.1 Confirmar sin ADR: reduced-motion apaga (no reemplaza) — 1 caso de cada patrón, sin convención que formalizar (design §4).
- [ ] 7.2 Mover a `archive/aaa-024-components-add-skeleton/`; frontmatter `archived`; sincronizar spec base `components-package` (ADDED autocontenido).
- [ ] 7.3 Registros: `openspec/README.md` (IDs en vuelo + próximo ID → `aaa-025`), catálogo en `docs/architecture/README.md`, grooming del BACKLOG (**cierra la tanda 1 de D-009** — el disparador "Tanda 1 completa" de EP-002/D-009 se reevalúa con el PO), HU-010 → Hecha con CAs tildados, EP-002 actualizado.
- [ ] 7.4 `pnpm openspec validate --all` pasa.
- [ ] 7.5 Proponer commit del archive y esperar OK.

**Criterio**: change archivado, spec base sincronizada, registros al día.

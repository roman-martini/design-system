# Tasks — aaa-032 — Card contenedor (familia DsCard)

Cada tarea es ≤2 h con criterio binario. Diseño: API presentacional (design §1), sub-partes como componentes con selector híbrido (§2), spacing del contenedor (§3), variantes/padding por tokens (§4).

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan.

**Criterio**: baseline verde.

## 2. Tokens

- [x] 2.1 Extender `packages/tokens/src/component/card.json` (existente del bootstrap) **solo aditivamente** según la tabla del design §4: `gap` → `{semantic.space.md}` y `shadow-elevated` → `{semantic.shadow.card-hover}`. Ningún token existente se renombra ni cambia de valor (nombres publicados).
- [x] 2.2 Build + test de tokens verdes: vars `--ds-component-card-*` emitidas (existentes + 2 nuevas). Gate de contraste: sin pares nuevos (el diff no toca tokens de color de texto/fondo interactivos).

**Criterio**: tokens nuevos emitidos; jerarquía ADR-003 respetada; gate sin regresión.

## 3. Familia de componentes

- [x] 3.1 `card/` (`card.ts/.html/.css` + `index.ts`): `DsCard` standalone + OnPush, inputs `variant` (default `outline`) y `padding` (default `comfortable`); host con `data-variant`/`data-padding`; layout flex column con `gap` tokenizado (design §3).
- [x] 3.2 Sub-partes: `DsCardHeader`/`DsCardContent`/`DsCardFooter` (elemento) y `DsCardTitle`/`DsCardDescription` (selector híbrido `ds-card-title, [dsCardTitle]`), cada una componente con template `<ng-content />` y estilos `:host` propios (design §2).
- [x] 3.3 CSS 100% tokenizado: variantes por `:host([data-variant])`, padding por `:host([data-padding])`; sin hardcodes.
- [x] 3.4 `export * from './lib/card';` en `public-api.ts`; build APF verde; typings exportan la familia + `DsCardVariant`/`DsCardPadding`.

**Criterio**: compila y buildea; API pública = familia + 2 types; cero hardcodes.

## 4. Tests de comportamiento (`card.spec.ts`)

- [x] 4.1 Un test por scenario del delta: variantes/padding (`data-*` + vars en CSS fuente), sub-partes opcionales (con y sin), uso híbrido (`<ds-card-title>` y `<h2 dsCardTitle>` re-proyectan 1:1), heading preservado (el `<h2>` sigue en el DOM con su nivel), host sin `role`, no-hardcodes por CSS fuente (límite jsdom declarado: sombras/gap reales se verifican en playground), export público.
- [x] 4.2 Suite completa de components verde.

**Criterio**: cada scenario cubierto (o su límite jsdom declarado); suite verde.

## 5. Story + showcase

- [x] 5.1 `card.stories.ts` (CSF 3, title `Components/Card`): Default (outline), Variants (3), Paddings (2), FullStructure (header/title/description/content/footer) y CookieSettings (composición con `ds-switch`… si aún no existe, con `ds-checkbox` y nota).
- [x] 5.2 Showcase del playground (registro tipado de aaa-022): ruta lazy `/card` reproduciendo la vista Cookie Settings de la referencia + variantes y paddings, cada caso con snippet copiable (CA-019.7; el requirement "Showcase navegable" de playground-app ya lo contrata — sin delta).
- [x] 5.3 `pnpm -F playground build-storybook` y `pnpm -F playground test` pasan. **Pendiente de ojo del PO**: verificación visual de radius/sombras/gap contra la referencia (límite jsdom).

**Criterio**: stories compilan; vista del showcase funcional; visual verificado a mano.

## 6. Validación de cierre

- [x] 6.1 `pnpm openspec validate components-add-card --strict`, `pnpm lint`, `pnpm format:check` pasan.
- [x] 6.2 `pnpm -r build` y `pnpm -r test` pasan.
- [x] 6.3 Auditoría `/ng:review` sobre `src/lib/card/` — 0 altas, 0 medias, 7 bajas, **todas corregidas**: 6 templates inline extraídos a `.html` (convención templateUrl del repo) y `border-width` tokenizado (`card.border-width` → `{dimension.1}`, patrón de checkbox/input/select). Excepciones legítimas verificadas por el auditor contra design.md §2 (selector híbrido) y precedente aaa-023 (CSS por readFileSync).
- [x] 6.4 `npm pack --dry-run`: tarball sin `*.spec.ts`/`*.stories.ts`.
- [x] 6.5 Changeset único con **minor** de components (familia `DsCard`) y **minor** de tokens (`component.card.*`). Lockstep (ADR-015).
- [x] 6.6 Commits autorizados por el PO ("ejecuta todo", 2026-07-22) — feat `6382233`.

**Criterio**: automáticos verdes; gates resueltos; changeset correcto; aprobación explícita antes del commit.

## 7. Archive

- [x] 7.1 Sin ADR nuevo salvo que el selector híbrido se repita en otra familia (patrón transversal).
- [x] 7.2 Mover a `archive/aaa-032-components-add-card/`; `status: archived` + fecha; **crear la spec base `component-card`** desde el delta ADDED (spec nueva, ADR-018) y sumarla al catálogo de specs.
- [x] 7.3 Registros: `openspec/README.md` (IDs en vuelo), catálogo en `docs/architecture/README.md`, grooming del BACKLOG (Card sale de Now; `components-button-variants` promovido a Now), HU-019 → Hecha con CAs tildados, EP-002 actualizado.
- [x] 7.4 `pnpm openspec validate --all` pasa.
- [x] 7.5 Commit del archive.

**Criterio**: change archivado, spec base creada, registros al día.

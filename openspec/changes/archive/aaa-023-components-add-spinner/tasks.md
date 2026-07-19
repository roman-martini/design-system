# Tasks — aaa-023 — Spinner de carga (DsSpinner)

Cada tarea es ≤2 h con criterio binario. Diseño: API mínima (design.md §1), SVG track+arco (§2), sizes por tokens (§3), animaciones con reduced-motion por reemplazo (§4), a11y con opt-out (§5).

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan (138 + 9 + tokens). Fix de infra en el camino: symlinks de pnpm rotos por el rename del directorio del repo (`agent-design-sistem` → `design-sistem`) — `pnpm install --force` los regeneró.

**Criterio**: baseline verde.

## 2. Tokens

- [x] 2.1 Crear `packages/tokens/src/component/spinner.json` según la tabla del design §3: `size-xs/sm/md/lg` → `{dimension.16/20/32/48}`, `stroke-xs/sm/md/lg` → `{dimension.2/2/3/4}`, `track-opacity` → `{opacity.25}`, `duration-spin` `800ms` raw documentado, `duration-pulse` `2000ms` raw documentado.
- [x] 2.2 Build + test de tokens verdes (11/11): vars `--ds-component-spinner-*` emitidas referenciando primitives. Gate de contraste: sin pares nuevos y **sin tocar ningún token de color** (el diff de tokens es solo `spinner.json` con dimensiones/opacidad/duraciones) — regresión imposible por construcción.

**Criterio**: tokens nuevos emitidos; jerarquía ADR-003 respetada; gate sin regresión.

## 3. Componente

- [x] 3.1 `spinner/` (`spinner.ts/.html/.css` + `index.ts`): `DsSpinner` standalone + OnPush, inputs `size` (default `md`) y `label` (default "Cargando"), type `DsSpinnerSize`; host con `data-size`; SVG interno `aria-hidden="true"` con círculo track (opacidad tokenizada) + arco `stroke-linecap="round"`, ambos `currentColor`, `vector-effect: non-scaling-stroke` + `pathLength="100"` (dasharray 75/25 independiente del size).
- [x] 3.2 A11y §5: `computed` del modo — `label` no vacío → `role="status"` + label visually-hidden (`.ds-spinner__label`); `label=""` → `aria-hidden="true"` en host sin role. Clase visually-hidden local en `spinner.css` (tokenizada con `dimension.1`).
- [x] 3.3 CSS 100% tokenizado: sizes/stroke por `:host([data-size])` + vars (§3), `@keyframes` de rotación (`duration-spin`, easing linear de tokens) y bloque `@media (prefers-reduced-motion: reduce)` que **reemplaza** la rotación por pulso de opacidad (`duration-pulse`, opacidades `opacity.100/40`) (§4).
- [x] 3.4 `export * from './lib/spinner';` en `public-api.ts`; build APF verde; typings del rollup exportan `DsSpinner` + `DsSpinnerSize`.

**Criterio**: compila y buildea; API pública = componente + type; cero hardcodes.

## 4. Tests de comportamiento (`spinner.spec.ts`)

- [x] 4.1 Un test por scenario del delta (10 tests): sizes por tokens (`data-size` + vars en CSS), sin inputs de color y stroke `currentColor`, `role="status"` + label default/custom visually-hidden, modo decorativo (`aria-hidden`, sin role, sin texto), SVG `aria-hidden`, animación/reduced-motion y no-hardcodes con assert sobre la fuente CSS por `readFileSync` (el plugin Angular de vitest intercepta imports `.css`, incluso `?raw`; límite jsdom declarado: la geometría real se verifica en playground, design §Risks), export público.
- [x] 4.2 Suite completa verde: `pnpm -F @romanmartinidev/components test` (148/148).

**Criterio**: cada scenario cubierto (o su límite jsdom declarado); suite verde.

## 5. Story + showcase

- [x] 5.1 `spinner.stories.ts` (CSF 3, title `Components/Spinner`): Default, Sizes (los 4), InsideButton (composición con `ds-button`, sin tocar `DsButton`), CustomLabel y Decorative.
- [x] 5.2 Showcase del playground (registro tipado de aaa-022): ruta lazy `/spinner` con los 4 sizes, caso embebido en botón por composición, caso de label/herencia de color y nota de reduced-motion, cada caso con snippet copiable vía `app-showcase-case` (CA-009.6; el requirement "Showcase navegable" de playground-app ya lo contrata — sin delta). Utilidad `.playground__success-context` nueva en `styles.css` (tokenizada).
- [x] 5.3 `pnpm -F playground build-storybook` y `pnpm -F playground test` pasan (9/9); **pendiente de ojo del PO**: verificación manual del pulso con emulación `prefers-reduced-motion` y geometría del arco en los 4 sizes (límite jsdom, design §Risks).

**Criterio**: stories compilan; vista del showcase funcional; reduced-motion verificado a mano.

## 6. Validación de cierre

- [x] 6.1 `pnpm openspec validate components-add-spinner --strict`, `pnpm lint`, `pnpm format:check` pasan (prettier reformateó el code fence del design.md en el camino).
- [x] 6.2 `pnpm -r build` y `pnpm -r test` pasan (11 + 148 + 9).
- [x] 6.3 Auditoría **`/ng:review`** sobre `src/lib/spinner/` — 0 altas, 0 medias, 1 baja: los asserts de CA-009.4/5 leen la fuente CSS (readFileSync) en vez de comportamiento DOM — **excepción aceptada**, documentada en design.md §Risks (jsdom no computa keyframes/media queries); sin cambios de código. Queries por `querySelector` = convención establecida del repo (sin @testing-library), no hallazgo.
- [x] 6.4 `npm pack --dry-run`: tarball sin `*.spec.ts`/`*.stories.ts` (7 archivos, solo dist + README).
- [x] 6.5 Changeset único `.changeset/add-spinner.md` con **minor** de components (DsSpinner) y **minor** de tokens (`component.spinner.*`). Lockstep (ADR-015).
- [x] 6.6 Mensaje de commit propuesto y aprobado por el PO — commits `6bbadc9` (propose) y `5ca0f04` (feat).

**Criterio**: automáticos verdes; gates resueltos; changeset correcto; aprobación explícita antes del commit.

## 7. Archive

- [x] 7.1 Sin ADR nuevo: el patrón "reduced-motion por reemplazo de animación" (design §4) solo se formaliza si Skeleton lo repite — nota dejada en el catálogo y en el item de Skeleton del BACKLOG.
- [x] 7.2 Movido a `archive/aaa-023-components-add-spinner/`; frontmatter `archived: 2026-07-19`; spec base `components-package` sincronizada (ADDED autocontenido).
- [x] 7.3 Registros: `openspec/README.md` (línea de IDs en vuelo eliminada; próximo ID ya en `aaa-024`), catálogo en `docs/architecture/README.md`, grooming del BACKLOG (Spinner sale de Now; `components-add-skeleton` promovido a Now; `components-button-loading` desbloqueado, sigue en Next por disparador), HU-009 → Hecha con CAs tildados, EP-002 actualizado.
- [x] 7.4 `pnpm openspec validate --all` pasa (6/6; format:check verde tras prettier sobre el catálogo). En el camino se repuso la fila faltante de `DsToastService` en "Valor entregado" de EP-002 (omisión del archive de aaa-021).
- [x] 7.5 Commit del archive — el OK del PO al proponer los commits cubrió explícitamente el flujo completo ("después sigue el archive").

**Criterio**: change archivado, spec base sincronizada, registros al día.

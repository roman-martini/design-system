# Tasks — aaa-031 — Estado loading de DsButton

Cada tarea es ≤2 h con criterio binario. Diseño: API dos inputs (design §1), reemplazo con ancho congelado vs. loadingText (§2), guarda extendida (§3), aria-busy (§4), precedencia sobre disabled (§5).

> **Apply + archive ejecutados por decisión del PO** (2026-07-22), adelantados al disparador orgánico (proposal §Why). Change archivado; commit autorizado por el PO.

## 1. Pre-flight

- [x] 1.1 Baseline verde de partida: `pnpm -F @romanmartinidev/components test` (228/228) antes de tocar código.

**Criterio**: baseline verde.

## 2. Componente

- [x] 2.1 `button.ts`: inputs `loading` (default `false`) y `loadingText` (opcional). `computed` `showReason`/`ariaDisabled`/`loadingMode` con precedencia `loading` > `disabled` (design §5): mientras `loading()`, no se renderiza `disabledReason` ni `aria-disabled`.
- [x] 2.2 Guarda de click/teclado extendida (design §3): `if (this.disabled() || this.loading()) return;` — `clicked` no emite con `loading`; `type="button"` sin `disabled` nativo.
- [x] 2.3 `button.html`: `ds-spinner` (`size="xs"`, `label=""`) embebido por composición; `[attr.aria-busy]="loading() ? 'true' : null"`; wrapper `.ds-button__content` (opacity en modo replace) + `.ds-button__loading` con `loadingText` opcional (design §2). `imports: [DsSpinner]`.
- [x] 2.4 `button.css`: modo `replace` (contenido `opacity: 0` conserva ancho + spinner absoluto centrado) y modo `text` (contenido `display:none` + spinner/texto en flujo); 100% tokenizado, sin pares de contraste nuevos (`currentColor`).

**Criterio**: compila y buildea; API previa intacta; cero hardcodes; `public-api.ts` sin cambios (`DsButton` ya exportado). **OK**: `pnpm -F @romanmartinidev/components build` (APF verde).

## 3. Tests de comportamiento (`button.spec.ts`)

- [x] 3.1 9 tests nuevos (describe `loading`): `clicked` no emite con `loading`; focuseable sin `disabled` nativo; `aria-busy` presente/ausente; spinner embebido decorativo (`xs`, `aria-hidden`, sin role); modo `replace` (contenido presente, sin loading-text); modo `text` (loading-text renderizado); sin spinner/`data-loading`/`aria-busy` fuera de carga; precedencia sobre `disabled` (sin `aria-disabled`/reason); restablecimiento al apagar `loading`.
- [x] 3.2 Suite completa verde: `pnpm -F @romanmartinidev/components test` (237/237).

**Criterio**: cada scenario cubierto; suite verde.

## 4. Story + showcase

- [x] 4.1 `button.stories.ts`: `Loading`, `LoadingText` y `LoadingWhileDisabled` + `loading`/`loadingText` en argTypes/args.
- [x] 4.2 Showcase del playground: caso "Loading (estado async)" en `button-showcase` con demo interactivo (`saving` signal + `simulateSave()`), modo `loadingText` y precedencia sobre `disabled`, con snippet copiable (CA-017.8).
- [x] 4.3 `pnpm -F playground build-storybook` y `pnpm -r test` pasan (playground 9/9); `pnpm -r build` (playground bundle) verde. **Pendiente de ojo del PO**: verificación manual del cero layout shift y del anuncio `aria-busy` con SR (límite jsdom).

**Criterio**: stories compilan; vista del showcase funcional; layout/anuncio verificados a mano.

## 5. Validación de cierre

- [x] 5.1 `pnpm openspec validate components-button-loading --strict`, `pnpm lint`, `pnpm format:check` pasan (prettier reformateó 4 docs en el camino; corregida además una inconsistencia design.md: `opacity:0`, no `visibility:hidden`).
- [x] 5.2 `pnpm -r build` y `pnpm -r test` pasan (tokens 11 + components 237 + playground 9).
- [x] 5.3 Auditoría `/ng:review` sobre `src/lib/button/` — 0 altas, 0 medias, 1 baja (consistencia): `aria-busy` inline vs. `computed()`. **Corregido** (`ariaBusy = computed(...)`). Excepciones preexistentes declaradas (naming `onClick`, queries por `querySelector`) por consistencia de repo/stack.
- [x] 5.4 `npm pack --dry-run`: tarball de 11 archivos sin `*.spec.ts`/`*.stories.ts`.
- [x] 5.5 Changeset `.changeset/button-loading.md` con **minor** de components. `fixed` (ADR-015) versiona tokens en lockstep al release.
- [x] 5.6 Commit autorizado por el PO (2026-07-22).

**Criterio**: automáticos verdes; gates resueltos; changeset correcto; aprobación explícita antes del commit.

## 6. Archive

- [x] 6.1 Sin ADR nuevo (`loading` solo lo adopta `DsButton`). El refinamiento visual del botón se registró como **D-013** en `decisiones.md`.
- [x] 6.2 Movido a `archive/aaa-031-components-button-loading/`; `status: archived` + `archived: 2026-07-22`; spec base `component-button` sincronizada (Requirement ADDED promovido).
- [x] 6.3 Registros: `openspec/README.md` (línea IDs en vuelo eliminada), catálogo en `docs/architecture/README.md`, BACKLOG (item sale, Now vacío + changesets 9), HU-017 → Hecha con CAs tildados, EP-002 (tabla + valor entregado), D-013 en `decisiones.md`.
- [x] 6.4 `pnpm openspec validate --all` pasa (22/22).
- [x] 6.5 Commit de la entrega + archive (autorizado por el PO).

**Criterio**: change archivado, spec base sincronizada, registros al día.

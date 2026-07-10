# Tasks — aaa-014 — Componente DsModal

Cada tarea es ≤2 h y tiene criterio de aceptación binario. Diseño: `<dialog>` nativo (design.md §1), sin stack manager (§2).

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan.
- [x] 1.2 Verificar soporte de `<dialog>` en el jsdom del workspace: `showModal()`, atributo `open`, eventos `cancel`/`close`. Si falta algo, activar la mitigación de design.md §7 (spy/mock + eventos sintéticos) — documentar cuál rama aplicó.
- [x] 1.3 Confirmar tokens necesarios en `dist/tokens.css`: `--ds-component-modal-*`, `--ds-semantic-motion-transition-overlay-*`, `--ds-semantic-effect-blur-overlay`, `--ds-semantic-color-bg-overlay`.

**Criterio**: baseline verde; estrategia de test del dialog decidida y anotada; tokens confirmados.

## 2. Fix de jerarquía en tokens

- [x] 2.1 `packages/tokens/src/component/modal.json`: `overlay-bg` → `{ "value": "{semantic.color.bg.overlay}" }`.
- [x] 2.2 `pnpm -F @romanmartinidev/tokens build`: `dist/tokens.css` emite `--ds-component-modal-overlay-bg: var(--ds-semantic-color-bg-overlay)`.
- [x] 2.3 `pnpm -F @romanmartinidev/tokens test` pasa.

**Criterio**: referencia en vez de valor crudo; valor resuelto idéntico; tests verdes.

## 3. Dependencia Lucide en components (ADR-012 §2)

- [x] 3.1 `packages/components/package.json`: `"@lucide/angular": "^1.23.0"` en `peerDependencies` **y** `devDependencies`; `pnpm install`.
- [x] 3.2 Verificar que `ng-packagr` no bundlea la dependencia (build de components + inspección de `dist/package.json`).
- [x] 3.3 README de components: sección de instalación con la peer nueva y su motivo (Modal la consume).

**Criterio**: peer declarada; build APF limpio; README actualizado.

## 4. Componente DsModal

- [x] 4.1 Crear `packages/components/src/lib/modal/modal.ts`: standalone, OnPush, signals — `open` (model), `size`, `heading`, `closeLabel`, `closeOnEscape`, `closeOnOverlay`; `viewChild` del dialog; `effect` de sincronización `open()` ↔ `showModal()`/`close()`; handlers de `cancel`, `close` y click-en-backdrop (design.md §3); `headingId` con contador de módulo; scroll lock con contador de módulo (design.md §5). Importa `LucideX`.
- [x] 4.2 Crear `modal.html`: `<dialog>` con `aria-labelledby` condicional; wrapper interno que absorbe clicks; header (heading + botón X `LucideX` 16/1.5 con `aria-label`); `<ng-content />` (cuerpo); `<ng-content select="[ds-modal-footer]" />`.
- [x] 4.3 Crear `modal.css`: sizes vía `var(--ds-component-modal-size-*)` (con clamp a viewport), radius/padding/bg/shadow/tipografía vía tokens component; animación fade+scale con `@starting-style` + `transition-behavior: allow-discrete` y duraciones asimétricas enter/exit (design.md §4); `::backdrop` con bg.overlay + blur; bloque `prefers-reduced-motion`.
- [x] 4.4 Crear `index.ts` (`export { DsModal, type DsModalSize } from './modal';`) y sumar `export * from './lib/modal';` a `public-api.ts`.
- [x] 4.5 `pnpm -F @romanmartinidev/components build` pasa (APF verde con el componente nuevo).

**Criterio**: componente compila y buildea; estructura ADR-010; cero valores hardcodeados en CSS.

## 5. Tests de comportamiento (`modal.spec.ts`)

- [x] 5.1 Abre y cierra vía `[(open)]` (model sincronizado en ambas direcciones).
- [x] 5.2 ESC cierra con `closeOnEscape` default; NO cierra con `false` (model intacto).
- [x] 5.3 Click en backdrop cierra con `closeOnOverlay` default; NO cierra con `false`; click en el contenido interno nunca cierra.
- [x] 5.4 Botón X: presente, `aria-label` = `closeLabel`, svg `aria-hidden`, cierra y actualiza el model.
- [x] 5.5 `heading` renderiza `<h2>` con id y el dialog lo referencia por `aria-labelledby`.
- [x] 5.6 Sizes: cada `size` aplica el ancho del token esperado (inspección de clase/estilo).
- [x] 5.7 Scroll lock: abre → `body` bloqueado; cierra/destruye → restaurado; dos modales → restaura solo al cerrar el último.
- [x] 5.8 `pnpm -F @romanmartinidev/components test` pasa (50 previos + nuevos).

**Criterio**: cada scenario del spec delta cubierto; suite verde.

## 6. Story + playground

- [x] 6.1 `modal.stories.ts` (CSF 3): Default (heading + cuerpo + footer con acciones), Sizes, SinHeading (documenta la responsabilidad a11y del consumidor), NoDismissible (`closeOnEscape/closeOnOverlay` en false).
- [x] 6.2 Playground: sección "Modal" con botón que abre un modal de confirmación (usa `[(open)]`, heading, footer con `ds-button`).
- [x] 6.3 `pnpm -F playground build-storybook` y `pnpm -F playground test` pasan.

**Criterio**: stories compilan; demo funcional en playground.

## 7. Validación de cierre

- [x] 7.1 `pnpm openspec validate components-add-modal --strict` pasa.
- [x] 7.2 `pnpm lint` y `pnpm format:check` pasan.
- [x] 7.3 `pnpm -r build` y `pnpm -r test` pasan.
- [x] 7.4 `npm pack --dry-run` en components: el tarball incluye el modal compilado, sin `*.stories.ts`/`*.spec.ts`, y `dist/package.json` declara la peer de Lucide.
- [x] 7.5 Changesets: **minor** de `@romanmartinidev/components` (DsModal + peer Lucide) y **patch** de `@romanmartinidev/tokens` (fix referencia overlay-bg).
- [ ] 7.6 Proponer mensaje de commit y esperar OK del usuario.

**Criterio**: automáticos verdes; changesets correctos; aprobación explícita antes del commit.

## 8. ADR + archive

- [ ] 8.1 Crear **ADR-013** "Overlays modales sobre `<dialog>` nativo (top layer)": opciones dialog nativo / CDK / manual; consecuencia sobre la jerarquía z-index (top layer la ignora; el token queda para overlays no-top-layer); patrón para Drawer y overlays futuros. Estado `Aceptado`.
- [ ] 8.2 Fila en `docs/architecture/decisions-log.md`.
- [ ] 8.3 Mover a `archive/aaa-014-components-add-modal/`; frontmatter `archived`; sincronizar specs base (`components-package` Requirement ADDED; `design-tokens-package` Requirement MODIFIED).
- [ ] 8.4 Registros: `openspec/README.md` (próximo ID), catálogo en `docs/architecture/README.md`, BACKLOG (Modal sale; **anotar disparadores activados**: `/ds:add-component` con 3 changes add-component archivados y `/ds:check-a11y` con 5 componentes).
- [ ] 8.5 `pnpm openspec validate --all` pasa.
- [ ] 8.6 Proponer commit del archive y esperar OK.

**Criterio**: change archivado, ADR-013 aceptado, specs base sincronizadas, disparadores del backlog anotados.

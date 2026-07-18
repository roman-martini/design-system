# Tasks — aaa-021 — Sistema de toasts (DsToastService)

Cada tarea es ≤2 h con criterio binario. Diseño: service + provider públicos, DOM interno (design.md §1), popover manual solo-capa (§2), stack (§3), timers con remaining (§4), a11y (§5), tokens y anatomía (§6), fix de status borders (§7).

## 1. Pre-flight

- [ ] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan.
- [ ] 1.2 Confirmar polyfill de Popover API en `test-setup.ts` (aaa-016) y fake timers para los timers pausables.

**Criterio**: baseline verde; estrategia de test confirmada.

## 2. Tokens

- [ ] 2.1 **Fix status borders** (§7, ejecuta `tokens-fix-status-borders`): `semantic/color.json` `border.success/warning/info` → `*-500`; `theme/dark.json` → `*-400`. Ningún componente publicado los consume hoy (verificado en aaa-017) — sin regresión.
- [ ] 2.2 Crear `packages/tokens/src/component/toast.json` según la tabla del design §6 (`bg`, `text`, `border-width`, `radius`, `shadow`, `padding-x/y`, `gap`, `offset`, `width` raw documentado, `duration` raw documentado).
- [ ] 2.3 Build + test de tokens; **gate de contraste por script**: `border.<status>` sobre `bg.surface` y sobre `bg.elevated` ≥ 3:1 en los 4 themes (scenario nuevo del delta).

**Criterio**: fix aplicado y verificado por cálculo; tokens nuevos emitidos referenciando semantic/primitives.

## 3. Service + contenedor + item

- [ ] 3.1 Contrato público en `toast.ts` + `index.ts`: `DsToastService`, `provideDsToasts`, types (§1). Config por `InjectionToken` interno con defaults (`bottom-right`, `dismissLabel: 'Cerrar'`).
- [ ] 3.2 `toast-container.ts/.html/.css` (interno, no exportado): creación perezosa (`createComponent` + append a body), `popover="manual"`, `showPopover()`/`hidePopover()` según stack, `position: fixed` por `data-position` (4 valores), `column`/`column-reverse` según top/bottom, gap tokenizado.
- [ ] 3.3 `toast-item.ts/.html/.css` (interno): anatomía §6 (borde de variante, icono ADR-012 `aria-hidden`, mensaje, acción opcional, X con `aria-label`), `role="status"`/`"alert"` por variante, CSS 100% tokenizado con motion de overlay + `prefers-reduced-motion`.
- [ ] 3.4 Timers §4: auto-dismiss con default tokenizado, `duration` custom, `0` persistente, danger sin timer, pausa/reanudación con remaining por hover y foco, limpieza total en dismiss/destroy.
- [ ] 3.5 `export * from './lib/toast';` en `public-api.ts`; build APF verde; `npm pack --dry-run` sin exponer contenedor/item en typings públicos.

**Criterio**: compila y buildea; API pública = service + provider + types; cero hardcodes.

## 4. Tests de comportamiento (`toast.spec.ts`)

- [ ] 4.1 Un test por scenario del delta (fake timers): show/atajos + dismiss por ref, posición por provider y default (sin posición por toast), auto-dismiss + pausa hover/foco + remaining, `duration: 0`, danger persistente con botón siempre, acción (callback + cierre + sin robo de foco), roles status/alert, aria-label del cierre, stack de 3 con reacomodo, popover show/hide del contenedor, estilos por tokens, internos no exportados.
- [ ] 4.2 Suite completa verde: `pnpm -F @romanmartinidev/components test`.

**Criterio**: cada scenario cubierto (o su límite jsdom declarado); suite verde.

## 5. Story + playground

- [ ] 5.1 `toast.stories.ts` (CSF 3, title `Components/Toast`): Variants (los 4), WithAction (Deshacer), Persistent (`duration: 0`), Positions (doc de provider), Stack.
- [ ] 5.2 Playground: sección de toasts con disparadores por variante + **verificación manual del top layer sobre un `DsModal` abierto** (límite jsdom, scenario CA-008.6).
- [ ] 5.3 `pnpm -F playground build-storybook` y `pnpm -F playground test` pasan.

**Criterio**: stories compilan; demo funcional; top layer verificado a mano.

## 6. Validación de cierre

- [ ] 6.1 `pnpm openspec validate components-add-toast --strict`, `pnpm lint`, `pnpm format:check` pasan.
- [ ] 6.2 `pnpm -r build` y `pnpm -r test` pasan.
- [ ] 6.3 Auditoría **`/ng:review`** sobre `src/lib/toast/` — sin altas/medias, o excepción justificada con aviso al PO.
- [ ] 6.4 `npm pack --dry-run`: tarball sin `*.spec.ts`/`*.stories.ts`.
- [ ] 6.5 Changesets: **minor** de components (DsToastService) y **minor** de tokens (`component.toast.*` + fix status borders). Lockstep → 0.3.0.
- [ ] 6.6 Proponer mensaje de commit (implementación) y esperar OK del usuario.

**Criterio**: automáticos verdes; gate resuelto; changesets correctos; aprobación explícita antes del commit.

## 7. Archive

- [ ] 7.1 Sin ADR nuevo previsto; si la service como entry point destapa una decisión de patrón (providers del kit), evaluarla como ADR antes de archivar.
- [ ] 7.2 Mover a `archive/aaa-021-components-add-toast/`; frontmatter `archived`; sincronizar specs base (components ADDED + tokens MODIFIED, texto autocontenido).
- [ ] 7.3 Registros: `openspec/README.md` (próximo ID → `aaa-022`), catálogo, grooming del BACKLOG (Toast sale de Now; `tokens-fix-status-borders` ya eliminado al proponer; promover Spinner a Now), HU-008 → Hecha con CAs tildados, EP-002 actualizado.
- [ ] 7.4 `pnpm openspec validate --all` pasa.
- [ ] 7.5 Proponer commit del archive y esperar OK.

**Criterio**: change archivado, specs base sincronizadas, registros al día.

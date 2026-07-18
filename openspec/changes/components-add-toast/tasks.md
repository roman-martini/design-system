# Tasks — aaa-021 — Sistema de toasts (DsToastService)

Cada tarea es ≤2 h con criterio binario. Diseño: service + provider públicos, DOM interno (design.md §1), popover manual solo-capa (§2), stack (§3), timers con remaining (§4), a11y (§5), tokens y anatomía (§6), fix de status borders (§7).

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan (138 tests).
- [x] 1.2 Confirmar polyfill de Popover API en `test-setup.ts` (aaa-016) y fake timers para los timers pausables.

**Criterio**: baseline verde; estrategia de test confirmada.

## 2. Tokens

- [x] 2.1 **Fix status borders** (§7, ejecuta `tokens-fix-status-borders`): `semantic/color.json` `border.success → green.600`, `warning → yellow.700`, `info → teal.600` (el `*-500` supuesto por el BACKLOG falló el cálculo — design §7); `theme/dark.json` → `*-400`. Ningún componente publicado los consume hoy (verificado en aaa-017) — sin regresión.
- [x] 2.2 Crear `packages/tokens/src/component/toast.json` según la tabla del design §6 (`bg`, `text`, `border-width`, `radius`, `shadow` → `semantic.shadow.toast` preexistente, `padding-x/y`, `gap`, `offset`, `width` raw documentado, `duration` raw documentado).
- [x] 2.3 Build + test de tokens; **gate de contraste por script**: `border.<status>` sobre `bg.surface` y sobre `bg.elevated` ≥ 3:1 en los 4 themes — PASS (light 3.3-4.92, dark 5.47-11.71; par `toast.text/bg` 14.5-17.9).

**Criterio**: fix aplicado y verificado por cálculo; tokens nuevos emitidos referenciando semantic/primitives.

## 3. Service + contenedor + item

- [x] 3.1 Contrato público en `toast.ts` + `index.ts`: `DsToastService`, `provideDsToasts`, types (§1). Config por `InjectionToken` interno con defaults (`bottom-right`, `dismissLabel: 'Cerrar'`).
- [x] 3.2 `toast-container.ts/.html/.css` (interno, no exportado): creación perezosa (`createComponent` + append a body), `popover="manual"`, `showPopover()`/`hidePopover()` según stack, `position: fixed` por `data-position` (4 valores), `column`/`column-reverse` según top/bottom, gap tokenizado.
- [x] 3.3 `toast-item.ts/.html/.css` (interno): anatomía §6 (borde de variante, icono ADR-012 `aria-hidden`, mensaje, acción opcional, X con `aria-label`), `role="status"`/`"alert"` por variante, CSS 100% tokenizado con motion de overlay + `prefers-reduced-motion`.
- [x] 3.4 Timers §4: auto-dismiss con default tokenizado (lectura de CSS var con fallback 5000, patrón tooltip), `duration` custom, `0` persistente, danger sin timer, pausa/reanudación con remaining por hover y foco (flags `hovered`/`focused` combinados), limpieza total en dismiss/destroy.
- [x] 3.5 `export * from './lib/toast';` en `public-api.ts`; build APF verde; typings del rollup verificados: exporta service + provider + 6 types; `DsToastEntry` declarado sin exportar; contenedor/item ausentes.

**Criterio**: compila y buildea; API pública = service + provider + types; cero hardcodes.

## 4. Tests de comportamiento (`toast.spec.ts`)

- [x] 4.1 Un test por scenario del delta (fake timers): show/atajos + dismiss por ref, posición por provider y default (sin posición por toast), auto-dismiss + pausa hover/foco + remaining, `duration: 0`, danger persistente con botón siempre, acción (callback + cierre + sin robo de foco), roles status/alert, aria-label del cierre, iconos decorativos, stack de 3 con reacomodo, popover show/hide del contenedor, internos no exportados — 15 tests.
- [x] 4.2 Suite completa verde: `pnpm -F @romanmartinidev/components test` (138/138).

**Criterio**: cada scenario cubierto (o su límite jsdom declarado); suite verde.

## 5. Story + playground

- [x] 5.1 `toast.stories.ts` (CSF 3, title `Components/Toast`): Variants (los 4), ActionAndStack (Deshacer + ráfaga + persistente), TopRightPosition (provider vía `applicationConfig`). Host demo interno: la API es una service.
- [x] 5.2 Playground: sección de toasts con disparadores por variante + acción, y botón dentro del `DsModal` para la **verificación manual del top layer** (límite jsdom, scenario CA-008.6) — pendiente de ojo del PO al levantar la app.
- [x] 5.3 `pnpm -F playground build-storybook` y `pnpm -F playground test` pasan.

**Criterio**: stories compilan; demo funcional; top layer verificado a mano.

## 6. Validación de cierre

- [x] 6.1 `pnpm openspec validate components-add-toast --strict`, `pnpm lint`, `pnpm format:check` pasan. Fix de infra en el camino: `CHANGELOG.md` agregado a `.prettierignore` — los genera el bot de changesets sin pasar por hooks y rompían `format:check` en main desde el release.
- [x] 6.2 `pnpm -r build` y `pnpm -r test` pasan (11 + 138 + 4).
- [x] 6.3 Auditoría **`/ng:review`** sobre `src/lib/toast/` — 0 altas, 1 media y 3 bajas, **todas aplicadas**: `entries` encapsulado con `.asReadonly()`, handlers renombrados por acción (`setPausedByHover/Focus`, `runAction`), `@default never;` para exhaustividad del switch de variantes (con `@let` para narrowing), queries del spec por accesible name. Re-verificado: build + 138/138 + lint + format verdes.
- [x] 6.4 `npm pack --dry-run`: tarball sin `*.spec.ts`/`*.stories.ts` (7 archivos, solo dist + README).
- [x] 6.5 Changeset único con **minor** de components (DsToastService) y **minor** de tokens (`component.toast.*` + fix status borders). Lockstep → 0.3.0.
- [ ] 6.6 Proponer mensaje de commit (implementación) y esperar OK del usuario.

**Criterio**: automáticos verdes; gate resuelto; changesets correctos; aprobación explícita antes del commit.

## 7. Archive

- [ ] 7.1 Sin ADR nuevo previsto; si la service como entry point destapa una decisión de patrón (providers del kit), evaluarla como ADR antes de archivar.
- [ ] 7.2 Mover a `archive/aaa-021-components-add-toast/`; frontmatter `archived`; sincronizar specs base (components ADDED + tokens MODIFIED, texto autocontenido).
- [ ] 7.3 Registros: `openspec/README.md` (próximo ID → `aaa-022`), catálogo, grooming del BACKLOG (Toast sale de Now; `tokens-fix-status-borders` ya eliminado al proponer; promover Spinner a Now), HU-008 → Hecha con CAs tildados, EP-002 actualizado.
- [ ] 7.4 `pnpm openspec validate --all` pasa.
- [ ] 7.5 Proponer commit del archive y esperar OK.

**Criterio**: change archivado, specs base sincronizadas, registros al día.

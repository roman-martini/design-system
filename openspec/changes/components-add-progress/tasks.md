# Tasks — aaa-029 — Barra de progreso (DsProgress)

Cada tarea es ≤2 h con criterio binario. Diseño: API con `value: null` = indeterminada (design §1), ARIA de progressbar (§2), animaciones con reemplazo reduced-motion (§3), tokens con gate UI 3:1 (§4). **Cierra la tanda 2 (D-011).**

## 1. Pre-flight

- [ ] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan (11 + 219 + 9 = 239).
- [ ] 1.2 Sin polyfills ni harness nuevos (feedback puro): confirmado por diseño.

**Criterio**: baseline verde.

## 2. Tokens

- [ ] 2.1 Crear `packages/tokens/src/component/progress.json` según la tabla del design §4 (track, fill×3, sizes, value, motion; `indeterminate-duration` raw documentado).
- [ ] 2.2 Build + test de tokens verdes. **Gate ejecutado con nivel `ui` (3:1)**: fill-primary/track, fill-success/track, fill-danger/track en los 4 scopes; si un tono falla, fix local al component token (step más oscuro del primitive, precedente aaa-027) — semantic no se toca sin D-008.

**Criterio**: tokens emitidos; pares UI verificados o resueltos localmente.

## 3. Componente

- [ ] 3.1 `progress/` — `DsProgress`: inputs (`value` null=indeterminada, `max`, `size`, `tone`, `showValue`, `label` con opt-out `''`), `percent` computed con clamp `[0, max]` (max ≤ 0 degrada a vacía), `data-size`/`data-tone` en host.
- [ ] 3.2 Template: track `role="progressbar"` + `aria-valuemin/max` siempre, `aria-valuenow` solo determinada (valor clampeado), `aria-label` = label o null; fill con `width` por style binding; `<span>` de `showValue` solo determinada.
- [ ] 3.3 CSS: transición de width tokenizada (determinada), keyframes de desplazamiento (indeterminada), bloque `prefers-reduced-motion` con **pulso de opacidad** en indeterminada + transición apagada en determinada; sizes por `data-size`, tonos por `data-tone`; 100% tokenizado sin selectores de estado por descendencia desde `:host`.
- [ ] 3.4 `export * from './lib/progress';` en `public-api.ts`; build APF verde; typings exportan `DsProgress`, `DsProgressSize`, `DsProgressTone`.

**Criterio**: compila; API = 1 componente + 2 types; cero hardcodes.

## 4. Tests de comportamiento (`progress.spec.ts`)

- [ ] 4.1 Un test por scenario del delta: ARIA determinada (valuenow/min/max, clamp por arriba y por abajo, fill width), indeterminada (sin valuenow), label default/custom/opt-out, showValue (visible en determinada con redondeo, ausente en indeterminada), sizes y tonos por data-attributes, fuente CSS (keyframes + reduced-motion con pulso + no-hardcodes + sin `:host` de estado), export público.
- [ ] 4.2 Suite completa verde: `pnpm -F @romanmartinidev/components test`.

**Criterio**: cada scenario cubierto (límite jsdom: animación → playground); suite verde.

## 5. Story + showcase

- [ ] 5.1 `progress.stories.ts` (CSF 3, title `Components/Progress`): Default, ShowValue, Sizes, Tones, Indeterminate.
- [ ] 5.2 Showcase del playground: ruta lazy `/progress` con determinada interactiva (slider o botones de demo), `showValue`, sizes, tonos, indeterminada y la **guía "cuándo spinner, cuándo progress"** (CA-016.2/CA-016.9), cada caso con snippet + entrada en `SHOWCASE_ENTRIES`.
- [ ] 5.3 `pnpm -F playground build-storybook`, `pnpm -F playground test` y `pnpm -F playground build` pasan; **pendiente de ojo del PO**: animación indeterminada + pulso reduced-motion, transición de la determinada, tonos en light y dark.

**Criterio**: stories compilan; showcase funcional con la guía; verificación manual anotada.

## 6. Validación de cierre

- [ ] 6.1 `pnpm openspec validate components-add-progress --strict`, `pnpm lint` y `pnpm format:check` pasan.
- [ ] 6.2 `pnpm -r build` y `pnpm -r test` pasan.
- [ ] 6.3 Auditoría **`/ng:review`** sobre `src/lib/progress/` — 0 hallazgos altos o medios (los que salgan se aplican o se justifican por escrito).
- [ ] 6.4 `npm pack --dry-run`: tarball limpio.
- [ ] 6.5 Changeset único `.changeset/add-progress.md` con **minor** de components y **minor** de tokens. Lockstep (ADR-015). **Sin publicar** (veto vigente).
- [ ] 6.6 Proponer mensaje de commit (split docs/feat) y **esperar OK del PO**.

**Criterio**: automáticos verdes; gates resueltos; aprobación explícita antes del commit.

## 7. Archive — cierre de la tanda 2

- [ ] 7.1 Confirmar que no surgió nada one-way door; si surgió, ADR antes de archivar.
- [ ] 7.2 Mover a `archive/aaa-029-components-add-progress/`; frontmatter `archived` + spec base sincronizada.
- [ ] 7.3 Registros: `openspec/README.md`, catálogo, HU-016 → Hecha con CAs tildados, EP-002 actualizado (**tanda 2 completa 5/5**), foto táctica y hito H1 en `docs/product/README.md` (condición de salida: app real 100% con el DS — decisión del PO sobre cómo verificarla), grooming del BACKLOG (Progress sale de Now; **evaluar con el PO qué entra**: no hay más piezas de tanda en cola).
- [ ] 7.4 `pnpm openspec validate --all` pasa.
- [ ] 7.5 Commit del archive propuesto y aprobado por el PO.

**Criterio**: change archivado; tanda 2 registrada como completa; próximo paso del backlog decidido o anotado como decisión pendiente del PO.

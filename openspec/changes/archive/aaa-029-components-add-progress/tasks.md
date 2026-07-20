# Tasks — aaa-029 — Barra de progreso (DsProgress)

Cada tarea es ≤2 h con criterio binario. Diseño: API con `value: null` = indeterminada (design §1), ARIA de progressbar (§2), animaciones con reemplazo reduced-motion (§3), tokens con gate UI 3:1 (§4). **Cierra la tanda 2 (D-011).**

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan (11 + 219 + 9 = 239).
- [x] 1.2 Sin polyfills ni harness nuevos (feedback puro): confirmado por diseño.

**Criterio**: baseline verde.

## 2. Tokens

- [x] 2.1 Crear `packages/tokens/src/component/progress.json` según la tabla del design §4 (track, fill×3, sizes, value, motion; `indeterminate-duration` raw documentado).
- [x] 2.2 Build + test de tokens verdes (11/11, 15 vars; fix de build: el grupo `value` es keyword DTCG de Style Dictionary y rompía el typings — renombrado a `value-text`). **Gate ejecutado con nivel `ui` (3:1)**: los fills sobre `bg.*` fallaban en 8/12 pares (green.500/red.500 sin 3:1 sobre track claro; primary sin 3:1 en dark) → **fix local**: los fills referencian la familia `semantic.color.text.*` (link/success/danger), cuyo dual light/dark ya está calibrado para contraste (D-012) — re-verificado 12/12 PASS (3.07–5.54), sin tocar semantic ni themes.

**Criterio**: tokens emitidos; pares UI verificados o resueltos localmente.

## 3. Componente

- [x] 3.1 `progress/` — `DsProgress`: inputs (`value` null=indeterminada, `max`, `size`, `tone`, `showValue`, `label` con opt-out `''`), `percent` computed con clamp `[0, max]` (max ≤ 0 degrada a vacía), `data-size`/`data-tone` en host.
- [x] 3.2 Template: track `role="progressbar"` + `aria-valuemin/max` siempre, `aria-valuenow` solo determinada (valor clampeado), `aria-label` = label o null; fill con `width` por style binding; `<span>` de `showValue` solo determinada.
- [x] 3.3 CSS: transición de width tokenizada (determinada), keyframes de desplazamiento (indeterminada), bloque `prefers-reduced-motion` con **pulso de opacidad** en indeterminada + transición apagada en determinada; sizes por `data-size`, tonos por `data-tone`; 100% tokenizado sin selectores de estado por descendencia desde `:host`.
- [x] 3.4 `export * from './lib/progress';` en `public-api.ts`; build APF verde; typings exportan `DsProgress`, `DsProgressSize`, `DsProgressTone`.

**Criterio**: compila; API = 1 componente + 2 types; cero hardcodes.

## 4. Tests de comportamiento (`progress.spec.ts`)

- [x] 4.1 Un test por scenario del delta: ARIA determinada (valuenow/min/max, clamp por arriba y por abajo, fill width), indeterminada (sin valuenow), label default/custom/opt-out, showValue (visible en determinada con redondeo, ausente en indeterminada), sizes y tonos por data-attributes, fuente CSS (keyframes + reduced-motion con pulso + no-hardcodes + sin `:host` de estado), export público.
- [x] 4.2 Suite completa verde: `pnpm -F @romanmartinidev/components test`.

**Criterio**: cada scenario cubierto (límite jsdom: animación → playground); suite verde.

## 5. Story + showcase

- [x] 5.1 `progress.stories.ts` (CSF 3, title `Components/Progress`): Default, ShowValue, Sizes, Tones, Indeterminate.
- [x] 5.2 Showcase del playground: ruta lazy `/progress` con determinada interactiva (slider o botones de demo), `showValue`, sizes, tonos, indeterminada y la **guía "cuándo spinner, cuándo progress"** (CA-016.2/CA-016.9), cada caso con snippet + entrada en `SHOWCASE_ENTRIES`.
- [x] 5.3 `pnpm -F playground build-storybook`, `pnpm -F playground test` y `pnpm -F playground build` pasan; **pendiente de ojo del PO**: animación indeterminada + pulso reduced-motion, transición de la determinada, tonos en light y dark.

**Criterio**: stories compilan; showcase funcional con la guía; verificación manual anotada.

## 6. Validación de cierre

- [x] 6.1 `pnpm openspec validate components-add-progress --strict`, `pnpm lint` y `pnpm format:check` pasan.
- [x] 6.2 `pnpm -r build` y `pnpm -r test` pasan.
- [x] 6.3 Auditoría **`/ng:review`** — 0 altas, 1 media, 1 baja; **ambas aplicadas**: `opacity: var(--ds-opacity-100)` en el keyframe del pulso (consistencia con spinner) y binding de clase muerto del track eliminado. Excepciones deliberadas del design documentadas por el review — sin cambios. Re-verificado: build + 228/228 + lint + format.
- [x] 6.4 `npm pack --dry-run`: tarball limpio.
- [x] 6.5 Changeset único `.changeset/add-progress.md` con **minor** de components y **minor** de tokens. Lockstep (ADR-015). **Sin publicar** (veto vigente).
- [x] 6.6 Commits aprobados por el PO: docs `1b5fa8a` (propose) y feat `2cd87d4` (implementación completa).

**Criterio**: automáticos verdes; gates resueltos; aprobación explícita antes del commit.

## 7. Archive — cierre de la tanda 2

- [x] 7.1 Confirmado: nada one-way door (los fixes de tokens fueron locales al componente). Sin ADR.
- [x] 7.2 Movido a `archive/aaa-029-components-add-progress/`; frontmatter `archived: 2026-07-20` + spec base sincronizada (ADDED autocontenido).
- [x] 7.3 Registros: `openspec/README.md`, catálogo, HU-016 → Hecha con CAs tildados, EP-002 actualizado (**tanda 2 completa 5/5**), foto táctica y hito H1 en `docs/product/README.md` (condición de salida: app real 100% con el DS — decisión del PO sobre cómo verificarla), grooming del BACKLOG (Progress sale de Now; **evaluar con el PO qué entra**: no hay más piezas de tanda en cola).
- [x] 7.4 `pnpm openspec validate --all` pasa.
- [x] 7.5 Commit del archive propuesto y aprobado por el PO (2026-07-20). Tanda 2 completa.

**Criterio**: change archivado; tanda 2 registrada como completa; próximo paso del backlog decidido o anotado como decisión pendiente del PO.

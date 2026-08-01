# Tasks — aaa-044 — Slider (DsSlider)

Cada tarea es ≤2 h con criterio binario. Diseño: patrón híbrido (design §1), control autónomo (§2), extras opt-in (§3), tokens (§4).

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan (878 tests: 484 tokens, 362 components, 32 playground).
- [x] 1.2 Verificado empíricamente (spec descartable, eliminado): jsdom clampea `value` al rango como un navegador, resuelve custom properties inline por `getComputedStyle`, tiene `PointerEvent` y soporta `:focus-visible` en `matches()`. Los tests pueden ser conductuales, sin fallbacks por atributo.

**Criterio**: base verde; estrategia de test viable confirmada.

## 2. Tokens

- [x] 2.1 `component/slider.json` creado (33 vars emitidas en `dist/tokens.css`, jerarquía ADR-003 intacta, thumb themable por `{semantic.color.bg.surface}`). Sin token `focus-ring` propio: el kit pinta el foco con `--ds-semantic-shadow-focus` (patrón switch) y declararlo habría nacido huérfano.
- [x] 2.2 Ratios verificados con `contrast-cli` en los 4 themes: `fill-on-track` 4.1/3.98/5.54/**3.07**, `thumb-border-on-surface` y `thumb-bg-on-fill` ≥5, `tooltip-text` ≥17. **Hallazgo en el camino**: `{semantic.color.bg.primary}` como fill fallaba en dark (2.12 < 3); se resolvió con `{semantic.color.text.link}` (fill y thumb.border) — la misma cadena que usa el fill de `DsProgress`, que aclara en dark.
  - **Secuenciamiento de los pares**: los 4 pares van a `contrast-pairs.json` **en el commit de archive** (task 8.2), junto con la spec base — declararlos en el feat rompería la trazabilidad del gate (`specRef: component-slider` apuntaría a una spec inexistente hasta el archive). Slider es el primer componente que entra con el gate ya instalado; avatar no tuvo este timing.

**Criterio**: tokens emitidos con jerarquía intacta; ratios verificados verdes (pares al archive).

## 3. DsSlider — núcleo

- [x] 3.1 `lib/slider/slider.ts/.html/.css` según design §1/§2: CVA `number`, aliases con host limpio (`[attr.aria-label]: null` en host — evita `aria-prohibited-attr` de axe en el elemento genérico), `--ds-slider-pct` por computed, fórmula con corrección por ancho de thumb en `--_pos`, thumb nativo anulado por vendor pseudo-elements conservando su tamaño, focus por `--ds-semantic-shadow-focus` sobre el thumb visual, `disabled` nativo + reflejo en host, área interactiva `max(24px, thumb)`, `prefers-reduced-motion` anula las transiciones.
- [x] 3.2 `index.ts` + export en `public-api.ts` (orden alfabético); build APF verde.

**Criterio**: compila; slider mínimo funcional con teclado/pointer nativos y visual clavado al valor.

## 4. DsSlider — extras opt-in

- [x] 4.1 `showValue`: `<output for>` con `displayValue` (formateador o número), tabular-nums.
- [x] 4.2 `ticks`: marcas por `--ds-slider-tick-pct` con la misma fórmula, `aria-hidden`, labels opcionales; extremos con `transform: none` / `translateX(-100%)`; el host reserva espacio abajo solo si hay labels.
- [x] 4.3 `valueTooltip`: burbuja `aria-hidden` sobre el thumb (`--_pos`), visible con `input:focus-visible ~` y clase `--dragging` (pointerdown/up/cancel), sin `popover` ni DsTooltip; el host reserva espacio arriba.

**Criterio**: los tres extras apagados por default (DOM mínimo verificable); encendidos se comportan según spec.

## 5. Tests + story + showcase

- [x] 5.1 `slider.spec.ts`: 25 tests (core + extras + FormControl host + 2 aserciones de axe: default y con extras). El gate `axe-coverage` detecta el spec automáticamente (busca la invocación de `expectNoAxeViolations(`).
- [x] 5.2 `slider.stories.ts` CSF 3 (`Components/Slider`): Default, WithValue, WithTicks, WithTooltip, Disabled, Sizes.
- [x] 5.3 Showcase `/slider` (5 casos con snippets: referencia mínima, valor + Reactive Forms, ticks, tooltip, sizes/disabled) + entrada en `SHOWCASE_ENTRIES` tras switch.
- [x] 5.4 Suite completa verde: **904 tests** (tokens 484, components 387, playground 33 — el test del playground cubrió la ruta nueva solo); `storybook:build` y build del playground verdes.

**Criterio**: suite verde; showcase reproduce la referencia.

## 6. Validación de cierre

- [x] 6.1 `pnpm openspec validate components-add-slider --strict`, `pnpm lint`, `pnpm format:check` pasan.
- [x] 6.2 `pnpm -r build` y `pnpm -r test` pasan (904 tests).
- [x] 6.3 Auditoría `/ng:review` → `docs/design/reviews/2026-07-31-slider.md`: **0 altas, 0 medias, 2 bajas** (ref `#inputEl` muerta; fórmula de ticks duplicada en CSS) — ambas resueltas en el momento; 3 excepciones declaradas coherentes con el kit. Suite re-verificada tras los fixes.
- [x] 6.4 `npm pack --dry-run`: tarball sin `*.spec.ts`/`*.stories.ts`.
- [x] 6.5 `pnpm size` excedió como estaba previsto (D-031): **el slider costó 2.88 kB gzip** (43.22 → 46.10 tras la de-duplicación de la review; coherente con ~2.3 kB típicos + tres extras). Techo nuevo **48.41 kB** (46 100 × 1.05 = 48 405 → múltiplo de 10 B siguiente, regla de `CONTRIBUTING.md`); tabla actualizada con los medidos de hoy (tokens css 6.03, js 5.69 — bajo sus techos, que no se mueven). `pnpm size` verde.
- [x] 6.6 Changeset `add-slider.md`: **minor** de components + **minor** de tokens.
- [x] 6.7 Mensaje de commit propuesto con el peso medido; **OK del PO recibido el 2026-08-01** (el commit incluye la propuesta OpenSpec, diferida por decisión del PO).

**Criterio**: automáticos verdes; techo de bundle actualizado con el peso registrado; changeset correcto.

## 7. Gate visual del PO (D-022 — bloqueante)

- [x] 7.1 Slider renderizado revisado por el PO en el showcase (`/slider`, 5 casos + teclado + hover): **OK visual explícito del PO el 2026-08-01**.

**Criterio**: OK visual del PO registrado.

## 8. ADR + archive

- [x] 8.1 Patrón híbrido **promovido a ADR-023** (`ADR-023-controles-de-rango-hibridos.md`, 6 reglas con el slider como implementación de referencia) + fila en `decisions-log.md`.
- [x] 8.2 Movido a `archive/aaa-044-components-add-slider/` (`status: archived`, 2026-08-01); spec base `component-slider` creada desde el delta (con las referencias a design §1/§3 reapuntadas a ADR-023, que es el artefacto que sobrevive al archive; el bloque reduced-motion quedó descripto sobre thumb+burbuja, que es lo que la implementación transiciona). **Los 5 pares de contraste declarados en `contrast-pairs.json`** (`slider/fill-on-track`, `label`, `thumb-bg-on-fill`, `thumb-border-on-surface`, `tooltip-text`) — el secuenciamiento previsto en 2.2.
- [x] 8.3 Registros: `openspec/README.md` (aaa-044 fuera de IDs en vuelo), catálogos de specs y changes en `docs/architecture/README.md`, HU-025 → Hecha (11 CAs tildados), EP-002 (tanda 3 **7/7**, fila de valor entregado), README de producto (índice, tabla de HUs, hito H1, foto táctica, última entrega; corregido drift de "próximos IDs libres" D-029 → D-032), grooming del BACKLOG (slider sale; entra `playground-prototipo-h1` con disparador activado por D-023).
- [x] 8.4 `pnpm openspec validate --all` pasa (28 items); suite completa **924 tests** verdes (tokens 504 — incluye las 20 evaluaciones de los 5 pares nuevos —, components 387, playground 33); lint y format verdes.
- [x] 8.5 Mensaje de commit del archive propuesto al PO.

**Criterio**: change archivado, spec base creada, tanda 3 registrada como cerrada, registros al día.

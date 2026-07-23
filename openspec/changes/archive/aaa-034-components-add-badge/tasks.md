# Tasks — aaa-034 — Badge de estado (DsBadge)

Cada tarea es ≤2 h con criterio binario. Diseño: API dos ejes (design §1), tokens subtle/outline semantic + solid primitive (§2), mapa tono×apariencia (§3), sizing (§4), CSS por `data-*` (§5).

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan.

## 2. Tokens

- [x] 2.1 `semantic/color.json` + `theme/dark.json`: agregar `bg.neutral-subtle` (`neutral.100` light / `neutral.800` dark) — completa el set de tonos.
- [x] 2.2 Crear `packages/tokens/src/component/badge.json`: sizing por `size-sm/md/lg` (padding-x/y, font-size, radius, gap, icon-size, dot-size) + por tono los slots `subtle-bg`/`text`/`outline-border`/`solid-bg`/`solid-text` según el mapa del design §3 (subtle/outline → semantic; solid → primitives).
- [x] 2.3 Build de tokens + **gate de contraste**: las 18 combinaciones `tone × appearance` AA en los 4 themes. **Gate 18 combos × 4 themes: 18/18 verde**. success solid green.700 (5.02), info solid teal.700 (5.47), warning solid texto oscuro (11.71); primary-subtle usó text.link-hover para pasar dark (4.07→5.74). Cero regresiones.

**Criterio**: tokens emitidos; jerarquía ADR-003 (subtle/outline semantic, solid primitive); gate 18/18 verde con ratios registrados.

## 3. Componente

- [x] 3.1 `badge/` (`badge.ts/.html/.css` + `index.ts`): `DsBadge` standalone + OnPush; inputs `tone`/`appearance`/`size`/`icon`/`dot`; host con `data-tone`/`data-appearance`/`data-size`; `computed` de precedencia ícono>dot.
- [x] 3.2 `badge.html`: leading `ds-icon`/Lucide (`aria-hidden`) o `<span class="ds-badge__dot">` (aria-hidden) + `<ng-content />`.
- [x] 3.3 `badge.css`: combinaciones `:host([data-appearance][data-tone])` + sizing por `[data-size]`; dot con color del tono; 100% tokenizado.
- [x] 3.4 `export * from './lib/badge';` en `public-api.ts`; build APF verde; typings exportan `DsBadge` + 3 types.

**Criterio**: compila y buildea; API = componente + 3 types; cero hardcodes.

## 4. Tests de comportamiento (`badge.spec.ts`)

- [x] 4.1 Un test por scenario del delta: defaults (`neutral`/`subtle`/`md`), reflejo de los 3 `data-*`, ícono vs dot (precedencia + `aria-hidden`), sin `role`, tokens/no-hardcodes por CSS fuente, export público.
- [x] 4.2 Suite completa de components verde.

**Criterio**: cada scenario cubierto (o su límite jsdom declarado); suite verde.

## 5. Story + showcase

- [x] 5.1 `badge.stories.ts`: Matrix (tono × apariencia), Sizes, WithIcon, WithDot, InContext (roles del team de la referencia).
- [x] 5.2 Showcase del playground (registro tipado): ruta `/badge` con la matriz completa, sizes, ícono/dot y el ejemplo de roles, snippets copiables (CA-021.7).
- [x] 5.3 `pnpm -F playground build-storybook` y `pnpm -F playground test` pasan. **Pendiente de ojo del PO**: verificación visual de la matriz y los tonos.

**Criterio**: stories compilan; showcase funcional; visual verificado a mano.

## 6. Validación de cierre

- [x] 6.1 `pnpm openspec validate components-add-badge --strict`, `pnpm lint`, `pnpm format:check` pasan.
- [x] 6.2 `pnpm -r build` y `pnpm -r test` pasan.
- [x] 6.3 Auditoría `/ng:review` sobre `src/lib/badge/` — 0 altas, 2 medias, 2 bajas, **todas corregidas**: directiva `DsBadgeIcon` que fuerza `aria-hidden` en el ícono proyectado; precedencia ícono>dot (`dotVisible` computed) + tests; `border-width` tokenizado. Excepciones (queries por clase, CSS por readFileSync) ratificadas por consistencia del repo.
- [x] 6.4 `npm pack --dry-run`: tarball sin `*.spec.ts`/`*.stories.ts`.
- [x] 6.5 Changeset único con **minor** de components (DsBadge) y **minor** de tokens (semantic neutral + `component.badge.*`). Lockstep (ADR-015).
- [x] 6.6 Commit del feat autorizado por el PO (modo "ejecuta todo").

**Criterio**: automáticos verdes; gate 18/18; changeset correcto.

## 7. Archive

- [x] 7.1 Sin ADR nuevo — ADR-019 (estrenado por este change) ya cubre el patrón; el semantic neutral es aditivo reversible.
- [x] 7.2 Mover a `archive/aaa-034-components-add-badge/`; `status: archived` + fecha; crear la spec base `component-badge` desde el delta.
- [x] 7.3 Registros: `openspec/README.md`, catálogo de changes y specs en `docs/architecture/README.md`, grooming del BACKLOG (Badge sale; `components-add-switch` promovido), HU-021 → Hecha, EP-002 al día.
- [x] 7.4 `pnpm openspec validate --all` pasa.
- [x] 7.5 Commit del archive.

**Criterio**: change archivado, spec base creada, registros al día.

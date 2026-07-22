# Tasks — aaa-033 — Variantes outline y danger de DsButton

Cada tarea es ≤2 h con criterio binario. Diseño: union plano (design §1), bloques component por variante (§2), D-016 en semantic (§3), CSS por `[data-variant]` con estados transversales (§4).

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan.

**Criterio**: baseline verde.

## 2. Tokens

- [x] 2.1 `semantic/color.json` (D-016): default `bg.danger/hover/active` → `{color.red.600/700/800}`; `theme/dark.json` corre su cadena aclarando → `{color.red.500/400/300}` (corrección del gate, ver 2.3).
- [x] 2.2 `component/button.json`: bloques aditivos `outline`, `danger-outline`, `danger-ghost` según la tabla del design §2. El bloque `danger` existente no se toca.
- [x] 2.3 Build + test de tokens verdes; **gate de contraste**: 9 pares × 4 scopes, todos pasan — danger base 4.83/4.83/4.83/4.76, hover 6.47/…/4.76→6.48, active 8.31/…/6.48, borde danger-outline 3.76 (ui), regresiones cero. **El gate corrigió la premisa de dark**: base red.600 daba 3.71 ✗ → la cadena dark aclara un paso (500/400/300), registrado en design §3 y D-016.

**Criterio**: tokens emitidos; D-016 aplicada; gate verde con ratios registrados.

## 3. Componente

- [x] 3.1 `button.ts`: ampliar `DsButtonVariant` con los 4 valores nuevos (API previa intacta).
- [x] 3.2 `button.css`: 4 bloques `[data-variant='…']` con los selectores de interacción existentes (`:not([aria-disabled])`/`:not([data-loading])`); cero CSS nuevo para disabled/loading (transversales).
- [x] 3.3 Build APF verde.

**Criterio**: compila; variantes visibles; sin hardcodes.

## 4. Tests de comportamiento (`button.spec.ts`)

- [x] 4.1 Un test por scenario del delta: `data-variant` refleja los 4 valores nuevos; CSS fuente contiene los tokens por variante; disabled + loading operativos en `danger` (guarda + aria).
- [x] 4.2 Suite completa de components verde.

**Criterio**: cada scenario cubierto; suite verde.

## 5. Story + showcase

- [x] 5.1 `button.stories.ts`: Variants ampliada (7) + DangerStates (hover/disabled/loading).
- [x] 5.2 Showcase de Button en playground: caso "Variantes" con las 7 y caso danger con disabled/loading, snippets copiables (CA-020.6).
- [x] 5.3 `pnpm -F playground build-storybook` y `pnpm -F playground test` pasan. **Pendiente de ojo del PO**: verificación visual de las variantes contra la referencia.

**Criterio**: stories compilan; showcase funcional; visual verificado a mano.

## 6. Validación de cierre

- [x] 6.1 `pnpm openspec validate components-button-variants --strict`, `pnpm lint`, `pnpm format:check` pasan.
- [x] 6.2 `pnpm -r build` y `pnpm -r test` pasan.
- [x] 6.3 Auditoría `/ng:review` sobre `src/lib/button/` — 0 altas, 0 medias, 1 baja **corregida** (story `DangerStates` recibía `args` sin consumirlos → ahora explícita con `controls: disable`). Excepción de CSS-fuente por readFileSync ratificada como extensión del precedente aaa-023.
- [x] 6.4 `npm pack --dry-run`: tarball sin `*.spec.ts`/`*.stories.ts`.
- [x] 6.5 Changeset único con **minor** de components (variantes) y **minor** de tokens (D-016 + bloques). Lockstep (ADR-015).
- [x] 6.6 Commits autorizados por el PO (modo "ejecuta todo" del loop de la tanda 3).

**Criterio**: automáticos verdes; gate resuelto; changeset correcto.

## 7. Archive

- [ ] 7.1 Sin ADR nuevo (tokens reversibles + variantes aditivas; D-016 registra la decisión).
- [ ] 7.2 Mover a `archive/aaa-033-components-button-variants/`; `status: archived` + fecha; delta ADDED promovido a la spec base `component-button`.
- [ ] 7.3 Registros: `openspec/README.md`, catálogo en `docs/architecture/README.md`, grooming del BACKLOG (item sale; `components-add-badge` promovido a Now), HU-020 → Hecha con CAs tildados, EP-002 al día.
- [ ] 7.4 `pnpm openspec validate --all` pasa.
- [ ] 7.5 Commit del archive.

**Criterio**: change archivado, spec base sincronizada, registros al día.

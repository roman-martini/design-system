# Tasks — aaa-033 — Variantes outline y danger de DsButton

Cada tarea es ≤2 h con criterio binario. Diseño: union plano (design §1), bloques component por variante (§2), D-016 en semantic (§3), CSS por `[data-variant]` con estados transversales (§4).

## 1. Pre-flight

- [ ] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan.

**Criterio**: baseline verde.

## 2. Tokens

- [ ] 2.1 `semantic/color.json` (D-016, default only): `bg.danger` → `{color.red.600}`, `danger-hover` → `{color.red.700}`, `danger-active` → `{color.red.800}`. `theme/dark.json` intacto.
- [ ] 2.2 `component/button.json`: bloques aditivos `outline`, `danger-outline`, `danger-ghost` según la tabla del design §2. El bloque `danger` existente no se toca.
- [ ] 2.3 Build + test de tokens verdes; **gate de contraste por script**: pares danger nuevos AA en los 4 themes y cero regresión en pares existentes (registrar ratios).

**Criterio**: tokens emitidos; D-016 aplicada; gate verde con ratios registrados.

## 3. Componente

- [ ] 3.1 `button.ts`: ampliar `DsButtonVariant` con los 4 valores nuevos (API previa intacta).
- [ ] 3.2 `button.css`: 4 bloques `[data-variant='…']` con los selectores de interacción existentes (`:not([aria-disabled])`/`:not([data-loading])`); cero CSS nuevo para disabled/loading (transversales).
- [ ] 3.3 Build APF verde.

**Criterio**: compila; variantes visibles; sin hardcodes.

## 4. Tests de comportamiento (`button.spec.ts`)

- [ ] 4.1 Un test por scenario del delta: `data-variant` refleja los 4 valores nuevos; CSS fuente contiene los tokens por variante; disabled + loading operativos en `danger` (guarda + aria).
- [ ] 4.2 Suite completa de components verde.

**Criterio**: cada scenario cubierto; suite verde.

## 5. Story + showcase

- [ ] 5.1 `button.stories.ts`: Variants ampliada (7) + DangerStates (hover/disabled/loading).
- [ ] 5.2 Showcase de Button en playground: caso "Variantes" con las 7 y caso danger con disabled/loading, snippets copiables (CA-020.6).
- [ ] 5.3 `pnpm -F playground build-storybook` y `pnpm -F playground test` pasan. **Pendiente de ojo del PO**: verificación visual de las variantes contra la referencia.

**Criterio**: stories compilan; showcase funcional; visual verificado a mano.

## 6. Validación de cierre

- [ ] 6.1 `pnpm openspec validate components-button-variants --strict`, `pnpm lint`, `pnpm format:check` pasan.
- [ ] 6.2 `pnpm -r build` y `pnpm -r test` pasan.
- [ ] 6.3 Auditoría `/ng:review` sobre `src/lib/button/` — 0 altas, 0 medias; hallazgos menores resueltos o documentados.
- [ ] 6.4 `npm pack --dry-run`: tarball sin `*.spec.ts`/`*.stories.ts`.
- [ ] 6.5 Changeset único con **minor** de components (variantes) y **minor** de tokens (D-016 + bloques). Lockstep (ADR-015).
- [ ] 6.6 Commits autorizados por el PO (modo "ejecuta todo" del loop de la tanda 3).

**Criterio**: automáticos verdes; gate resuelto; changeset correcto.

## 7. Archive

- [ ] 7.1 Sin ADR nuevo (tokens reversibles + variantes aditivas; D-016 registra la decisión).
- [ ] 7.2 Mover a `archive/aaa-033-components-button-variants/`; `status: archived` + fecha; delta ADDED promovido a la spec base `component-button`.
- [ ] 7.3 Registros: `openspec/README.md`, catálogo en `docs/architecture/README.md`, grooming del BACKLOG (item sale; `components-add-badge` promovido a Now), HU-020 → Hecha con CAs tildados, EP-002 al día.
- [ ] 7.4 `pnpm openspec validate --all` pasa.
- [ ] 7.5 Commit del archive.

**Criterio**: change archivado, spec base sincronizada, registros al día.

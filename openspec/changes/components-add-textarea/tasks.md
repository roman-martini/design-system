# Tasks — aaa-036 — Textarea (DsTextarea) + base compartida DsFieldBase

Cada tarea es ≤2 h con criterio binario. Diseño: base `@Directive()` (design §1), extends (§2), CSS field compartido (§3), tokens textarea (§4).

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan (baseline de Input a preservar).

## 2. Base + refactor de Input

- [x] 2.1 `lib/field/field-base.ts`: `@Directive()` abstracto `DsFieldBase implements ControlValueAccessor` con toda la lógica de field (models, inputs, aria aliases, CVA por `NgControl` self, IDs `fieldId`/`hintId`/`errorId`, `isInvalid`/`showError`/`describedBy`, `onInput`/`onBlur`) + type `DsFieldSize`.
- [x] 2.2 `lib/field/field.css`: clases `.ds-field__*` (label/control/hint/error/`--invalid`/`--disabled`/focus-within) reutilizando `component.input.*`.
- [x] 2.3 Refactor `DsInput`: `extends DsFieldBase`, deja solo `type`; `input.html` usa `.ds-field__*` + `<input>`; `styleUrls: ['../field/field.css', './input.css']` (input.css solo lo específico). **API pública intacta.**
- [x] 2.4 Suite de `DsInput` **100% verde** como red de no-regresión. Nota: el rename estructural `.ds-input__*` → `.ds-field__*` obligó a actualizar 5 _strings_ de selector en `input.spec.ts` (`querySelector`/`classList`); **cero aserciones tocadas** — todo el comportamiento (label/for, aria-describedby, two-way, FormControl, disabled) se verifica idéntico. Los IDs se comparan por elemento, no por literal, así que el rename `ds-input-*` → `ds-field-*` no los afecta.

**Criterio**: Input refactorizado sin cambio de API; base compartida en su lugar; tests de Input verdes.

## 3. DsTextarea

- [x] 3.1 `lib/textarea/` (`textarea.ts/.html/.css` + `index.ts`): `DsTextarea extends DsFieldBase`, agrega `rows` (default 3) y `resize` (`vertical` default | `none`, type `DsTextareaResize`); `textarea.html` = `.ds-field__*` + `<textarea [rows] [attr.data-resize]>`; `styleUrls: ['../field/field.css', './textarea.css']`.
- [x] 3.2 `textarea.css`: min-height + padding-y por `component.textarea.*`; `resize` por `[data-resize]`; sin `height` fijo.
- [x] 3.3 `export * from './lib/textarea';` en `public-api.ts` (DsTextarea + DsTextareaResize; NO DsFieldBase); build APF verde.

**Criterio**: compila y buildea; API = DsTextarea + type; base no exportada.

## 4. Tokens

- [x] 4.1 Crear `component/textarea.json`: `min-height` (`{dimension.80}`), `padding-y` (`{semantic.space.xs}`). Build de tokens verde. Sin pares de contraste nuevos (reutiliza el field de input, ya gateado).

**Criterio**: tokens emitidos; sin regresión.

## 5. Tests + showcase

- [x] 5.1 `textarea.spec.ts`: render `<textarea>` + rows; CVA (writeValue/onChange, `[formControl]` setValue/disable); label asociado + `aria-describedby` de error/hint; `data-resize`; no-hardcodes por CSS fuente; export público (y DsFieldBase NO exportada).
- [x] 5.2 `textarea.stories.ts` + showcase `/textarea`: campo Notes de la referencia (label + hint + estado error) y sizes, snippets copiables.
- [x] 5.3 `pnpm -r test` (Input + Textarea verdes), `build-storybook`, playground.

**Criterio**: suite verde (incl. Input sin regresión); showcase funcional.

## 6. Validación de cierre

- [x] 6.1 `pnpm openspec validate components-add-textarea --strict`, `pnpm lint`, `pnpm format:check` pasan.
- [x] 6.2 `pnpm -r build` y `pnpm -r test` pasan.
- [x] 6.3 Auditoría `/ng:review` sobre `src/lib/field/`, `src/lib/textarea/` y el diff de `input/` — 0 altas, 0 medias; hallazgos menores resueltos.
- [x] 6.4 `npm pack --dry-run`: tarball sin `*.spec.ts`/`*.stories.ts`.
- [x] 6.5 Changeset único con **minor** de components (DsTextarea + refactor interno de Input) y **minor** de tokens.
- [ ] 6.6 Commit del feat autorizado por el PO.

**Criterio**: automáticos verdes; Input sin regresión; changeset correcto.

## 7. Archive

- [ ] 7.1 **Crear ADR-020** (base compartida `DsFieldBase` para form fields): decisión + alternativas (multiline / duplicar / base) + regla para futuros form fields. Actualizar decisions-log.
- [ ] 7.2 Mover a `archive/aaa-036-components-add-textarea/`; `status: archived` + fecha; crear la spec base `component-textarea` desde el delta.
- [ ] 7.3 Registros: `openspec/README.md`, catálogo de changes/specs/ADRs en `docs/architecture/README.md`, grooming del BACKLOG (Textarea sale; `components-add-avatar` promovido), HU-024 → Hecha, EP-002 al día.
- [ ] 7.4 `pnpm openspec validate --all` pasa.
- [ ] 7.5 Commit del archive.

**Criterio**: change archivado, spec base + ADR-020 creados, registros al día.

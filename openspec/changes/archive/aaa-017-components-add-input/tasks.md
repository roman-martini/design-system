# Tasks — aaa-017 — Componente DsInput

Cada tarea es ≤2 h con criterio binario. Diseño: NgControl auto-registrado sin `NG_VALUE_ACCESSOR` (design.md §1), ids generados para las asociaciones (§2), slots pasivos (§3).

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan (98/98 post aaa-016).
- [x] 1.2 Confirmar tokens `component.input.*` en `dist/tokens.css` (existen desde el bootstrap).

**Criterio**: baseline verde; tokens presentes.

## 2. Fix de token

- [x] 2.1 `packages/tokens/src/component/input.json`: `text-placeholder` → `{semantic.color.text.secondary}` (2.52 → 7.81). **El gate destapó 2 fixes más**: `input.border` → `{semantic.color.border.strong}` (1.48 → 4.74 — único límite visible del field, mismo caso que el trigger de Select) y `semantic.color.border.danger` → `{color.red.500}` con override dark → `{color.red.400}` (border-error pasaba 2.77/2.16 → 3.76/6.48; fix a nivel semantic porque el token fallaba su propósito para cualquier consumidor futuro). Pendiente detectado para el archive: `border.success/warning/info` (400 light / 800 dark) tienen el mismo problema latente, sin consumidores aún.
- [x] 2.2 `pnpm -F @romanmartinidev/tokens build` + test; contraste por script de los pares del field (4 scopes) — todos en verde, exit 0.

**Criterio**: pares en verde calculados, no estimados.

## 3. Componente DsInput

- [x] 3.1 Crear `input.ts`: standalone, OnPush, signals — `value` (model string), `type` (`DsInputType`), `label`, `hint`, `error`, `placeholder`, `invalid` (input boolean | undefined), `disabled` (model), `size`; `aria-label`/`aria-labelledby` con alias reenviados al `<input>` (lección aaa-016); CVA por auto-registración (`inject(NgControl, { optional: true, self: true })`, `ngControl.valueAccessor = this`, **sin** provider `NG_VALUE_ACCESSOR`); `showError`/`isInvalid` derivados (`invalid()` override → NgControl `invalid && touched`); ids generados (`inputId`, `hintId`, `errorId`) y `describedBy` compuesto (error reemplaza hint).
- [x] 3.2 Crear `input.html`: `<label [for]>` condicional; wrapper `.ds-input__control` con `<ng-content select="[ds-input-prefix]" />` + `<input>` nativo (type, placeholder, disabled nativo, `aria-invalid`, `aria-describedby`) + suffix; hint/error condicionales (error con `aria-live="polite"` en su contenedor).
- [x] 3.3 Crear `input.css`: field por sizes vía `component.input.*` (height/padding-x/font-size), borde default/hover/focus (`:focus-within` + shadow focus)/error/disabled, label y helper con sus sub-tokens, slots alineados; transición de borde con bloque `prefers-reduced-motion`.
- [x] 3.4 `index.ts` + `export * from './lib/input';` en `public-api.ts`; `pnpm -F @romanmartinidev/components build` (APF verde).

**Criterio**: compila y buildea; estructura ADR-010; cero hardcodes; clasificación ADR-011 rama form control aplicada.

## 4. Tests de comportamiento (`input.spec.ts`)

- [x] 4.1 Un test por scenario del delta: CVA (tipeo → ctrl, setValue → input, disable → disabled nativo), label `for`/id, hint `aria-describedby`, `aria-label` reenviado, tipos en lista blanca, invalid automático (pristine sin error → touched+invalid con error, `aria-invalid`, mensaje visible, describedby cambia de hint a error), override `[invalid]` sin forms, slots prefix/suffix proyectados, export.
- [x] 4.2 Suite completa verde: `pnpm -F @romanmartinidev/components test` (83 previos + nuevos).

**Criterio**: cada scenario cubierto; suite verde.

## 5. Story + playground

- [x] 5.1 `input.stories.ts` (CSF 3, title `Components/Input`): Default (label + hint), Sizes, Types, WithFormControl (validación en vivo mostrando el invalid automático), WithPrefixSuffix (iconos ADR-012 `aria-hidden`, documentando el contrato pasivo), Disabled.
- [x] 5.2 Playground: sumar `ds-input` al form combinado (con Select/Checkbox) demostrando CVA + error automático.
- [x] 5.3 `pnpm -F playground build-storybook` y `pnpm -F playground test` pasan.

**Criterio**: stories compilan; demo funcional en el form del playground.

## 6. Validación de cierre

- [x] 6.1 `pnpm openspec validate components-add-input --strict`, `pnpm lint`, `pnpm format:check` pasan.
- [x] 6.2 `pnpm -r build` y `pnpm -r test` pasan.
- [x] 6.3 Auditoría **`/ng:review`** sobre `src/lib/input/` — **gate aprobado**: 0 altas, 0 medias, 2 bajas (naming de handlers por evento — patrón compartido por los 4 componentes del kit; decisión diferida al PO: formalizarlo como convención en `ng-stack-profile.md` o housekeeping que renombra en todo el kit). Excepciones de design.md verificadas una a una por el reviewer.
- [x] 6.4 `npm pack --dry-run`: tarball sin `*.spec.ts`/`*.stories.ts`, con input compilado.
- [x] 6.5 Changesets: **minor** de components (DsInput) y **patch** de tokens (fix placeholder).
- [x] 6.6 Proponer mensaje de commit (implementación) y esperar OK del usuario.

**Criterio**: automáticos verdes; gate de review resuelto; changesets correctos; aprobación explícita antes del commit.

## 7. Archive

- [x] 7.1 Sin ADR nuevo previsto: aplica ADRs existentes (011 rama form control, 012, 014 §5-analogía del reenvío). Si la implementación destapa una decisión one-way door, se crea en ese momento.
- [x] 7.2 Mover a `archive/aaa-017-components-add-input/`; frontmatter `archived`; sincronizar spec base `components-package` (1 Requirement ADDED, referencia a design.md convertida a texto autocontenido).
- [x] 7.3 Registros: `openspec/README.md` (próximo ID → `aaa-018`), catálogo en `docs/architecture/README.md`, grooming del BACKLOG (Input sale de Now; **promover el siguiente de la tanda D-009** — tooltip, ya desbloqueado), HU-005 → Hecha con CAs tildados, EP-002 actualizado.
- [x] 7.4 `pnpm openspec validate --all` pasa.
- [ ] 7.5 Proponer commit del archive y esperar OK.

**Criterio**: change archivado, spec base sincronizada, tanda D-009 avanzada.

# Design — components-add-textarea (aaa-036)

Decisiones técnicas del change. La decisión de base compartida se promueve a **ADR-020** al archivar.

## Context

`DsInput` es un field completo (label/hint/error/invalid, CVA por auto-registración de `NgControl`, IDs de a11y). Un `<textarea>` comparte **todo** ese wrapper y solo cambia el control. HU-024 fijó: extraer una base compartida `DsFieldBase` y construir `DsTextarea` encima, sin romper la API de `DsInput`.

## Goals / Non-Goals

**Goals:**

- Cero duplicación de la lógica de field (CVA, a11y, estado).
- `DsInput` sin cambio de API; tests de Input como red de no-regresión.
- Patrón reutilizable para futuros form fields.

**Non-Goals:**

- Auto-grow, contador de caracteres (backlog).
- Tocar la API pública de `DsInput`.

## Decisions

### 1. `DsFieldBase` — `@Directive()` abstracto

```ts
@Directive() // sin selector; abstracto; permite inputs/models heredables
export abstract class DsFieldBase implements ControlValueAccessor {
  readonly value = model<string>('');
  readonly disabled = model<boolean>(false);
  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly placeholder = input<string>('');
  readonly invalid = input<boolean | undefined>(undefined);
  readonly size = input<DsFieldSize>('md'); // 'sm' | 'md' | 'lg'
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });
  // IDs (fieldId/hintId/errorId), CVA (ngControl self-inject, writeValue/…/setDisabledState),
  // isInvalid()/showError()/describedBy(), onInput()/onBlur() — idénticos a los de DsInput hoy.
}
```

- `@Directive()` (no `@Component`): Angular reconoce inputs/models/host heredables solo si la base está decorada. Abstracta, sin selector.
- **CVA por auto-registración**: `inject(NgControl, { optional: true, self: true })` corre en el contexto de inyección del componente derivado (`self` = su propio injector) → funciona en `DsInput` y `DsTextarea` sin duplicar.
- El `id` genérico se llama `fieldId` (antes `inputId` en Input; el `<input>`/`<textarea>` lo consume por `[id]`).

### 2. `DsInput` y `DsTextarea` extienden la base

- `DsInput extends DsFieldBase` — agrega `type` (`DsInputType`); template `input.html` renderiza `<input [type]>`. **API idéntica** a hoy (mismos inputs públicos, ahora heredados).
- `DsTextarea extends DsFieldBase` — agrega `rows` (default 3) y `resize` (`vertical` default | `none`); template `textarea.html` renderiza `<textarea [rows] [attr.data-resize]>`.
- Ambos declaran su propio `providers`? No: la auto-registración de `NgControl` no usa `NG_VALUE_ACCESSOR`; la base se asigna `ngControl.valueAccessor = this` en el constructor (patrón de DsInput, sin ciclo de DI).

### 3. CSS de field compartido

- `lib/field/field.css` con clases `.ds-field__*` (label, control, hint, error, `--invalid`, `--disabled`, focus-within) reutilizando **tokens `component.input.*`** (son los tokens del look de field; renombrarlos a `component.field.*` sería breaking y queda fuera).
- `input.css` y `textarea.css` traen solo lo específico del control vía `styleUrls: ['../field/field.css', './input.css']` (sin duplicar el wrapper).
- **Diferencia clave input vs textarea**: el input tiene `height` por size; el textarea usa `min-height` (por `rows`) + padding vertical y `resize`. Eso vive en `textarea.css` + `component.textarea.*`.

### 4. Tokens `component.textarea.*` (nuevo, mínimo)

| Token        | Valor                         |
| ------------ | ----------------------------- |
| `min-height` | `{dimension.80}` (≈ 3 líneas) |
| `padding-y`  | `{semantic.space.xs}`         |

El resto (border, bg, radius, colores, label, hint, error, font por size) se reutiliza de `component.input.*`.

## Risks / Trade-offs

- [Refactor de `DsInput` publicado] → mitigado: cambio interno, API intacta; los tests de Input (writeValue/invalid/describedBy/etc.) deben seguir 100% verdes como red de no-regresión.
- [Tokens de field bajo el nombre `input`] → deuda menor de naming (los tokens del wrapper compartido se llaman `component.input.*`); renombrar a `field` es breaking, se difiere.
- [Clases `.ds-field__*` reemplazan `.ds-input__*`] → internas, sin contrato público; pre-1.0.

## Open Questions

(ninguna — HU-024 cerró forma, rows/resize, scope)

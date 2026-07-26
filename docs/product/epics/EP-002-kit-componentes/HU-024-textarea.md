---
epica: EP-002
actor: Dev consumidor
estado: Hecha (2026-07-26, aaa-036 components-add-textarea archivado — quinta entrega de la tanda 3; DsFieldBase extraída sin regresión de Input, /ng:review 1 media/2 bajas corregidas incl. staleness OnPush resuelta vía control.events, verificación visual del PO OK)
decisiones: [D-007, D-014, D-017]
adrs: [ADR-004, ADR-011, ADR-020]
---

# HU-024 — Textarea (dev consumidor)

**COMO** dev que arma formularios con texto largo (notas, comentarios, descripciones)
**QUIERO** una entrada multilínea accesible con label/hint/error
**PARA** capturar texto extenso con la misma calidad de a11y y validación que `DsInput`.

## Origen

Tanda 3 ([D-014](../../decisiones.md)), referencia [`moder-minimal`](../../../reference/components/moder-minimal/) img 2 (campo "Notes / Enter notes").

## Decisiones de refinamiento (PO, 2026-07-23)

1. **`DsTextarea` separado sobre una base compartida `DsFieldBase`** (D-017: cero duplicación, escalable) — se **extrae la lógica de field de `DsInput`** (CVA por auto-registración de `NgControl`, `model` `value`/`disabled`, inputs `label`/`hint`/`error`/`placeholder`/`invalid`/`size`, aliases `aria-label`/`aria-labelledby`, IDs de a11y, `isInvalid`/`showError`/`describedBy`, `onInput`/`onBlur`) a un `@Directive()` abstracto `DsFieldBase`. `DsInput` y `DsTextarea` lo **extienden**; cada uno aporta su control (`<input type>` / `<textarea rows>`) y su template. **La API pública de `DsInput` no cambia** (refactor interno; sus tests siguen verdes).
2. **CSS de field compartido** — clases `.ds-field__*` en un `field.css` que ambos usan (`styleUrls`), reutilizando los tokens `component.input.*` para el look del field; `component.textarea.*` (nuevo) solo para lo específico (min-height por `rows`, `resize`).
3. **Específicos de textarea**: `rows` (default 3), `resize` (`vertical` default | `none`). Auto-grow y contador de caracteres quedan **fuera de alcance** (backlog si aparece).
4. **Genera ADR-020 al archivar** — `DsFieldBase` es un patrón transversal (≥2 componentes: Input, Textarea, futuros form fields); se promueve a ADR al cerrar el change.

## Criterios de aceptación

<!-- Binarios: al implementar se vuelven scenarios del spec component-textarea (nuevo, ADR-018). -->

- [x] **CA-024.1 (base compartida)** — Dado `DsFieldBase` (`@Directive()` abstracto), entonces contiene la lógica de field (CVA por `NgControl` self, models, inputs, IDs, `isInvalid`/`describedBy`); `DsInput` la extiende **sin cambio de API** y su suite de tests sigue verde.
- [x] **CA-024.2 (DsTextarea)** — Dado `<ds-textarea>` (standalone, OnPush) que extiende `DsFieldBase`, entonces renderiza un `<textarea>` con `rows` (default 3), integrado a Forms (CVA por `NgControl`), con label/hint/error/invalid del field compartido.
- [x] **CA-024.3 (a11y)** — Dado un textarea con label/hint/error, entonces label asociado por `for`/`id`, `aria-invalid` cuando corresponde, `aria-describedby` apuntando a error (live region) o hint — idéntico a `DsInput`.
- [x] **CA-024.4 (resize y tokens)** — Dado `resize` `vertical` (default) | `none`, entonces se aplica; el field usa tokens `component.input.*` (compartidos) y `component.textarea.*` (min-height/padding); sin hardcodes ni hex.
- [x] **CA-024.5 (export)** — Dado `public-api.ts`, exporta `DsTextarea`, `DsTextareaResize` (y no expone `DsFieldBase`, que es interno).
- [x] **CA-024.6 (showcase)** — El showcase reproduce el campo Notes de la referencia con hint y estado de error, y muestra los sizes.

## Dependencias

- Refactoriza `DsInput` ([HU-005](HU-005-input-textfield.md)) extrayendo `DsFieldBase` — sin cambiar su API.

## Fuera de alcance

- Auto-grow (crecer con el contenido) y contador de caracteres — backlog si aparece caso.
- Rich text / markdown.

## Notas

- Change OpenSpec: `components-add-textarea` — introduce el spec `component-textarea` (ADR-018); `DsFieldBase` es infraestructura interna (sin spec propia); **genera ADR-020** (base de form fields) al archivar.
- Changeset **minor** de components (DsTextarea + refactor interno de Input) y **minor** de tokens (`component.textarea.*`). Lockstep (ADR-015).

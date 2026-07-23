---
'@romanmartinidev/components': minor
'@romanmartinidev/tokens': minor
---

`DsTextarea` (HU-024, aaa-036, tanda 3) — campo multilínea integrado a Angular Forms, construido sobre una base compartida nueva `DsFieldBase` extraída de `DsInput` (cero duplicación de la lógica de field: `ControlValueAccessor` por auto-registración de `NgControl`, label/hint/error con estado automático por `invalid + touched`, IDs de a11y y `aria-describedby`). Suma `rows` (default 3) y `resize` (`vertical` default | `none`). `size` sm/md/lg. `DsFieldBase` es interna (no exportada).

`DsInput` refactorizado para extender la misma base: **API pública intacta** (todos sus inputs se conservan, ahora heredados); sus tests siguen como red de no-regresión. Las clases internas pasan de `.ds-input__*` a `.ds-field__*` (sin contrato público, pre-1.0).

Tokens: nuevo `component.textarea.*` (`min-height`, `padding-y`); el resto del look reutiliza `component.input.*`. Lockstep (ADR-015).

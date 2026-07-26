---
name: component-textarea
type: spec
status: active
created: 2026-07-26
---

# component-textarea

## Purpose

Contrato de `DsTextarea`: field multilínea integrado a Angular Forms (`ControlValueAccessor`), construido sobre la base compartida interna `DsFieldBase` (ADR-020), con `rows`/`resize` y la misma a11y de field que `DsInput`.

## Requirements

### Requirement: Textarea (DsTextarea)

El package SHALL exponer `DsTextarea` (`ds-textarea`, naming por ADR-007) junto con el type `DsTextareaResize`. `DsTextarea` SHALL extender la base interna `DsFieldBase` (compartida con `DsInput`) e implementar `ControlValueAccessor`, renderizando un `<textarea>` con `rows` (default 3) y `resize` (`vertical` default | `none`). SHALL soportar `label`, `hint`, `error`, `invalid`, `placeholder`, `disabled` y `size` (`sm | md | lg`) con el mismo comportamiento de a11y que `DsInput` (label asociado, `aria-invalid`, `aria-describedby` a error/hint). Todo estilo SHALL salir de tokens (`component.input.*` compartidos + `component.textarea.*`).

#### Scenario: base compartida sin regresión en Input (CA-024.1)

- **WHEN** se ejecuta la suite de `DsInput`
- **THEN** SHALL permanecer 100% verde tras extraer `DsFieldBase` (la API pública de `DsInput` no cambia)
- **AND** `DsInput` y `DsTextarea` SHALL compartir la lógica de field vía `DsFieldBase` (sin duplicarla)

#### Scenario: textarea multilínea con Forms (CA-024.2)

- **GIVEN** un `<ds-textarea>` (standalone, OnPush) enlazado por `[(value)]` o `formControl`
- **WHEN** el usuario escribe
- **THEN** SHALL renderizar un `<textarea>` con `rows` (default 3)
- **AND** el valor SHALL propagarse por el `ControlValueAccessor`

#### Scenario: a11y de field (CA-024.3)

- **GIVEN** un textarea con `label`, `hint` y `error` (con `invalid`)
- **WHEN** se renderiza
- **THEN** el label SHALL asociarse por `for`/`id`; `aria-invalid` SHALL reflejar el estado inválido
- **AND** `aria-describedby` SHALL apuntar al error (live region `aria-live="polite"`) cuando se muestra, o al hint en su defecto

#### Scenario: resize y tokens (CA-024.4)

- **GIVEN** un textarea con `resize` `vertical` (default) o `none`
- **WHEN** se renderiza
- **THEN** el `resize` CSS SHALL aplicarse en consecuencia
- **AND** el CSS SHALL usar solo `var(--ds-*)` (`component.input.*` compartidos + `component.textarea.*`), sin hex ni literales

#### Scenario: exportado desde public-api.ts (CA-024.5)

- **WHEN** se inspecciona `packages/components/src/public-api.ts`
- **THEN** SHALL contener `export * from './lib/textarea';` y exportar `DsTextarea` y `DsTextareaResize`
- **AND** `DsFieldBase` NO SHALL exportarse (es infraestructura interna)

#### Scenario: tests del comportamiento con Vitest (CA-024.2–024.4)

- **WHEN** se ejecuta `pnpm -F @romanmartinidev/components test`
- **THEN** Vitest SHALL cubrir: render de `<textarea>` con `rows`, CVA (`writeValue`/toggle/`setDisabledState` e integración `[formControl]`), asociación de label y `aria-describedby` de error/hint, `resize` por `data-resize`, y no-hardcodes en el CSS fuente

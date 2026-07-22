---
epica: EP-002
actor: Dev consumidor
estado: Identificada (tanda 3, D-014 2026-07-22; CAs binarios al refinar, justo antes de su change)
decisiones: [D-005, D-007]
adrs: [ADR-004]
---

# HU-024 — Textarea (dev consumidor)

**COMO** dev que arma formularios con texto largo (notas, comentarios, descripciones)
**QUIERO** una entrada multilínea accesible con label/hint/error
**PARA** capturar texto extenso con la misma calidad de a11y y validación que `DsInput`.

## Origen

Tanda 3 ([D-014](../../decisiones.md)), referencia [`moder-minimal`](../../../reference/components/moder-minimal/) img 2 (campo "Notes / Enter notes").

## Criterios de aceptación (candidatos)

- [ ] **CA-024.1 (forma)** — **Decisión a refinar**: componente nuevo `ds-textarea` vs. modo `multiline` de `DsInput`. En cualquier caso reutiliza el patrón field (label/hint/error, `invalid` automático) de [HU-005](HU-005-input-textfield.md).
- [ ] **CA-024.2 (control)** — `ControlValueAccessor`; `rows` configurable; `resize` controlado por tokens/estilo; auto-grow opcional (a refinar).
- [ ] **CA-024.3 (a11y)** — label, hint y error asociados por `aria-describedby`/`aria-invalid`, igual que `DsInput`.
- [ ] **CA-024.4 (showcase)** — El showcase muestra el campo Notes con hint y estado de error.

## Decisiones a resolver al refinar

1. Componente propio vs. modo de `DsInput` (impacta API y specs).
2. Auto-grow (crecer con el contenido) sí/no.
3. Contador de caracteres opcional.

## Dependencias

- Patrón field de [HU-005](HU-005-input-textfield.md) (`DsInput`).

## Fuera de alcance

- Rich text / markdown editor.
- Autocompletado.

## Notas

- Change tentativo: `components-add-textarea` (o `components-input-multiline` si se resuelve como modo de DsInput).

---
epica: EP-002
actor: Dev consumidor
estado: Identificada (tanda 3, D-014 2026-07-22; CAs binarios al refinar, justo antes de su change)
decisiones: [D-005, D-007]
adrs: [ADR-004, ADR-011]
---

# HU-023 — Switch/Toggle (dev consumidor)

**COMO** dev que ofrece opciones on/off de efecto inmediato (settings, cookies, preferencias)
**QUIERO** un `ds-switch` integrado a Angular Forms
**PARA** alternar un booleano de forma accesible sin construir el toggle a mano.

## Origen

Tanda 3 ([D-014](../../decisiones.md)), referencia [`moder-minimal`](../../../reference/components/moder-minimal/) img 1 (toggle azul) e img 4 (Cookie Settings: Strictly Necessary / Functional Cookies).

## Criterios de aceptación (candidatos)

- [ ] **CA-023.1 (control accesible)** — `<ds-switch>` (standalone, OnPush) implementa `ControlValueAccessor`; expone `role="switch"` + `aria-checked`; alterna con click, Space y Enter.
- [ ] **CA-023.2 (visual tokenizado)** — Track y thumb por tokens `component.switch.*`; la transición usa tokens de motion y respeta `prefers-reduced-motion`.
- [ ] **CA-023.3 (estados)** — checked/unchecked/disabled accesibles; el track cumple contraste AA (estado on) contra el fondo.
- [ ] **CA-023.4 (label)** — Nombre accesible por label asociado; label proyectado opcional.
- [ ] **CA-023.5 (showcase)** — El showcase reproduce el bloque de Cookie Settings.

## Decisiones a resolver al refinar

1. **Base semántica**: `<input type="checkbox" role="switch">` (form-nativo, coherente con `DsCheckbox`/`DsRadio` y con la preferencia del repo por semántica de plataforma) vs. `<button role="switch" aria-checked>`. Impacta la decisión 4.
2. Label integrado (input `label`) vs. externo (el consumidor asocia).
3. Sizes.
4. Patrón de disabled: nativo (como checkbox/radio, ADR-011) o `aria-disabled` — se deriva de la decisión 1.

## Dependencias

- Reutiliza el patrón CVA de `DsCheckbox`/`DsRadio`.

## Fuera de alcance

- Switch de 3 estados / indeterminado.
- Estado `loading` en el switch.

## Notas

- Change tentativo: `components-add-switch`. Distinguir de Checkbox: switch = acción inmediata; checkbox = selección en un form que se envía.

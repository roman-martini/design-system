---
epica: EP-002
actor: Dev consumidor
estado: Refinada (2026-07-22; ejecución vía change components-add-switch — BACKLOG Now, cuarta entrega de la tanda 3)
decisiones: [D-007, D-014, D-015, D-017]
adrs: [ADR-004, ADR-011]
---

# HU-023 — Switch/Toggle (dev consumidor)

**COMO** dev que ofrece opciones on/off de efecto inmediato (settings, cookies, preferencias)
**QUIERO** un `ds-switch` integrado a Angular Forms
**PARA** alternar un booleano de forma accesible sin construir el toggle a mano.

## Origen

Tanda 3 ([D-014](../../decisiones.md)), referencia [`moder-minimal`](../../../reference/components/moder-minimal/) img 1 (toggle azul) e img 4 (Cookie Settings: Strictly Necessary / Functional Cookies).

## Decisiones de refinamiento (PO, 2026-07-22)

1. **Base `<input type="checkbox" role="switch">` (CVA)** — semántica de plataforma, coherente con `DsCheckbox`/`DsRadio` (mismo `ControlValueAccessor`, `model` `checked`/`disabled`, toggle nativo por Space). Se descarta `<button role="switch">`: perdería la integración de Forms nativa sin beneficio. El disabled es **nativo** (form control, ADR-011).
2. **Sizes `sm | md | lg`** (default `md`) — consistencia con `DsCheckboxSize` y sin medias tintas (D-017). El bootstrap dejó `sm/md`; se agrega `lg`.
3. **Label opcional** — input `label` (string), igual que `DsCheckbox`; el label envuelve el input (clickable). Sin label, el consumidor asocia por `aria-label`/`aria-labelledby`.
4. **Fixes de tokens del bootstrap (D-017)**: `bg-off` pasa a referenciar semantic (themable en dark, hoy es primitive `neutral.300`); se agregan los tokens de size `lg`; la transición del thumb respeta `prefers-reduced-motion`.

## Criterios de aceptación

<!-- Binarios: al implementar se vuelven scenarios del spec component-switch (nuevo, ADR-018). -->

- [ ] **CA-023.1 (control accesible)** — Dado `<ds-switch>` (standalone, OnPush) con `ControlValueAccessor`, entonces el control es un `<input type="checkbox" role="switch">` con `aria-checked` reflejando el estado; alterna con click y Space; `[(checked)]` y `formControl` funcionan.
- [ ] **CA-023.2 (visual tokenizado + reduced-motion)** — Dado el track y el thumb, entonces salen de tokens `component.switch.*` por size (sm/md/lg); la transición del thumb usa tokens de motion y bajo `prefers-reduced-motion` no anima.
- [ ] **CA-023.3 (estados)** — Dado on/off/disabled, entonces el track on usa `bg.primary` y off un neutral **themable**; el estado on/off se distingue por ≥3:1 (WCAG 1.4.11), verificado por gate; disabled reduce opacidad y bloquea el toggle.
- [ ] **CA-023.4 (label)** — Dado `label`, entonces se renderiza asociado y clickable; el switch conserva su nombre accesible.
- [ ] **CA-023.5 (tokens)** — Dado el CSS, entonces todo valor sale de `var(--ds-*)` (`component.switch.*`), sin hardcodes ni hex.
- [ ] **CA-023.6 (export + showcase)** — Dado `public-api.ts`, exporta `DsSwitch` y `DsSwitchSize`; el showcase reproduce el bloque Cookie Settings de la referencia + estados y sizes.

## Dependencias

- Reutiliza el patrón CVA de `DsCheckbox`/`DsRadio` (mismo `NG_VALUE_ACCESSOR`, `model`, `setDisabledState`).

## Fuera de alcance

- Switch de 3 estados / indeterminado.
- Estado `loading` en el switch.
- Ícono dentro del thumb.

## Notas

- Change OpenSpec: `components-add-switch` — introduce el spec `component-switch` (ADR-018); extiende `component/switch.json` del bootstrap (lg + fix themable).
- Distinción de Checkbox: switch = acción inmediata; checkbox = selección en un form que se envía.
- Changeset **minor** de components + tokens (lockstep ADR-015).

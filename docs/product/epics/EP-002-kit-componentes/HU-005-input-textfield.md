# HU-005 — Input/TextField para formularios reales (dev consumidor)

**Épica**: [EP-002 — Kit de componentes Angular](EP-002-kit-componentes.md)
**Actor**: Dev consumidor
**Estado**: Hecha — change [aaa-017 components-add-input](../../../../openspec/changes/archive/aaa-017-components-add-input/) archivado (2026-07-11)
**Decisiones que aplica**: [D-005, D-007, D-009](../../decisiones.md)

---

**COMO** dev que arma formularios con el DS
**QUIERO** un `ds-input` de texto accesible integrado a Angular Forms
**PARA** cubrir la entrada de datos básica — junto con Select (HU-003), el mínimo de cualquier formulario real.

## Decisiones de refinamiento (PO, 2026-07-11)

1. **Anatomía: field completo** — un solo componente con label, input, hint y error asociados programáticamente (los tokens `component.input.label.*`/`.helper.*` ya lo anticipaban). No hay `ds-field` separado.
2. **Tipos: lista blanca sin `number`** — `text | email | password | tel | url | search` (`DsInputType`). Un NumberField real (inputmode, sin spinners) es HU propia si aparece caso (D-005).
3. **Prefix/suffix: slots pasivos ahora** — contenido decorativo (`aria-hidden`); sufijos interactivos (toggle password, clear) fuera de alcance.
4. **Errores: estado visual automático + mensaje manual** — invalid se deriva del NgControl (`invalid && touched`, con override `[invalid]`); el texto del error siempre lo provee el consumidor.

## Criterios de aceptación

<!-- Al implementar, estos CAs se vuelven scenarios del spec components-package (delta del change components-add-input). -->

- [x] **CA-005.1** — Dado un `ds-input` ligado a Reactive Forms o `[(ngModel)]` (CVA), cuando el usuario tipea, entonces el control del form refleja el valor en cada input; y cuando el form setea el valor programáticamente, el input lo muestra.
- [x] **CA-005.2** — Dado `<ds-input label="Email" hint="Nunca lo compartimos">`, entonces el label se asocia por `<label [for]>` al input nativo y el hint por `aria-describedby`; sin `label` provisto, el componente acepta `aria-label` del consumidor (reenviado al input nativo, patrón ADR-014 §5-análogo al de Select).
- [x] **CA-005.3** — Dado el input `type`, entonces acepta exactamente `text | email | password | tel | url | search` (type `DsInputType`, default `text`) y lo refleja en el `<input>` nativo.
- [x] **CA-005.4** — Dado un FormControl invalid y touched, entonces el input muestra el estado de error (borde `border-error`, `aria-invalid="true"`) sin código extra del consumidor; el input `[invalid]` fuerza el estado manualmente; y el input `error` (string) se renderiza visible y asociado por `aria-describedby` (reemplaza al hint mientras está presente).
- [x] **CA-005.5** — Dado un input deshabilitado vía forms API (`setDisabledState`) o `[disabled]`, entonces usa el **`disabled` nativo** del `<input>` (rama form control de [ADR-011](../../../architecture/adr/ADR-011-estado-disabled-accesible.md) — acá el control operable sí es un input nativo, a diferencia de Select).
- [x] **CA-005.6** — Dado el CSS del componente, entonces todo valor visual sale de `var(--ds-*)` (tokens `component.input.*`), los sizes `sm | md | lg` escalan por tokens, y los pares de contraste calculados por script pasan AA en los 4 themes (nota: `input.text-placeholder` hoy referencia `text.tertiary`, que falla AA — ajustar a `text.secondary` como se hizo en Select).
- [x] **CA-005.7** — Dado contenido proyectado en `[ds-input-prefix]`/`[ds-input-suffix]`, entonces se renderiza dentro del field (antes/después del input), es decorativo (`aria-hidden`, no focuseable) y los iconos siguen ADR-012 (16/1.5/currentColor).
- [x] **CA-005.8** — Dado el input enfocado por teclado, entonces el field muestra el ring de foco tokenizado (`--ds-semantic-shadow-focus` o `border-focus`) sin `outline: none` desnudo.

## Dependencias

- Ninguna bloqueante. El ajuste del token `input.text-placeholder` (CA-005.6) entra en el mismo change.

## Fuera de alcance

- Textarea, máscaras de entrada y autocomplete/typeahead: HUs posteriores si aparece caso real (D-005).
- Validadores propios: la validación es de Angular Forms; el componente solo la refleja visual y semánticamente.
- Sufijos **interactivos** (toggle de password, botón clear) y NumberField (`inputmode` numérico): HUs posteriores con caso real.

## Notas

- Change OpenSpec: `components-add-input` (próximo ID en [openspec/README.md](../../../../openspec/README.md)).
- Referencias de implementación: patrón CVA de `checkbox.ts`, reenvío de `aria-label` de `select.ts`, tokens `component/input.json` ya existentes.

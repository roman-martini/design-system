---
name: component-slider
type: spec
status: active
created: 2026-08-01
---

# component-slider

## Purpose

Contrato de `DsSlider`: control de rango de valor único integrado a Angular Forms (`ControlValueAccessor` tipado a `number`), construido con el patrón híbrido de ADR-023 — motor `<input type="range">` nativo + capa visual tokenizada — con extras opt-in de visualización del valor.

## Requirements

### Requirement: Slider (DsSlider)

El package SHALL exponer `DsSlider` (`ds-slider`, naming por ADR-007) junto con los types `DsSliderSize` y `DsSliderTick`. El componente SHALL implementar `ControlValueAccessor` **tipado a `number`** sobre un `<input type="range">` nativo que aporta la semántica (`role` implícito de slider, `aria-valuemin/valuemax/valuenow`), el teclado (flechas ±`step`, Home/End, PageUp/PageDown), el arrastre por pointer y la participación en forms — sin reimplementar esa mecánica en JS. La capa visual (track, fill, thumb) SHALL componerse de elementos propios posicionados por la custom property `--ds-slider-pct` derivada del valor, con estilos exclusivamente por tokens `component.slider.*`. Inputs: `min` (default `0`), `max` (default `100`), `step` (default `1`), `label`, `size` (`sm | md | lg`, default `md`), `valueText` (formateador opcional para `aria-valuetext`), aliases `aria-label`/`aria-labelledby`. El `disabled` SHALL ser nativo (form control, ADR-011).

#### Scenario: control accesible con CVA numérico (CA-025.1)

- **GIVEN** un `<ds-slider>` (standalone, OnPush) enlazado por `formControl` o `[(ngModel)]`
- **WHEN** el form escribe un valor (`setValue(30)`)
- **THEN** el `<input type="range">` interno SHALL reflejarlo
- **WHEN** el usuario interactúa (evento `input` del control nativo)
- **THEN** el CVA SHALL propagar un **`number`** (nunca string) por `onChange`, y `onTouched` SHALL dispararse al blur

#### Scenario: teclado y pointer provistos por el motor nativo (CA-025.2)

- **GIVEN** un slider con `min`/`max`/`step` enlazados
- **WHEN** se inspecciona el control interactivo
- **THEN** SHALL ser un único `<input type="range">` con `min`, `max` y `step` reflejados como atributos — lo que garantiza flechas ±step, Home/End, PageUp/PageDown y arrastre según el patrón APG sin JS propio
- **WHEN** el input nativo emite `input` tras una interacción de teclado o pointer
- **THEN** el valor del CVA y la custom property `--ds-slider-pct` SHALL actualizarse en consecuencia

#### Scenario: nombre accesible y aria-valuetext (CA-025.3)

- **GIVEN** un slider con `label`
- **THEN** el label SHALL estar asociado al input (nombre accesible)
- **GIVEN** un slider sin `label` pero con `aria-label` o `aria-labelledby`
- **THEN** el atributo SHALL reenviarse al input nativo (el host no lo conserva)
- **GIVEN** un slider con formateador `valueText` (p. ej. `(v) => v + ' %'`)
- **WHEN** el valor es `45`
- **THEN** el input SHALL exponer `aria-valuetext="45 %"`
- **AND** el componente SHALL registrar **cero violaciones** en el gate de axe

#### Scenario: capa visual sincronizada y tokenizada (CA-025.4)

- **GIVEN** un slider con `min=0`, `max=200` y valor `50`
- **WHEN** se renderiza
- **THEN** `--ds-slider-pct` SHALL valer `25` y fill y thumb SHALL derivar su geometría de esa custom property solo en CSS (corrección por ancho del thumb, ADR-023 regla 2)
- **AND** todo valor del CSS SHALL referenciarse vía `var(--ds-*)` (`component.slider.*`), sin hex ni literales
- **AND** el par fill/track SHALL cumplir ≥3:1 (WCAG 1.4.11) verificado por gate en los 4 themes

#### Scenario: estados disabled y foco (CA-025.5)

- **GIVEN** un slider `disabled` (por input o `setDisabledState`)
- **THEN** el input nativo SHALL tener `disabled` y la interacción SHALL quedar bloqueada, con la capa visual reflejándolo
- **WHEN** el input recibe foco de teclado (`:focus-visible`)
- **THEN** el anillo de foco SHALL pintarse sobre el thumb visual
- **AND** SHALL existir un bloque `@media (prefers-reduced-motion: reduce)` que anula las transiciones de thumb y burbuja

#### Scenario: sizes con área táctil mínima (CA-025.9)

- **GIVEN** `size` en `sm | md | lg` (default `md`)
- **WHEN** se renderiza
- **THEN** alto de track y diámetro de thumb SHALL salir de `component.slider.*` por size (reflejado en el host, `data-size`)
- **AND** el alto del área interactiva (el input) SHALL ser ≥24 CSS px en las tres sizes

#### Scenario: exportado desde public-api.ts

- **WHEN** se inspecciona `packages/components/src/public-api.ts`
- **THEN** SHALL contener `export * from './lib/slider';`
- **AND** un consumidor SHALL poder importar `DsSlider`, `DsSliderSize` y `DsSliderTick`

#### Scenario: tests del comportamiento con Vitest (CA-025.1–025.9)

- **WHEN** se ejecuta `pnpm -F @romanmartinidev/components test`
- **THEN** Vitest SHALL cubrir: integración `formControl` (setValue/interacción/disable) con propagación **numérica**, atributos `min`/`max`/`step` reflejados, reacción al evento `input` (CVA + `--ds-slider-pct`), nombre accesible por label y por alias, `aria-valuetext` con formateador, disabled nativo, `data-size`, y no-hardcodes en el CSS fuente

### Requirement: Extras opt-in de visualización del valor

`DsSlider` SHALL soportar tres extras **desactivados por default** (el DOM mínimo es track + fill + thumb + input + label): `showValue` (valor actual en un `<output>` asociado), `ticks` (marcas alineadas por la misma fórmula de posicionamiento, con etiqueta opcional) y `valueTooltip` (burbuja de valor sobre el thumb durante arrastre y foco). Los tres SHALL ser puramente presentacionales para el árbol de accesibilidad (`aria-hidden` en ticks y burbuja; el valor ya lo anuncia el input por `aria-valuenow`/`aria-valuetext`), y la burbuja SHALL NO usar `DsTooltip` ni Popover API (es un indicador del propio control, no una descripción anclada — ADR-023 regla 6).

#### Scenario: valor visible en output (CA-025.6)

- **GIVEN** un slider con `showValue`
- **WHEN** se renderiza con valor `30`
- **THEN** SHALL renderizar un `<output>` asociado al input con el texto `30` (o el resultado de `valueText` si hay formateador) y `font-variant-numeric: tabular-nums` por CSS
- **GIVEN** un slider sin `showValue`
- **THEN** SHALL NO existir el `<output>`

#### Scenario: ticks con etiquetas sin desbordar (CA-025.7)

- **GIVEN** un slider `min=0`, `max=100` con `ticks=[{value: 0, label: '0'}, {value: 50}, {value: 100, label: '100'}]`
- **WHEN** se renderiza
- **THEN** SHALL dibujar una marca por cada entrada, posicionada por el porcentaje de su `value` (misma fórmula del thumb), con etiqueta solo donde se declaró
- **AND** las marcas SHALL ser `aria-hidden`
- **AND** las etiquetas de los extremos SHALL alinearse hacia adentro para no desbordar el track

#### Scenario: burbuja de valor en arrastre y foco (CA-025.8)

- **GIVEN** un slider con `valueTooltip`
- **WHEN** el input recibe foco de teclado o comienza un arrastre (pointerdown)
- **THEN** la burbuja SHALL hacerse visible sobre el thumb, mostrando el valor (o `valueText`), posicionada por `--ds-slider-pct`
- **WHEN** el foco se pierde y no hay arrastre
- **THEN** SHALL ocultarse
- **AND** la burbuja SHALL ser `aria-hidden` y SHALL NO usar el atributo `popover` ni `DsTooltip`

#### Scenario: default mínimo sin extras (CA-025.10)

- **GIVEN** un slider sin `showValue`, `ticks` ni `valueTooltip`
- **WHEN** se renderiza
- **THEN** el DOM SHALL contener únicamente input, track, fill, thumb y label — reproduciendo el slider mínimo de la referencia

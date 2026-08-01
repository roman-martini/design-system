# Design — components-add-slider

Decisiones no triviales del change. Las alternativas descartadas y su porqué están en el proposal (§ Alternativas evaluadas); acá va el **cómo**.

## §1 Patrón híbrido: input nativo como motor + capa visual propia

**Estructura del DOM** (el input va primero para poder estilar a los hermanos visuales con `~` según su estado de foco):

```html
<div class="ds-slider" [style.--ds-slider-pct]="pct()">
  <input type="range" class="ds-slider__input" [min]="min()" [max]="max()" [step]="step()" ... />
  <div class="ds-slider__track"><div class="ds-slider__fill"></div></div>
  <div class="ds-slider__thumb"></div>
  <!-- ticks / output / burbuja: opt-in -->
</div>
```

- El input cubre **toda el área interactiva** (absoluto, `opacity: 0`, sin `display: none` — debe seguir siendo enfocable e interactivo). Aporta `role="slider"`, `aria-valuemin/valuemax/valuenow`, teclado (flechas ±step, Home/End, PageUp/PageDown), arrastre y click-para-saltar, y la participación en forms. **Nada de eso se reimplementa en JS.**
- La capa visual son elementos propios, estilables al 100% por tokens y sin vendor pseudo-elements para lo que se ve.

**Sincronización del porcentaje**: `pct = (value - min) / (max - min) * 100`, computed expuesto como custom property `--ds-slider-pct` en el host del control. El fill y el thumb derivan de ella **solo en CSS**.

**Corrección por ancho del thumb** (la sutileza del patrón): el centro del thumb nativo no recorre el 0–100% del track — recorre `thumbSize/2 → trackWidth - thumbSize/2`. Para que el thumb visual y el fill queden clavados al nativo (y el arrastre no "derive"):

```css
.ds-slider__thumb {
  left: calc(
    var(--ds-slider-pct) / 100 * (100% - var(--ds-component-slider-thumb-size)) +
      var(--ds-component-slider-thumb-size) / 2
  );
  transform: translateX(-50%);
}
```

El fill usa la misma expresión como `width` (hasta el centro del thumb). El thumb **nativo** se anula visualmente (`::-webkit-slider-thumb` / `::-moz-range-thumb` con `appearance: none`, sin pintura) pero conserva su tamaño igual al del visual, para que la mecánica de arrastre del navegador coincida con lo que se ve.

**Foco y estados**: el elemento enfocado es siempre el input; el anillo se pinta en el thumb visual vía `.ds-slider__input:focus-visible ~ .ds-slider__thumb` (token `focus-ring`). Hover y active análogos. `disabled` es **nativo en el input** (ADR-011, form control); el wrapper lo refleja para la opacidad de la capa visual.

**Área táctil** (CA-025.9): el alto del input (zona interactiva) no baja de 24px en ninguna size, aunque el track visual sea más finito.

## §2 Control autónomo — excepción a ADR-020, prevista por el propio ADR

ADR-020 regla 1 pide que "todo form field" extienda `DsFieldBase`, y su acción de seguimiento define la vía de excepción: _"si un field no puede usar la base (caso genuinamente distinto), lo justifica en su design.md"_. Este es ese caso:

1. **El kit ya tiene dos familias**: fields de texto (`DsInput`, `DsTextarea` — extienden la base: label/hint/error/placeholder, `value: string`) y **controles con CVA autónomo** (`DsSwitch`, `DsCheckbox`, `DsRadio`, `DsSelect`). El slider pertenece a la segunda: no tiene placeholder y su error de validación es marginal (siempre emite un número dentro del rango).
2. La base está **tipada a `string`** (`value = model<string>('')`, `onInput` sobre `.value`); el slider maneja `number`. Generalizarla a `DsFieldBase<TValue>` se evaluó y descartó (proposal § Alternativas 3): refactor de dos componentes publicados dentro del change más complejo de la tanda, para heredar una API mayormente inaplicable.
3. Sigue el patrón CVA compacto de `DsSwitch` tipado a `number`: `writeValue` con coerción `null → min`, `registerOnChange/OnTouched`, `setDisabledState` sobre el model `disabled`. Label propio asociado al input + aliases `aria-label`/`aria-labelledby` (lección aaa-016: el alias consume el atributo del host).

Si más adelante la familia de fields necesita un miembro no-string **con** hint/error, ahí sí se generaliza la base — con su propio change y la suite como red.

## §3 Extras opt-in

Los tres extras están **apagados por default**: el slider mínimo es el de la referencia moder-minimal.

- **`showValue`** — `<output>` asociado al input (`for`), `font-variant-numeric: tabular-nums`. Muestra `valueText` si hay formateador, si no el número.
- **`ticks`** — input `readonly DsSliderTick[]` (`{ value: number; label?: string }`). Cada marca se posiciona con **la misma fórmula del §1** (por eso quedan clavadas a los steps). Las etiquetas de los extremos se re-alinean (`translateX` 0% / -100%) para no desbordar el track. Las marcas son decorativas (`aria-hidden`): el valor ya lo anuncia el input.
- **`valueTooltip`** — burbuja posicionada por la misma fórmula, visible durante el arrastre (`:active` del input + pointerdown/up) y con foco de teclado (`:focus-visible`). Es `aria-hidden`: el screen reader ya recibe `aria-valuenow`/`aria-valuetext`; duplicarlo sería ruido. **No** usa `DsTooltip` ni Popover API (ADR-014 gobierna descripciones ancladas, no indicadores de valor): no necesita top-layer (vive dentro del control, sin riesgo de clipping) ni semántica de descripción.

**`aria-valuetext`** (CA-025.3): input opcional `valueText: (value: number) => string`; cuando está, se refleja como `attr.aria-valuetext` (p. ej. "45 %", "3 de 5 estrellas" en el futuro rating).

## §4 Tokens `component.slider.*`

Estructura (los refs exactos se fijan en la task de tokens, con estas restricciones):

- `track`: `height.{sm,md,lg}`, `radius`, `bg` — mismo rol que el track de progress.
- `fill`: `bg` = `{semantic.color.text.link}` — la cadena de acción primaria (`bg.primary`) falla en dark contra el track (2.12 < 3, medido); `text.link` aclara en dark y es la misma cadena que usa el fill de `DsProgress`. Par del **gate de contraste** `slider-fill` vs `track.bg` (nivel no-texto, ≥3:1) en los 4 themes.
- `thumb`: `size.{sm,md,lg}`, `bg`, `border-width`, `border-color`, `shadow` — **themable: solo refs semantic, sin `{color.white}`** (evita el hallazgo de checkbox/radio que arregla la Parte G, `components-fix-checkbox-radio`).
- `tick`: `size`, `color`, `label-font-size`, `label-color`, `label-gap`.
- `value-text`: `font-size`, `color`, `gap` (patrón de progress `value-text`).
- `tooltip`: `bg`, `text`, `radius`, `padding-x/y`, `font-size`, `offset`, `shadow` — par de contraste `slider-tooltip` (texto, ≥4.5).
- `label-font-size`, `label-color`, `focus-ring` (`{semantic.color.focus-ring}`), `motion.duration/easing` con su bloque `prefers-reduced-motion: reduce` (patrón aaa-023: la transición del fill/thumb se anula).

Jerarquía ADR-003 intacta: component → semantic (dimensiones por `{dimension.*}` como el resto del kit).

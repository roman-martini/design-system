---
epica: EP-002
actor: Dev consumidor
estado: Hecha (2026-08-01, aaa-044; componente + tokens + spec + story + showcase + ADR-023; gate visual del PO OK; cierra la tanda 3 7/7)
decisiones: [D-007, D-015, D-022, D-031]
adrs: [ADR-004, ADR-011, ADR-020, ADR-023]
---

# HU-025 — Slider (range) (dev consumidor)

**COMO** dev que deja elegir un valor en un rango (settings, filtros, volumen)
**QUIERO** un `ds-slider` integrado a Angular Forms y accesible por teclado
**PARA** capturar un número dentro de límites sin construir el control ni su a11y a mano.

## Origen

Tanda 3 ([D-014](../../decisiones.md)), referencia [`moder-minimal`](../../../reference/components/moder-minimal/) img 1 (slider con fill). Salió de la ex Cantera del BACKLOG (hoy [intake](../../intake/README.md), por [D-019](../../decisiones.md)) al ganar el disparador de la tanda. **Cierra la tanda 3 (7/7).**

## Decisiones resueltas al refinar (2026-07-31)

El PO fijó el alcance visual y las sizes, y delegó las decisiones técnicas con un criterio explícito: **la opción más flexible, profesional y adaptable a casos futuros, sin ceder buenas prácticas**.

### 1. Base: híbrida — `<input type="range">` como motor, capa visual propia

El input nativo queda invisible sobre el control y aporta **semántica** (`role="slider"`, `aria-valuemin/valuemax/valuenow`), **teclado completo**, **arrastre por pointer** y **participación en forms** — nada de eso se reimplementa. El track, el fill, el thumb, los ticks y la burbuja de valor son **elementos propios** del componente, posicionados por una custom property con el porcentaje del valor (patrón Angular Material).

**Por qué no las alternativas**: estilizar el input a secas duplica el CSS por vendor pseudo-elements con rendering inconsistente, no da camino limpio a ticks etiquetados ni tooltip (el thumb nativo no es posicionable) y hace imposible el range de dos thumbs de la v2; el custom completo con `role="slider"` reimplementa a mano teclado, pointer capture y clamping — más superficie de bug y más peso con el techo de bundle al límite ([D-031](../../decisiones.md)).

**Trade-off aceptado**: sincronizar el offset del thumb visual con el valor (fórmula que corrige por el ancho del thumb) y anular el thumb nativo por vendor pseudo-elements manteniendo el input interactivo.

> Es un **patrón nuevo para el kit** y gobierna futuros controles de la familia (rating, range de dos thumbs). Candidato a **ADR** al cerrarse el change; se decide al archivar.

### 2. Forma: control autónomo, como `DsSwitch` — no extiende `DsFieldBase`

El kit ya divide en dos familias: **fields de texto** (`DsInput`/`DsTextarea` sobre [ADR-020](../../../architecture/adr/ADR-020-base-compartida-form-fields.md), con label/hint/error/placeholder) y **controles** con CVA autónomo (`DsSwitch`, `DsCheckbox`, `DsRadio`, `DsSelect`). El slider es un control: no tiene placeholder y su error de validación es marginal (siempre emite un número dentro del rango). Sigue el patrón CVA compacto de `DsSwitch`, tipado a `number`, con label asociado y aliases `aria-label`/`aria-labelledby`.

Se **evaluó y descartó** generalizar la base a `DsFieldBase<TValue>`: la API de la base es texto-céntrica, el genérico exige ceremonia de inicialización y el refactor tocaría dos componentes publicados dentro del change ya más complejo de la tanda. ADR-020 prevé la excepción — se justifica en el `design.md` del change citando este análisis.

### 3. Alcance visual v1: completo, con extras opt-in

Entran las cuatro piezas: **track + fill + thumb** (siempre), **valor visible**, **marcas/ticks con etiquetas** y **tooltip de valor sobre el thumb**. Los tres extras son **opt-in por input**: el slider por defecto es exactamente el mínimo de la referencia `modern-minimal`.

El tooltip **no reusa `DsTooltip`**: aquel es una descripción anclada por Popover API ([ADR-014](../../../architecture/adr/ADR-014-overlays-anclados-popover-api.md)); este es un indicador de valor del propio control, posicionado por la misma custom property del porcentaje, visible en foco y durante el arrastre.

### 4. Single value

Confirmado: v1 de un solo valor. El range de dos thumbs sigue fuera de alcance (la base híbrida le deja el camino abierto).

### 5. Sizes: `sm` / `md` / `lg`

Paridad con la familia (`DsSwitch`, `DsInput`, `DsTextarea`, `DsProgress`).

## Criterios de aceptación

- [x] **CA-025.1 (control y forms)** — `<ds-slider>` standalone + OnPush implementa `ControlValueAccessor` tipado a `number` (patrón `DsSwitch`); inputs `min`, `max`, `step`. Con `[(ngModel)]` y `formControlName` propaga **números** en ambos sentidos: lo escrito desde el form llega al control y la interacción emite `number`, nunca string.
- [x] **CA-025.2 (teclado y pointer)** — Flechas mueven ±`step`, Home/End llevan a `min`/`max`, PageUp/PageDown saltan, y el arrastre por pointer cambia el valor — provisto por el input nativo; los tests verifican que el CVA y el valor emitido se actualizan ante esos eventos.
- [x] **CA-025.3 (a11y)** — Expone `role="slider"` con `aria-valuemin`/`aria-valuemax`/`aria-valuenow`, y `aria-valuetext` cuando el consumidor pasa un formateador. Nombre accesible por label asociado o por `aria-label`/`aria-labelledby`. **Cero violaciones de axe** (gate de `aaa-042`).
- [x] **CA-025.4 (visual tokenizado)** — Track, fill, thumb, ticks y burbuja por tokens `component.slider.*`; el contraste del fill contra el track cumple AA y lo verifica el **gate de contraste versionado** (`aaa-041`); las transiciones tienen su bloque `prefers-reduced-motion: reduce`.
- [x] **CA-025.5 (estados)** — `disabled` por atributo nativo según [ADR-011](../../../architecture/adr/ADR-011-estado-disabled-accesible.md); foco visible sobre el thumb; estado hover.
- [x] **CA-025.6 (valor visible)** — Con `showValue`, renderiza el valor actual en un `<output>` asociado al control, con `font-variant-numeric: tabular-nums` para que no salte al cambiar de dígitos.
- [x] **CA-025.7 (marcas/ticks)** — Con `ticks`, dibuja marcas alineadas a los steps; acepta marcas con etiqueta y las posiciona sin desbordar los extremos del track.
- [x] **CA-025.8 (tooltip de valor)** — Con `valueTooltip`, muestra una burbuja sobre el thumb que lo sigue durante el arrastre y aparece también con foco de teclado; se oculta al salir. No usa `DsTooltip` ni Popover API.
- [x] **CA-025.9 (sizes)** — `sm` / `md` / `lg` cambian alto de track y diámetro de thumb por token; el área interactiva del thumb no baja de 24×24 CSS px en ninguna talla.
- [x] **CA-025.10 (showcase y story)** — El showcase del playground reproduce el slider de la referencia `modern-minimal`; la story cubre los cuatro modos (mínimo, con valor, con ticks, con tooltip), disabled y las tres tallas.
- [x] **CA-025.11 (presupuesto de bundle)** — El techo de `components` en `.size-limit.json` se ajusta al peso **medido** con el slider + 5% de margen, la tabla de `CONTRIBUTING.md` refleja el nuevo valor y el commit registra cuánto pesó. Previsto por [D-031](../../decisiones.md): el techo se sube, **no se recorta el componente**.

## Dependencias

- Ninguna bloqueante. Es el componente más complejo de la tanda.

## Fuera de alcance

- Range de dos valores (v2) y orientación vertical.
- Reuso de `DsTooltip` para la burbuja de valor (ver decisión 3).

## Notas

- Change: `components-add-slider`. Referencia de a11y: APG "Slider" pattern.
- **El gate visual de [D-022](../../decisiones.md) es bloqueante**: sin OK explícito del PO sobre el componente renderizado, el change no se archiva.
- Al cerrarse, habilita la verificación del hito **H1** — el prototipo de `modern-minimal` en el playground ([D-023](../../decisiones.md)).

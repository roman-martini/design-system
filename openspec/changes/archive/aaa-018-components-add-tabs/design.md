# Design — components-add-tabs

## Context

Noveno componente del kit, tercero de la tanda 1. Sin overlay ni forms: la complejidad está en el **roving tabindex** (primer componente del kit donde el contenedor renderiza los controles a partir de hijos proyectados) y en servir 3 variantes visuales desde un solo template. Decisiones de producto ya tomadas en el refinamiento de HU-006 (2026-07-12).

## Goals / Non-Goals

**Goals:**

- Cumplir los 8 CAs de HU-006 como scenarios testables.
- Un solo tab-stop en el tablist (roving tabindex) con activación automática.
- Las 3 variantes desde tokens existentes, con contraste verificado.

**Non-Goals:**

- Router tabs, cerrables/reordenables, overflow con scroll, orientación vertical, lazy rendering (fuera de alcance de la HU).

## Decisions

### 1. El contenedor renderiza los botones; el hijo hostea el panel

`DsTab` no renderiza su propio botón: declara `value`/`label`/`disabled` y hostea el panel (`role="tabpanel"`, contenido proyectado, `hidden` cuando inactivo). `DsTabs` renderiza el strip de botones con `@for` sobre las registraciones. Razón: el roving tabindex y la navegación exigen que los botones sean hermanos bajo un mismo `tablist`; renderizarlos desde el padre evita coordinar foco entre hosts separados. Alternativa descartada — que cada `DsTab` proyecte su botón al strip vía slots: requiere doble proyección (botón y panel a lugares distintos), que Angular no soporta sin `ng-template` + `ViewContainerRef`; complejidad sin beneficio mientras el label sea string.

- Consecuencia: `label` es **input string** (no contenido rico). Tab labels con iconos/badges = HU futura que introduciría un `ng-template` opcional.

### 2. Registración reactiva con ids cruzados

Interfaz `DsTabRegistration` (mismo patrón Select/RadioGroup): `valueProp()`, `labelText()`, `isDisabled()`, `tabId()`, `panelId()`. Ids generados con contador de módulo; el botón lleva `id=tabId` + `aria-controls=panelId`, el panel `id=panelId` + `aria-labelledby=tabId`.

### 3. Valor activo efectivo derivado

`value` es `model<string | null>(null)`. El activo efectivo es un `computed`: `value()` si matchea un tab habilitado, sino el **primer tab habilitado** (CA-006.1). Seleccionar (click o teclado) setea el model. Sin CVA: el tab activo es estado de UI, no dato de formulario — si algún consumidor lo necesita en un form, el two-way alcanza.

### 4. Teclado y roving tabindex

`keydown` en el tablist: `←`/`→` mueven al habilitado anterior/siguiente **con wrap** (APG tabs; nota: Select no wrappea porque APG combobox no lo hace — ambos quedan documentados en el spec de cada uno), `Home`/`End` a los extremos. Activación automática: mover el foco selecciona (`focus()` + `value.set` en el mismo paso). Solo el tab activo tiene `tabindex="0"`; el resto `-1` — el strip es un tab-stop y `Tab` desde el tab activo va al panel (`tabindex="0"` en el panel, APG).

### 5. Nombre accesible del tablist

`role="tablist"` vive en el strip interno (no en el host, que también contiene los paneles) → `aria-label`/`aria-labelledby` del consumidor se reenvían con inputs con alias (tercer uso del patrón; lección aaa-016).

### 6. Variantes por atributo + tokens

`data-variant` en el strip; cada variante consume su bloque `component.tabs.{underline|pills|contained}`. El underline activo se pinta con `box-shadow: inset 0 calc(-1 * width) 0 color` — sin pseudo-elemento posicionado ni animación de layout; la transición es de color con su bloque `prefers-reduced-motion`.

### 7. `tabindex="0"` incondicional en el tabpanel (excepción del gate `/ng:review`, con aviso al PO)

El review marcó como media que el panel lleve `tabindex="0"` fijo: cuando el contenido proyectado ya tiene focusables, agrega una parada de Tab redundante. Se mantiene incondicional como **excepción justificada**: (a) APG recomienda `tabindex="0"` para paneles sin focusables, y el componente no puede saber de forma robusta si el contenido proyectado los tiene (la detección dinámica de focusables es frágil: elementos que aparecen con `@if`, `disabled` dinámico, shadow DOM); (b) el costo es una parada de Tab extra, predecible y no bloqueante; (c) el contrato quedó en el spec y su test. Si una auditoría `/ds:check-a11y` futura lo pesa con evidencia de AT real, se revisa como delta de spec.

## Risks / Trade-offs

- [Label solo string] → decisión explícita (§1); labels ricos son extensión aditiva futura (template opcional), no breaking.
- [`tabs.underline.underline-hover` referencia `bg.primary` pero `underline-active` referencia `text.primary`] → herencia del bootstrap; se respeta el token tal como está (el gate de contraste valida ambos) — si el PO quiere unificar la semántica es un micro-change de tokens, no de este scope.
- [Wrap en tabs vs no-wrap en select] → ambos siguen su patrón APG respectivo; documentado en cada spec para que no parezca inconsistencia accidental.

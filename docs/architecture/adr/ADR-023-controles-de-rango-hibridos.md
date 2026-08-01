# ADR-023 — Controles de rango híbridos: input nativo como motor + capa visual propia

- **Fecha**: 2026-08-01
- **Estado**: Aceptado
- **Dominio**: frontend / components
- **ADRs relacionados**: [ADR-004](ADR-004-arquitectura-components.md) (arquitectura de components), [ADR-011](ADR-011-estado-disabled-accesible.md) (disabled nativo en form controls), [ADR-013](ADR-013-overlays-dialog-nativo.md) / [ADR-014](ADR-014-overlays-anclados-popover-api.md) (precedente de preferencia por plataforma), [ADR-020](ADR-020-base-compartida-form-fields.md) (familias de form fields; la excepción del slider quedó justificada en el design de `aaa-044`)
- **Decisiones de producto**: [D-007](../../product/decisiones.md) (a11y AA no negociable), [D-031](../../product/decisiones.md) (presupuesto de bundle)

## Contexto

`DsSlider` (HU-025, change `aaa-044`) necesitaba visual 100% tokenizado (track, fill, thumb, ticks, burbuja de valor) sobre un control de rango accesible. El `<input type="range">` estilizado directo no lo permite (el thumb nativo no es posicionable: nada puede seguirlo, y los vendor pseudo-elements duplican CSS con rendering inconsistente), y reimplementar el control desde cero contradice la preferencia del repo por la plataforma (ADR-013/014). La decisión gobierna también a los futuros controles de la misma familia (rating, range de dos thumbs), por lo que amerita ADR: es una convención de construcción, no una elección local.

## Opciones consideradas

### Opción A — Input nativo estilizado a secas

Estilar el propio `<input type="range">` con `linear-gradient` para el fill y vendor pseudo-elements para thumb/track.

- **Pros**: mínimo código y peso; cero sincronización.
- **Contras**: CSS duplicado por vendor (`::-webkit-*`/`::-moz-*`) con rendering inconsistente; sin camino a ticks etiquetados ni indicador de valor (el thumb nativo no es posicionable); imposible el range de dos thumbs. Descartada: no escala a la familia.

### Opción B — Custom completo con `role="slider"`

Elemento propio con `role="slider"`, `tabindex`, `aria-value*` y teclado/pointer/clamping escritos a mano.

- **Pros**: control absoluto del DOM y del visual.
- **Contras**: reimplementa lo que el navegador ya da (teclado APG completo, arrastre, forms); más superficie de bug, más tests y más bundle (D-031); toda regresión de a11y pasa a ser responsabilidad propia (D-007). Descartada: solo se justificaría si el nativo no alcanzara.

### Opción C — Híbrida: input nativo como motor + capa visual propia (elegida)

El `<input type="range">` queda **invisible sobre el control** (absoluto, `opacity: 0`, cubriendo toda el área interactiva) y aporta semántica (`role` de slider, `aria-valuemin/valuemax/valuenow`), teclado completo, arrastre, click-para-saltar y participación en forms. La parte visible son **elementos propios** posicionados por una custom property con el porcentaje del valor (patrón Angular Material).

- **Pros**: a11y e interacción de plataforma sin reimplementar nada; visual 100% propio y tokenizable (cualquier extra es DOM normal); camino real al range de dos thumbs (dos inputs sobre la misma capa).
- **Contras**: exige la fórmula de sincronización y anular el thumb nativo por vendor pseudo-elements manteniéndolo interactivo (ver Decisión).

## Decisión

**Todo control de rango del kit (slider, rating, futuros) se construye con el patrón híbrido**, con estas reglas (implementación de referencia: `packages/components/src/lib/slider/`):

1. **El input nativo es el motor**: primero en el DOM (los hermanos visuales se estilan con `~` según su estado), absoluto y transparente sobre toda el área interactiva, nunca `display: none` ni `visibility: hidden` (debe seguir enfocable e interactivo). Teclado, arrastre y forms no se reimplementan en JS.
2. **Sincronización solo por CSS**: el componente expone una única custom property con el porcentaje (`--ds-slider-pct`); fill, thumb, marcas e indicadores derivan su geometría de ella con la **corrección por ancho del thumb** — el centro del thumb nativo recorre `thumb/2 → 100% − thumb/2`, así que toda posición es `calc(pct / 100 * (100% − thumb) + thumb / 2)`.
3. **El thumb nativo se anula pero conserva el tamaño del visual** (`appearance: none` en `::-webkit-slider-thumb`/`::-moz-range-thumb` con `width`/`height` del thumb visible): la mecánica de arrastre del navegador coincide con lo que se ve.
4. **El foco vive en el input**; el anillo se pinta sobre el thumb visual (`input:focus-visible ~ …` con `--ds-semantic-shadow-focus`). `disabled` es nativo (ADR-011).
5. **El área interactiva no baja de 24×24 CSS px** (WCAG 2.5.8) aunque el visual sea más fino: el alto del input usa `max()` contra el token de 24.
6. **Los indicadores visuales del valor son `aria-hidden`** (ticks, burbuja): el valor ya lo anuncia el input por `aria-valuenow`/`aria-valuetext`; duplicarlo es ruido para el screen reader. La burbuja de valor **no** usa `DsTooltip` ni Popover API — es un indicador del propio control, no una descripción anclada (no matiza ADR-014).

Criterios contra las prioridades del repo: (1) **buenas prácticas** — la plataforma provee a11y e interacción, el componente provee el visual; (2) **escalar ordenado** — extras y futuros controles de la familia son DOM normal sobre el mismo motor; (3) **mantenibilidad** — una sola fórmula de sincronización, declarada una vez.

## Consecuencias

### Positivas

- CA de teclado y arrastre se cumplen sin JS propio; el riesgo de regresión de a11y queda en la plataforma, no en el kit.
- El visual es tokenizable al 100% (el gate de contraste opera sobre tokens propios) y los extras (ticks, burbuja) no tocan el motor.
- El range de dos thumbs (v2 de HU-025) tiene camino directo: dos inputs sobre la misma capa visual.

### Negativas / trade-offs aceptados

- La fórmula de sincronización es sutileza propia del patrón: si el thumb visual y el nativo divergen de tamaño, el arrastre "deriva" — mitigado por la regla 3 y el test de `--ds-slider-pct`.
- Los vendor pseudo-elements no desaparecen del todo (siguen anulando el thumb nativo), pero quedan reducidos a neutralización, sin pintura.
- El DOM lleva una capa más que el input estilizado a secas (~2.9 kB gzip el slider completo con extras, contra ~2.3 kB de un componente típico — dentro de lo previsto por D-031).

### Acciones de seguimiento

- El próximo control de la familia (rating o range de dos thumbs) cita este ADR en su change y reusa las reglas 1–6; si algo no le aplica, lo justifica en su `design.md`.

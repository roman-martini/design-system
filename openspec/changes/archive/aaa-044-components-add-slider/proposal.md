---
id: aaa-044
name: components-add-slider
type: change
status: archived
archived: 2026-08-01
introduces-specs:
  - component-slider
modifies-specs:
  - design-tokens-package (sin delta de spec; agrega component.slider.*)
related-adrs:
  - ADR-004
  - ADR-007
  - ADR-011
  - ADR-020
  - ADR-023
related-decisions:
  - D-014
  - D-022
  - D-031
---

# Proposal — components-add-slider

# Why

Séptima y última entrega de la **tanda 3** (D-014): la referencia moder-minimal muestra un slider con fill (img 1) y hoy el dev no tiene forma accesible de capturar un número dentro de un rango sin construir el control y su a11y a mano. HU-025 fue refinada con el PO el 2026-07-31: base **híbrida** (input nativo como motor + capa visual propia), **control autónomo** tipado a `number` (patrón `DsSwitch`, no extiende `DsFieldBase` — excepción prevista por ADR-020, justificada en design §2), alcance visual **completo con extras opt-in** (valor visible, ticks con etiquetas, tooltip de valor), single value y sizes `sm–lg`. **Cierra la tanda 3 (7/7)** y habilita la verificación del hito H1 (D-023).

# What Changes

- Nuevo **`DsSlider`** (`ds-slider`, ADR-007): `ControlValueAccessor` tipado a `number` sobre un `<input type="range">` invisible que aporta semántica (`role="slider"`, `aria-value*`), teclado completo, arrastre y forms; capa visual propia (track, fill, thumb) posicionada por custom property con el porcentaje del valor (design §1). Inputs `min`/`max`/`step`, `label`, aliases `aria-label`/`aria-labelledby`, `size` (`sm | md | lg`), formateador opcional para `aria-valuetext`.
- **Extras opt-in** (default: el mínimo de la referencia): `showValue` (valor actual en `<output>`, tabular-nums), `ticks` (marcas alineadas a steps, con etiqueta opcional), `valueTooltip` (burbuja sobre el thumb en arrastre y foco — **no** reusa `DsTooltip` ni Popover API, design §3).
- **Tokens**: `component/slider.json` nuevo — track/fill/thumb/ticks/burbuja por size, referenciando la cadena semántica (thumb themable, sin `{color.white}` — evita el hallazgo de checkbox/radio que arregla la Parte G). Pares del gate de contraste declarados (fill vs track).
- **Spec `component-slider` nueva** (ADR-018). Story CSF 3 + showcase con los cuatro modos, disabled y sizes; el showcase reproduce el slider de la referencia.
- **Presupuesto de bundle** (D-031): primer componente que entra con el gate de `aaa-043` activo — se mide con `pnpm size`, se sube el techo de components en `.size-limit.json` al peso medido +5% y se actualiza la tabla de `CONTRIBUTING.md`; el commit registra el peso.
- Changesets: **minor** de components y **minor** de tokens. Lockstep (ADR-015); publicación solo por CI (ADR-022).

# Capabilities

## New Capabilities

- `component-slider`: contrato de `DsSlider` — control de rango accesible sobre motor nativo con capa visual tokenizada y extras opt-in. Derivado 1:1 de los CAs de HU-025.

## Modified Capabilities

- `design-tokens-package`: sin delta de spec — `component.slider.*` cumple la jerarquía ADR-003 (component referencia semantic).

# Clasificación (paso 2 de la skill)

**Form control** → implementa CVA; `disabled` **nativo** (ADR-011). El patrón de construcción híbrido es **nuevo en el kit** y gobierna futuros controles de la familia (rating, range de dos thumbs): decisión documentada en design §1, **candidata a ADR al archivar**.

# Alternativas evaluadas

Refinamiento con el PO (2026-07-31, decisiones en HU-025):

1. **Input nativo estilizado a secas** — descartado: CSS duplicado por vendor pseudo-elements con rendering inconsistente, sin camino a ticks etiquetados ni tooltip (el thumb nativo no es posicionable) y sin camino al range de dos thumbs (v2).
2. **Custom completo con `role="slider"`** — descartado: reimplementa teclado, pointer capture y clamping que el navegador ya da; más superficie de bug y más peso con el techo de bundle al límite (D-031).
3. **Generalizar `DsFieldBase<TValue>` y extenderla** — descartado: la API de la base es texto-céntrica (placeholder, hint/error), el genérico exige ceremonia de inicialización y el refactor tocaría dos componentes publicados dentro del change más complejo de la tanda. El kit ya tiene la familia de controles autónomos (`DsSwitch`, `DsCheckbox`, `DsRadio`, `DsSelect`); el slider pertenece a ella (design §2).
4. **Reusar `DsTooltip` para la burbuja de valor** — descartado: aquel es una descripción anclada por Popover API (ADR-014); esto es un indicador de valor del propio control (design §3).

# Impact

- **Código**: `packages/components/src/lib/slider/` (6 archivos + index), `public-api.ts`, `packages/tokens/src/component/slider.json`, showcase (`apps/playground/.../showcase/slider/` + registry), stories.
- **Gate de contraste**: pares `slider-*` (fill vs track, nivel no-texto ≥3:1) en los 4 themes.
- **Gate de bundle**: el techo de components sube (D-031) — medido, no estimado.
- **Dependencias**: ninguna nueva.
- **ADR**: candidato — el patrón híbrido nativo+visual si se confirma como convención de familia al archivar (regla: ≥2 componentes o one-way door).

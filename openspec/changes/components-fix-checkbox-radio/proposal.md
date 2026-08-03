---
id: aaa-051
name: components-fix-checkbox-radio
type: change
status: proposed
modifies-specs:
  - component-checkbox
  - component-radio
related-adrs:
  - ADR-003
related-decisions:
  - D-007
  - D-022
  - D-030
---

# Proposal — components-fix-checkbox-radio

# Why

La marca de ambos controles está pintada de **blanco literal y no theme-aware**: `checkbox.css` hardcodea `stroke='white'` dentro del SVG en data URI del checkmark y del indeterminate, y `radio.css` dibuja el punto con `var(--ds-color-white)`. En dark, el fondo del control marcado (`bg.primary`) **aclara** a `blue-500`, así que la marca blanca queda con menos contraste justo donde más falta: es el único elemento que distingue "marcado" de "sin marcar".

Al abrir el componente aparece el problema de fondo, y **corrige lo que `aaa-041` había anotado**: ese hallazgo decía que el control desmarcado se pinta blanco en dark porque `bg-off` está clavado a `{color.white}`. Leído el CSS, **eso no ocurre en el render**: el CSS usa `var(--ds-semantic-color-bg-surface)`, que sí es theme-aware. Lo que pasa es distinto y más amplio: **ninguno de los dos componentes consume sus tokens `component.*`**. Los once tokens de color de `checkbox`/`radio` están declarados y huérfanos, y el CSS estiliza con `semantic.*` directo y primitives sueltos, contra la jerarquía de ADR-003.

Que estén huérfanos tiene consecuencias medibles, porque además **mienten**:

- `radio.bg-on` dice `{color.white}` mientras el render pinta el fondo marcado con `bg.primary` — el token describe un diseño **opuesto** al que se ve.
- `radio.dot-color` dice `{semantic.color.bg.primary}` (azul) mientras el CSS pinta el punto blanco.
- `checkbox.check-color` existe y nadie lo usa, que es exactamente por qué el `stroke='white'` sobrevivió.

Un theme que quisiera reestilizar estos controles editaría tokens que no llegan a ninguna parte. Es el mismo patrón que `aaa-049` encontró en el botón, y el tercero de la parte.

**Prioridad respaldada**: la 1 (a11y: contraste de la marca en dark, D-007) y la 2 (que el sistema escale ordenado: tokens conectados y veraces).

# What Changes

- **La marca sale de un token theme-aware**: `checkbox.check-color` y `radio.dot-color` pasan a `{semantic.color.text.inverse}`, que es el color pensado para ir **sobre** `bg.primary` — blanco en light y oscuro en dark, donde el fondo aclara. Es la misma cadena que ya usa el texto del botón primario.
- **El checkmark deja de vivir en un data URI**: un SVG embebido como `background-image` no resuelve custom properties, así que el token no podría llegar. Pasa a `mask-image` + `background-color`, con la máscara sobre un pseudo-elemento para no tapar el fondo del control (design §2).
- **Los dos componentes consumen sus tokens `component.*`** para color, tamaño, radius y borde, en lugar de `semantic.*` directo.
- **Los tokens que mienten se corrigen al render**, que es el diseño aprobado: `radio.bg-on` pasa a `{semantic.color.bg.primary}`. Mismo criterio que `aaa-049` con el radius del botón — primero se decide cuál de los dos es la verdad, después se conectan.
- **`bg-off` y `bg-off-hover` pasan a semantics theme-aware** (`bg.surface` y `bg.secondary-hover`) en vez de `{color.white}` y `{color.neutral.50}`. El render no cambia en light; en dark el token deja de contradecir lo que se ve.
- Changeset: **patch** de `components` + `tokens`.

# Capabilities

## Modified Capabilities

- `component-checkbox`: el requirement de estilos pasa a exigir que el checkmark salga de un token y que el componente consuma `component.checkbox.*`.
- `component-radio`: lo mismo para el punto del control marcado y `component.radio.*`.

# Alternativas evaluadas

1. **Reemplazar `white` por `var(--ds-...)` dentro del data URI** — descartada porque **no funciona**: un SVG embebido en `url("data:...")` se resuelve como documento aislado y no ve las custom properties del documento que lo referencia. Es la razón por la que el plan advertía que este change no era "cambiar tres strings".
2. **Un SVG externo como archivo** en vez del data URI — descartada. Resolvería el color con `currentColor`, pero agrega un asset al package publicable y una request en runtime, para un ícono de 20 px que ya se dibuja sin dependencias.
3. **Corregir solo los colores y dejar los tokens huérfanos** — descartada. Es la mitad del trabajo y deja el problema que causó el defecto: tokens que nadie consume no se verifican, y por eso el `stroke='white'` sobrevivió a dos auditorías.
4. **Adoptar el diseño que declaran los tokens del radio** (fondo blanco, punto azul) — descartada. Es un rediseño que nadie pidió, colado dentro de un fix; el render actual es el aprobado visualmente.

# Impact

- **Código**: `packages/components/src/lib/{checkbox,radio}/*.css` y sus specs, `packages/tokens/src/component/{checkbox,radio}.json`, un changeset.
- **Consumidores**: sin cambios de API. **Cambio visual acotado a dark**: la marca del control pasa de blanca a oscura sobre el fondo primario aclarado, que es lo que la vuelve legible. En light el render no cambia.
- **Gate de contraste**: los pares nuevos (`text.inverse` sobre `bg.primary`) ya están cubiertos por el gate desde el botón primario; el cambio de `bg-off` a `bg.surface` mantiene el par del borde que `D-030` corrigió.
- **Bundle**: neutro o a la baja (el data URI del checkmark se conserva como máscara, sin agregar reglas nuevas de peso).
- **ADR**: no genera. Ejecuta ADR-003.
- **Gate visual del PO (D-022)**: **aplica con dark encendido** — es donde el fix se ve. El playground no tiene aún theme switcher (item de la Parte K), así que la verificación se hace forzando `data-theme` en el navegador.

# Design — components-fix-checkbox-radio

## Context

Motivación en `proposal.md` § Why. Lo leído en el código:

- `checkbox.css`: el checkmark y el indeterminate son `background-image: url("data:image/svg+xml,…stroke='white'…")`. El fondo del control usa `var(--ds-semantic-color-bg-surface)` (theme-aware) y el marcado `var(--ds-semantic-color-bg-primary)`.
- `radio.css`: el punto es `radial-gradient(circle, var(--ds-color-white) 35%, transparent 40%)` sobre `bg.primary`.
- Los once tokens de color de ambos componentes están declarados y sin consumidor. `radio.bg-on` dice `{color.white}` mientras el render pinta `bg.primary`.
- `switch.css` ya usa `input[type='checkbox']::before` para dibujar su perilla: el pseudo-elemento sobre un input con `appearance: none` es un patrón que el kit ya aplica.

## Goals / Non-Goals

**Goals:**

- Que la marca conserve contraste en todos los themes.
- Que los tokens declarados se consuman y describan lo que se ve.

**Non-Goals:**

- **No** se rediseñan los controles: en light el render queda idéntico.
- **No** se toca la API, los tamaños ni el comportamiento de forms.

## Decisions

### 1. `text.inverse` como color de la marca

La marca va **sobre** `bg.primary`, y el semantic pensado para eso es `semantic.color.text.inverse` — el mismo que usa el texto del botón primario. Resuelve a blanco en light y a `neutral-900` en dark, que es justo lo que hace falta: en dark el fondo primario aclara a `blue-500`, así que la marca tiene que oscurecerse para seguir legible.

Usar `bg.surface` sería tentador (blanco en light, oscuro en dark) y daría un resultado parecido, pero conceptualmente es el color de una superficie, no el de algo dibujado sobre el color primario. Si mañana `bg.surface` cambia de tono para las superficies, no querríamos que la marca del checkbox lo siga.

### 2. El checkmark pasa a máscara sobre un pseudo-elemento

Un SVG embebido en `url("data:…")` se resuelve como documento aislado: **no ve las custom properties del documento que lo referencia**, así que meter `var(--ds-…)` adentro no funcionaría. Esa es la razón técnica por la que el plan advertía que este ítem no era "cambiar tres strings".

La forma que sí permite tokenizar el color es invertir la responsabilidad: el SVG define **la forma** (máscara) y el color lo pone CSS. Pero aplicar la máscara al `<input>` recortaría también su fondo, dejando solo el checkmark visible. Por eso la máscara va en un `::before` que se superpone al control, con el fondo del input intacto detrás — el mismo recurso que `switch.css` ya usa para su perilla.

El `path` del SVG se conserva tal cual: cambia cómo se pinta, no el dibujo.

### 3. Los tokens que mienten se corrigen al render

`radio.bg-on` declara `{color.white}` y el control marcado se pinta con `bg.primary`: el token describe el diseño **opuesto**. Se corrige el token, no el render, con el mismo criterio que `aaa-049` aplicó al radius del botón: el render es lo que el PO aprobó visualmente.

Vale registrar que esta es la **tercera** vez en la parte que aparece la misma clase de problema (botón, y ahora checkbox y radio): tokens declarados que el CSS ignora, y que al ignorarlos derivan hasta contradecirlo. La auditoría formal de tokens —pendiente antes de la Parte H— ya tiene tres casos que muestran que "token huérfano" no es sinónimo de "inventario deliberado".

### 4. `bg-off`/`bg-off-hover` a semantics, sin cambio en light

`{color.white}` → `{semantic.color.bg.surface}` y `{color.neutral.50}` → `{semantic.color.bg.secondary-hover}`. En light, `bg.surface` resuelve a blanco, así que el fondo no cambia; el hover pasa de `neutral-50` a `neutral-100`, un tono apenas más marcado y consistente con el hover sutil del resto del kit.

## Risks / Trade-offs

- **[`mask-image` necesita prefijo en Safari]** → se declara `-webkit-mask-image` junto a `mask-image`. Es la única propiedad del kit que lo requiere; queda comentado en el CSS para que no se "limpie" por prolijidad.
- **[El `::before` podría interferir con el foco o el click]** → es decorativo y sin `pointer-events`; el input sigue siendo el elemento interactivo. Cubierto por los tests de interacción existentes.
- **[Cambio visual en dark]** → es el punto del change, y va al gate visual del PO. Como el playground todavía no tiene theme switcher (Parte K), la verificación se hace forzando `data-theme` en el navegador.
- **[jsdom no computa colores]** → los tests verifican el contrato sobre el CSS fuente (tokens consumidos, sin literales de color); el contraste real lo cubre el gate por script de `aaa-041`.

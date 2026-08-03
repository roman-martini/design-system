---
id: aaa-049
name: components-fix-button
type: change
status: archived
archived: 2026-08-03
modifies-specs:
  - component-button
related-adrs:
  - ADR-003
  - ADR-011
  - ADR-012
related-decisions:
  - D-007
  - D-022
  - D-031
---

# Proposal — components-fix-button

# Why

El PO reportó que **el texto del botón no se ve centrado verticalmente** (`docs/backlog/fixs/button/fix-button.md` + captura). Medido en Chromium antes de tocar código, el reporte es exacto y la causa es concreta: el `line-height` del botón resuelve a **20 px** mientras el alto natural del texto a 16 px es de **21 px**. Comprimir la caja de línea por debajo del texto reparte el sobrante en medio píxel a cada lado, y el redondeo lo empuja arriba: quedan **8 px sobre el texto y 9 debajo**.

Al medirlo apareció algo que el reporte no menciona y que explica el defecto de fondo: **el botón no consume sus propios tokens de dimensionamiento**. `component.button.height.{sm,md,lg}` (32/40/48), `padding-x`, `font-size` y `gap` **existen desde el bootstrap y nadie los referencia**; el CSS se dimensiona con `semantic.space.*` y con primitives de tipografía directos. Dos consecuencias medidas:

- **El botón mide 38 px donde su token dice 40**, así que en una fila de formulario **no alinea con el select ni con el input**, que sí consumen su altura tokenizada.
- Un rediseño del botón vía tokens no llega al botón: los valores que un theme cambiaría están declarados pero desconectados.

Eso viola la jerarquía de ADR-003 que la spec `design-tokens-package` exige — un componente consume `component.*`, no `semantic.*` ni primitives sueltos —, y es la misma clase de convención escrita-pero-no-verificada que la Parte G viene encontrando. Los tokens huérfanos, además, son parte de los 219 que la auditoría formal de tokens tiene pendiente triar: éstos ya tienen veredicto — no son inventario deliberado, son **deuda**.

Se suman dos hallazgos de la review sobre el mismo componente:

- **`DsButton` no admite nombre accesible** [aaa-042]: no reenvía `aria-label` al `<button>` interno, así que un botón ícono-only queda sin nombre (`button-name`, critical). La evidencia de que la brecha es real está en el propio repo: la story `OnIconButton` de tooltip **esquiva `ds-button`** y arma un `<button>` nativo con estilos inline para poder nombrarlo.
- **No soporta `type="submit"`** [components-06]: el template fija `type="button"` sin input para cambiarlo, así que el kit no ofrece el botón que dispara el submit de un formulario — justo el más importante de la familia de forms que ya está completa.
- **Borde hardcodeado** en `1px` [components-12], el mismo ítem que se cerró en el modal.

**Prioridad respaldada**: la 1 (buenas prácticas — a11y y contrato de forms) y la 2 (que el sistema escale ordenado: tokens conectados, controles que alinean).

# What Changes

- **El botón consume sus tokens de dimensionamiento**: `height`, `padding-x`, `font-size` y `gap` de `component.button.*`. Con altura declarada, el centrado deja de depender del padding y **el texto queda centrado por el flex**; de paso el botón pasa a medir lo que su token dice y alinea con select e input.
- **`line-height` que no comprime el texto**: pasa a `--ds-font-line-height-normal`. Con altura fija, el line-height ya no define el alto del control, así que puede contener el texto entero en lugar de recortarlo.
- **`component.button.radius` se corrige a `{semantic.radius.lg}`**, el valor que el CSS viene usando y que el PO aprobó visualmente. Hoy el token dice `md`: **el token miente respecto del diseño real**, y conectarlo sin corregirlo cambiaría la curvatura de todos los botones sin que nadie lo pidiera.
- **Alias `aria-label` y `aria-labelledby`** reenviados al `<button>` interno y limpiados del host, mismo patrón que acaba de adoptar el modal. La story `OnIconButton` de tooltip deja de esquivar el componente.
- **Input `type`** (`'button' | 'submit' | 'reset'`, default `'button'`). Con `aria-disabled` + `submit`, la guarda del click también previene el envío nativo, como ADR-011 anticipó.
- **Borde tokenizado** con `var(--ds-dimension-1)`.
- Changeset: **minor** de `components` (el input `type` y los alias son API nueva) y patch de `tokens`; el techo de bundle se mide y se ajusta con la regla de D-032 si hace falta.

# Capabilities

## Modified Capabilities

- `component-button`: el requirement suma el input `type` y los alias de nombre accesible; los scenarios de tamaño pasan a exigir altura tokenizada (y con ella el centrado vertical del texto) en lugar de padding vertical, y el de estilos exige consumir `component.button.*`.

# Alternativas evaluadas

1. **Corregir solo el centrado, con un ajuste de `line-height` y nada más** — descartada. Arregla el síntoma que se ve y deja intacto el motivo por el que apareció: un componente que se dimensiona con tokens genéricos mientras los suyos están sin conectar. El botón seguiría sin alinear con el select, y el próximo cambio de tamaño volvería a desincronizar el token del render.
2. **Conectar los tokens sin corregir `radius`** — descartada. `component.button.radius` resuelve a `semantic.radius.md` (6 px) y el CSS usa `lg` (8 px): consumir el token tal como está cambiaría la curvatura de todos los botones del kit como efecto colateral de un fix de centrado. El token es el que está mal, y se corrige al valor real.
3. **Centrado óptico con un desplazamiento de 1 px** — descartada. Es un parche sobre el síntoma que además depende de la fuente y del tamaño: cambia con `sm`/`lg` y con cualquier cambio de familia tipográfica. La causa medida es el `line-height` comprimido, y eso es lo que se corrige.
4. **Dejar el nombre accesible sobre el host** — descartada por lo mismo que en el modal: el rol lo tiene el `<button>` interno; sobre el host el atributo es inerte y en sí una violación.

# Impact

- **Código**: `packages/components/src/lib/button/{button.ts, button.html, button.css, button.spec.ts}`, `packages/tokens/src/component/button.json`, la story `OnIconButton` de tooltip, un changeset.
- **Consumidores**: cambio **visual** — el botón pasa de 38 a 40 px en `md` (y equivalentes en `sm`/`lg`), que es lo que sus tokens declaran y lo que lo alinea con el resto de los controles. Sin cambios que rompan la API: `type` y los alias son aditivos.
- **Bundle**: crece por los inputs nuevos; se mide al cerrar y el techo se ajusta con la regla de D-032 si se excede.
- **ADR**: no genera. Ejecuta ADR-003 (jerarquía de tokens), ADR-011 (guarda de disabled, cuyo caso `submit` el propio ADR anticipó) y el patrón de nombre accesible ya establecido.
- **Gate visual del PO (D-022)**: **aplica con peso** — es el único change de la parte con cambio visual deliberado. El gate verifica el centrado reportado, la altura nueva y que el radius no haya cambiado.

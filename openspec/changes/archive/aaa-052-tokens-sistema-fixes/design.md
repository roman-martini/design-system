# Diseño — aaa-052

Seis ítems independientes entre sí; cada uno con su decisión. Dos destaparon un hallazgo que la Parte H no anticipaba y que cambia lo que hay que hacer (D1 y D3).

---

## D1 — Focus ring theme-aware: el token de color y el render nunca coincidieron

### Hallazgo

La review asumía que `semantic.color.focus-ring` era la verdad y que faltaba conectarlo. Al leer los valores, **el token y el render discrepan en los cuatro scopes**, no solo en las marcas:

| Scope   | `semantic.color.focus-ring` declarado | Color que el anillo pinta hoy             |
| ------- | ------------------------------------- | ----------------------------------------- |
| default | `{color.blue.200}`                    | `{color.blue.500}` (vía la primitiva)     |
| dark    | `{color.blue.700}`                    | `{color.blue.400}` (override literal)     |
| brand-a | `{color.green.200}`                   | `{color.blue.500}` — la marca no gobierna |
| brand-b | `{color.purple.200}`                  | `{color.blue.500}` — la marca no gobierna |

Los valores declarados son pálidos (`200`) o demasiado oscuros para su fondo (`blue.700` sobre dark). Leen como un color de halo de un anillo de dos capas que nunca se implementó. Los renderizados (`blue.500` en light, `blue.400` en dark) son los que sostienen el contraste.

Aplica la regla de `aaa-049`: **decidir primero cuál es la verdad**. Conectar el composite al token declarado tal como está sería un rediseño disfrazado de fix — degradaría el anillo de `blue.500` a `blue.200` en light, que casi con certeza no llega a 3:1.

### Decisión

Dos movimientos en el mismo ítem:

1. **Realinear los valores** de `semantic.color.focus-ring` a lo que el sistema efectivamente pinta: `{color.blue.500}` en default y `{color.blue.400}` en dark. Para las marcas, el tono equivalente de su paleta (`{color.green.600}` y `{color.purple.500}` como punto de partida) en vez del `200` pálido.
2. **Recomponer** `semantic.shadow.focus` como `0 0 0 3px {semantic.color.focus-ring}` — alias intra-`semantic` no circular, ya autorizado por la regla de jerarquía desde `aaa-041`. Con `outputReferences: true`, el CSS emite `--ds-semantic-shadow-focus: 0 0 0 3px var(--ds-semantic-color-focus-ring)`, así que el override de marca cascadea sin declarar el box-shadow. `dark.json` deja de overridear `semantic.shadow.focus` (queda solo su `focus-ring`).

Los tonos exactos de marca **los fija el gate**, no el ojo: se suma el par focus-ring → superficie a `packages/tokens/test/contrast-pairs.json` con umbral `ui` (3:1), y como el gate corre cada par contra cada scope, el número lo decide el test. Hoy **no existe ningún par de focus ring** en el archivo — por eso el desajuste sobrevivió.

**Efecto visual**: el anillo pasa a verde en `brand-a` y violeta en `brand-b` (hoy azul). En default y dark el color no cambia. **Ajuste del gate (PO, 2026-08-05)**: el grosor del composite baja de 3px a **2px** — con el border de los fields, el foco quedaba en 4px visuales contra los ~2px del border de las cards de referencia; 2px es además el estándar de Material 3 y Primer. Aplica a todos los scopes.

La primitiva `shadow.focus` queda sin consumidor. Se conserva: la spec la exige y la auditoría ya clasifica las primitivas sin consumidor como inventario deliberado. Se documenta acá para que la próxima corrida no la vuelva a triar.

### Alternativas

- **Overridear `semantic.shadow.focus` en cada theme de marca.** Descartada en `proposal.md`: replica el composite en cuatro lugares y hace que la próxima marca nazca con el bug.
- **Realinear el render al token (bajar el anillo a los `200`).** Descartada: el criterio de desempate es la accesibilidad, y el gate de contraste la vuelve objetiva. Un anillo `blue.200` sobre `bg.surface` blanco no sostiene 3:1.

---

## D2 — Motion compuesto por referencias: dos duraciones fuera de escala

`fast`, `normal`, `slow` y `spring` se conectan sin discusión: sus componentes existen tal cual en `primitives/motion.json` y la conexión des-huérfana `motion.easing.ease-in` y `motion.easing.spring`.

El problema son `overlay-enter` (250ms) y `overlay-exit` (150ms): **ninguna de las dos duraciones está en la escala primitiva** (`instant 0, fast 100, normal 200, slow 300, slower 500`). Que estén fuera de escala es el defecto, no un accidente del detector.

### Decisión

Alinear los overlays a la escala existente: `overlay-enter` = `{motion.duration.normal} {motion.easing.ease-out}` (200ms) y `overlay-exit` = `{motion.duration.fast} {motion.easing.ease-in}` (100ms). La escala queda en 5 peldaños y la regla "ningún preset es un literal" se cumple sin excepciones.

**Esto corrige el alcance declarado en `proposal.md`**: el ítem 4 no es visualmente neutro. Los overlays entran 50 ms más rápido y salen 50 ms más rápido; se mantiene `enter ≥ exit`, la convención que la spec ya exige. Va al gate visual junto con D1 y D6.

### Alternativas

- **Agregar dos peldaños a la escala** (150 y 250) para preservar los valores exactos. Descartada por naming: la escala es de nombres relativos (`fast`/`normal`/`slow`), y 150 y 250 caen _entre_ peldaños existentes, donde ningún nombre relativo queda legible ni ordenable. Extender una escala con rungs innombrables es peor que mover dos valores 50 ms. Si el PO prioriza el timing exacto sobre la escala, esta opción sigue disponible y solo cambia qué se escribe en `primitives/motion.json`.
- **Dejar los dos literales y documentar la excepción.** Descartada: es el estado actual con una nota encima. La auditoría lo volvería a levantar en cada corrida.

---

## D3 — Superficie invertida: `text.on-inverse` sería un sinónimo

La review pedía el par `bg.inverse` / `text.on-inverse`. Al mirar la fuente, **`semantic.color.text.inverse` ya existe** y ya significa exactamente eso: `{color.white}` en default, `{color.neutral.900}` en dark — texto para una superficie invertida.

### Decisión

Agregar **solo** `semantic.color.bg.inverse` y emparejarlo con el `text.inverse` existente. `component.tooltip.bg` → `{semantic.color.bg.inverse}` y `component.tooltip.text` → `{semantic.color.text.inverse}`.

Valores que preservan el render actual, verificados contra la fuente:

| Scope   | tooltip hoy (bg / text)                                  | `bg.inverse` nuevo    | `text.inverse` existente |
| ------- | -------------------------------------------------------- | --------------------- | ------------------------ |
| default | `text.primary` = neutral.900 / `bg.surface` = white      | `{color.neutral.900}` | `{color.white}`          |
| dark    | `text.primary` = neutral.50 / `bg.surface` = neutral.900 | `{color.neutral.50}`  | `{color.neutral.900}`    |

Cambio visual: ninguno. Lo que cambia es que el tooltip deja de usar un token de texto como fondo — hoy resuelve al color correcto por coincidencia de la paleta, no por intención, y cualquier ajuste futuro de `text.primary` se lo llevaría puesto.

### Alternativas

- **Agregar `text.on-inverse` y deprecar `text.inverse`.** Descartada: crea un sinónimo y obliga a una migración de consumidores para ganar solo claridad de nombre. `on-inverse` es el nombre más preciso, pero no lo suficiente como para justificar dos tokens con el mismo valor conviviendo.
- **Dejar el tooltip como está y documentar el cruce.** Descartada: el cruce de roles es justamente lo que la capa semantic existe para evitar.

`semantic.color.icon.inverse`, que la auditoría lista como huérfano, completa la familia y queda disponible para el próximo componente de superficie invertida. No se toca acá.

---

## D4 — Tipografía de component vía semantic: mapear por rol, no por valor

Repuntes concretos (todos preservan el valor resuelto):

| Token de component         | Hoy                    | Pasa a                                         |
| -------------------------- | ---------------------- | ---------------------------------------------- |
| `tooltip.font-size`        | `{font.size.xs}`       | `{semantic.font.size.body-xs}`                 |
| `input.font-size.sm/md/lg` | `{font.size.sm/md/lg}` | `{semantic.font.size.body-sm/body-md/body-lg}` |
| `input.helper.font-size`   | `{font.size.xs}`       | `{semantic.font.size.label-sm}`                |

El criterio es el **rol**, no el valor: `body-xs` y `label-sm` resuelven ambos a `{font.size.xs}`, y el helper de un campo es una anotación del campo — hermano del label, que ya usa `{semantic.font.size.label-md}`. Elegir por valor haría el mapeo arbitrario.

### Cómo se verifica — trinquete sobre el legado (ajustado durante el apply)

La implementación destapó que el bypass tipográfico era mucho más ancho que lo que la review registró: **28 referencias component→`font.*` en 11 componentes**, no solo tooltip/input/alert. Y no todas son mapeables sin juicio: las iniciales del avatar usan `font.size.xs…xl` como escala dimensional — su alias de igual valor para `xl` sería `heading-4`, un mapeo absurdo. Una regla automática "existe alias semantic → falla" daría falsos positivos o forzaría elecciones arbitrarias.

Resolución (PO, 2026-08-05, aplicando el criterio de recomendación de CLAUDE.md): **trinquete/baseline**, el patrón estándar de la industria para imponer una invariante nueva sobre legado existente (ESLint baselines, large-scale changes). `packages/tokens/test/hierarchy.spec.ts` congela las 28 referencias como `LEGACY_FONT_REFS`:

- Una referencia **nueva** de component a `{font.*}` falla el test.
- El baseline **solo se achica**: una entrada saldada que no se borra, falla el test.
- Los repuntes de tooltip/input quedan fijados por aserción testigo.

El burn-down del legado (mapear por rol componente por componente; avatar como probable excepción documentada) es un ítem de backlog que se registra al archivar este change. Las 3 entradas de `alert.*` las salda `aaa-053` al retirar el archivo.

Fuera de la tipografía la regla no aplica: en `dimension.*`/`space.*` la relación es muchos-a-uno y una regla universal forzaría elecciones arbitrarias.

---

## D5 — Separar definición de ejecución del build

`packages/tokens/sd.config.mjs` declara las plataformas y, en sus últimas líneas, corre `buildAllPlatforms()`. Importar la configuración implica ejecutar el build.

Se extrae la ejecución a `packages/tokens/build.mjs`; `sd.config.mjs` pasa a exportar `sdBase`, `themes` y `themeBuilds` sin efectos. `package.json` cambia `build` y `watch` a `node build.mjs`.

El nombre `sd.config.mjs` se conserva: el requirement "Build reproducible con Style Dictionary 4" lo nombra como el lugar donde se declaran los themes, y eso sigue siendo cierto. El comando público (`pnpm -F @romanmartinidev/tokens build`) no cambia, por eso este ítem no lleva delta de spec.

Beneficio concreto: los tests pueden importar la definición para aserciones sobre plataformas y themes declarados sin disparar escrituras en `dist/`.

---

## D6 — Elevación en dark

D-025 fijó el mecanismo: overridear `semantic.shadow.*` en `theme/dark.json` con mayor opacidad, sin tocar geometría.

Los overrides son literales porque la escala primitiva de sombras codifica geometría y color juntos y un theme solo redefine tokens semantic (no puede introducir primitivas). El riesgo de esa duplicación es la deriva: que alguien cambie la geometría en `primitives/shadow.json` y dark quede con la vieja. Se cubre con el test de paridad de geometría del delta de spec, que compara offsets/blur/spread entre scopes y solo tolera diferencia en la componente de opacidad.

Punto de partida de opacidad, a confirmar con el gate y el ojo del PO: `0.05 → 0.2`, `0.1 → 0.4`, `0.25 → 0.6`. Alcanza a `card`, `card-hover`, `dropdown`, `modal`, `toast`; `input` (inner) e `focus` quedan fuera — no son elevación.

### Alternativa evaluada

**Parametrizar el color de la sombra**: mover la geometría a `semantic.shadow.*` y hacer que referencie un `semantic.color.shadow` nuevo, de modo que dark overridee **un solo token** en vez de cinco y la paridad de geometría quede garantizada por construcción en vez de por test. Es estructuralmente superior. Se descarta acá porque orfana las primitivas `shadow.*` (que la spec exige que existan) y porque D-025 decidió el mecanismo con este nivel de granularidad; cambiarlo es una decisión propia, no un detalle de implementación de este change. Queda anotada como candidata a un change futuro si la deriva aparece.

---

## Orden de ejecución

D5 primero (no toca tokens, deja el build importable para los tests que vienen). Después D3 y D4 (sin cambio visual, verificables por diff del CSS emitido). Al final D1, D2 y D6, que son los tres cambios visuales y comparten un único gate visual del PO en el playground, que ya tiene toggle de theme y de marca.

## ADR

No genera ADR. D1 opera dentro de ADR-003 y D6 ejecuta D-025. La alternativa de D6 (parametrizar el color de sombra) sí sería material de ADR si alguna vez se adopta, porque reordena la relación primitives ↔ semantic para una categoría entera.

# Research — Atlassian Design System (atlassian.design)

Fecha: 2026-06-01
Slug: atlassian-design
URLs analizadas:

- https://atlassian.design/foundations/spacing
- https://atlassian.design/foundations/typography
- https://atlassian.design/foundations/elevation
- https://atlassian.design/foundations/iconography
- https://atlassian.design/foundations/motion
- https://atlassian.design/foundations/color, /foundations/color-new, /components/tokens/all-tokens (sin valores extraíbles)
- https://atlassian.design/foundations/shape (HTTP 404)

---

## Limitaciones de la captura

`WebFetch` extrajo con éxito 5 de 9 categorías porque Atlassian documenta tokens en tablas HTML semánticas. Las 4 categorías bloqueadas:

- **Paleta de color**: el page `/foundations/color` describe la filosofía pero **no expone los hex codes** — los referencia desde un design token reference list que está renderizado client-side y `WebFetch` no puede leer.
- **Border radius**: la URL `/foundations/shape` devuelve **HTTP 404**; `/components/tokens/border-radius` también 404.
- **Shadow values**: los nombres de tokens (`elevation.shadow.raised`, `elevation.shadow.overlay`) se extraen, pero el **CSS box-shadow completo** (offsets/blur/spread/rgba) no.
- **Borders**: no hay page dedicada extraíble.

Lo que SÍ se extrajo es suficiente para comparativa estructural (filosofía del sistema, naming, escalas, motion). Sin paleta no se puede emitir recomendación de identidad visual.

---

## 1. Inventario del sistema visual

### 1.1 Paleta

**No determinable sin captura visual.** Atlassian usa naming semántico `color.background.brand.bold` / `color.text.subtle` / etc., pero los hex codes no se exponen en HTML estático.

### 1.2 Tipografía

**Fuentes**: Atlassian Sans, Atlassian Mono (familias propias).

| Token           | Font size       | Weight  | Line height    |
| --------------- | --------------- | ------- | -------------- |
| heading.xxlarge | 32px / 2rem     | Bold    | 36px / 2.25rem |
| heading.xlarge  | 28px / 1.75rem  | Bold    | 32px / 2rem    |
| heading.large   | 24px / 1.5rem   | Bold    | 28px / 1.75rem |
| heading.medium  | 20px / 1.25rem  | Bold    | 24px / 1.5rem  |
| heading.small   | 16px / 1rem     | Bold    | 20px / 1.25rem |
| heading.xsmall  | 14px / 0.875rem | Bold    | 20px / 1.25rem |
| heading.xxsmall | 12px / 0.75rem  | Bold    | 16px / 1rem    |
| body.large      | 16px / 1rem     | Regular | 24px / 1.5rem  |
| body            | 14px / 0.875rem | Regular | 20px / 1.25rem |
| body.small      | 12px / 0.75rem  | Regular | 16px / 1rem    |
| metric.large    | 28px / 1.75rem  | Bold    | 32px / 2rem    |
| metric.medium   | 24px / 1.5rem   | Bold    | 28px / 1.75rem |
| metric.small    | 16px / 1rem     | Bold    | 20px / 1.25rem |
| code            | 12px            | Regular | 20px           |

Letter-spacing: no especificado en la doc.

Concepto **metric**: 3 tokens dedicados a renderizar números/estadísticas prominentes (dashboards, cards de KPIs). Es bold + sizing alineado con headings. **No existe en el DS actual del repo.**

### 1.3 Spacing

Sistema **factor-based**: numerito = porcentaje del base unit (8px = `space.100`).

| Token      | Multiplier | Px  | Rem   |
| ---------- | ---------- | --- | ----- |
| space.0    | 0×         | 0   | 0     |
| space.025  | 0.25×      | 2   | 0.125 |
| space.050  | 0.5×       | 4   | 0.25  |
| space.075  | 0.75×      | 6   | 0.375 |
| space.100  | 1×         | 8   | 0.5   |
| space.150  | 1.5×       | 12  | 0.75  |
| space.200  | 2×         | 16  | 1     |
| space.250  | 2.5×       | 20  | 1.25  |
| space.300  | 3×         | 24  | 1.5   |
| space.400  | 4×         | 32  | 2     |
| space.500  | 5×         | 40  | 2.5   |
| space.600  | 6×         | 48  | 3     |
| space.800  | 8×         | 64  | 4     |
| space.1000 | 10×        | 80  | 5     |

Adicionalmente: **negative tokens** (`space.negative.025` … `space.negative.400`) para overlapping y romper container padding. **No existe en el DS actual.**

### 1.4 Radius

**No determinable.** URLs de shape y border-radius devuelven 404; el page de tokens master no expone valores.

### 1.5 Shadows

Solo **nombres de tokens**, no valores CSS:

- `elevation.shadow.raised`
- `elevation.shadow.overlay`
- `elevation.shadow.overflow.spread`
- `elevation.shadow.overflow.perimeter`

Y tokens de **surface** (no shadow, sino background color/border para sensación de elevación):

- `elevation.surface`, `.sunken`, `.raised`, `.raised.hovered`, `.raised.pressed`, `.overlay`, `.overlay.hovered`, `.overlay.pressed`, `.hovered`, `.pressed`

Z-index extraído (8 niveles vs los 12 que tengo en el repo):

| Z-index | Capa                 | Uso                |
| ------- | -------------------- | ------------------ |
| 100     | (None)               | —                  |
| 200     | Atlassian navigation | Default elevation  |
| 300     | Inline dialog        | Overlay            |
| 400     | Popup                | Overlay            |
| 500     | Blanket              | Background overlay |
| 510     | Modal                | Overlay            |
| 600     | Flag                 | Overlay            |
| 700     | Spotlight            | Overlay            |
| 800     | Tooltip              | Top                |

Escala en **centenas** (vs mis miles): más fácil de mantener pero menos margen para insertar capas intermedias.

### 1.6 Borders

**No determinable** en las URLs visitadas.

### 1.7 Motion

**Rangos por categoría**:

- Interacciones (hover, press): **50–150ms** (ej. list-item hover = 50ms).
- Transiciones (enter/exit/move): **150–400ms** (ej. dropdown entrance = 150ms, modal entrance = 250ms).

**Easings** (4 curvas con intent declarado):

| Token              | cubic-bezier                     | Intent                        | Caso                          |
| ------------------ | -------------------------------- | ----------------------------- | ----------------------------- |
| ease-out-bold      | `cubic-bezier(0, 0.4, 0, 1)`     | "Arrive quickly, decelerate"  | Panel, Flag entrance          |
| ease-in-out-bold   | `cubic-bezier(0.4, 0, 0, 1)`     | "Gentle start, soft settle"   | Scaling Modals, repositioning |
| ease-in-practical  | `cubic-bezier(0.6, 0, 0.8, 0.6)` | "Slow start, accelerate away" | Exit transitions              |
| ease-out-practical | `cubic-bezier(0.4, 1, 0.6, 1)`   | "Subtle everyday entrance"    | Popup, hover fades            |

**Tokens semánticos compuestos**: `motion.popup.enter` = duration + easing + properties (scale/fade/slide/color). **El repo actual no compone así** — separa duration y easing en tokens independientes (`semantic/motion.json` tiene `transition.fast` = `100ms cubic-bezier(...)` pero no por-componente).

### 1.8 Iconografía

- **Librería**: Atlassian Icons (propia, no Lucide/Heroicons/Feather).
- **Tamaño default**: 16×16 px (medium/primary).
- **Tamaño alternativo**: 12×12 px (small — chevrons, validation, badges).
- **Estilo**: 1.5px stroke con rounded corners + sharp interior corners + square line caps. Mezcla de stroke y fill según contexto.
- **Color**: vía design tokens (icon-specific y text color tokens).
- **Formato**: React components + Figma library.

### 1.9 Layout / composición

No determinable sin captura visual. La documentación visible discute principios (alignment, layout primitives) sin valores extraíbles vía WebFetch.

---

## 2. Comparativa contra `--ds-*` actuales

### Spacing

| Token DS actual | Px DS | Token Atlassian   | Px Atlassian | Delta                                                                 |
| --------------- | ----- | ----------------- | ------------ | --------------------------------------------------------------------- |
| —               | —     | space.0           | 0            | DS NO expone `space.0` semántico (sí está en `dimension.0` primitive) |
| space.2xs       | 2     | space.025         | 2            | Compatible                                                            |
| space.xs        | 4     | space.050         | 4            | Compatible                                                            |
| —               | —     | space.075         | 6            | DS NO tiene tick 6 en semantic                                        |
| space.sm        | 8     | space.100         | 8            | Compatible                                                            |
| —               | —     | space.150         | 12           | DS NO tiene tick 12 en semantic                                       |
| space.md        | 16    | space.200         | 16           | Compatible                                                            |
| —               | —     | space.250         | 20           | DS NO tiene tick 20 en semantic                                       |
| space.lg        | 24    | space.300         | 24           | Compatible                                                            |
| space.xl        | 32    | space.400         | 32           | Compatible                                                            |
| —               | —     | space.500         | 40           | DS NO tiene tick 40 en semantic                                       |
| space.2xl       | 48    | space.600         | 48           | Compatible                                                            |
| space.3xl       | 64    | space.800         | 64           | Compatible                                                            |
| —               | —     | space.1000        | 80           | DS NO tiene tick 80 en semantic                                       |
| —               | —     | space.negative.\* | -2 … -32     | DS NO tiene negative tokens                                           |

**Observación**: el DS actual usa naming T-shirt (xs/sm/md/lg) y deja **5 ticks fuera** (6, 12, 20, 40, 80). Eso obliga a usar primitives `dimension.6` directos en CSS cuando un componente los necesita (caso real: el Checkbox usa `dimension.16/20/24` directos por necesidad). Atlassian no tiene ese hueco.

### Typography

| Aspecto             | DS actual                                       | Atlassian                                        | Delta                                                                                  |
| ------------------- | ----------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Fuente sans         | Inter, system-ui, …                             | Atlassian Sans (propia)                          | Estilísticamente diferente; ambas son geométricas modernas                             |
| Fuente mono         | JetBrains Mono                                  | Atlassian Mono (propia)                          | Igual                                                                                  |
| Headings escalones  | 6 (h1 36, h2 30, h3 24, h4 20, h5 18, h6 16 px) | 7 (xxlarge 32 → xxsmall 12 px)                   | DS tope = 36 px, Atlassian tope = 32 px. DS tiene un nivel más visualmente jerárquico. |
| Body escalones      | 4 (body-lg/md/sm/xs = 18/16/14/12 px)           | 3 (large/default/small = 16/14/12 px)            | DS tiene body-lg = 18 px que Atlassian no tiene                                        |
| Metric tokens       | **No existe**                                   | 3 tokens (large/medium/small)                    | Gap del DS. Útil para KPIs/dashboards                                                  |
| Heading weight      | Bold (700)                                      | Bold                                             | Compatible                                                                             |
| Line height heading | tight (1.25)                                    | "tight-ish" (proporciones 1.125–1.33 según size) | Atlassian varía por size; DS usa `tight` global                                        |
| Letter spacing      | 6 tokens declarados (tighter…widest)            | No especificado en la doc                        | DS más completo a nivel de primitive                                                   |

### Motion

| Aspecto                     | DS actual                                   | Atlassian                                                              | Delta                                                                                                                       |
| --------------------------- | ------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Durations                   | 5 niveles (0/100/200/300/500ms)             | Rangos por categoría (50–150ms interacciones / 150–400ms transiciones) | DS es más rígido (timing fijo); Atlassian guía por rango                                                                    |
| Easings                     | 5 curvas (linear + 4 cubic-bezier)          | 4 curvas nombradas con intent (bold/practical × in/out)                | Conceptos diferentes — DS usa nombres técnicos (`ease-in`, `ease-out`), Atlassian usa intent semántico (`bold`/`practical`) |
| Combinación duration+easing | `transition.fast/normal/slow/spring` global | `motion.<component>.enter/exit` por-componente                         | Atlassian compone por componente; DS expone primitives combinables                                                          |
| `ease-in-out` (DS)          | `cubic-bezier(0.4, 0, 0.2, 1)`              | `ease-in-out-bold = (0.4, 0, 0, 1)`                                    | Curvas DIFERENTES: el out-control point es 0.2 vs 0. Atlassian "se asienta más rápido" al final                             |

### Z-index

| Aspecto            | DS actual                                               | Atlassian                                      |
| ------------------ | ------------------------------------------------------- | ---------------------------------------------- |
| Escala             | Miles (10/1000/1020/1030/1040/1050/1060/1070/1080/1090) | Centenas (100/200/300/400/500/510/600/700/800) |
| Niveles            | 12                                                      | 8                                              |
| Margen entre capas | 10 unidades                                             | 100 unidades                                   |

DS tiene más capas declaradas (sticky vs banner vs overlay), Atlassian colapsa más. DS está alineado a la convención Bootstrap/Tailwind (1000+); Atlassian usa su escala interna.

### Iconografía

| Aspecto      | DS actual       | Atlassian                                |
| ------------ | --------------- | ---------------------------------------- |
| Librería     | **No definida** | Atlassian Icons propia                   |
| Default size | **No definido** | 16×16 px                                 |
| Stroke width | **No definido** | 1.5px                                    |
| Estilo       | **No definido** | Rounded corners + sharp interior corners |

**Gap completo del DS** — no hay decisiones tomadas sobre iconografía. Atlassian ofrece referencia clara cuando llegue ese momento.

### Paleta / Radius / Shadow values / Borders

**No determinables sin captura visual** del lado de Atlassian. Comparativa imposible.

---

## 3. Conflictos con decisiones existentes

**Ninguno bloqueante.** ADR-003 (tokens) y ADR-004 (components) son agnósticos del sistema visual concreto — gobiernan estructura (primitive→semantic→component→theme, prefix `--ds-*`, etc.). Cualquier valor de Atlassian se puede mapear a esa estructura sin tocar ADRs.

Posibles fricciones menores (no bloqueantes):

- Si se adopta el naming factor-based (`space.100`) en lugar de T-shirt (`space.md`): **modificaría una convención semantic** documentada en SPC-002 → requeriría delta de SPC-002 y posible ADR si el cambio es one-way door. **No recomendado**: T-shirt es más legible en CSS de componente.
- Si se adopta `metric.*` typography: amplía SPC-002 sin reemplazar nada. **Cambio aditivo, sin breaking.**

---

## 4. Recomendación

**Inspiración selectiva.**

Justificación contra prioridades del repo:

- **Buenas prácticas**: el DS actual ya tiene una estructura jerárquica primitives→semantic→component→theme equivalente a Atlassian. La diferencia estructural más interesante (tokens semánticos compuestos por componente, como `motion.popup.enter`) es válida pero corresponde decidirla al crear cada componente en su propio CHG, no en un refactor masivo aquí.
- **Escalar ordenado**: adoptar cualquier categoría completa de Atlassian sin tener su paleta extraíble dejaría el sistema "mitad Atlassian, mitad DS actual" — peor que dejarlo coherente. La comparación honesta es: lo que SÍ se extrajo confirma que el DS actual está estructuralmente sano.
- **Mantenibilidad**: las ideas adoptables son chicas y aditivas. Aplicarlas requiere micro-changes (sumar tokens) que no rompen nada existente.

**Lo que vale adoptar como inspiración** (cada uno como CHG separado cuando aparezca la necesidad real, no en bulk):

1. **Sumar `space.0`** a `semantic/space.json` (mapeado a `dimension.0`). **Por qué**: hoy un dev que quiera `gap: 0` con tokens semánticos no tiene el ítem. Triviales.
2. **Agregar ticks faltantes a semantic space** (`space.sm-plus` = 6, `space.md-plus` = 12, etc., con nombres a decidir) **solo si aparece necesidad concreta** repetida — el Checkbox ya tuvo que usar primitives directos (`dimension.16/20/24`); ese síntoma vale como una observación, no urgencia.
3. **Agregar tokens `metric.*` semánticos** si se va a renderizar cifras prominentes en algún componente futuro (dashboard, stat card). Cubrir 3 niveles: small/medium/large.
4. **Considerar `space.negative.*`** cuando aparezca el primer componente con overlap (avatares apilados, badges sobre imagen). No urgente.
5. **Renombrar easings de motion con intent** (al estilo Atlassian `bold`/`practical`) **NO RECOMENDADO** — los nombres técnicos del DS actual (`ease-in-out`, `ease-out`) son convención industria. Cambiar a `bold` es estética de marca Atlassian.
6. **Decidir iconografía** (cuando aparezca el primer componente que la necesite — Modal con X de cierre, Select con chevron): adoptar **16px default + 1.5px stroke** como starting point. Librería: **Lucide** (open-source, mantenida activamente) en lugar de hacer una propia (Atlassian Icons es propia y propietaria).

**Lo que NO vale adoptar**:

- Sistema de naming factor-based (`space.100`). T-shirt sizing (`space.md`) es más legible y ya está en uso.
- Z-index en centenas. La escala en miles (Bootstrap/Tailwind compatible) está alineada con convenciones de comunidad y permite más holgura.
- Fuente Atlassian Sans/Mono. Inter + JetBrains Mono cubren el rol con licencia open-source.

---

## 5. Esbozo de propuesta OpenSpec (si aplica)

Las adopciones recomendadas son **micro-changes aditivos**, cada uno con su CHG individual cuando se decida ejecutar:

| CHG tentativo                    | Esfuerzo                                                                                                   | Bloquea                                          |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `tokens-add-space-zero`          | 1 sesión (≤2h): sumar `space.0` a `semantic/space.json`, delta SPC-002, changeset patch                    | Nada                                             |
| `tokens-add-metric-typography`   | 1 sesión: sumar 3 tokens a `semantic/typography.json`, delta SPC-002, changeset minor                      | Cuando se necesite el primer stat-display        |
| `tokens-add-negative-space`      | 1 sesión: sumar negativos a `semantic/space.json`, delta SPC-002, changeset minor                          | Cuando aparezca el primer componente con overlap |
| `components-decide-icon-library` | 2 sesiones: ADR-008 (Lucide vs Heroicons vs Feather), agregar primer ícono al primer componente que lo use | Cuando se agregue Modal o Select                 |

**No se proponen changes que rompan ADRs existentes.** El sistema actual queda intacto; las adopciones son incrementales y opcionales.

---

## Observaciones meta (para mejorar la skill `research-design-system`)

Después de probar la skill contra Polymer (bloqueada por compilación moderna sin CSS extraíble) y Atlassian (parcial, 5 de 9 categorías), patrones detectados que merecen iterar:

1. **`WebFetch` solo sirve para sitios que documentan su DS como TEXTO** (tablas HTML con valores). Sitios compilados con CSS-in-JS, runtime-rendered o con tokens en JS bundles **no son investigables** con esta tool.
2. **Mejores candidatos** para esta skill: documentation sites de DS públicos (Atlassian, Carbon, Material Design 3, Polaris de Shopify, Spectrum de Adobe, Lightning de Salesforce, Primer de GitHub, Open Props).
3. **Peores candidatos**: marketing sites de productos SaaS modernos (Polymer.co, Stripe, Linear, Vercel) — su CSS está en bundles compilados que `WebFetch` no expone.
4. **El paso 0 ("verificar que el sitio expone su DS textualmente") debería existir en la skill** antes de continuar. Si no se extrae nada útil del primer fetch, pausar y proponer alternativas en vez de seguir.
5. **Sumar headless browser (Playwright)** como herramienta complementaria habilitaría los sitios del grupo 3 — es la opción B mencionada en `polymer-co.md`. Aprendizaje confirmado.

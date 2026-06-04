# Research — Polymer (polymer.co)

Fecha: 2026-06-01
Slug: polymer-co
URL principal: https://www.polymer.co/features
URLs analizadas:

- https://www.polymer.co/features (Chromium headless, viewport 1440x900)

Método de captura: **Playwright headless (skill v2.0, paso 2-B)**

Captura previa con WebFetch falló — confirmado el sitio usa CSS-in-JS (Emotion, clases tipo `css-1m2ugdg-FeatureSection_MobileTab`) sin custom properties expuestas en `:root`.

---

## Limitaciones de la captura

- **Sin custom properties `--*`**: el sitio no expone tokens semánticos en CSS variables. Toda la estructura visual está en clases generadas por Emotion. Imposible mapear tokens de adopción 1:1; hay que inferir intenciones.
- **Sin inputs visibles** en `/features` (no es página con formularios).
- **Media queries no extraídas**: probablemente inyectadas en estilos cross-origin a los que el script no accede via `document.styleSheets`.
- **Estados hover/focus**: el script captura computed styles base, no estados interactivos. Inferibles solo del `transition` declarado.
- **Animations en JS**: si el sitio anima con `animate()` API o GSAP, no se observa estáticamente.

---

## 1. Inventario del sistema visual

### 1.1 Paleta

Solo 5 colores observados en este page. El sitio es **deliberadamente neutral** (blanco / negro / 3 grises).

| Hex       | RGB              | Rol inferido                     | Dónde se observó                                              |
| --------- | ---------------- | -------------------------------- | ------------------------------------------------------------- |
| `#FFFFFF` | rgb(255,255,255) | Surface base                     | `<main>`, `<section>`, meta `theme-color`, background general |
| `#000000` | rgb(0,0,0)       | Text primary, footer surface     | `<body>` color, `<h1>`-`<h4>` color, `<footer>` background    |
| `#4D4D4D` | rgb(77,77,77)    | Text subtle (párrafos)           | `<p>` color                                                   |
| `#727272` | rgb(114,114,114) | Text muted (UI secundario)       | Header text, links inactivos                                  |
| `#F5F5F5` | rgb(245,245,245) | Surface raised / button selected | Background del tab activo en FeatureSection                   |

**No se detectó** ningún color de marca acentuado (azul, violeta, etc.) en este page. Posibles razones: (a) la marca usa colores acentuados solo en CTAs principales fuera del scope capturado, (b) el sitio es intencionalmente monocromático (tendencia 2024-2026 en SaaS B2B premium).

### 1.2 Tipografía

**Familia única**: `Suisse, sans-serif` (fuente propietaria/comercial — no en Google Fonts). Weights cargados: **400, 450, 500, 600**. La presencia de **450** es atípica — usualmente se usa 400 o 500, pero no el intermedio.

| Elemento          | Font size           | Weight  | Line height               | Ratio L/H | Color     |
| ----------------- | ------------------- | ------- | ------------------------- | --------- | --------- |
| `h1`              | 48px                | 700     | 62.4px                    | 1.30      | `#000000` |
| `h2`              | 30px                | 600     | 39px                      | 1.30      | `#000000` |
| `h3`              | 18px                | 600     | 28.8px (Arial fallback ⚠) | 1.60      | `#000000` |
| `h4`              | 16px                | 600     | 25.6px                    | 1.60      | `#000000` |
| `body` / `<body>` | 16px                | 400     | 19.36px                   | 1.21      | `#000000` |
| `<p>`             | 16px                | 400     | 25.6px                    | 1.60      | `#4D4D4D` |
| Buttons           | 13.33px (≈0.833rem) | 400-600 | —                         | —         | varía     |

Observaciones:

- **`h3` cae a Arial** — bug del sitio: Suisse no cubre el peso aplicado a `h3` o hay un override que pierde la familia. No es una decisión de diseño, es un drift de implementación.
- **`<body>` tiene line-height 1.21 (apretado)** mientras `<p>` usa 1.60. Inconsistencia visible — probablemente el body es contenedor y los párrafos sobreescriben.
- **Tipografía 100% sin serif**, una familia, weight como única variable. Aproach minimalista.
- **Letter-spacing**: `normal` en todos. Sin tracking declarado.
- **`<small>`, `<code>`, `h5`, `h6`**: no presentes en este page.

### 1.3 Spacing

Datos parciales — el script no extrae `padding`/`margin` por estilo computado de cada elemento, pero los valores observados en componentes específicos:

- Button mobile tab: `padding: 12px 14px 12px 12px` → asimétrico (no aligned a una escala 4-8-16).
- Button desktop tab: `padding: 16px 20px` → alineado a escala 4/8 (16 y 20 son múltiplos limpios).
- Navigation toggle button: `padding: 8px`.

Escala inferida: **probablemente 4-8-12-16-20-...** (mismos ticks que el repo + el 20px que falta en mi semantic).

### 1.4 Radius

| Elemento                  | Border-radius     |
| ------------------------- | ----------------- |
| Tabs (FeatureSection_Tab) | `6px`             |
| Otros buttons             | `0px` (cuadrados) |
| Mobile tab                | `0px`             |

**Convención**: solo elementos "card-like" (tabs con bg distinto) reciben radius. Buttons inline cuadrados. Coincide con el DS actual: `radius.md = 6px` calza exactamente.

### 1.5 Shadows

Todos los elementos capturados tienen `box-shadow: none`. El sitio **no usa shadows** como mecanismo de elevación en este page. Si los usa en modales/dropdowns, no se observa aquí.

### 1.6 Borders

- Navigation toggle: `border: 0px none rgb(0, 0, 0)` (sin borde).
- Tab mobile: `border: 0px 0px 2px ... solid rgb(0, 0, 0)` → **border-bottom 2px solid black** en estado activo, gris (`rgb(102,102,102) = #666666`) en inactivo. **Sexto color** del sistema, no listado en paleta arriba porque solo aparece en bordes.
- Tab desktop: `0px none` (sin borde, diferencia visual va por bg).

### 1.7 Motion

| Elemento          | Transition                                                             |
| ----------------- | ---------------------------------------------------------------------- |
| Tab desktop       | `background-color 0.2s` (200ms, sin easing declarado → default `ease`) |
| Tab mobile        | `0.2s` (todas las propiedades, 200ms)                                  |
| Navigation toggle | `all` (sin duración explícita)                                         |
| Generic buttons   | `all`                                                                  |

**Duración estándar**: 200ms. **Easing**: default del browser (`ease` = cubic-bezier(0.25, 0.1, 0.25, 1)). Sin custom easings declarados.

### 1.8 Iconografía

No determinable — el script no extrae SVGs ni `<i class="icon-...">`. Habría que inspeccionar las clases `Navigation_Toggle` y similares manualmente. Inferencia limitada: el sitio usa iconos (hay un toggle de navegación) pero no se identifica librería.

### 1.9 Layout / composición

- **Viewport**: `width=device-width, initial-scale=1` (estándar mobile-friendly).
- **Theme-color** meta: `#FFFFFF` (tab del browser claro).
- **Hero**: no extraído como bloque, pero el `<h1>` a 48px sugiere hero centrado o asimétrico con typography prominente.
- **Sin grid system visible** en computed styles del script. Probable: CSS Grid o Flexbox declarado en clases Emotion no inspeccionables.
- **Breakpoints**: no extraídos (media queries en bundles cross-origin).
- **Stack tecnológico inferido**: Emotion + React (clases con hash CSS), probablemente Next.js (typical para SaaS marketing).

---

## 2. Comparativa contra `--ds-*` actuales

### Paleta

| Aspecto        | DS actual                                                       | Polymer.co                                          | Delta                                                                                      |
| -------------- | --------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Surface base   | Tokens semánticos `--ds-semantic-color-bg-*` (no auditados aún) | `#FFFFFF`                                           | Sin contradicción posible (DS tiene paleta amplia, Polymer solo neutral)                   |
| Text primary   | (TBD del repo)                                                  | `#000000`                                           | Idem                                                                                       |
| Accent / brand | (TBD)                                                           | **No observado**                                    | DS tendrá accent; Polymer no lo expone en `/features`                                      |
| Grises         | (TBD primitives `color.gray.*`)                                 | `#727272` muted, `#4D4D4D` subtle, `#F5F5F5` raised | DS tiene escala de gray. Polymer usa 3 puntos — compatible si los míos cubren esos 3 stops |

**Inferencia**: la paleta de Polymer.co es **un subset de cualquier sistema neutral standard**. Adoptarla = restringir voluntariamente la riqueza del DS actual. Solo tiene sentido si Roman busca estética monocromática deliberada.

### Tipografía

| Aspecto                        | DS actual                                               | Polymer.co                                              | Delta                                                                                                                                                           |
| ------------------------------ | ------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sans-serif                     | Inter                                                   | Suisse (propietaria)                                    | Inter es estructuralmente similar (geométrica neo-grotesque). Suisse es comercial — adoptarla requeriría licencia. Inter cubre el rol estéticamente cercano.    |
| Weights                        | 7 (thin..extrabold = 100, 300, 400, 500, 600, 700, 800) | 4 (400, 450, 500, 600) — sin bold real                  | Polymer NO usa 700 en headings (pero su h1 está a 700 — inconsistencia). DS tiene espectro más amplio.                                                          |
| Escala headings                | 6 niveles (h1 36px → h6 16px)                           | 4 niveles observados (h1 48px → h4 16px) con tope mayor | Polymer h1 = 48px > mi h1 = 36px. Adoptar tope alto puede tener sentido para landing pages, pero el DS está pensado para componentes de UI, no marketing pages. |
| Line-height                    | `tight` (1.25) en headings, `normal` (1.5) en body      | 1.30 en headings, 1.21 en body, 1.60 en `<p>`           | Polymer headings ligeramente más relajados (1.30 vs 1.25). DS body está alineado a `<p>` (1.5 vs 1.6) — compatible.                                             |
| Familia propietaria vs sistema | Inter (open-source, Google Fonts)                       | Suisse (Swiss Typefaces, licencia comercial)            | DS prioriza open-source. Sin cambio.                                                                                                                            |

### Spacing

| Aspecto          | DS actual                              | Polymer.co                         |
| ---------------- | -------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Escala detectada | 2-4-8-16-24-32-48-64 (T-shirt sizing)  | Múltiplos de 4 con `20px` presente | El `20px` ya está en `dimension.20` (primitive) pero no en `semantic.space` — gap detectado previamente con Atlassian, confirmado acá |
| Asimetría        | DS no usa padding asimétrico en tokens | Polymer sí (`12px 14px 12px 12px`) | Diferencia de filosofía — Polymer parece pegar padding ad-hoc en CSS-in-JS sin tokens                                                 |

### Radius

| Aspecto | DS actual                                             | Polymer.co              |
| ------- | ----------------------------------------------------- | ----------------------- | --------------------------------------------- |
| Escala  | `radius.xs/sm/md/lg/xl/2xl/full` = 2/4/6/8/12/16/9999 | Solo 0 y 6px observados | DS cubre la convención de Polymer sin cambios |

### Shadows

| Aspecto                  | DS actual                        | Polymer.co                |
| ------------------------ | -------------------------------- | ------------------------- | --------------------------------------------- |
| Tokens shadow semánticos | Existen (`semantic/shadow.json`) | Cero shadows en este page | No comparable — Polymer no usa elevation aquí |

### Motion

| Aspecto                      | DS actual                                                         | Polymer.co                         |
| ---------------------------- | ----------------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Duración estándar            | `transition.normal = 200ms cubic-bezier(0, 0, 0.2, 1)` (ease-out) | `200ms` con easing default browser | Misma duración. Polymer usa default `ease` que es menos snappy que mi `ease-out`. Mi DS tiene mejor curva. |
| Tokens semánticos compuestos | `transition.fast/normal/slow/spring`                              | Inline en CSS-in-JS, sin tokens    | DS tiene mejor estructura                                                                                  |

### Iconografía

| Aspecto  | DS actual                      | Polymer.co      |
| -------- | ------------------------------ | --------------- | ---------------------------------------------- |
| Librería | **No decidida** (gap conocido) | No determinable | Sin info de Polymer para tomar como referencia |

### Layout

| Aspecto          | DS actual                 | Polymer.co |
| ---------------- | ------------------------- | ---------- | ---------------------------------------- |
| Theme-color meta | No definido en playground | `#FFFFFF`  | Trivial sumar al template del playground |
| Viewport         | Estándar                  | Estándar   | Igual                                    |

---

## 3. Conflictos con decisiones existentes

**Ninguno bloqueante.** Polymer.co es estética minimalista; el DS actual cubre todo lo observado sin contradicción.

Observaciones menores:

- ADR-003 (tokens) define jerarquía primitive→semantic→component→theme. Polymer **no usa esta jerarquía** (CSS-in-JS sin tokens). Adoptar valores específicos de Polymer requiere mapearlos a la jerarquía propia — no conflicto, solo trabajo de traducción.
- ADR-004 (components) define `--ds-*` como contract de styling. Polymer no expone tokens. No hay nada que "consumir" directamente.

---

## 4. Recomendación

**Inspiración selectiva.**

Justificación contra prioridades del repo:

- **Buenas prácticas**: el DS actual tiene mejor estructura que Polymer (jerarquía de tokens, easings declarados, tipografía open-source). Adoptar bajaría calidad estructural.
- **Escalar ordenado**: Polymer es deliberadamente restringido (sin accent, sin shadows, una sola familia). Adoptarlo cerraría puertas estructurales sin razón clara.
- **Mantenibilidad**: la fuente Suisse es propietaria. Inter (DS actual) es open-source y mantenida activamente. Migrar a Suisse sumaría licencia + costo + riesgo.

**Lo que vale tomar como inspiración**:

1. **Disciplina cromática**: Polymer usa **5 colores total** (blanco, negro, 3 grises) y consigue identidad fuerte. Lección de diseño: un sistema bien armado no necesita 50 colores. Aplicación práctica en el DS actual: cuando se diseñen tokens semánticos por estado (success/warning/danger), no exagerar la paleta.
2. **Tipografía bold por contraste**: h1 a 48px/700 funciona como ancla visual. Sumar un token `font.size.hero` (48px o más) al primitive scale podría servir para landing pages futuras del playground.
3. **Motion sutil**: 200ms transition es el sweet spot — coincide con mi `transition.normal`. Validación del setting actual del DS.

**Lo que NO vale adoptar**:

- Fuente Suisse (licencia comercial).
- Weight 450 (intermedio no estándar — Inter no lo trae nativo).
- Padding asimétrico ad-hoc (anti-pattern de tokenización).
- CSS-in-JS como mecanismo de styling (incompatible con ADR-004 que define CSS plain + tokens).
- Ausencia de shadows (Polymer no las usa porque su estética es minimal; el DS sí las necesita para Modal, Dropdown, Tooltip).
- Inconsistencia tipográfica (`<body>` LH 1.21 vs `<p>` 1.60, h3 cayendo a Arial).

---

## 5. Esbozo de propuesta OpenSpec (si aplica)

**No requiere CHG OpenSpec ahora.** Las observaciones de Polymer son inspiracionales, no proponen cambios estructurales.

Posibles CHGs aditivos opcionales, solo si aparecen casos de uso reales:

| CHG tentativo                 | Disparador                                                             | Esfuerzo |
| ----------------------------- | ---------------------------------------------------------------------- | -------- |
| `tokens-add-hero-font-size`   | Si el playground gana una landing page que necesite typography a 48px+ | 1 sesión |
| `tokens-add-theme-color-meta` | Si el playground agrega meta `theme-color` para PWA-like behavior      | <1h      |

Ambos triviales — esperar trigger real.

---

## Comparación con la primera versión de este reporte

La primera versión (escrita con WebFetch puro) estaba **bloqueada** — todas las categorías marcadas "no determinable sin captura visual". Esta segunda versión, con el script Playwright (skill v2.0 paso 2-B), pudo extraer:

- ✅ Paleta (5 colores, 6 con border-color del tab).
- ✅ Tipografía (4 niveles de heading + body + p, fonts).
- ✅ Spacing (parcial — buttons sí, no scale completa).
- ✅ Radius (2 valores).
- ✅ Shadows (confirmado: ninguno).
- ✅ Borders (border-bottom de tabs).
- ✅ Motion (200ms estándar).
- ⚠ Iconografía (no determinable sin SVG extraction adicional).
- ⚠ Layout (parcial — viewport y theme-color, no grid).

La skill v2.0 con el script Playwright **resuelve el bloqueo** que la v1.0 declaraba para sitios compilados modernos. Confirmado el valor del setup.

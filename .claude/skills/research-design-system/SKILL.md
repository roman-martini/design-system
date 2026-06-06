---
name: research-design-system
description: Investigate the visual system of an external website and produce a reasoned adoption report for this design system repo. Use when the user wants to study a reference site (Polymer, Stripe, Linear, Vercel, Carbon, Material, Atlassian, etc.) before deciding whether to adopt, adapt, or discard pieces of its visual language.
license: MIT
metadata:
  author: roman.martini.dev@gmail.com
  version: "2.0"
---

# research-design-system

Estudiá el sistema visual de un sitio externo y producí un informe estructurado en `docs/design/research/<slug>.md` que permita a Roman decidir adopción sin tener que revisitar el sitio.

**Esta skill es para investigación, no para implementación.** Nunca tocás `packages/tokens/`, `packages/components/`, `apps/playground/` ni creás ADRs o propuestas OpenSpec en esta fase. El research alimenta una decisión posterior; la implementación va por otro lado.

---

## Input

El usuario invoca con `/ds:research-design-system <url>` o describe el sitio en lenguaje natural. Extraé:

- **URL principal** del sitio (obligatoria).
- **URLs complementarias** opcionales (home, pricing, blog, changelog).
- **Foco específico** opcional: si el usuario aclaró "solo paleta y typography", respetá el scope.

Si no hay URL clara, **preguntá** antes de seguir. No inventés ni asumás.

El **slug del archivo de salida** se deriva del dominio: `https://www.polymer.co/features` → `polymer-co.md`. Si ya existe, sufijar con fecha: `polymer-co-2026-06-01.md`.

---

## Tipos de sitio y herramienta correcta

| Tipo de sitio | Ejemplos | Herramienta |
|---|---|---|
| **Documentación pública de un DS** (foundations/tokens listados como texto en HTML) | Atlassian Design System, Carbon (IBM), Material 3, Polaris (Shopify), Spectrum (Adobe), Lightning (Salesforce), Primer (GitHub), Open Props | `WebFetch` rinde — lee tablas HTML. |
| **Sitio SaaS / marketing compilado** (CSS-in-JS, Emotion, styled-components, runtime-rendered) | Polymer.co, Stripe, Linear, Vercel, Notion, Figma marketing, Asana | `WebFetch` NO rinde — usar el script Playwright (paso 2-B). |
| **App con shadow DOM o auth gate** | Apps detrás de login | No investigable sin acceso. Pausar y declarar. |

---

## Workflow

### 0. Pre-flight — clasificación + probe rápido

Antes de hacer fetch completo:

1. **Clasificar** el sitio según tabla arriba. Si el TLD/path sugiere documentación de DS (`atlassian.design`, `carbondesignsystem.com`, etc.), priorizar workflow textual. Si es marketing SaaS o producto compilado, ir directo al script Playwright.
2. **Probe rápido** con `WebFetch` a la URL principal preguntando solo por: `(a) lista de hex codes presentes, (b) lista de font-family declarations, (c) lista de stylesheet URLs, (d) primeros 3 elementos button con su class`. **Si el probe devuelve "none found" o "not visible" en TODOS los puntos**: el sitio es del grupo 2 → saltar a paso 2-B sin perder más tiempo con WebFetch.
3. **Si el probe rinde** (al menos hex codes o classes detectables): seguir con workflow textual (paso 2-A).

### 1. Anclaje en el repo (siempre)

Leé en este orden, independiente del tipo de sitio:

1. `CLAUDE.md` — prioridades del repo y convenciones.
2. `docs/architecture/README.md` — mapa mental del sistema actual.
3. `docs/architecture/decisions-log.md` — ADRs aceptados que pueden chocar con la adopción.
4. **Todos** los JSON en `packages/tokens/src/` — primitives, semantic, component, theme. Este es el inventario actual contra el que vas a comparar.
5. Los ADRs relacionados a tokens y components (`ADR-003`, `ADR-004`, `ADR-007` si existe).

Si algo del repo contradice la adopción (ej. un ADR explícito que prohíbe motion compleja), declaralo en la sección "Conflictos con decisiones existentes" del informe.

### 2-A. Captura textual (sitios de documentación de DS)

Usar `WebFetch` con URLs específicas de foundations:

- `/<domain>/foundations/color` o `/color-palette` → paleta con hex.
- `/<domain>/foundations/typography` → escala tipográfica.
- `/<domain>/foundations/spacing` → escala de spacing.
- `/<domain>/foundations/shape` o `/border-radius` → radius.
- `/<domain>/foundations/elevation` o `/shadow` → shadows + z-index.
- `/<domain>/foundations/motion` → durations + easings.
- `/<domain>/foundations/iconography` → librería de iconos.

**Limitación residual de `WebFetch`**: incluso en sitios de documentación, los hex codes específicos a veces se renderizan client-side (ej. Atlassian color palette). Si una categoría falla, declarar "no determinable sin captura visual" y seguir con las demás.

### 2-B. Captura via headless browser (sitios compilados o cualquier sitio bloqueado)

Ejecutar el script Playwright que vive al lado de este SKILL.md:

```bash
node .claude/skills/research-design-system/scripts/extract-design.mjs <url> > /tmp/extract.json
```

El script abre la página con Chromium headless, espera networkidle + 800ms, y extrae:

- `meta` (theme-color, viewport, description).
- `customProperties` (todas las `--*` de `:root` y `[data-theme]`).
- `fonts` (familias cargadas vía `document.fonts`).
- `typography` (computed styles de body, h1-h6, p, small, code).
- `colorsSamples` (bg/color/border de body, header, footer, main).
- `buttonsSamples` (hasta 10 buttons distintos: bg, color, border-radius, padding, font, box-shadow, transition).
- `inputsSamples` (hasta 3 inputs).
- `cardsSamples` (hasta 5 cards detectados por `[class*="card"]`, `article`).
- `linksSamples` (color, text-decoration, weight).
- `mediaQueries` (extraídas de stylesheets accesibles).

**Limitaciones residuales del script**:

- Stylesheets cross-origin: las media queries de bundles externos no se leen.
- Páginas detrás de login: el script no autentica.
- Animations: se observan transiciones declaradas, no se gravan ejecuciones.
- El JSON puede ser grande. Si excede ~30000 chars al leerlo, hacer head/tail o filtrar antes de incorporarlo al inventario.

Variante con viewport específico (útil para detectar breakpoints):

```bash
node .claude/skills/research-design-system/scripts/extract-design.mjs <url> --viewport=375x800
```

### 3. Inventario del sistema visual

Llenar las 9 categorías a partir de lo extraído (texto o JSON Playwright):

| Categoría | Qué buscar |
|---|---|
| **Paleta** | Custom properties (`:root` o `[data-theme]`), background-color de hero/cards/buttons, text colors. Convertir RGB a hex donde sea posible. Inferir rol semántico (primary, surface, text-emphasis, success, warning, danger). |
| **Tipografía** | Font-family stack, font-sizes detectados con su contexto (h1/h2/body/caption), font-weights, line-heights, letter-spacing. Detectar si son fuentes propietarias, sistema, Google Fonts. |
| **Spacing** | `padding` y `margin` recurrentes. Inferir escala (4 / 8 / 12 / 16 / 24 / 32 / 48 / 64). |
| **Radius** | `border-radius` por tipo de elemento (button, card, input, badge). |
| **Shadows** | `box-shadow` por nivel (subtle elevation, dropdown, modal). |
| **Borders** | `border-width`, colores, estilos. |
| **Motion** | `transition-duration`, `transition-timing-function`, `animation-*`. |
| **Iconografía** | Detectar librería (Lucide, Feather, Heroicons, custom SVG). Stroke vs fill. Tamaños recurrentes. |
| **Layout / composición** | Patrones de hero, grid, spacing vertical, breakpoints inferidos. |

### 4. Comparativa contra `--ds-*`

Para cada categoría, generar una tabla:

| Categoría | Actual (`--ds-*`) | Sitio | Delta / Compatibilidad |
|---|---|---|---|
| color.primary | `#2563EB` | `#7C3AED` | Cambio de hue — decisión de marca |
| space scale | 4-8-16-24-32 | 4-8-12-16-24-32-48 | Compatible; sumamos ticks |
| radius.md | 6px | 12px | Sitio más rounded |

Las filas "no determinable" son OK — honestidad sobre la limitación.

### 5. Recomendación razonada

Elegir **una sola** opción y argumentarla contra las 3 prioridades del repo:

- **Reemplazo total** — solo si el sitio tiene un sistema dramáticamente mejor o Roman busca cambio de identidad visual.
- **Adopción parcial** — pisamos algunas categorías, mantenemos otras.
- **Theme alternativo** — nuevo `theme.json`, mantiene el actual como default. Cero breaking.
- **Inspiración selectiva** — no copiamos valores; tomamos ideas estructurales.
- **Descarte** — el sitio no aporta. Documentar por qué evitar volver a evaluarlo.

Cada opción se mide contra:

- **Buenas prácticas**: ¿el sistema del sitio tiene jerarquía clara? ¿WCAG AA en contrastes inferibles?
- **Escalar ordenado**: ¿la adopción rompe ADRs aceptados? ¿genera deuda?
- **Mantenibilidad**: ¿podemos mantener el sistema con esos valores? ¿cuántos componentes hay que tocar?

### 6. Próximos pasos (esbozo, no creación)

Si la recomendación implica cambio significativo (≥2 packages, refactor de tokens base, rediseño visual), **esbozar** la propuesta OpenSpec en la última sección:

- Nombre tentativo: `tokens-adopt-<slug>` o `components-restyle-<slug>`.
- Qué specs modifica (ej. design-tokens-package, components-package).
- Qué ADR sería necesario.
- Estimación en sesiones (≤2h cada una).

**NO crear** el `proposal.md` ni el ADR. El esbozo va dentro del archivo de research.

---

## Output: estructura del archivo

```markdown
# Research — <Nombre del sitio> (<URL>)

Fecha: <YYYY-MM-DD>
Slug: <slug>
URLs analizadas:
- <url 1>

Método de captura: <WebFetch textual | Playwright headless | mixto>
Limitaciones de la captura: <qué no se pudo inferir>

---

## 1. Inventario del sistema visual

### 1.1 Paleta
### 1.2 Tipografía
### 1.3 Spacing
### 1.4 Radius
### 1.5 Shadows
### 1.6 Borders
### 1.7 Motion
### 1.8 Iconografía
### 1.9 Layout / composición

## 2. Comparativa contra `--ds-*` actuales

## 3. Conflictos con decisiones existentes

## 4. Recomendación

**<reemplazo | adopción parcial | theme alternativo | inspiración selectiva | descarte>**

Justificación contra prioridades del repo:
- Buenas prácticas: ...
- Escalar ordenado: ...
- Mantenibilidad: ...

## 5. Esbozo de propuesta OpenSpec (si aplica)

<nombre tentativo del change, specs afectados, ADR, esfuerzo>
```

---

## Constraints

- **Cero modificaciones** de `packages/tokens/`, `packages/components/`, `apps/playground/`. Si la tarea requiere tocar código, declarar que la skill terminó y el siguiente paso es un CHG OpenSpec.
- **Cero ADRs** nuevos. Cero propuestas OpenSpec activadas.
- **Cero invenciones**: si un valor no se puede inferir, marcarlo como "no determinable".
- **Cero emojis** en el archivo generado.
- **Una sola recomendación final** — argumentar la elegida, no listar 5 opciones.
- **Pausá** si encontrás un conflicto bloqueante con un ADR aceptado.
- **El script Playwright se ejecuta con permiso del usuario.** Si requiere autenticación o el sitio bloquea bots, declarar y pasar a alternativa.

---

## Quality checks (auto-verificación antes de cerrar)

1. ¿El archivo está en `docs/design/research/<slug>.md`?
2. ¿Existen las 5 secciones del esquema?
3. ¿La comparativa tiene **≥3 categorías con valores reales** (no "no determinable")? Si todas son "no determinable", el research falló — devolver control con explicación clara.
4. ¿La recomendación argumenta las 3 prioridades?
5. ¿El método de captura está declarado al inicio (textual / Playwright / mixto)?
6. ¿Hay mención a "adopté X" o "modifiqué Y"? Si sí, error: la skill no toca código.

Si algún check falla, corregirlo antes de devolver control al usuario.

---

## When to use

Cuando el usuario:

- Quiere investigar la inspiración visual de un sitio (`/ds:research-design-system https://www.polymer.co/features`).
- Pide "extraé el design system de X" o "estudiá la paleta de Y para ver si nos sirve".
- Quiere comparar el DS actual contra una referencia externa antes de tomar una decisión.

## When NOT to use

- Cuando el usuario quiere **implementar** un cambio visual. Esa fase es un CHG OpenSpec, no esta skill.
- Cuando el research es sobre librerías de componentes (Mat, Nz, Tui). Para librerías, leer su repo directamente con herramientas de código, no fetch de su sitio.
- Cuando ya hay una decisión tomada y solo falta ejecutarla. La skill no es para "ratificar" decisiones; es para informarlas antes.

---
id: aaa-024
name: components-add-skeleton
type: change
status: archived
archived: 2026-07-19
modifies-specs:
  - components-package (ADDED: DsSkeleton)
  - design-tokens-package (sin delta de spec; component.skeleton nuevo referenciando semantic/primitives)
related-adrs:
  - ADR-007
---

# Proposal — components-add-skeleton

## Why

Séptimo y último entregable de la tanda 1 (D-009): las vistas con datos remotos hoy solo pueden esperar con un spinner, que no preserva la estructura y produce layout shift al llegar el contenido. [HU-010](../../../docs/product/epics/EP-002-kit-componentes/HU-010-skeleton.md) fue refinada con el PO el 2026-07-19 (dimensiones libres con defaults por shape, pulso de opacidad, estático bajo reduced-motion, decorativo siempre). Respalda la prioridad 1 del repo (buenas prácticas: placeholders estables y motion accesible de serie). Cierra el criterio de D-009: "una app real se construye 100% con el DS".

## What Changes

- Nuevo componente **`DsSkeleton`** (`ds-skeleton`, naming ADR-007): placeholder de carga, standalone + OnPush, sin dependencias nuevas.
- **`shape` `text | rect | circle`** (default `text`), cada uno con defaults tokenizados de dimensiones y radius; **`width`/`height`/`radius`** aceptan cualquier valor CSS y overridean los defaults (decisión 1).
- **Pulso de opacidad** con fondo `bg.disabled` (theme-aware), duración y rango tokenizados; **sin shimmer** (decisión 2).
- **`prefers-reduced-motion` → estático**: la animación se apaga (decisión 3 — no repite el patrón "reemplazo" de aaa-023, sin ADR).
- **Decorativo siempre**: `aria-hidden="true"` estático en el host; el contenedor del consumidor anuncia la carga (patrón documentado en el showcase) (decisión 5).
- **Sin input `lines`**: multilínea por composición (decisión 4).
- Nuevos tokens **`component.skeleton.*`** (bg, radius, alturas default por shape, tamaño de circle, duración y opacidad del pulso) — sin pares de contraste (elemento decorativo no textual).
- Showcase del playground (EP-006): página de `ds-skeleton` con los 3 shapes, párrafo por composición, card compuesta como demo y nota de reduced-motion.
- Changesets: **minor** de components (componente nuevo) y **minor** de tokens (`component.skeleton.*`). Lockstep (ADR-015).

## Capabilities

### New Capabilities

(ninguna — se extiende la existente)

### Modified Capabilities

- `components-package`: ADDED Requirement "Skeleton de contenido en carga (DsSkeleton)" — shapes con defaults tokenizados, overrides CSS libres, semántica decorativa y pulso apagable, derivado 1:1 de los 6 CAs de HU-010.
- `design-tokens-package`: sin delta de spec — `component.skeleton.json` cumple la jerarquía existente (ADR-003) y no agrega pares al requirement de contraste.

## Alternativas evaluadas

Descartadas en el refinamiento con el PO (2026-07-19, decisiones en HU-010):

1. **Solo presets tokenizados (sin width/height libres)** — descartado: un placeholder debe imitar al contenido real y eso exige medidas arbitrarias; los presets quedan como defaults, no como límite.
2. **Shimmer (gradiente deslizante)** — descartado: más movimiento y más tokens sin caso que lo pida; el pulso comparte lenguaje con el spinner (aaa-023).
3. **Input `lines` multilínea** — descartado: primer paso hacia los compuestos que la HU excluye; un párrafo se compone repitiendo elementos.
4. **Reduced-motion con pulso más lento** — descartado: un placeholder no necesita comunicar actividad; estático es la reducción honesta.

## Impact

- **Código**: `packages/components/src/lib/skeleton/` (componente + css + spec + stories), `public-api.ts`, `packages/tokens/src/component/skeleton.json` (nuevo), página del showcase en playground.
- **Dependencias**: ninguna nueva.
- **Clasificación** (workflow add-component): no es form control, no es overlay (ADR-014 no aplica), sin iconos (ADR-012 no aplica); segundo componente decorativo/animado del kit (tras aaa-023).
- **Sin ADR previsto**: reduced-motion apaga (no reemplaza) — el patrón de aaa-023 no se repite; no hay decisión one-way door ni cross-package nueva.

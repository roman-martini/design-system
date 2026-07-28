---
id: aaa-023
name: components-add-spinner
type: change
status: archived
archived: 2026-07-19
modifies-specs:
  - components-package (ADDED: DsSpinner)
  - design-tokens-package (sin delta de spec; component.spinner nuevo referenciando semantic/primitives)
related-adrs:
  - ADR-007
---

# Proposal — components-add-spinner

## Why

Sexto entregable de la tanda 1 (D-009): la espera indeterminada (fetch, submit, carga inicial) es el único feedback de proceso que el kit todavía no cubre, y los spinners caseros fallan siempre en lo mismo — sin anuncio a lectores de pantalla, animación que ignora `prefers-reduced-motion` y colores hardcodeados que rompen en dark. HU-009 fue refinada con el PO el 2026-07-19 (spinner solo, `currentColor`, pulso de opacidad en reduced-motion, anuncio con opt-out). Respalda la prioridad 1 del repo (buenas prácticas: a11y y motion accesible de serie).

## What Changes

- Nuevo componente **`DsSpinner`** (`ds-spinner`, naming ADR-007): indicador de espera indeterminada, standalone + OnPush, sin dependencias nuevas.
- **Sizes `xs | sm | md | lg`** (default `md`) — diámetro y grosor de trazo por tokens `component.spinner.*`; `xs` habilita el uso inline/embebido en botones.
- **Color por `currentColor`**: el indicador hereda del contexto y el track usa el mismo color con opacidad tokenizada. Sin API de color (decisión 2 del refinamiento).
- **A11y con opt-out**: `role="status"` + input `label` (default "Cargando") como texto visually-hidden; `label=""` lo vuelve decorativo (`aria-hidden`), evitando doble anuncio cuando el contexto ya comunica la carga.
- **`prefers-reduced-motion`**: la rotación se reemplaza por un pulso de opacidad (~2s) sin movimiento espacial (decisión 3).
- Nuevos tokens **`component.spinner.*`** (sizes, stroke, opacidad de track, duraciones de spin y pulso) referenciando primitives/semantic — **sin pares de contraste propios** (con `currentColor`, el contraste lo gobierna el contexto contenedor).
- Showcase del playground (EP-006): página de `ds-spinner` con los 4 sizes, el caso embebido en un botón **por composición** (no se toca `DsButton`) y la demo de reduced-motion.
- Changesets: **minor** de components (componente nuevo) y **minor** de tokens (`component.spinner.*`). Con lockstep (ADR-015) el par sale junto.

## Capabilities

### New Capabilities

(ninguna — se extiende la existente)

### Modified Capabilities

- `components-package`: ADDED Requirement "Spinner de carga (DsSpinner)" — sizes por tokens, herencia de color, anuncio con opt-out y reduced-motion, derivado 1:1 de los 6 CAs de HU-009.
- `design-tokens-package`: sin delta de spec — `component.spinner.json` es un archivo component nuevo que cumple la jerarquía existente (ADR-003) y no agrega pares al requirement de contraste.

## Alternativas evaluadas

Descartadas en el refinamiento con el PO (2026-07-19, decisiones en HU-009):

1. **Incluir el estado `loading` de `ds-button` en este change** — descartado: rompe la regla "un change por componente" de la tanda y agranda el review; queda como item `components-button-loading` del BACKLOG con disparador propio.
2. **API de color con variantes semánticas** (`variant: primary | neutral | …`) — descartada: más superficie de API sin caso de uso (D-005) y no hereda del contexto; `currentColor` resuelve el caso embebido gratis.
3. **Reduced-motion como rotación lenta o estático total** — descartados: la rotación lenta sigue siendo movimiento continuo y el arco congelado se lee como "colgado"; el pulso de opacidad comunica actividad sin movimiento espacial.

## Impact

- **Código**: `packages/components/src/lib/spinner/` (componente + css + spec + stories), `public-api.ts`, `packages/tokens/src/component/spinner.json` (nuevo), página del showcase en playground.
- **Dependencias**: ninguna nueva.
- **Clasificación** (workflow add-component): no es form control, no es overlay (ADR-014 no aplica), sin iconos (ADR-012 no aplica); primer componente puramente decorativo/animado del kit.
- **Sin ADR previsto**: no hay decisión one-way door ni cross-package nueva; si el patrón reduced-motion por reemplazo de animación amerita convención transversal, se evalúa al cierre.

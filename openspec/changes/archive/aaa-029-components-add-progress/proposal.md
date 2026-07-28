---
id: aaa-029
name: components-add-progress
type: change
status: archived
archived: 2026-07-20
modifies-specs:
  - components-package (ADDED: DsProgress)
  - design-tokens-package (sin delta de spec; component.progress nuevo referenciando semantic/primitives)
related-adrs:
  - ADR-007
---

# Proposal — components-add-progress

## Why

Quinta y **última pieza de la tanda 2** (D-011): las operaciones con avance (upload, importación, wizard) necesitan comunicar progreso, y las barras caseras fallan siempre en lo mismo — sin `role="progressbar"` ni `aria-valuenow`, animaciones indeterminadas que ignoran `prefers-reduced-motion` y porcentajes calculados a mano. HU-016 fue refinada con el PO el 2026-07-20 (ambas variantes con guía de uso vs spinner — criterio de mejor práctica de la industria —, `showValue` opt-in, sizes, 3 tonos). **Cerrar este change completa la tanda 2** y el trío de feedback (Spinner/Skeleton/Progress). Respalda la prioridad 1 del repo.

## What Changes

- Nuevo componente **`DsProgress`** (naming ADR-007), barra de progreso accesible:
  - **Determinada**: `value` (clampeado a `[0, max]`) + `max` (default 100) → `role="progressbar"` con `aria-valuenow/min/max`; fill proporcional con transición tokenizada.
  - **Indeterminada**: sin `value` → `progressbar` sin `aria-valuenow`, animación continua de desplazamiento; bajo `prefers-reduced-motion` se reemplaza por **pulso de opacidad** (patrón del spinner, aaa-023). **Guía de uso documentada** (showcase): spinner para esperas cortas o inline; progress indeterminada para procesos largos con contexto de página; determinada siempre que haya medida.
  - **`showValue`** opt-in: porcentaje redondeado visible (solo determinada).
  - **Sizes** sm/md/lg y **tonos** primary/success/danger tokenizados — los pares fill/track entran al gate como **UI no-texto (WCAG 1.4.11, 3:1)**, primer uso del nivel `ui` del script.
  - **Label accesible con opt-out** (patrón HU-009): default "Progreso"; `label=""` = decorativo (el contexto es dueño del anuncio).
- Nuevos tokens **`component.progress.*`** (track, fill por tono, sizes, value-text, motion).
- Showcase del playground (EP-006): página de `ds-progress` con determinada interactiva, `showValue`, sizes, tonos, indeterminada y la guía spinner vs progress.
- Changesets: **minor** de components y **minor** de tokens. Lockstep (ADR-015).

## Capabilities

### New Capabilities

(ninguna — se extiende la existente)

### Modified Capabilities

- `components-package`: ADDED Requirement "Barra de progreso (DsProgress)" — determinada/indeterminada, label opt-out, showValue, sizes, tonos con gate UI, reduced-motion por pulso — derivado 1:1 de los 9 CAs de HU-016.
- `design-tokens-package`: sin delta de spec — `component/progress.json` cumple la jerarquía existente (ADR-003).

## Alternativas evaluadas

Del refinamiento con el PO (2026-07-20, decisiones en HU-016):

1. **Solo determinada** — recomendación inicial (D-005, solape con DsSpinner) revisada a pedido del PO por criterio de mejor práctica: el estándar de la industria (Material/Carbon/Atlassian) incluye ambas variantes con guía de uso; el rol ARIA las contempla y el costo incremental es una animación CSS. Se eligió **ambas + delimitación documentada**.
2. **Porcentaje siempre visible o nunca** — descartados: `showValue` opt-in da la visualización sin imponerla; el valor accesible existe siempre.
3. **Un solo color** — descartado por el PO: los tonos success/danger tienen caso claro (completado/fallo) y entran con sus pares al gate.
4. **Progress circular / buffer** — fuera (D-005): el circular sería una variante con medida de DsSpinner si aparece el caso; el buffer es de streaming, sin caso.

## Impact

- **Código**: `packages/components/src/lib/progress/` (componente único + css + spec + stories), `public-api.ts`, `packages/tokens/src/component/progress.json` (nuevo), página del showcase.
- **Dependencias**: ninguna nueva (sin iconos, sin overlay, sin proyección).
- **Clasificación** (workflow add-component): componente de **feedback, no overlay ni control** — sin ADR-011 (no hay acciones), sin ADR-012 (sin iconos), sin CVA. Primer consumo del nivel `ui` (3:1) del gate de contraste.
- **ADR candidato**: ninguno previsto — reutiliza patrones cerrados (label opt-out y reduced-motion por pulso de aaa-023, sizes tokenizados); si surge algo one-way door, se para y se escala.

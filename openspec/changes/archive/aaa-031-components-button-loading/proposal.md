---
id: aaa-031
name: components-button-loading
type: change
status: archived
archived: 2026-07-22
modifies-specs:
  - component-button (ADDED: estado loading)
related-adrs:
  - ADR-011
  - ADR-007
related-decisions:
  - D-013
---

# Proposal — components-button-loading

## Why

`DsButton` cubre acción, variantes, sizes y disabled accesible, pero no el estado más común de un botón que dispara trabajo asíncrono: **en curso**. Hoy el consumidor cablea a mano un `ds-spinner` embebido + una bandera de "guardando" + una guarda contra el doble submit, en cada pantalla. HU-017 fue refinada con el PO el 2026-07-22 (precedencia `loading` sobre `disabled`, contenido configurable con default seguro, anuncio por `aria-busy`) y cierra ese hueco en el propio componente. Respalda la **prioridad 1** del repo (buenas prácticas: a11y y prevención de doble submit de serie) y ejecuta D-007 (a11y como feature).

**Nota de gobernanza (D-005)**: esta propuesta se crea **adelantada al disparador orgánico** del item `components-button-loading` (primer caso de uso real que bloquee un botón en async) **por decisión del PO** (2026-07-22). No deroga D-005: la HU ya está Refinada y el **apply espera el caso de uso real** — el change queda como propuesta activa hasta entonces (mismo patrón operativo que `tokens-figma-export`, proposed y en pausa).

## What Changes

- Nuevo input **`loading`** en `DsButton` (default `false`): embebe un `ds-spinner` (`size xs`, `currentColor`) **por composición interna** (reutiliza HU-009, sin API nueva de spinner).
- **Bloqueo accesible**: con `loading=true` la guarda del manejador impide disparar `clicked` (click + Enter/Space), pero el botón **permanece focuseable y anunciado** — no usa `disabled` nativo (criterio de a11y de ADR-011).
- **Anuncio con `aria-busy="true"`** en el `<button>` mientras carga; el spinner embebido es decorativo (`label=""`, `aria-hidden`) para no duplicar el anuncio (decisión 3 de HU-017).
- **Contenido configurable** (decisión 2 de HU-017): por defecto el spinner reemplaza el contenido con **ancho congelado** (cero layout shift, cero config); input opcional **`loadingText`** para spinner + texto de progreso ("Guardando…") cuando el caso lo pida.
- **Precedencia `loading` sobre `disabled`/`disabledReason`** (decisión 1 de HU-017): mientras carga, gana `loading` y no se muestra el motivo de disabled; al volver a `false` se restablece.
- Showcase del playground (EP-006): página de `DsButton` con el estado `loading` en sus dos modos y su interacción con `disabled`.
- **Refinamiento visual del botón base** (decisión del PO 2026-07-22, a partir de una referencia visual): gap de contenido `2px → 8px` (`space-2xs → space-sm`) y radius `6px → 8px` (`radius-md → radius-lg`) para una separación/redondeo más cómodos. **Afecta a todos los `ds-button` publicados** — cambio visual asumido. El **padding no se toca**: la escala de espaciado (2/4/8/16/24) no ofrece los valores intermedios (10/12/18/20) que pediría un padding más aireado, y sumarlos es una decisión de tokens aparte (D-005), no un hardcode.
- Changeset: **minor** de components (input aditivo + refinamiento visual; la API previa no cambia). El par se versiona lockstep (ADR-015) al release.

## Capabilities

### New Capabilities

(ninguna — se extiende `DsButton`, componente existente)

### Modified Capabilities

- `component-button`: ADDED Requirement "Estado loading de DsButton" — input `loading` (+ `loadingText` opcional), bloqueo accesible sin `disabled` nativo, `aria-busy`, spinner embebido decorativo, ancho congelado en modo default y precedencia sobre `disabled`. Derivado 1:1 de los 8 CAs de HU-017.

## Alternativas evaluadas

1. **Reutilizar el `disabled` nativo para bloquear durante la carga** — descartada: reintroduce los tres agujeros de a11y que ADR-011 resolvió (fuera del tab order, sin anuncio, sin comunicar el estado) y no distingue "no disponible" de "en curso". `aria-busy` + guarda mantiene el botón descubrible y comunica el estado correcto.
2. **Un componente/wrapper separado `ds-loading-button`** — descartada: duplica toda la API de `DsButton` y fragmenta el kit; `loading` es un **estado** del botón, no otro componente. Un input aditivo es la superficie mínima.
3. **`loadingText` obligatorio (sin modo default de reemplazo)** — descartada: obliga a proveer copy en cada uso y no garantiza el "cero layout shift" por sí solo. El default (reemplazo con ancho congelado) es seguro y zero-config; `loadingText` queda como opt-in.

## Impact

- **Código**: `packages/components/src/lib/button/` (`button.ts` + `.html` + `.css` + `.spec.ts` + `.stories.ts`), página del showcase de Button en playground. `public-api.ts` **sin cambios** (`DsButton` ya se exporta; el type `DsButtonLoadingText` no aplica — `loadingText` es `string`).
- **Dependencias**: ninguna nueva. Reutiliza `DsSpinner` (composición interna) y el patrón de guarda de ADR-011.
- **Tokens**: ninguno nuevo — reutiliza `component.spinner.*` (size `xs`) y los tokens de `button.css`. Sin delta de `design-tokens-package`, sin pares de contraste nuevos (`currentColor`).
- **Clasificación** (workflow add-component): es un **estado de un componente de acción existente**, no un componente nuevo; no es form control, no es overlay.
- **Sin ADR previsto**: `loading` hoy solo lo adopta `DsButton`. Por la misma lógica de ADR-011 ("sin primitiva compartida hasta el segundo consumidor"), un patrón transversal de loading se decidiría por ADR recién si un segundo componente de acción lo adopta.

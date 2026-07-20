---
id: aaa-025
name: components-add-menu
type: change
status: archived
archived: 2026-07-19
modifies-specs:
  - components-package (ADDED: DsMenu, DsMenuItem, DsMenuSeparator, DsMenuTrigger)
  - design-tokens-package (sin delta de spec; component.menu nuevo referenciando semantic/primitives)
related-adrs:
  - ADR-007
  - ADR-011
  - ADR-012
  - ADR-014
  - ADR-016
---

# Proposal — components-add-menu

## Why

Primera pieza de la **tanda 2** ([D-011](../../../docs/product/decisiones.md), criterio "navegación y estructura de apps reales"): las acciones contextuales (editar, duplicar, eliminar tras un botón kebab) son el patrón de navegación más frecuente que el kit todavía no cubre, y los menús caseros fallan siempre en lo mismo — sin teclado APG, foco que no vuelve al trigger, dropdowns recortados por `overflow` y items destructivos sin contraste. [HU-012](../../../docs/product/epics/EP-002-kit-componentes/HU-012-menu-dropdown.md) fue refinada con el PO el 2026-07-19 (trigger por directiva, items declarativos, capacidades completas incluyendo typeahead y **submenús anidados en v1** — costo aceptado explícitamente). Respalda la prioridad 1 del repo (buenas prácticas: patrón APG completo de serie).

## What Changes

- Nueva familia **`DsMenu`** (naming ADR-007), cuarto overlay del kit y primero con árbol anidado:
  - **`DsMenuTrigger`** — directiva `[dsMenuTriggerFor]` aplicable a cualquier botón (DsButton, icon button o nativo); cablea `aria-haspopup="menu"` + `aria-expanded` y la apertura por click/Enter/Space/↓.
  - **`DsMenu`** — panel `role="menu"` sobre **Popover API** (patrón ADR-014: top layer, light-dismiss nativo, sincronización por `toggle`).
  - **`DsMenuItem`** — `role="menuitem"` declarativo proyectado (registro en el padre, patrón DsSelect/DsOption), con icono Lucide opcional (ADR-012), variante **danger** y disabled accesible (rama "botón de acción" de ADR-011: focusable + `aria-disabled` + guarda).
  - **`DsMenuSeparator`** — `role="separator"` para agrupar acciones.
- **Teclado APG completo**: ↑/↓ con wrap, Home/End, **typeahead por carácter**, Esc cierra devolviendo el foco al trigger, activación por Enter/Space/click cierra todo el árbol.
- **Submenús anidados**: item con `aria-haspopup="menu"` que abre un panel lateral (→/Enter/hover; ←/Esc vuelven al padre) usando **popovers anidados de la plataforma** (el light-dismiss cierra el árbol completo). El posicionamiento lateral **extiende el fallback propio de ADR-014** con un modo de placement nuevo — decisión técnica en `design.md` §4, candidata a promoción a ADR al cierre (regla 2 de ADR-014).
- Nuevos tokens **`component.menu.*`** (panel, item, separador, submenú) referenciando semantic/primitives; el item danger introduce **pares de contraste nuevos al gate** (danger sobre superficie elevada y sobre hover).
- Showcase del playground (EP-006): página de `ds-menu` con menú básico, grupos con separador, iconos, danger, disabled, submenú y referencia de teclado.
- Changesets: **minor** de components (familia nueva) y **minor** de tokens (`component.menu.*`). Lockstep (ADR-015).

## Capabilities

### New Capabilities

(ninguna — se extiende la existente)

### Modified Capabilities

- `components-package`: ADDED Requirement "Menú de acciones (DsMenu)" — apertura por directiva, teclado APG con typeahead, items (icono/danger/disabled/separador), submenús anidados, light-dismiss y tokens, derivado 1:1 de los 9 CAs de HU-012.
- `design-tokens-package`: sin delta de spec — `component/menu.json` es un archivo component nuevo que cumple la jerarquía existente (ADR-003); los pares danger nuevos entran al requirement de contraste vigente vía el gate por script.

## Alternativas evaluadas

Descartadas en el refinamiento con el PO (2026-07-19, decisiones en HU-012):

1. **Trigger embebido en el componente** (como DsSelect) — descartado: duplicaría estilos de botón y limitaría el caso típico (kebab con DsButton/icon button); la directiva reutiliza los botones existentes (precedente DsTooltip).
2. **API de datos `[items]`** — descartada: rompe el patrón declarativo del kit (DsSelect/DsOption) y limita contenido rico (iconos, markup).
3. **Dejar submenús fuera de v1** — recomendación técnica descartada por el PO: acepta el costo explícitamente (prioriza el patrón completo). Consecuencia asumida: el change resuelve posicionamiento lateral (design §4).
4. **Context menu (click derecho)** — fuera: otro patrón de invocación; si aparece el caso real entra como change propio reutilizando el panel.

## Impact

- **Código**: `packages/components/src/lib/menu/` (directiva + panel + item + separador, css, spec, stories), `public-api.ts`, `packages/tokens/src/component/menu.json` (nuevo), página del showcase en playground.
- **Dependencias**: ninguna nueva (Popover API de plataforma; iconos vía peer `@lucide/angular` ya declarada).
- **Clasificación** (workflow add-component): overlay **no modal** → ADR-014 reglas 1–6; items = **controles de acción** → ADR-011 rama `aria-disabled` + guarda; consume iconos → ADR-012 §1. Sin CVA (no es form control).
- **ADR candidato**: la extensión del posicionamiento propio con placement lateral para submenús modifica el alcance del patrón ADR-014 — se evalúa promover a ADR al archivar (no se decide en silencio; ver design §4).

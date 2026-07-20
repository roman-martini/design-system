---
id: aaa-030
name: specs-split-por-componente
type: change
status: archived
archived: 2026-07-20
modifies-specs:
  - components-package (remueve los requirements por-componente; conserva los transversales)
introduces-specs:
  - component-button
  - component-checkbox
  - component-radio
  - component-select
  - component-input
  - component-modal
  - component-tabs
  - component-tooltip
  - component-toast
  - component-spinner
  - component-skeleton
  - component-menu
  - component-accordion
  - component-breadcrumbs
  - component-pagination
  - component-progress
related-adrs:
  - ADR-018
---

## Why

El spec `components-package/spec.md` acumula **1592 líneas y 33 requirements** en un solo archivo: mezcla los contratos **transversales del package** (identidad publicable, peer deps, arquitectura flat, naming, build APF, convenciones a11e/iconografía) con el **comportamiento de cada uno de los ~16 componentes** del kit. Cada componente nuevo suma ~70 líneas al mismo archivo; el spec ya es difícil de navegar, los deltas de cada change tocan un archivo gigante compartido, y no hay forma de leer "el contrato de DsMenu" sin recorrer un documento de contratos ajenos. Contradice la prioridad 2 del repo (**escalar ordenado**) y la 3 (**mantenibilidad**): la superficie crece linealmente sin partición.

## What Changes

- **Partir `components-package`** en dos niveles de capability:
  - `components-package` **conserva** solo los requirements **transversales** (los que gobiernan el artefacto package o ≥2 componentes, no uno): identidad publicable, peer deps de Angular/tokens/forms, arquitectura flat, standalone+signals, prefix de selector, naming de class/archivo, styles con tokens, ViewEncapsulation, `public-api.ts`, build ng-packagr APF, reglas de dependencia, patrón **disabled accesible** (ADR-011, regula acción vs form control) y convención de **iconografía Lucide** (ADR-012).
  - Se **introduce una spec por componente** (`component-<name>`), cada una con el/los requirement(s) de **ese** componente, **promovidos verbatim** (sin cambiar una palabra del contrato normativo): button, checkbox, radio (group+radio), select (select+option), input, modal, tabs (tabs+tab), tooltip, toast, spinner, skeleton, menu, accordion, breadcrumbs, pagination, progress.
- **Migración sin cambio de comportamiento**: es una **reorganización de archivos de spec**, no un cambio de contrato. Ningún `SHALL` se modifica, agrega ni elimina; solo cambia en qué archivo vive. Los scenarios viajan con su requirement.
- **Fijar la convención para changes futuros**: desde el cierre, un change de componente escribe su delta contra `component-<name>` (nueva → `ADDED Requirements`; existente → `MODIFIED`), y solo toca `components-package` si cambia algo transversal. Se documenta en `openspec/README.md` y en la skill `add-component`.
- **Actualizar referencias**: catálogo de specs en `docs/architecture/README.md`, enlaces cruzados en ADRs/HUs que apuntan a `components-package`, y el catálogo de changes.
- Genera **ADR-018** (organización de specs del package en capabilities por componente): es una decisión de convención que rige **todos** los changes de componente futuros y evalúa alternativas de granularidad → amerita ADR.

## Capabilities

### New Capabilities

- `component-button`: el requirement de **tests de `DsButton`** (Vitest, comportamiento de `clicked` con/sin disabled). El patrón **disabled accesible** queda transversal en `components-package` porque su texto normativo regula también a `ds-checkbox`/`ds-radio` (2+ componentes → transversal, ver regla de partición en `design.md`).
- `component-checkbox`: contrato de `DsCheckbox` (checked/indeterminate/disabled, CVA).
- `component-radio`: contrato de `DsRadioGroup` + `DsRadio` (selección exclusiva, CVA, teclado).
- `component-select`: contrato de `DsSelect` + `DsOption` (overlay anclado, teclado, CVA).
- `component-input`: contrato de `DsInput` (tipos, estados, mensajes, CVA).
- `component-modal`: contrato de `DsModal` (overlay sobre `<dialog>` nativo, focus, cierre).
- `component-tabs`: contrato de `DsTabs` + `DsTab` (activeIndex, teclado, variantes).
- `component-tooltip`: contrato de la directiva `DsTooltip` (placement, trigger, a11y).
- `component-toast`: contrato de `DsToastService` (variantes, posiciones, auto-dismiss, stacking).
- `component-spinner`: contrato de `DsSpinner` (sizes, reduced-motion, label).
- `component-skeleton`: contrato de `DsSkeleton` (shapes, reduced-motion).
- `component-menu`: contrato de `DsMenu` (placements, submenús, item danger).
- `component-accordion`: contrato de `DsAccordion` (exclusividad, anidados, animación).
- `component-breadcrumbs`: contrato de `DsBreadcrumbs` (links agnósticos, separador, truncamiento).
- `component-pagination`: contrato de `DsPagination` (modelo, ventana, variante compacta).
- `component-progress`: contrato de `DsProgress` (determinada/indeterminada, tonos, sizes).

### Modified Capabilities

- `components-package`: **REMOVED** de todos los requirements por-componente listados arriba (se promueven a sus nuevas specs); **conserva** los requirements transversales. Sin `MODIFIED` ni `ADDED` — el contenido no cambia, solo se acota el alcance del archivo a lo transversal.

## Impact

### Specs

- `openspec/specs/components-package/spec.md`: se reduce a los ~15 requirements transversales.
- `openspec/specs/component-<name>/spec.md`: 16 archivos nuevos, cada uno con los requirements de su componente (promovidos sin cambios).

### Código

- **Ninguno.** No se toca `packages/components/` ni ningún test: los contratos no cambian, solo su organización documental. Los tests existentes siguen cubriendo el mismo comportamiento.

### Docs y convención

- `docs/architecture/README.md`: catálogo de specs actualizado (16 specs nuevas + `components-package` reencuadrada), catálogo de changes (fila aaa-030), decisions-log (ADR-018).
- `openspec/README.md`: convención de dónde vive el delta de un change de componente.
- `.claude/skills/add-component/SKILL.md`: el paso de spec delta apunta a `component-<name>`.
- ADRs/HUs que enlazan `components-package` por un requirement de componente: reapuntados a la spec nueva (los enlaces a requirements transversales se mantienen).

### APIs públicas

Sin impacto. Cero cambios en la superficie de `@romanmartinidev/components`. No requiere changeset (no hay cambio publicable).

## Alternativas evaluadas

### Opción A — Una spec por componente (elegida)

`component-<name>` singular, un archivo por componente + `components-package` transversal.

- **Pros**: cada contrato de componente es un archivo autocontenido y navegable; el delta de un change futuro toca solo su spec; escala plano (un componente = un archivo, patrón espejo de `packages/components/src/lib/<name>/`); la línea transversal/específico queda explícita.
- **Contras**: ~16 archivos nuevos de golpe; requiere reapuntar enlaces cruzados existentes.

### Opción B — Agrupar por familia

`component-forms` (checkbox/radio/select/input), `component-overlays` (modal/tooltip/menu), `component-feedback` (toast/spinner/skeleton/progress), `component-navigation` (tabs/breadcrumbs/pagination/accordion), `component-actions` (button).

- **Pros**: solo ~5 archivos; agrupa por afinidad conceptual (espeja las tandas D-009/D-011).
- **Contras**: la frontera de familia es discutible (¿select es form u overlay?, ¿menu es overlay o navegación?) y obliga a re-decidir en cada componente nuevo; los archivos siguen siendo multi-componente (el problema de navegación se atenúa pero no desaparece); un delta de un componente sigue tocando un archivo compartido con sus hermanos. Descartada: reintroduce el juicio de encaje que el split busca eliminar.

### Opción C — Mantener el archivo único (statu quo)

- **Pros**: cero trabajo; un solo lugar que buscar.
- **Contras**: el problema que motiva el change persiste y empeora con cada componente. Descartada por el PO (TASK 1.7).

## ADRs y follow-ups

- **Genera ADR-018** — "Organización de specs del package: capability por componente". Estado **Propuesto**; se acepta al cerrar este change. Fija la convención transversal-vs-componente y el patrón de deltas futuros.
- **Follow-up**: al proponer el primer componente de la tanda 3, verificar que su change escriba el delta contra `component-<name>` (nueva spec) — primera validación de la convención en vivo.

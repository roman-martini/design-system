---
id: aaa-014
name: components-add-modal
type: change
status: proposed
modifies-specs:
  - components-package (nuevo componente DsModal + peerDependency @lucide/angular)
  - design-tokens-package (fix jerarquía: component.modal.overlay-bg referencia semantic)
related-adrs:
  - ADR-004
  - ADR-010
  - ADR-011
  - ADR-012
---

## Why

`DsModal` es el primer componente **overlay** del kit — FUTURE-WORK Nivel 1, caso de uso real de cualquier app Angular (confirmaciones, formularios, detalle). Es además el componente que **tres decisiones previas dejaron preparado y están esperando**:

1. **aaa-009** sumó los tokens de overlay _antes_ que el componente, explícitamente para Modal: `--ds-semantic-motion-transition-overlay-enter/exit` (fade+scale), `--ds-semantic-effect-blur-overlay` (backdrop blur) y la jerarquía z-index formalizada.
2. **aaa-013 / ADR-012** decidió la iconografía (Lucide) con Modal como primer consumidor nombrado: la **X de cierre** es `LucideX`, y este change ejecuta la regla **peer-al-primer-uso** — `@lucide/angular` pasa a `peerDependencies` de `@romanmartinidev/components`.
3. Los tokens `component.modal.*` **ya existen** en `packages/tokens` (sizes sm/md/lg/xl, radius, padding, shadow, tipografía del título, z-index) — heredados del bootstrap, hasta hoy sin consumidor.

Sin Modal, todo eso es inversión ociosa. Con Modal, el kit pasa de 4 form/action controls a incluir su primer patrón de overlay completo (focus management, scroll lock, animación, a11y de diálogo), que sienta la base para Drawer/Toast/Tooltip futuros.

**Hallazgo de auditoría incluido**: `component.modal.overlay-bg` hardcodea `rgba(0, 0, 0, 0.5)` en vez de referenciar `{semantic.color.bg.overlay}` (mismo valor) — viola la regla de jerarquía de ADR-003 (_component referencia semantic, no valores crudos duplicados_). Se corrige acá, donde el token gana su primer consumidor.

Respalda las 3 prioridades del repo:

1. **Buenas prácticas**: diálogo accesible según el patrón de la plataforma/ARIA (focus trap, `aria-modal`, restauración de foco, ESC); animaciones y capas 100% vía tokens; a11y aplicando ADR-011 y ADR-012 desde el diseño.
2. **Escalar ordenado**: primer overlay del sistema — establece el patrón que Drawer/Toast/Popover reutilizan; los tokens preparados en aaa-009 se consumen como estaba planeado.
3. **Mantenibilidad**: cero valores hardcodeados; contrato testable en spec; el fix de jerarquía elimina una duplicación silenciosa.

Toca **2 packages** (`components` + fix menor en `tokens`) → los cambios van por spec deltas de ambos. La decisión de implementación del diálogo (elemento nativo vs CDK vs manual) es técnica y va en `design.md`; si resulta one-way door, se promueve a ADR al cerrar.

## What Changes

> Nivel de requerimiento. El detalle técnico (mecanismo del diálogo, animación de salida, scroll lock, forma exacta de la API) va en `design.md`; el secuenciado, en `tasks.md`.

### Nuevo componente `DsModal` en `@romanmartinidev/components`

- **Apertura/cierre controlado por el consumidor**: `[(open)]` (model two-way boolean).
- **Cierre por tres vías** (cada una deshabilitable donde tenga sentido): tecla **ESC**, click en el **overlay/backdrop**, y **botón X** (`LucideX`, 16/1.5, en un botón con `aria-label` configurable — patrón semántico de ADR-012).
- **4 sizes**: `sm | md | lg | xl` (default `md`), consumiendo `--ds-component-modal-size-*`.
- **A11y de diálogo modal**: foco atrapado dentro del modal mientras está abierto; foco restaurado al elemento que lo abrió al cerrar; contenido de fondo inerte para lectores de pantalla; semántica de `dialog` modal; título asociado (`aria-labelledby` vía input `heading` o slot).
- **Animación fade+scale** con los tokens `overlay-enter`/`overlay-exit`; **`prefers-reduced-motion` respetado** (sin animación).
- **Backdrop** con `bg.overlay` + `backdrop-filter: blur(var(--ds-semantic-effect-blur-overlay))`.
- **Body scroll lock** mientras el modal está abierto.
- **Content projection**: slot default para el cuerpo; header con input `heading` (string) y/o slot; slot opcional de footer/acciones.
- Estructura de archivos según ADR-010 (`modal.ts/.html/.css/.spec.ts`, `modal.stories.ts`, `index.ts`), naming `DsModal`/`ds-modal` según ADR-007.

### Dependencia de iconos (ejecuta ADR-012 §2)

- `@lucide/angular` pasa a **`peerDependencies`** de `@romanmartinidev/components` (+ devDependency local para compilar/testear) y se documenta en el README del package.

### Fix de jerarquía en tokens

- `component.modal.overlay-bg`: `"rgba(0, 0, 0, 0.5)"` → `"{semantic.color.bg.overlay}"` (mismo valor resuelto; la referencia respeta ADR-003).

### Stack manager: **postergado** (a confirmar en design)

El backlog menciona "stack manager para múltiples modales abiertos". El design evalúa si el mecanismo de diálogo elegido lo hace innecesario (apilamiento nativo) o si se posterga como follow-up — no se construye infraestructura especulativa (regla del BACKLOG).

## Capabilities

### New Capabilities

Ninguna nueva — se extiende la capability existente `components-package`.

### Modified Capabilities

- `components-package`: Requirement ADDED "Componente DsModal" (comportamiento completo, testable) + el scenario de iconografía peer-al-primer-uso pasa a cumplirse en su segunda rama.
- `design-tokens-package`: Requirement/scenario del fix de jerarquía (overlay-bg como referencia) — delta menor.

## Impact

### Código

- **Creados**: `packages/components/src/lib/modal/{modal.ts, modal.html, modal.css, modal.spec.ts, modal.stories.ts, index.ts}`.
- **Modificados**:
  - `packages/components/src/public-api.ts` (+`export * from './lib/modal'`).
  - `packages/components/package.json` (peer + dev dependency `@lucide/angular`).
  - `packages/components/README.md` (peer dep nueva).
  - `packages/tokens/src/component/modal.json` (fix overlay-bg).
  - `apps/playground` (sección demo del Modal).
- **Eliminados**: ninguno.

### APIs públicas

- **Aditivo** en components: `DsModal` + types (`DsModalSize`). **Nueva peerDependency** `@lucide/angular` — los consumidores que usen `DsModal` deben instalarla (documentado). Bump **minor**.
- Tokens: el valor resuelto de `--ds-component-modal-overlay-bg` no cambia (solo pasa a `var(...)`). Bump **patch**.

### Dependencias

- `@lucide/angular` como peerDependency de components (ya está en el workspace vía playground desde aaa-013).

### Spec deltas

- `components-package`: 1 Requirement ADDED (DsModal).
- `design-tokens-package`: 1 Requirement ADDED o scenario que formaliza la regla ya existente aplicada a `component.modal.overlay-bg` (forma exacta en la fase de specs).

## Alternativas evaluadas

### Opción A — No hacer Modal aún (status quo)

- **Pros**: cero esfuerzo.
- **Contras**: los tokens de aaa-009 y la decisión de aaa-013 quedan sin consumidor; el kit no tiene overlays; FUTURE-WORK Nivel 1 estancado. Descartada — el disparador está activo.

### Opción B — DsModal completo con stack manager

- **Pros**: cubre modales anidados desde el día 1.
- **Contras**: infraestructura especulativa sin caso de uso confirmado (anti-patrón del BACKLOG); el design puede demostrar que el apilamiento nativo del mecanismo elegido ya lo cubre. Descartada como primer corte.

### Opción C — DsModal con scope del backlog menos stack manager (esta propuesta)

- **Pros**: valor completo del overlay (a11y + animación + tokens) sin especulación; si el mecanismo nativo apila correctamente, el "stack manager" resulta innecesario por diseño.
- **Contras**: modales anidados quedan sin garantía formal en el primer corte (se documenta la limitación o se valida el apilamiento nativo en design).

**Decisión propuesta**: **Opción C**.

## ADRs y follow-ups

- **Posible ADR** (a confirmar en design): si la elección del mecanismo de diálogo (elemento nativo `<dialog>` vs CDK vs manual) resulta one-way door para todos los overlays futuros, se promueve a ADR al cerrar. La regla del repo lo exige si sienta patrón transversal.
- **Ejecuta** ADR-012 §2 (peer al primer consumo) — sin ADR nuevo por eso.
- **Al cerrarse activa dos disparadores del backlog**: `/ds:add-component` (3 changes "add component" archivados) y `/ds:check-a11y` (5 componentes en el kit). Se anotan en BACKLOG al archivar.
- **Follow-ups**: Drawer/Toast reutilizando el patrón de overlay; validación formal de modales anidados si aparece el caso de uso.

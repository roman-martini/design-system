---
id: aaa-011
name: components-accessible-disabled
type: change
status: proposed
modifies-specs:
  - components-package
related-adrs:
  - ADR-004
---

## Why

El estado disabled de los componentes del DS hoy usa el **atributo `disabled` nativo** (`ds-button` con `[disabled]`, y `ds-radio`/`ds-checkbox` vía su input `disabled`). Funciona, pero tiene tres agujeros de accesibilidad conocidos:

1. Un control con `disabled` nativo **sale del tab order** → quien navega por teclado nunca llega y no se entera de que existe.
2. **El screen reader no lo anuncia** al tabular (no recibe foco).
3. **No hay forma de comunicar el porqué** del estado → el usuario queda ante un callejón sin salida silencioso ("el botón está apagado" sin saber qué falta para habilitarlo).

Decisión tomada (con Roman, 2026-06-08): adoptar el patrón **`aria-disabled` accesible** como **estándar transversal del DS** —control focuseable, anunciado por el SR como no disponible, y con un **mecanismo para explicar el motivo**— en lugar de parchar componente por componente. El beneficio central no es el atributo: es **comunicar por qué** está deshabilitado, que es lo que convierte un dead-end en feedback accionable.

Disparador: el `/ng:review` del `ds-button` destapó una guarda `if(disabled()) return` redundante con el `disabled` nativo; al analizarla surgió que el patrón nativo es subóptimo en a11y. Alineado con el Nivel 2 ("Calidad profesional — a11y en CI") de [`docs/architecture/FUTURE-WORK.md`](../../../docs/architecture/FUTURE-WORK.md).

Respalda las prioridades del repo:

1. **Buenas prácticas**: la a11y es práctica core, no opcional; es el patrón recomendado por la comunidad (ARIA APG; "disabled buttons" como anti-patrón de UX).
2. **Escalar ordenado**: un único patrón de disabled accesible para todos los componentes interactivos, presentes y futuros.
3. **Mantenibilidad**: consistencia — un solo principio en vez de decisiones ad-hoc por componente.

Toca **1 package** (`@romanmartinidev/components`), afecta **≥2 componentes** (`ds-button`, `ds-radio`, `ds-checkbox`) y es una **decisión de patrón one-way-door** → **genera un ADR al cerrarse** y modifica el spec `components-package` (el comportamiento a11y es observable y testable).

## What Changes

> Nivel de requerimiento. El detalle técnico (diferenciación por tipo de componente, diseño del mecanismo de "porqué", primitiva compartida) va en `design.md`; el secuenciado, en `tasks.md`.

- **Definir el patrón estándar de "estado disabled accesible"** del DS y documentarlo como ADR + como requirement del spec `components-package`.
- **Reemplazar el `disabled` nativo por `aria-disabled`** en los componentes interactivos, manteniéndolos focuseables y anunciados.
- **Guarda de activación** en JS: en un `<button>` real, una sola guarda en `(click)` cubre mouse + teclado (Enter/Space disparan un `click` sintético).
- **Mecanismo de "explicar el porqué"**: un input/slot accesible (p. ej. `disabledReason`) expuesto vía `aria-describedby` cuando el control está deshabilitado.
- **Migrar el CSS** de `:disabled` / `:not(:disabled)` a selectores `[aria-disabled="true"]`.
- **Tests de comportamiento** que cubran: foco recibido, anuncio del estado, no-activación y exposición del motivo.

### A resolver en `design.md`

- ¿El patrón es **uniforme** o **diferenciado por tipo**? Los botones de acción que bloquean un flujo (submit) son el caso fuerte para `aria-disabled` + porqué; los form controls (`radio`/`checkbox`) dentro de un form con label tienen el `disabled` nativo más defendible. El `design.md` decide si se unifica o se justifica la diferencia.
- Diseño exacto del mecanismo de "porqué" (input vs content projection; `aria-describedby` vs alternativas).
- Si conviene una **primitiva/util compartida** para no duplicar la lógica en cada componente.
- Qué hacer con el `ds-button` que quedó en working tree sin commitear (template extraído + guarda eliminada): se integra a la implementación de este change.

## Capabilities

### New Capabilities

Ninguna nueva; se endurece el contrato de a11y de la capability existente.

### Modified Capabilities

- `components-package`: Requirements ADDED/MODIFIED sobre el comportamiento accesible del estado disabled (foco, anuncio, no-activación, motivo). Deltas a redactar en la fase de specs del change.

## Impact

### Código

- **Modificados**: `ds-button`, `ds-radio`, `ds-checkbox` (TS, template, CSS, spec) — alcance exacto y secuencia en `tasks.md`.
- **Posible** primitiva/util compartida para el patrón (a evaluar en design — evitar duplicar la lógica).

### APIs públicas

- **Aditivo** probable: nuevo input para el motivo (p. ej. `disabledReason`); el input `disabled` se mantiene. Si el cambio de `disabled` nativo a `aria-disabled` altera comportamiento observado (foco), se documenta. No hay consumidores externos hoy (solo `apps/playground`).

### Dependencias

Sin nuevas dependencias previstas. A evaluar en design si conviene `@angular/cdk` a11y (`AriaDescriber`/`LiveAnnouncer`).

### Spec deltas

- `components-package`: requirements de a11y del estado disabled (deltas a redactar).

## Alternativas evaluadas

### Opción A — `disabled` nativo (status quo)

- **Pros**: máxima simplicidad, cero JS, previene submit nativo, estilado con `:disabled`.
- **Contras**: los tres agujeros de a11y (fuera del tab order, sin anuncio, sin porqué). No alcanza el objetivo de calidad profesional.

### Opción B — `aria-disabled` + guarda + mecanismo de "porqué" (esta propuesta)

- **Pros**: control descubrible por teclado y anunciado; comunica el motivo (el beneficio grande); patrón recomendado por la industria; aplicable de forma uniforme.
- **Contras**: más complejo (guarda, estilos `[aria-disabled]`, manejo del motivo); requiere disciplina para mantener la consistencia. Mitigación: encapsular en una primitiva/util compartida (a definir en design).

### Opción C — Evitar `disabled` del todo (control siempre activo + validación al activar)

- **Pros**: máxima a11y (nunca hay un control inalcanzable); feedback inmediato del porqué al intentar.
- **Contras**: cambio de paradigma de interacción; no siempre aplicable (disabled por permisos/estado es legítimo); más trabajo y sorpresa para el usuario. Descartada como patrón único, aunque puede convivir caso a caso.

**Decisión**: **Opción B**, con la diferenciación por tipo de componente a resolver en `design.md`.

## ADRs y follow-ups

- **Genera un ADR nuevo al cerrarse**: "Estrategia de estado disabled accesible" (patrón del DS). Número a asignar al redactarlo (próximo disponible: ADR-009 — el `BACKLOG.md` lo asocia tentativamente a `components-decide-icon-library`, pero los ADRs se numeran al crearse, no se reservan).
- **`design.md` requerido**: es cross-cutting (≥3 componentes) y tiene ambigüedad técnica (uniforme vs diferenciado, diseño del "porqué", primitiva compartida) → lo amerita según `openspec/config.yaml`.
- **Relación con `aaa-010`** (`components-drop-component-suffix`): independiente, pero ambos tocan los mismos archivos. Coordinar el orden de aplicación para minimizar conflictos.
- **Working tree**: el `ds-button` con template extraído + guarda eliminada se incorpora a la implementación de este change (no se commitea como refactor aislado, para no contradecir el patrón que este change introduce).

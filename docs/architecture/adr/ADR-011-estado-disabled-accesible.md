# ADR-011 — Estrategia de estado disabled accesible

- **Fecha**: 2026-07-03
- **Estado**: Aceptado
- **Dominio**: frontend / components
- **ADRs relacionados**: [ADR-004](ADR-004-arquitectura-components.md) (arquitectura de components), [ADR-007](ADR-007-naming-prefijos.md)

## Contexto

El estado deshabilitado de los componentes interactivos del DS usaba el **atributo `disabled` nativo** (`ds-button` con `[disabled]`, `ds-checkbox`/`ds-radio` vía su input). Funciona, pero el `disabled` nativo tiene tres agujeros de accesibilidad conocidos en botones de acción:

1. El control **sale del tab order** → quien navega por teclado nunca llega y no se entera de que existe.
2. **El screen reader no lo anuncia** al tabular (no recibe foco).
3. **No hay forma de comunicar el porqué** → el usuario queda ante un dead-end silencioso, sin saber qué falta para habilitarlo.

El disparador concreto fue una auditoría `/ng:review` del `ds-button` que destapó una guarda `if(disabled()) return` redundante con el `disabled` nativo; al analizarla surgió que el patrón nativo es subóptimo en a11y para botones de acción. Alineado con el Nivel 2 ("Calidad profesional — a11y") de `FUTURE-WORK.md`.

Esta decisión define un **principio transversal** para todos los componentes interactivos, presentes y futuros (afecta ≥2 componentes y es one-way door de patrón) → ADR. La ejecución fue el change [`aaa-011 components-accessible-disabled`](../../../openspec/changes/archive/aaa-011-components-accessible-disabled/), que implementó el patrón en `ds-button` y ratificó el de los form controls.

## Opciones consideradas

### Opción A — `disabled` nativo en todos (status quo)

- **Pros**: máxima simplicidad; cero JS; previene submit nativo; estilable con `:disabled`.
- **Contras**: los tres agujeros de a11y en botones de acción (fuera del tab order, sin anuncio, sin porqué). No alcanza el objetivo de calidad profesional.

### Opción B — `aria-disabled` uniforme en todos los componentes

Migrar botones **y** form controls a `aria-disabled` + guarda en JS.

- **Pros**: un solo patrón para todo.
- **Contras**: en un `<input>` (checkbox/radio) el `disabled` nativo ya es semánticamente correcto y se anuncia en contexto del formulario; forzar `aria-disabled` obligaría a **reimplementar en JS** la prevención del toggle y perdería el soporte nativo (`:disabled`, validación de forms) **sin beneficio proporcional** — el form control rara vez es el único gate de un flujo (el botón submit lo es). Sobre-ingeniería.

### Opción C — Patrón diferenciado por tipo de componente (elegida)

Botones de acción → `aria-disabled` + guarda + motivo; form controls → `disabled` nativo ratificado.

- **Pros**: aplica el patrón accesible donde rinde (el botón que bloquea el flujo) y conserva la semántica nativa donde ya es correcta (el input en su form). Mínimo código nuevo.
- **Contras**: dos patrones en vez de uno — exige que el principio quede documentado (este ADR) para que componentes futuros elijan bien.

## Decisión

Se adopta la **Opción C — patrón diferenciado por tipo**:

| Tipo                | Componentes                                   | Patrón de disabled                                                                                                                                                                                                                                                                                    |
| ------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Botón de acción** | `ds-button` (y futuros: menú-item, tab, etc.) | **`aria-disabled="true"`** (no `disabled` nativo) → permanece focuseable y anunciado. **Guarda** en el manejador de click que bloquea la activación (mouse + Enter/Space). Input **`disabledReason`** que, si está deshabilitado, renderiza un texto **visible** asociado por **`aria-describedby`**. |
| **Form control**    | `ds-checkbox`, `ds-radio`                     | **`disabled` nativo** (ratificado) — semánticamente correcto en `<input>`, anunciado en contexto del formulario. `disabledReason` vía `aria-describedby` se puede sumar de forma incremental si aparece la necesidad, sin migrar a `aria-disabled`.                                                   |

Decisiones de implementación asociadas (detalle en el `design.md` del change):

- **Motivo visible, no solo-SR**: el beneficio central es que el usuario sepa qué falta; ocultarlo del usuario vidente con teclado —a quien más se busca ayudar— lo socava.
- **Sin `@angular/cdk`**: el patrón se resuelve con `aria-describedby` manual; no se suma dependencia para un atributo. Coherente con "no agregar deps sin necesidad real".
- **Sin primitiva compartida por ahora**: `ds-button` es hoy el único que adopta el patrón completo; extraer una directiva para un consumidor sería abstracción prematura. Se extrae cuando un segundo componente de acción lo adopte.

Criterios contra las prioridades del repo: (1) **buenas prácticas** — a11y es práctica core, y el patrón sigue las guías ARIA APG (el "disabled button" nativo es anti-patrón de UX conocido); (2) **escalar ordenado** — un principio explícito para todos los componentes interactivos futuros; (3) **mantenibilidad** — se elige el patrón correcto por tipo en vez de decisiones ad-hoc.

## Consecuencias

### Positivas

- El `ds-button` deshabilitado es **descubrible por teclado y anunciado**, y puede **comunicar el motivo** — convierte un dead-end en feedback accionable.
- Los form controls conservan la semántica nativa (soporte de `:disabled`, validación de forms) sin código extra.
- Cero dependencias nuevas; feature aditiva (`disabledReason`) — changeset **minor**, el input `disabled` se mantiene.
- Principio documentado: componentes de acción futuros saben qué patrón adoptar.

### Negativas / trade-offs aceptados

- **Dos patrones coexisten**: exige criterio al sumar un componente (¿acción o form control?). Mitigado por la tabla de este ADR.
- **`aria-disabled` no previene submit nativo**: irrelevante hoy (`ds-button` es `type="button"`). Si aparece un botón submit, la guarda en el click + no propagar cubre el caso — a documentar en su momento.
- **La guarda es código, no atributo**: un botón con `aria-disabled` sí dispara el click nativo; la lógica de no-activación vive en el componente y debe testearse (cubierto por los specs del change).

### Acciones de seguimiento

- Si un segundo componente de acción (menú-item, tab, split-button) adopta el patrón, extraer una directiva/util compartida (`[dsDisabledReason]` o similar) para no duplicar `reasonId` + `describedBy` + guarda.
- Evaluar sumar `disabledReason` a `ds-checkbox`/`ds-radio` vía `aria-describedby` si aparece un caso real (sin migrar su `disabled` nativo).

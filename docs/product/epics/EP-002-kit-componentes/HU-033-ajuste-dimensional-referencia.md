---
epica: EP-002
actor: Dev consumidor
estado: Identificada
decisiones: [D-014, D-019, D-022]
---

# HU-033 — Ajuste dimensional a la referencia modern-minimal (dev consumidor)

**COMO** dev que arma vistas reales con los componentes de la tanda 3
**QUIERO** que sus dimensiones y proporciones coincidan con la referencia visual `modern-minimal` que define el lenguaje del kit
**PARA** que una vista construida con el DS se vea como la referencia sin ajustes locales por componente.

## Origen

Tanda 3 ([D-014](../../decisiones.md)), referencia [`moder-minimal`](../../../reference/components/moder-minimal/). D-014 aprobó la tanda declarando explícitamente que **las proporciones y dimensiones exactas de la referencia son tarea aparte**, pero ese trabajo quedó registrado únicamente en el inbox personal del PO (`TASK.md`, gitignored). La [review integral 2026-07-26](../../../reviews/2026-07-26-review-integral/hallazgos.md) lo marcó como defecto de gobernanza: trabajo comprometido por una decisión de producto formal, invisible para el backlog y su grooming. [D-019](../../decisiones.md) prohíbe que artefactos versionados dependan de `TASK.md`. Esta HU trae ese trabajo a producto.

## Criterios de aceptación

- [ ] **CA-033.1 (contraste componente por componente)** — Dado cada componente de la tanda 3 ([HU-019](HU-019-card.md), [HU-020](HU-020-button-outline-destructive.md), [HU-021](HU-021-badge.md), [HU-022](HU-022-avatar.md), [HU-023](HU-023-switch.md), [HU-024](HU-024-textarea.md), [HU-025](HU-025-slider.md)), cuando se contrasta su render actual contra la referencia, entonces queda un registro por componente con las divergencias dimensionales detectadas o la marca explícita "sin divergencias" — ningún componente de la tanda queda sin contrastar.
- [ ] **CA-033.2 (toda divergencia con destino)** — Dada cada divergencia registrada, entonces queda en uno de dos estados finales: **resuelta** (ajuste aplicado) o **documentada** (no se aplica, con el motivo escrito); ninguna divergencia queda sin decisión.
- [ ] **CA-033.3 (ajustes tokenizados)** — Dado un ajuste aplicado, entonces su valor sale de un token existente o de un token nuevo declarado en `packages/tokens`; el CSS de componente no incorpora ningún valor dimensional literal.
- [ ] **CA-033.4 (validación: la escala no alcanza)** — Dado un ajuste que requiere un valor que la escala de espaciado/radio no ofrece, cuando se evalúa aplicarlo, entonces **no se hardcodea**: la divergencia queda documentada y el valor faltante se eleva como decisión de tokens con su propio disparador (mismo criterio que [D-013](../../decisiones.md) para el padding del botón).
- [ ] **CA-033.5 (sin regresión)** — Dado el cierre del trabajo, entonces la suite de `@romanmartinidev/components` queda verde, el gate de contraste AA sigue pasando y ninguna API pública de los componentes de la tanda cambia.
- [ ] **CA-033.6 (gate visual del PO)** — Dado el conjunto de ajustes aplicados, entonces el PO los verifica visualmente en el showcase contra la referencia y da el OK explícito antes de archivar ([D-022](../../decisiones.md)).

## Dependencias

- Tanda 3 completa: [HU-019](HU-019-card.md) … [HU-025](HU-025-slider.md) entregadas (la HU actúa sobre componentes ya construidos).
- **Refinamiento bloqueado por el PO**: la referencia visual `modern-minimal` no está disponible fuera del material del PO, y el alcance concreto (qué medida de qué componente) solo puede definirse con ella a la vista.

## Fuera de alcance

- **Theming** de la referencia (la otra mitad separada por D-014): es trabajo propio, con su HU — acá solo dimensiones y proporciones.
- Cambios de API, de comportamiento o de estructura de los componentes: esta HU es dimensional.
- Componentes fuera de la tanda 3 (tandas 1 y 2): si aparece una divergencia en ellos, se registra pero no se corrige acá.
- Ampliar la escala de espaciado/radio: es decisión de tokens con disparador propio (CA-033.4).

## Notas

- Origen: hallazgo **backlog-02** de la [review integral 2026-07-26](../../../reviews/2026-07-26-review-integral/hallazgos.md) (severidad alta) — el trabajo citado por D-014 vivía solo en `TASK.md:9-11`, con la numeración de la cita ya rota.
- La HU se **registra** en la **Parte B** del [plan de acción](../../../reviews/2026-07-26-review-integral/plan-de-accion.md); su ejecución todavía no tiene Parte asignada, porque depende del refinamiento.
- **El refinamiento requiere una sesión con el PO y la referencia a la vista.** Deliberadamente no se declaran medidas, proporciones ni valores concretos: no son verificables sin la referencia y escribirlos sería inventarlos. Al refinar, los CA-033.1/2 se instancian en una lista cerrada de divergencias por componente.
- Al migrar este trabajo, corresponde tachar el ítem correspondiente en el inbox del PO (`TASK.md`) — su rol de borrador queda formalizado por D-019.
- **Candidata para el refinamiento — centrado óptico del texto en fields** (PO, 2026-08-07, contra la referencia PrimeNG): el texto del input "se siente" bajo. Medido en el playground con Playwright: la caja del texto está centrada **al píxel** (gaps 10.00/10.00 en `md`, line-box simétrico) — es el efecto óptico de las métricas verticales de **Inter** (ascendentes altos, peso visual bajo el centro geométrico), no un defecto de layout. Si el refinamiento decide corregirlo, la vía profesional es **metric overrides** (`ascent-override`/`descent-override`) en el `@font-face` — normaliza toda la tipografía del sistema de una vez; no parchear paddings por componente.

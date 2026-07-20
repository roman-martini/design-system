# Backlog operativo — design-system

Cola **accionable** de trabajo pendiente (componentes, tokens, refactors, tooling), organizada por horizonte **Now / Next / Later**. Responde "¿qué se puede arrancar ya y qué está esperando qué?".

No confundir con las otras fuentes (regla "no mezclar" del [CLAUDE.md](../../CLAUDE.md)):

| Fuente                                       | Rol                                                                                                        |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Este archivo**                             | Cola operativa: items concretos con disparador y horizonte                                                 |
| [docs/product/](../product/README.md)        | El porqué: épicas, HUs y decisiones de producto — cada item de acá enlaza su HU/EP si existe               |
| [openspec/changes/](../../openspec/changes/) | Ejecución: cuando un item se activa, se convierte en change `aaa-NNN` (o commit directo) y **sale de acá** |
| [FUTURE-WORK](FUTURE-WORK.md)                | Cantera inspiracional sin compromiso — lo que ni siquiera tiene disparador definido                        |

## Cómo se gestiona

1. **Entrada**: un item entra solo con **disparador concreto** (cuándo se activa). Sin disparador → va a FUTURE-WORK, no acá. Se usa la [plantilla](#plantilla-para-nuevos-items) y se enlaza la HU/épica de producto si existe.
2. **Horizontes**:
   - **Now** — disparador **activado** o decisión tomada: se puede arrancar en la próxima sesión.
   - **Next** — disparador definido pero no activado, o esperando una decisión puntual del PO.
   - **Later** — disparador definido pero lejano; sin urgencia ni fecha.
3. **Activación**: item OpenSpec → `/opsx:propose <slug>` (convención e ID en [openspec/README.md](../../openspec/README.md)); item de tooling/docs → commit directo. Al activarse, el item cambia a estado `propuesta activa` con link al change, y **se elimina de acá cuando el change se archiva** (el histórico vive en el [catálogo de changes](../architecture/README.md#catálogo-de-changes)).
4. **Grooming**: al **archivar cada change** se revisita este archivo — se reevalúan disparadores (¿alguno se activó?), se promueven items entre horizontes y se eliminan los cerrados. Es el mismo momento en que se actualizan catálogo y `openspec/README.md`, así el backlog nunca deriva.

---

## Now — disparador activado

> **Publicar a npm sigue vetado hasta orden explícita del PO** (2026-07-19) — los changesets se acumulan (hoy 5: Toast, Spinner, Skeleton, Menu y Accordion) y el release NO es candidato automático.

### `components-add-breadcrumbs` — Breadcrumbs de ubicación

**Tipo**: OpenSpec (kit). **Producto**: [HU-014](../product/epics/EP-002-kit-componentes/HU-014-breadcrumbs.md) / EP-002.

**Origen**: tercera pieza de la **tanda 2** ([D-011](../product/decisiones.md), 2026-07-19), criterio "navegación y estructura de apps reales" — promovida al cerrar `components-add-accordion` (`aaa-026`, 2026-07-20). Orden de la tanda en [EP-002 § Orden sugerido](../product/epics/EP-002-kit-componentes/EP-002-kit-componentes.md#orden-sugerido); las siguientes (Pagination, Progress) se promueven acá al cerrar la anterior.

**Alcance refinado** (HU-014, PO 2026-07-20): core agnóstico con links proyectados, separador por template (default chevron ADR-012), truncamiento opt-in con "…" inline (`maxItems`), auto-generación desde rutas como **secondary entry point** `components/router` con peer opcional (genera ADR al cerrar), tokens `component.breadcrumbs.*`.

**Disparador**: activado — tanda 2 aprobada (D-011), pieza anterior cerrada.

**Estado**: HU Refinada — lista para propose (`aaa-027`).

---

## Next — esperando disparador o decisión del PO

### `tokens-figma-export` — Export DTCG para Figma (EN PAUSA)

**Tipo**: OpenSpec. **Producto**: [HU-001](../product/epics/EP-004-puente-codigo-diseno/HU-001-tokens-en-figma.md) / EP-004.

**Estado**: **propuesta activa** — [`aaa-012`](../../openspec/changes/tokens-figma-export/), 4/4 artefactos, listo para apply. **Pausado por el PO** (2026-07-03). Se retoma cuando lo decida; la validación final requiere conectar Tokens Studio en Figma (trabajo del PO).

---

### `/ds:audit-tokens` — Skill para auditar consistencia de tokens

**Tipo**: commit directo (tooling). **Producto**: [EP-005](../product/epics/EP-005-calidad-profesional/EP-005-calidad-profesional.md).

**Origen**: documentada en `.claude/commands/ds/README.md`.

**Alcance propuesto**: detectar tokens huérfanos (definidos y no referenciados), CSS de componentes con valores hardcoded fuera de `var(--ds-*)`, semantic que no consume primitives (bypass de jerarquía).

**Disparador**: el package `tokens` supera 100 tokens, o aparece el primer drift en un code review.

**Estado**: pendiente. Nota (2026-07-11): la auditoría a11y detectó el primer hardcode (`white` en checkmark/dot de Checkbox y Radio) — el disparador podría considerarse activado (`components-fix-a11y-minor` ya cerrado por commit directo); confirmar con el PO.

---

### `components-button-loading` — Estado loading de ds-button

**Tipo**: OpenSpec (kit). **Producto**: [EP-002](../product/epics/EP-002-kit-componentes/EP-002-kit-componentes.md) (sin HU propia todavía).

**Origen**: refinamiento de [HU-009](../product/epics/EP-002-kit-componentes/HU-009-spinner.md) (decisión 1, PO 2026-07-19) — el spinner entra solo; el `loading` de `ds-button` se separó a item propio.

**Alcance propuesto**: input `loading` en `DsButton` (spinner embebido + deshabilitado accesible + aria coherente con ADR-011).

**Disparador**: primer caso de uso real (playground o consumidor) que necesite bloquear un botón durante una operación async. Desbloqueado desde el cierre de `components-add-spinner` (`aaa-023`, 2026-07-19); el disparador aún no se activó.

**Estado**: pendiente (Next).

---

## Later — sin urgencia

### Tokens aditivos del research Atlassian

**Tipo**: OpenSpec (kit, micro-changes). **Producto**: [EP-001](../product/epics/EP-001-fundamentos-tokens/EP-001-fundamentos-tokens.md).

**Origen**: `docs/design/research/atlassian-design.md §4` — "inspiración selectiva", cada uno un CHG separado:

- `tokens-add-space-zero` — `space.0` semántico (trivial, ~1h).
- `tokens-add-metric-typography` — `metric.small/medium/large` para números prominentes (KPIs).
- `tokens-add-negative-space` — `space.negative.*` para overlapping (avatares apilados, badges).

**Disparador** (cada uno): primer caso de uso real en playground o componente.

**Estado**: pendiente, sin disparador activo.

---

## Plantilla para nuevos items

```markdown
### `<nombre>` — <título corto>

**Tipo**: OpenSpec (kit/transversal) | commit directo (housekeeping/tooling). **Producto**: [HU-XXX o EP-XXX](../product/...) (si existe).

**Origen**: <por qué surge, link a ADR/research/FUTURE-WORK si aplica>

**Alcance propuesto**:

- <pasos concretos>

**Decisiones pendientes** (si aplica):

- <preguntas a cerrar antes de propose>

**Bloqueado por** (si aplica):

- <otro item que debe cerrarse antes>

**Disparador**: <evento concreto que activa este item>

**Estado**: pendiente | propuesta activa (link al change) — y en qué horizonte entra (Now/Next/Later)
```

---

## Reglas para mantener este archivo

- **Disparador obligatorio**: sin disparador concreto → "wishlist" → FUTURE-WORK, no acá.
- **Sin features hipotéticas** (D-005): nada entra "por completitud".
- **Los items cerrados se eliminan**: el histórico vive en el [catálogo de changes](../architecture/README.md#catálogo-de-changes) y en `openspec/changes/archive/`. Este archivo solo tiene pendientes.
- **Grooming al archivar cada change** (ver "Cómo se gestiona" §4): disparadores reevaluados, horizontes promovidos, cerrados eliminados.
- **Un item = una entrada**: si crece a múltiples entregas independientes, se parte (como los tokens Atlassian).
- **Sin emojis** en items o títulos.

# Backlog operativo — agent-design-sistem

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

### `/ds:check-a11y` — Auditoría WCAG sobre componentes existentes

**Tipo**: commit directo (tooling). **Producto**: [EP-005](../product/epics/EP-005-calidad-profesional/README.md).

**Origen**: documentada en `.claude/commands/ds/README.md`.

**Alcance propuesto**: skill que audita contraste de tokens (WCAG AA), navegación por teclado en stories, ARIA presente y correcta (`aria-checked`, `aria-disabled`, `aria-expanded`, `role`), `prefers-reduced-motion` respetado.

**Disparador**: ≥5 componentes — **ACTIVADO** (2026-07-10): Button, Checkbox, Radio, RadioGroup, Modal.

**Estado**: pendiente, listo para arrancar. Orden sugerido: **primero de EP-005** (materializa D-007 auditando los 5 componentes existentes).

---

### `/ds:add-component` — Workflow guiado para agregar componente

**Tipo**: commit directo (tooling). **Producto**: [EP-005](../product/epics/EP-005-calidad-profesional/README.md).

**Origen**: documentada en `.claude/commands/ds/README.md`.

**Alcance propuesto**: skill que guía "sumar componente nuevo" según ADR-004/007/010: estructura flat, naming `Ds<Name>`, CVA si aplica, tests, story, public-api, spec delta, changeset.

**Disparador**: ≥3 CHGs "add component" archivados — **ACTIVADO** (2026-07-10): Checkbox (`aaa-006`), Radio (`aaa-008`), Modal (`aaa-014`).

**Estado**: pendiente, listo para arrancar.

---

## Next — esperando disparador o decisión del PO

### `tokens-figma-export` — Export DTCG para Figma (EN PAUSA)

**Tipo**: OpenSpec. **Producto**: [HU-001](../product/epics/EP-004-puente-codigo-diseno/HU-001-tokens-en-figma.md) / EP-004.

**Estado**: **propuesta activa** — [`aaa-012`](../../openspec/changes/tokens-figma-export/), 4/4 artefactos, listo para apply. **Pausado por el PO** (2026-07-03). Se retoma cuando lo decida; la validación final requiere conectar Tokens Studio en Figma (trabajo del PO).

---

### `components-add-select` — Select/Combobox

**Tipo**: OpenSpec (kit). **Producto**: [HU-003](../product/epics/EP-002-kit-componentes/HU-003-select-formularios.md) / EP-002.

**Alcance propuesto**: `ds-select` con CVA, keyboard nav completa, chevron `LucideChevronDown` (ADR-012), a11y patrón combobox. El refinamiento decide el mecanismo de posicionamiento (`@floating-ui/dom` vs Popover API + anchor positioning — evaluar plataforma primero, criterio ADR-013).

**Disparador**: el PO prioriza formularios reales en el playground/prototipos. Sin bloqueos técnicos (iconos y patrón overlay resueltos).

**Estado**: pendiente.

---

### Primer release publicado en npm

**Tipo**: commit directo + pipeline (no requiere change; el pipeline existe desde `aaa-005`). **Producto**: [HU-002](../product/epics/EP-003-consumo-distribucion/HU-002-primer-release-npm.md) / EP-003.

**Alcance propuesto**: estrenar el release pipeline consumiendo los changesets acumulados (minors de components, patches de tokens); verificar tarballs (`workspace:*` → semver real) e instalación desde npm en un proyecto limpio.

**Disparador**: decisión del PO de publicar.

**Estado**: pendiente.

---

### `/ds:audit-tokens` — Skill para auditar consistencia de tokens

**Tipo**: commit directo (tooling). **Producto**: [EP-005](../product/epics/EP-005-calidad-profesional/README.md).

**Origen**: documentada en `.claude/commands/ds/README.md`.

**Alcance propuesto**: detectar tokens huérfanos (definidos y no referenciados), CSS de componentes con valores hardcoded fuera de `var(--ds-*)`, semantic que no consume primitives (bypass de jerarquía).

**Disparador**: el package `tokens` supera 100 tokens, o aparece el primer drift en un code review.

**Estado**: pendiente, sin disparador activo.

---

## Later — sin urgencia

### Tokens aditivos del research Atlassian

**Tipo**: OpenSpec (kit, micro-changes). **Producto**: [EP-001](../product/epics/EP-001-fundamentos-tokens/README.md).

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

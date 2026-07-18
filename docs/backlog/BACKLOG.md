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

### `components-add-tooltip` — Tooltip de ayuda contextual

**Tipo**: OpenSpec (kit). **Producto**: [HU-007](../product/epics/EP-002-kit-componentes/HU-007-tooltip.md) / EP-002.

**Alcance propuesto**: directiva `dsTooltip` (primera directiva del kit) con estilo inverso theme-aware, delay 500ms tokenizado, WCAG 1.4.13 completo, `aria-describedby`; reutiliza las reglas 1–6 de [ADR-014](../architecture/adr/ADR-014-overlays-anclados-popover-api.md) sin re-decidir. **HU-007 ya Refinada** (2026-07-18) con 8 CAs binarios.

**Disparador**: cierre del item anterior de la tanda (Input, `aaa-017`) — **ACTIVADO** (2026-07-11, grooming del archive).

**Estado**: **propuesta activa** — [`aaa-019`](../../openspec/changes/components-add-tooltip/), 4/4 artefactos, listo para apply.

---

### `components-add-toast` — Toast/Notification

**Tipo**: OpenSpec (kit). **Producto**: [HU-008](../product/epics/EP-002-kit-componentes/HU-008-toast-notificaciones.md) / EP-002.

**Alcance propuesto**: según HU-008 (refinar CAs antes del propose). Nota: consumirá `border/bg/text` de status — evaluar si activa `tokens-fix-status-borders` (Next) en el mismo change.

**Disparador**: cierre del item anterior de la tanda (Tabs, `aaa-018`) — **ACTIVADO** (2026-07-14, grooming del archive).

**Estado**: pendiente.

---

## Next — esperando disparador o decisión del PO

### Tanda 1 del kit — componentes restantes (D-009)

**Tipo**: OpenSpec (kit, un change por componente). **Producto**: HUs de [EP-002](../product/epics/EP-002-kit-componentes/README.md).

**Origen**: [D-009](../product/decisiones.md) — expansión aprobada hacia "una app real se construye 100% con el DS".

En orden sugerido; cada uno se promueve a Now al cerrarse el anterior (grooming al archivar):

- `components-add-spinner` — [HU-009](../product/epics/EP-002-kit-componentes/HU-009-spinner.md).
- `components-add-skeleton` — [HU-010](../product/epics/EP-002-kit-componentes/HU-010-skeleton.md).

**Disparador** (cada uno): cierre del item anterior de la tanda.

**Estado**: pendiente.

---

### `tokens-fix-status-borders` — Contraste AA de border.success/warning/info

**Tipo**: OpenSpec (tokens, micro-change). **Producto**: [EP-001](../product/epics/EP-001-fundamentos-tokens/README.md).

**Origen**: detectado en el gate de contraste de [`aaa-017`](../../openspec/changes/archive/aaa-017-components-add-input/) al arreglar `border.danger`: `border.success/warning/info` arrastran el mismo patrón (`*-400` en light / `*-800` en dark) que falla 3:1. Sin consumidores hoy.

**Alcance propuesto**: mismo fix que `border.danger` (semantic → `*-500`, override dark → `*-400`), verificado por script.

**Disparador**: el primer componente que consuma alguno de esos tokens (Alert es el candidato natural), o la próxima corrida de `/ds:check-a11y` que los alcance.

**Estado**: pendiente, sin disparador activo.

---

### `tokens-figma-export` — Export DTCG para Figma (EN PAUSA)

**Tipo**: OpenSpec. **Producto**: [HU-001](../product/epics/EP-004-puente-codigo-diseno/HU-001-tokens-en-figma.md) / EP-004.

**Estado**: **propuesta activa** — [`aaa-012`](../../openspec/changes/tokens-figma-export/), 4/4 artefactos, listo para apply. **Pausado por el PO** (2026-07-03). Se retoma cuando lo decida; la validación final requiere conectar Tokens Studio en Figma (trabajo del PO).

---

### Primer release publicado en npm

**Tipo**: commit directo + pipeline (no requiere change; el pipeline existe desde `aaa-005`). **Producto**: [HU-002](../product/epics/EP-003-consumo-distribucion/HU-002-primer-release-npm.md) / EP-003.

**Alcance propuesto**: estrenar el release pipeline consumiendo los changesets acumulados (minors de components, patches de tokens); verificar tarballs (`workspace:*` → semver real) e instalación desde npm en un proyecto limpio.

**Disparador**: decisión del PO de publicar (reafirmado "sigue esperando" el 2026-07-11 al aprobar [D-009](../product/decisiones.md); es prerequisito para consumir las libs desde otros repos).

**Estado**: pendiente.

---

### `/ds:audit-tokens` — Skill para auditar consistencia de tokens

**Tipo**: commit directo (tooling). **Producto**: [EP-005](../product/epics/EP-005-calidad-profesional/README.md).

**Origen**: documentada en `.claude/commands/ds/README.md`.

**Alcance propuesto**: detectar tokens huérfanos (definidos y no referenciados), CSS de componentes con valores hardcoded fuera de `var(--ds-*)`, semantic que no consume primitives (bypass de jerarquía).

**Disparador**: el package `tokens` supera 100 tokens, o aparece el primer drift en un code review.

**Estado**: pendiente. Nota (2026-07-11): la auditoría a11y detectó el primer hardcode (`white` en checkmark/dot de Checkbox y Radio) — el disparador podría considerarse activado (`components-fix-a11y-minor` ya cerrado por commit directo); confirmar con el PO.

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

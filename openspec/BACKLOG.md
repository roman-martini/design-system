# Backlog — agent-design-sistem

Lista de cambios pendientes (componentes, tokens, refactors, tooling).
Cada ítem indica si va por **OpenSpec** (cambios significativos al kit
publicable o tooling base, IDs `aaa-NNN`) o por **commit directo**
(housekeeping, docs, ajustes locales) — siguiendo la regla del
[CLAUDE.md](../CLAUDE.md):
_"Todo cambio significativo arranca como propuesta en `openspec/changes/`.
Los cambios triviales o de implementación local **no** requieren propuesta
OpenSpec."_

Cuando un ítem OpenSpec se activa, arranca con
`/opsx:propose <slug>` siguiendo la convención de [README.md](README.md).
**Próximo ID disponible**: ver [README.md](README.md) — al archivar un
change el "Próximo ID disponible" se incrementa.

Los ítems ya implementados viven en el catálogo histórico de
[`docs/architecture/README.md`](../docs/architecture/README.md)
§ "Catálogo de Changes" y en [`changes/archive/`](changes/archive/).

> **Regla**: cada ítem que se sume acá debe tener **disparador concreto**
> (cuándo se activa), no ser "wishlist". Anti-patrón documentado en
> `docs/architecture/FUTURE-WORK.md`: no agregar features sin uso real.

---

## OpenSpec — cambios al kit publicable

### Inspiración del research Atlassian — tokens aditivos opcionales

**Tipo**: OpenSpec (kit, micro-changes).

**Origen**: `docs/design/research/atlassian-design.md §4` recomendó como
"inspiración selectiva" 3 adopciones aditivas — cada una un CHG separado
cuando aparezca disparador:

- `tokens-add-space-zero` — sumar `space.0` semántico (hoy hay
  `dimension.0` primitive pero no semantic). Trivial (~1h).
- `tokens-add-metric-typography` — 3 tokens nuevos (`metric.small/medium/large`)
  para renderizar números prominentes (KPIs, dashboards).
- `tokens-add-negative-space` — `space.negative.*` para overlapping
  (avatares apilados, badges sobre imagen).

**Disparador** (cada uno): cuando aparezca el primer caso de uso real
en playground o en componente.

**Estado**: pendiente, sin disparador activo.

---

## Commit directo — housekeeping, tooling, docs

### Housekeeping de archivos heredados del bootstrap

**Tipo**: commit directo (repo housekeeping).

**Origen**: post-bootstrap quedaron archivos sin destino claro:

- `contexto_post_fases.md` (D pendiente — borrado durante aaa-006 pero
  sin commit).
- `contexto_inicial.md` → `docs/contexto_inicial.md` (rename pendiente).

**Alcance propuesto**:

- Confirmar el rename de `contexto_inicial.md` a `docs/` y borrar el
  `contexto_post_fases.md` definitivamente.
- Commit `chore(docs): housekeeping post-bootstrap`.

**Estado**: pendiente — cambios visibles en `git status`. Activar entre
aaa-007 y el próximo change.

---

### `/ds:audit-tokens` — Skill para auditar consistencia de tokens

**Tipo**: commit directo (tooling Claude Code, no toca el kit).

**Origen**: documentada en `.claude/commands/ds/README.md` como backlog.

**Alcance propuesto**:

- Skill que detecta:
  - Tokens huérfanos (definidos en JSON pero no referenciados).
  - CSS de componentes con valores hardcoded fuera de `var(--ds-*)`.
  - Semantic tokens que no consumen primitives (bypass de jerarquía).
- Wrapper command `/ds:audit-tokens` (patrón establecido en aaa-007).

**Disparador**: cuando el package `tokens` crezca a >100 tokens o aparezca
el primer drift detectado en code review.

**Estado**: pendiente, sin disparador activo.

---

### `/ds:add-component` — Workflow guiado para agregar componente

**Tipo**: commit directo (tooling).

**Origen**: documentada en `.claude/commands/ds/README.md`.

**Alcance propuesto**:

- Skill que guía el flujo de "sumar componente nuevo" siguiendo ADR-004 +
  ADR-007: estructura flat, naming `Ds<Name>`, CVA si aplica, tests,
  story, public-api, spec delta de components-package, changeset.

**Disparador**: cuando haya ≥3 CHGs de "add component" archivados con
estructura repetitiva clara (probable después de Radio + Modal).

**Estado**: pendiente, **disparador ACTIVADO** (2026-07-10) — 3 CHGs
"add component" archivados: Checkbox (`aaa-006`), Radio (`aaa-008`),
Modal (`aaa-014`).

---

### `/ds:check-a11y` — Auditoría WCAG sobre componentes existentes

**Tipo**: commit directo (tooling).

**Origen**: documentada en `.claude/commands/ds/README.md`.

**Alcance propuesto**:

- Skill que audita: contraste de tokens (text/bg WCAG AA), navegación
  por teclado en stories, ARIA correcta y presente
  (`aria-checked`, `aria-disabled`, `aria-expanded`, `role`),
  `prefers-reduced-motion` respetado.

**Disparador**: cuando haya ≥5 componentes (umbral Nivel 2 "Calidad
profesional" de FUTURE-WORK).

> **Disparador ACTIVADO** (2026-07-10) — 5 componentes en el kit:
> Button, Checkbox, Radio, RadioGroup, Modal (`aaa-014`).

**Estado**: pendiente.

---

## Orden sugerido cuando arrancamos

1. **Housekeeping** — limpiar `contexto_*` para tener canvas limpio.
2. **`tokens-add-z-index`** — desbloquea Modal/Tooltip/Toast.
3. **`components-add-radio`** — valida el patrón Checkbox a un segundo
   componente compuesto. Confirma que `/ds:add-component` vale la pena.
4. **`components-decide-icon-library`** (ADR-008) — si aparece Modal o
   Select en el roadmap inmediato.
5. **`components-add-modal`** — caso de uso completo de focus management
   - portales + z-index.
6. **Skills DS** (`/ds:audit-tokens`, `/ds:check-a11y`) — cuando los
   disparadores se activen, no antes.

---

## Plantilla para nuevos ítems

```markdown
### `<nombre>` — <título corto>

**Tipo**: OpenSpec (kit/transversal) | commit directo (housekeeping/tooling)

**Origen**: <por qué surge, link a ADR/research/FUTURE-WORK si aplica>

**Alcance propuesto**:

- <pasos concretos>

**Decisiones pendientes**:

- <preguntas a cerrar antes de propose>

**Bloqueado por** (si aplica):

- <otro ítem del backlog que debe cerrarse antes>

**Disparador**: <evento concreto que activa este ítem>

**Estado**: pendiente | en exploración | propuesta activa (link al `aaa-NNN-slug`) | archivado
```

---

## Reglas para mantener este archivo

- **Disparador obligatorio**: cada ítem declara cuándo se activa. Sin
  disparador concreto → "wishlist" → no entra al backlog.
- **Sin features hipotéticas**: si un componente solo se quiere "por
  completitud" sin uso real, queda en `FUTURE-WORK.md` (inspiracional),
  no acá.
- **Items archivados se mueven** al catálogo histórico de
  `docs/architecture/README.md` y a `changes/archive/` cuando se cierran.
  Este archivo solo tiene ítems pendientes.
- **Sin emojis** en items o títulos.

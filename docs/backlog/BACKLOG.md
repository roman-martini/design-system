# Backlog operativo — design-system

Cola **accionable** de trabajo pendiente (componentes, tokens, refactors, tooling), organizada por horizonte **Now / Next / Later**, más una **[Cantera](#cantera-sin-disparador)** de ideas sin disparador. Responde "¿qué se puede arrancar ya y qué está esperando qué?".

Este archivo **no define la dirección del producto**: la dirección ("qué sigue y por qué") vive en [docs/product/README.md § Roadmap](../product/README.md#roadmap) (hitos con condición de salida + tandas aprobadas por D-XXX). Acá solo se ordena la cola de lo ya decidido o lo que espera un disparador.

No confundir con las otras fuentes (regla "no mezclar" del [CLAUDE.md](../../CLAUDE.md)):

| Fuente                                       | Rol                                                                                                        |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Este archivo**                             | Cola operativa: items con disparador y horizonte + Cantera (ideas sin disparador, no compromiso)           |
| [docs/product/](../product/README.md)        | El porqué y la dirección: épicas, HUs, decisiones de producto (D-XXX) y roadmap de hitos                   |
| [openspec/changes/](../../openspec/changes/) | Ejecución: cuando un item se activa, se convierte en change `aaa-NNN` (o commit directo) y **sale de acá** |

## Cómo se gestiona

1. **Entrada**: un item entra a un horizonte con **disparador concreto** (cuándo se activa) **o por decisión directa del PO** (D-015). Sin ninguno de los dos → va a la [Cantera](#cantera-sin-disparador), no a los horizontes. Se usa la [plantilla](#plantilla-para-nuevos-items) y se enlaza la HU/épica de producto si existe.
2. **Horizontes**:
   - **Now** — disparador **activado** o decisión tomada: se puede arrancar en la próxima sesión.
   - **Next** — disparador definido pero no activado, o esperando una decisión puntual del PO.
   - **Later** — disparador definido pero lejano; sin urgencia ni fecha.
   - **Cantera** — sin disparador definido: inspiración, no compromiso (D-015). Un ítem sube a un horizonte cuando gana disparador o cuando el PO decide promoverlo.
3. **Activación**: item OpenSpec → `/opsx:propose <slug>` (convención e ID en [openspec/README.md](../../openspec/README.md)); item de tooling/docs → commit directo. Al activarse, el item cambia a estado `propuesta activa` con link al change, y **se elimina de acá cuando el change se archiva** (el histórico vive en el [catálogo de changes](../architecture/README.md#catálogo-de-changes)).
4. **Grooming**: al **archivar cada change** se revisita este archivo — se reevalúan disparadores (¿alguno se activó?), se promueven items entre horizontes y se eliminan los cerrados. Es el mismo momento en que se actualizan catálogo y `openspec/README.md`, así el backlog nunca deriva.

---

## Now — disparador activado

> **Publicar a npm sigue vetado hasta orden explícita del PO** (2026-07-19) — los changesets se acumulan (hoy 15: Toast, Spinner, Skeleton, Menu, Accordion, Breadcrumbs, Pagination, Progress, Button loading, Card, Button variants, Badge, Switch, Textarea y Avatar) y el release NO es candidato automático.

### `components-add-slider` — Slider (tanda 3, último)

**Tipo**: OpenSpec (kit). **Producto**: [HU-025](../product/epics/EP-002-kit-componentes/HU-025-slider.md) / EP-002 — origen, alcance y decisiones viven en la HU.

**Disparador**: su turno en la cola de la tanda 3 ([D-014](../product/decisiones.md)) — promovido al archivarse `components-add-avatar` (`aaa-037`, 2026-07-26). **Cierra la tanda 3** (7/7).

**Estado**: pendiente de refinar HU-025 + propose. Es el más complejo de la tanda (slider/range accesible). Sale de acá al archivar.

---

## Next — esperando disparador o decisión del PO

### `playground-theme-switcher` — Toggle de theme/brand en el playground

**Tipo**: commit directo o OpenSpec chico (playground). **Producto**: [EP-006](../product/epics/EP-006-playground/EP-006-playground.md).

**Origen**: gap detectado el 2026-07-23 — el playground importa solo los tokens base (`@romanmartinidev/tokens/css`), no los themes; hoy **no hay forma de validar visualmente dark/brand** de los componentes (la corrección de dark sí la verifica el gate de contraste por script, pero no se ve). El PO lo pidió y luego lo difirió para no cortar el loop de la tanda 3.

**Alcance propuesto**: toolbar con toggle light/dark + selector de brand (default/a/b); cargar los CSS de themes (`/themes/dark`, `/brand-a`, `/brand-b`) y setear `data-theme`/`data-brand` en el root.

**Disparador**: activado por decisión del PO (diferido 2026-07-23) — se retoma cuando quiera, o antes de un release para QA visual multi-theme.

**Estado**: pendiente (Next).

---

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

## Later — sin urgencia

### Tokens aditivos del research Atlassian

**Tipo**: OpenSpec (kit, micro-changes). **Producto**: [HU-018](../product/epics/EP-001-fundamentos-tokens/HU-018-tokens-aditivos-atlassian.md) / EP-001 — origen, alcance por token y fuera-de-alcance viven en la HU.

**Micro-changes** (cada uno su change y su disparador; detalle en HU-018): `tokens-add-space-zero`, `tokens-add-metric-typography`. ~~`tokens-add-negative-space`~~ — resuelto por decisión del PO (2026-07-26): `space.negative.*` se entrega **dentro de `components-add-avatar`** (`aaa-037`, su primer consumidor real); CA-018.3 se marca cumplido al archivar ese change, sin change de tokens separado.

**Disparador** (cada uno de los restantes): primer caso de uso real en playground o componente.

**Estado**: pendiente, sin disparador activo.

---

## Cantera (sin disparador)

> Ideas deseables **sin disparador definido** — inspiración, no compromiso (D-015). Absorbe lo vigente del ex `FUTURE-WORK.md` (fusionado el 2026-07-20); el marco conceptual que lo acompañaba (niveles de madurez, métricas, anti-patrones) vive en [docs/reference/roadmap-madurez-ds.md](../reference/roadmap-madurez-ds.md). Un ítem sube a un horizonte cuando gana disparador concreto o cuando el PO decide promoverlo; al hacerlo se le da formato de plantilla.

### Componentes

| Componente     | Notas                                                                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Stepper**    | Pasos discretos de un flujo; descartado del alcance de Progress ([HU-016](../product/epics/EP-002-kit-componentes/HU-016-progress.md)) |
| **Slider**     | Range input                                                                                                                            |
| **DatePicker** | **Wrapping** de librería existente (`flatpickr`, `vanilla-calendar`) — no construir desde cero (anti-patrón documentado)               |

### Tokens

- **Breakpoints** (`semantic/breakpoint.json`, mobile-first: sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536) — los necesita el primer componente responsive.
- **Motion adicional**: `delay` (0–300 ms) y easings extra (`bounce`, `back-in`, `back-out`).
- **Density tokens** (`[data-density="compact"]`) — solo si aparece la necesidad, no por completitud.

### Calidad profesional (nivel 2)

- **A11y en CI**: `@storybook/test-runner` + `axe-playwright` — violaciones WCAG AA fallan el build.
- **Docs de tokens en Storybook**: stories MDX para Colors, Spacing, Typography, Shadow, Motion.
- **Visual regression**: Chromatic (free tier) o Playwright snapshots.
- **Stylelint para forzar tokens**: valores hardcodeados fallan el lint (complementa a `/ds:audit-tokens`, en Next).
- **Bundle size budget**: `size-limit` en CI por PR.

### Distribución y consumo (nivel 3)

- **Tokens TypeScript estructurados** (objeto vs constantes planas) — change futuro `tokens-rich-types`.
- **Guía de migración/consumo** — cuando llegue la política 1.0 (D-004).

### Horizonte largo (niveles 4–5, solo con necesidad real)

- Multi-framework vía Web Components (Lit), tokens multi-platform (iOS/Android), sync bidireccional Figma, theme builder, modos extra (high contrast AAA, density, RTL) — sobre-ingeniería mientras haya un solo consumidor Angular.
- **Patterns / recipes** (login, settings panel, data table, dashboard, empty/error states, onboarding) como stories compuestas, no componentes del package.

---

## Plantilla para nuevos items

```markdown
### `<nombre>` — <título corto>

**Tipo**: OpenSpec (kit/transversal) | commit directo (housekeeping/tooling). **Producto**: [HU-XXX o EP-XXX](../product/...) (si existe).

**Origen**: <por qué surge, link a ADR/research/Cantera si aplica>

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

- **Respaldo obligatorio en los horizontes** (D-015): disparador concreto **o** decisión explícita del PO; sin ninguno de los dos → [Cantera](#cantera-sin-disparador), no Now/Next/Later.
- **Nada entra en silencio** (D-015): completar el kit es un objetivo válido, pero cada entrada la aprueba el PO — por disparador o por buena idea fundamentada; la Cantera guarda lo aún no aprobado.
- **La dirección no vive acá**: qué sigue lo deciden los hitos y D-XXX de [docs/product/](../product/README.md#roadmap); este archivo no propone candidatos ni prioriza por su cuenta.
- **Los items cerrados se eliminan**: el histórico vive en el [catálogo de changes](../architecture/README.md#catálogo-de-changes) y en `openspec/changes/archive/`. Este archivo solo tiene pendientes.
- **Cuando un item gana HU, se deduplica** (no se elimina — el item sigue vivo hasta que su change se archive): la HU pasa a ser la fuente de "qué/por qué" (origen, alcance, decisiones, fuera-de-alcance) y el item conserva **solo lo operativo** (tipo, link a la HU, disparador, horizonte, estado). No se repite en el backlog lo que la HU ya dice (modelo de referencia: `tokens-figma-export`).
- **Grooming al archivar cada change** (ver "Cómo se gestiona" §4): disparadores reevaluados, horizontes promovidos, cerrados eliminados.
- **Un item = una entrada**: si crece a múltiples entregas independientes, se parte (como los tokens Atlassian).
- **Sin emojis** en items o títulos.

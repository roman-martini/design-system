# Backlog operativo — design-system

Cola **accionable** de trabajo pendiente (componentes, tokens, refactors, tooling), organizada por horizonte **Now / Next / Later**. Responde "¿qué se puede arrancar ya y qué está esperando qué?".

Este archivo **no define la dirección del producto**: la dirección ("qué sigue y por qué") vive en [docs/product/README.md § Roadmap](../product/README.md#roadmap) (hitos con condición de salida + tandas aprobadas por D-XXX). Acá solo se ordena la cola de lo ya decidido o lo que espera un disparador.

Este archivo tampoco recibe ideas sin comprometer: desde [D-019](../product/decisiones.md) (2026-07-26) las ideas en exploración viven en [docs/product/intake/](../product/intake/README.md), que **reemplazó a la ex Cantera**. Los horizontes de acá son para trabajo ya decidido.

No confundir con las otras fuentes (regla "no mezclar" del [CLAUDE.md](../../CLAUDE.md)):

| Fuente                                              | Rol                                                                                                        |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Este archivo**                                    | Cola operativa: items comprometidos, con disparador y horizonte                                            |
| [docs/product/intake/](../product/intake/README.md) | Ideas en exploración, antes de comprometerlas (reemplaza a la ex Cantera)                                  |
| [docs/product/](../product/README.md)               | El porqué y la dirección: épicas, HUs, decisiones de producto (D-XXX) y roadmap de hitos                   |
| [openspec/changes/](../../openspec/changes/)        | Ejecución: cuando un item se activa, se convierte en change `aaa-NNN` (o commit directo) y **sale de acá** |

## Cómo se gestiona

1. **Entrada**: un item entra a un horizonte con **disparador concreto** (cuándo se activa) **o por decisión directa del PO** (D-015). Sin ninguno de los dos → va al [intake](../product/intake/README.md), no a los horizontes. Se usa la [plantilla](#plantilla-para-nuevos-items) y se enlaza la HU/épica de producto si existe.
2. **Horizontes**:
   - **Now** — disparador **activado** o decisión tomada: se puede arrancar en la próxima sesión.
   - **Next** — disparador definido pero no activado, o esperando una decisión puntual del PO.
   - **Later** — disparador definido pero lejano; sin urgencia ni fecha.
3. **Activación**: item OpenSpec → `/opsx:propose <slug>` (convención e ID en [openspec/README.md](../../openspec/README.md)); item de tooling/docs → commit directo. Al activarse, el item cambia a estado `propuesta activa` con link al change, y **se elimina de acá cuando el change se archiva** (el histórico vive en el [catálogo de changes](../architecture/README.md#catálogo-de-changes)).
4. **Grooming**: al **archivar cada change** se revisita este archivo — se reevalúan disparadores (¿alguno se activó?), se promueven items entre horizontes y se eliminan los cerrados. Es el mismo momento en que se tría el inbox del PO ([D-019](../product/decisiones.md)) y se revisa si algún intake maduró. El grooming es un paso del [checklist de archive](../product/README.md#checklist-de-archive), que es la lista canónica de todo lo que hay que actualizar al cerrar un change. Así el backlog nunca deriva.

---

## Now — disparador activado

> **El veto de publicación a npm fue levantado el 2026-07-28** por orden explícita del PO ([D-028](../product/decisiones.md)). El release **todavía no puede correr**: el pipeline está bloqueado por su propio gate de changesets [ci-cd-01] hasta la **Parte E**, y el PO acordó esperar además a las Partes **G** (bugs de componentes) e **I** (SSR). El destino es **`0.3.0` con todo lo acumulado** (inventario en [`.changeset/`](../../.changeset/); no se enumeran acá para no duplicar su fuente de verdad) — no hay `0.2.1` posible. El control de [D-018](../product/decisiones.md)(b) sigue en pie: el publish pasa a requerir aprobación explícita por release vía environment `npm-publish`, pendiente de la Parte E.

### `review-integral-2026-07-26` — Ejecución del plan de la review

**Tipo**: mixto (OpenSpec + commits directos, según la parte). **Producto**: atraviesa EP-001, EP-002, EP-003, EP-005, EP-006 y EP-007.

**Origen**: [review integral del repo](../reviews/2026-07-26-review-integral/plan-de-accion.md) pedida por el PO — 140 hallazgos verificados (28 de severidad alta, todos confirmados), organizados en un plan por partes A–N con modelo y effort recomendados por parte.

**Disparador**: activado — el PO aprobó ejecutar el plan por partes el 2026-07-26.

**Estado por parte** (el detalle de cada una vive en el plan; acá solo el avance):

| Parte | Contenido                           | Vía                     | Estado                                             |
| ----- | ----------------------------------- | ----------------------- | -------------------------------------------------- |
| A     | Decisiones del PO (21)              | Sesión + D-XXX          | **Hecha** (2026-07-26, D-018…D-027)                |
| B     | Registro en producto y backlog      | Commit directo          | **Hecha** (2026-07-26)                             |
| C     | Sincronización documental           | Commit directo          | **Hecha** (2026-07-27)                             |
| D     | Release-readiness (APF + packaging) | OpenSpec change         | **Hecha** (2026-07-28, `aaa-038`) — ADR-021, D-028 |
| E     | CI: correctness + hardening         | OpenSpec change         | **Hecha** (2026-07-28, `aaa-039`) — ADR-022        |
| F     | Gates de calidad automáticos        | OpenSpec change(s)      | Pendiente — HU-026…HU-028, HU-030                  |
| G     | Fixes de componentes (6 changes)    | OpenSpec por componente | Pendiente                                          |
| H     | Tokens: fixes y consistencia        | OpenSpec change         | Pendiente                                          |
| I     | Compatibilidad SSR                  | OpenSpec change + ADR   | Pendiente                                          |
| J     | Refactors internos compartidos      | OpenSpec change         | Pendiente                                          |
| K     | Playground como QA visual           | OpenSpec + commits      | Pendiente                                          |
| L     | Storybook avanzado y docs públicas  | OpenSpec change(s)      | Pendiente — HU-031, HU-035, HU-036                 |
| M     | Ecosistema `.claude/`               | Commit directo          | **Hecha** (2026-07-27) — HU-032 entregada          |
| N     | Estratégico pre-1.0                 | OpenSpec + ADRs         | Pendiente — HU-029                                 |

**Protocolo de ejecución**: una parte por sesión, con `/ds:handoff` → `/clear` → `/ds:resume` entre partes. El modelo y el effort de cada parte están declarados en el plan (§ "Modelo por parte" y § "Cuándo cortar sesión"); no se alterna modelo dentro de una sesión.

**Los tres críticos que mandan el orden**: el bundle publicado viola el Angular Package Format (Parte D), el gate de changesets rompe el propio PR de release (Parte E) y la lib no soporta SSR (Parte I).

---

### `components-add-slider` — Slider (tanda 3, último)

**Tipo**: OpenSpec (kit). **Producto**: [HU-025](../product/epics/EP-002-kit-componentes/HU-025-slider.md) / EP-002 — origen, alcance y decisiones viven en la HU.

**Disparador**: su turno en la cola de la tanda 3 ([D-014](../product/decisiones.md)) — promovido al archivarse `components-add-avatar` (`aaa-037`, 2026-07-26). **Cierra la tanda 3** (7/7).

**Estado**: pendiente de refinar HU-025 + propose. Es el más complejo de la tanda (slider/range accesible). **En espera mientras corre el plan de la review**, salvo que el PO decida lo contrario.

**Nota**: al cerrarse habilita la verificación del hito H1 — el prototipo de la referencia `modern-minimal` en el playground ([D-023](../product/decisiones.md)).

---

## Next — esperando disparador o decisión del PO

### `playground-theme-switcher` — Toggle de theme/brand en el playground

**Tipo**: OpenSpec chico (playground). **Producto**: [EP-006](../product/epics/EP-006-playground/EP-006-playground.md).

**Origen**: gap detectado el 2026-07-23 — el playground importa solo los tokens base (`@romanmartinidev/tokens/css`), no los themes; hoy **no hay forma de validar visualmente dark/brand** de los componentes (la corrección de dark sí la verifica el gate de contraste por script, pero no se ve). El PO lo pidió y luego lo difirió para no cortar el loop de la tanda 3.

**Alcance propuesto**: toolbar con toggle light/dark + selector de brand (default/`modern-minimal`/brand-b); cargar los CSS de themes y setear `data-theme`/`data-brand` en el root. Se ejecuta **ampliado dentro de la Parte K** del plan, que le suma los globalTypes y el decorator de Storybook.

**Disparador**: decisión del PO (diferido el 2026-07-23) — se retoma con la Parte K del plan de la review, o antes de un release para QA visual multi-theme.

**Nota**: el gate visual del PO previo al archive ([D-022](../product/decisiones.md)) sube el valor de este item — es la herramienta con la que ese gate se ejerce sobre themes.

**Estado**: pendiente (Next).

---

## Later — sin urgencia

### Tokens aditivos del research Atlassian

**Tipo**: OpenSpec (kit, micro-changes). **Producto**: [HU-018](../product/epics/EP-001-fundamentos-tokens/HU-018-tokens-aditivos-atlassian.md) / EP-001 — origen, alcance por token y fuera-de-alcance viven en la HU.

**Micro-changes** (cada uno su change y su disparador; detalle en HU-018): `tokens-add-space-zero`, `tokens-add-metric-typography`. ~~`tokens-add-negative-space`~~ — resuelto por decisión del PO (2026-07-26): `space.negative.*` se entrega **dentro de `components-add-avatar`** (`aaa-037`, su primer consumidor real); CA-018.3 se marca cumplido al archivar ese change, sin change de tokens separado.

**Disparador** (cada uno de los restantes): primer caso de uso real en playground o componente.

**Nota**: coordinar con la migración a formato DTCG ([D-024](../product/decisiones.md)) — conviene no sumar tokens en el formato viejo si la migración está cerca.

**Estado**: pendiente, sin disparador activo.

---

## Plantilla para nuevos items

```markdown
### `<nombre>` — <título corto>

**Tipo**: OpenSpec (kit/transversal) | commit directo (housekeeping/tooling). **Producto**: [HU-XXX o EP-XXX](../product/...) (si existe).

**Origen**: <por qué surge, link a ADR/research/intake si aplica>

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

- **Respaldo obligatorio en los horizontes** (D-015): disparador concreto **o** decisión explícita del PO; sin ninguno de los dos → [intake](../product/intake/README.md), no Now/Next/Later.
- **Nada entra en silencio** (D-015): completar el kit es un objetivo válido, pero cada entrada la aprueba el PO — por disparador o por buena idea fundamentada; el intake guarda lo aún no aprobado.
- **La dirección no vive acá**: qué sigue lo deciden los hitos y D-XXX de [docs/product/](../product/README.md#roadmap); este archivo no propone candidatos ni prioriza por su cuenta.
- **Los items cerrados se eliminan**: el histórico vive en el [catálogo de changes](../architecture/README.md#catálogo-de-changes) y en `openspec/changes/archive/`. Este archivo solo tiene pendientes.
- **Cuando un item gana HU, se deduplica** (no se elimina — el item sigue vivo hasta que su change se archive): la HU pasa a ser la fuente de "qué/por qué" (origen, alcance, decisiones, fuera-de-alcance) y el item conserva **solo lo operativo** (tipo, link a la HU, disparador, horizonte, estado). No se repite en el backlog lo que la HU ya dice.
- **Grooming al archivar cada change** (ver "Cómo se gestiona" §4): disparadores reevaluados, horizontes promovidos, cerrados eliminados, inbox del PO triado.
- **Un item = una entrada**: si crece a múltiples entregas independientes, se parte (como los tokens Atlassian).
- **Sin emojis** en items o títulos.

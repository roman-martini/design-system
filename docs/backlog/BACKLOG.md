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
3. **Activación**: item OpenSpec → `/opsx:propose <slug>` (convención e ID en [openspec/README.md](../../openspec/README.md)); item de tooling/docs → commit directo. Al activarse, el item cambia a estado `propuesta activa` con link al change, y **se elimina de acá cuando el change se archiva** (el histórico vive en el [catálogo de changes](../architecture/catalog.md#catálogo-de-changes)).
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
| F     | Gates de calidad automáticos        | OpenSpec change(s)      | **Hecha** (2026-07-31) — 4 sub-partes, ver abajo   |
| G     | Fixes de componentes (7 changes)    | OpenSpec por componente | **En curso** — 1/7 (2026-08-01, `aaa-045` menu)    |
| H     | Tokens: fixes y consistencia        | OpenSpec change         | Pendiente                                          |
| I     | Compatibilidad SSR                  | OpenSpec change + ADR   | Pendiente                                          |
| J     | Refactors internos compartidos      | OpenSpec change         | Pendiente                                          |
| K     | Playground como QA visual           | OpenSpec + commits      | Pendiente                                          |
| L     | Storybook avanzado y docs públicas  | OpenSpec change(s)      | Pendiente — HU-031, HU-035, HU-036                 |
| M     | Ecosistema `.claude/`               | Commit directo          | **Hecha** (2026-07-27) — HU-032 entregada          |
| N     | Estratégico pre-1.0                 | OpenSpec + ADRs         | Pendiente — HU-029                                 |

**Detalle de la Parte F** (12 ítems; el plan autoriza partirla, el PO lo aprobó el 2026-07-29):

| Sub-parte | Contenido                                                                  | Change    | Estado                    |
| --------- | -------------------------------------------------------------------------- | --------- | ------------------------- |
| F1-a      | Coverage con thresholds + typecheck de specs/stories (ítems 1, 6, 10)      | `aaa-040` | **Hecha** — HU-026        |
| F1-b      | Gates de tokens: contraste AA versionado, jerarquía, build (ítems 2, 3, 4) | `aaa-041` | **Hecha** — HU-027        |
| F2        | a11y (axe) y playground (ítems 5, 7, 8, 9, 11)                             | `aaa-042` | **Hecha** — HU-028 fase 1 |
| F3        | Bundle size budget con `size-limit` sobre el `dist` (ítem 12)              | `aaa-043` | **Hecha** — HU-030        |

**Los 12 ítems están ejecutados: la Parte F queda cerrada.** `pr.yml` corre hoy **12 steps bloqueantes** y la suite está en **878 tests** (tokens 484, components 362, playground 32).

> **F3 dejó un dato para planificar la Parte G y HU-025** (2026-07-31, `aaa-043`): el techo de `components` es **45.38 kB** gzip sobre 43.22 kB medidos, y un componente real cuesta ~2.3 kB. Es decir, **el próximo componente que entre al kit va a tener que subir el techo en su propio PR** — está previsto por [D-031](../product/decisiones.md) y documentado en `CONTRIBUTING.md`, pero conviene no descubrirlo con el PR en rojo.

> **El ítem 12 se agregó al plan el 2026-07-29.** HU-030 estaba aprobada en A14/[D-021](../product/decisiones.md) y la propia HU declaraba "Ejecución: Parte F", pero el plan nunca la listó entre sus ítems: quedó aprobada y sin sesión asignada. Se ejecuta como **F3** —no encaja en F1-b (todo `tokens`) ni en F2 (a11y + playground), porque toca ambos packages y el pipeline— y hereda el patrón probado en `aaa-040`: medir primero, techo con margen sobre lo medido, trinquete, step bloqueante.
>
> **F2 dejó tres cosas registradas** (2026-07-31, `aaa-042`): el gate de axe expuso que **`DsButton` no admite nombre accesible** —no reenvía `aria-label` al `<button>` interno, así que un botón ícono-only queda sin nombre—, encauzado como ítem de `components-fix-button` en la tabla de la Parte G. La **fase 2 de HU-028** queda con su alcance ya definido: el contenido de overlays abiertos (listbox de select, panel de menu, interior del modal) no es auditable en jsdom. Y el hallazgo `playground-02` **no queda cerrado del todo**: el build de Storybook detecta imports y configuración rotos, pero no un template de story desactualizado; eso exige ejecutar las stories en navegador (Parte L).
>
> **F1-b dejó dos cosas para más adelante** (2026-07-30, `aaa-041`): el gate de contraste expuso un incumplimiento real en el borde del control desmarcado de checkbox y radio, corregido en el momento bajo [D-030](../product/decisiones.md); y el **pendiente derivado** de que esos dos componentes no son theme-aware (`bg-off` clavado a `{color.white}`, más los hardcodes de `white` en su CSS). Eso último no es contraste sino theming, y quedó registrado el 2026-07-31 como **séptimo change de la Parte G** (`components-fix-checkbox-radio`), en la tabla del plan — no como nota suelta acá, que es como se pierden los pendientes.

**Detalle de la Parte G** (7 changes, uno por componente; corte de sesión cada 2–3):

| Change                          | Estado                                                         |
| ------------------------------- | -------------------------------------------------------------- |
| `components-fix-menu`           | **Hecha** (2026-08-01, `aaa-045`) — HU-012, 3 fixes + 1 del PO |
| `components-fix-select`         | Pendiente — siguiente por severidad                            |
| `components-fix-toast`          | Pendiente                                                      |
| `components-fix-modal`          | Pendiente                                                      |
| `components-fix-button`         | Pendiente — incluye el `aria-label` que expuso `aaa-042`       |
| `components-fix-avatar`         | Pendiente                                                      |
| `components-fix-checkbox-radio` | Pendiente — theming de `{color.white}`                         |

> **Lo que `aaa-045` dejó para el resto de la parte** (2026-08-01): tres de sus cuatro ítems no eran bugs aislados sino **convenciones que el kit ya cumplía en algún componente y nunca se escribieron** (índices con exports enumerados, el `display` del popover cerrado, el `max-height` de los overlays). Se propagaban por imitación y se rompían donde el autor no tenía un vecino a mano — `slider/index.ts`, escrito un día antes, reincidió en dos de ellas. Conviene mirar cada fix de esta parte con esa pregunta: ¿caso aislado o convención implícita? Si es lo segundo, se escribe como requirement con test en lugar de arreglar solo la instancia. El fix visual del PO además solo se diagnosticó **midiendo en un navegador real** (Playwright está en el repo): la hipótesis razonable desde el código era falsa.
>
> **Dato operativo para los gates visuales**: el playground consume el `dist/` de la lib, así que un cambio de CSS o tokens **no se ve hasta rebuildear y reiniciar el dev server**. Costó una vuelta de verificación en falso.

**Protocolo de ejecución**: una parte por sesión, con `/ds:handoff` → `/clear` → `/ds:resume` entre partes. El modelo y el effort de cada parte están declarados en el plan (§ "Modelo por parte" y § "Cuándo cortar sesión"); no se alterna modelo dentro de una sesión.

**Los tres críticos que mandan el orden**: el bundle publicado viola el Angular Package Format (Parte D), el gate de changesets rompe el propio PR de release (Parte E) y la lib no soporta SSR (Parte I).

---

### `playground-prototipo-h1` — Verificación del hito H1 (prototipo modern-minimal)

**Tipo**: playground (no publicable; commit directo o change chico según alcance). **Producto**: hito **H1** del [roadmap](../product/README.md#roadmap) / EP-006.

**Origen**: [D-023](../product/decisiones.md) definió cómo se verifica H1 — **un prototipo de la referencia `modern-minimal` construido en el playground 100% con componentes del DS**, no un checklist. La tanda 3 cerró 7/7 el 2026-08-01 (`aaa-044`, Slider), así que la verificación quedó habilitada.

**Alcance propuesto**: página en el playground que reproduzca la referencia usando exclusivamente el kit; lo que no se pueda construir con el kit es hallazgo (gap del hito), no motivo para CSS ad-hoc.

**Disparador**: activado — cierre de la tanda 3 (D-023). El PO decide cuándo agendarlo respecto del plan de la review (Partes G–N pendientes).

**Estado**: pendiente (Now).

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

### `tokens-audit-formal` — Auditoría formal de tokens y triage de huérfanos

**Tipo**: skill (`/ds:audit-tokens`) + sesión de triage. **Producto**: [EP-001](../product/epics/EP-001-fundamentos-tokens/EP-001-fundamentos-tokens.md) y [EP-005](../product/epics/EP-005-calidad-profesional/EP-005-calidad-profesional.md).

**La herramienta ya existe**: `/ds:audit-tokens` se entregó como [HU-032](../product/epics/EP-005-calidad-profesional/HU-032-audit-tokens-skill.md) el 2026-07-27 (Parte M) — skill + script determinista + command. **No hay nada que construir.**

**Origen**: la única corrida hasta hoy fue de **verificación de los CAs de HU-032**, no una auditoría formal: `docs/design/tokens/` no existe y no hay reporte fechado persistido. Esa corrida arrojó `2` hardcodes, `0` violaciones de contrato, `44` advertencias y **219 huérfanos sobre 754 tokens** — y nadie separó todavía qué parte de esos 219 es **deuda real** (un token que quedó sin consumidor tras un refactor) y qué parte es **inventario deliberado** (una escala de color completa, los 13 niveles de z-index de `aaa-009`). El `SKILL.md` ya instruye hacer esa distinción en el reporte, así que la corrida nueva debería entregarlo clasificado, no como lista cruda.

**Alcance**: (1) correr `/ds:audit-tokens` y persistir el reporte fechado; (2) sesión de triage de los huérfanos con veredicto por grupo — deuda a limpiar / inventario que se conserva y por qué; (3) lo que resulte deuda entra a la Parte H como ítem, no se corrige en la auditoría (la skill audita, no arregla).

**Se ejecuta con Fable 5** (decisión del PO, 2026-07-29): el triage no es trabajo mecánico sino criterio sobre 219 ítems —cuál es deuda y cuál cobertura futura deliberada—, que es el perfil que el plan reserva para Fable (razonamiento como cuello de botella, ver § "Modelo por parte" del [plan de acción](../reviews/2026-07-26-review-integral/plan-de-accion.md)). La corrida de la skill en sí es mecánica y no necesita Fable.

**Disparador**: **antes de la Parte H** (tokens: fixes y consistencia). El orden importa: los hallazgos de la auditoría son el insumo de H, así que hacerla antes convierte H en "arreglar lo que la auditoría marcó" en lugar de trabajar sobre la lista de la review del 2026-07-26. Conviene además cerrarla antes del `0.3.0` de [D-028](../product/decisiones.md), por ser un release público.

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
- **Los items cerrados se eliminan**: el histórico vive en el [catálogo de changes](../architecture/catalog.md#catálogo-de-changes) y en `openspec/changes/archive/`. Este archivo solo tiene pendientes.
- **Cuando un item gana HU, se deduplica** (no se elimina — el item sigue vivo hasta que su change se archive): la HU pasa a ser la fuente de "qué/por qué" (origen, alcance, decisiones, fuera-de-alcance) y el item conserva **solo lo operativo** (tipo, link a la HU, disparador, horizonte, estado). No se repite en el backlog lo que la HU ya dice.
- **Grooming al archivar cada change** (ver "Cómo se gestiona" §4): disparadores reevaluados, horizontes promovidos, cerrados eliminados, inbox del PO triado.
- **Un item = una entrada**: si crece a múltiples entregas independientes, se parte (como los tokens Atlassian).
- **Sin emojis** en items o títulos.

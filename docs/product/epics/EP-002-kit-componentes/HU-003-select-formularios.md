# HU-003 — Select/Combobox para formularios reales (dev consumidor)

**Épica**: [EP-002 — Kit de componentes Angular](README.md)
**Actor**: Dev consumidor
**Estado**: Hecha — change [aaa-016 components-add-select](../../../../openspec/changes/archive/aaa-016-components-add-select/) archivado (2026-07-11); generó [ADR-014](../../../architecture/adr/ADR-014-overlays-anclados-popover-api.md)
**Decisiones que aplica**: [D-005, D-007, D-009](../../decisiones.md)

---

**COMO** dev que arma formularios con el DS
**QUIERO** un `ds-select` accesible integrado a Angular Forms
**PARA** cubrir selección de opciones (el gap más grande del kit para un formulario real) sin recurrir a otro DS.

## Criterios de aceptación

<!-- Al implementar, estos CAs se vuelven scenarios del spec components-package (delta del change components-add-select). -->

- [x] **CA-003.1** — Dado un `ds-select` ligado a Reactive Forms o `[(ngModel)]` (CVA), cuando el usuario elige una opción, entonces el control del form refleja el valor; y cuando el form setea el valor programáticamente, el select muestra la opción correspondiente. _Tests CVA en `select.spec.ts`._
- [x] **CA-003.2** — Dado el select cerrado con foco, cuando se presiona `↓`, `Enter` o `Space`, entonces el listado se abre; dado el listado abierto, `↑`/`↓` mueven la opción activa, `Home`/`End` van a los extremos, `Enter` selecciona y cierra, y `Esc` cierra sin cambiar la selección. _5 tests de teclado._
- [x] **CA-003.3** — Dado el componente renderizado, entonces implementa el patrón combobox de ARIA APG: `role` correcto en trigger y listado, `aria-expanded` sincronizado, opción activa expuesta (`aria-activedescendant`) y label asociado programáticamente. _Incluye el reenvío de `aria-label` al trigger detectado por el gate `/ng:review`._
- [x] **CA-003.4** — Dado el trigger, entonces muestra el chevron `LucideChevronDown` según la convención de iconografía (16px / stroke 1.5, [ADR-012](../../../architecture/adr/ADR-012-iconografia-lucide.md)).
- [x] **CA-003.5** — Dado el CSS del componente, entonces todo valor visual sale de tokens (`var(--ds-*)`), incluidos los sizes, sin hardcodes. _Contraste de los pares nuevos verificado por script (2 tokens ajustados en el gate)._
- [x] **CA-003.6** — Dado un select deshabilitado vía forms API (`setDisabledState`), entonces no es operable pero su estado es perceptible (contraste y semántica según [ADR-011](../../../architecture/adr/ADR-011-estado-disabled-accesible.md), extendido por ADR-014 §5 al form control operado por botón).
- [x] **CA-003.7** — Dado el listado abierto, entonces se posiciona relativo al trigger sin quedar cortado por contenedores con overflow (top layer, Popover API), y se cierra al clickear fuera (light-dismiss).

## Dependencias

- Ninguna bloqueante: iconografía resuelta (ADR-012) y patrón de overlay disponible (ADR-013).
- Decisión técnica pendiente (no bloquea el refinamiento; se resuelve en el `design.md` del change): **mecanismo de posicionamiento del dropdown** — FUTURE-WORK sugería `@floating-ui/dom`; evaluar también Popover API nativa + CSS anchor positioning (misma filosofía de plataforma que ADR-013). Si sienta patrón, genera ADR.

## Fuera de alcance

- Variantes con search/filter y multi-select: candidatas a HUs posteriores si aparece caso real (D-005).

## Notas

- Al refinarse, se crea su change OpenSpec (`components-add-select`).

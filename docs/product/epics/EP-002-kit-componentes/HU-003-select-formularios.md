# HU-003 — Select/Combobox para formularios reales (dev consumidor)

**Épica**: [EP-002 — Kit de componentes Angular](README.md)
**Actor**: Dev consumidor
**Estado**: Identificada
**Decisiones que aplica**: [D-005, D-007](../../decisiones.md)

---

**COMO** dev que arma formularios con el DS
**QUIERO** un `ds-select` accesible integrado a Angular Forms
**PARA** cubrir selección de opciones (el gap más grande del kit para un formulario real) sin recurrir a otro DS.

## Criterios de aceptación

Pendientes de refinamiento. Temas a cubrir (base [FUTURE-WORK](../../../backlog/FUTURE-WORK.md)): CVA + `[(value)]`, keyboard nav completa (↑↓ Enter Esc Home End), chevron con `LucideChevronDown` (ADR-012), a11y del patrón combobox (ARIA APG), sizes por tokens.

## Dependencias

- Ninguna bloqueante: iconografía resuelta (ADR-012) y patrón de overlay disponible (ADR-013).
- El refinamiento debe decidir el **mecanismo de posicionamiento del dropdown** (FUTURE-WORK sugería `@floating-ui/dom`; evaluar también Popover API nativa + CSS anchor positioning — misma filosofía de plataforma que ADR-013). Decisión técnica → design.md del change y ADR si sienta patrón.

## Fuera de alcance

- Variantes con search/filter y multi-select: candidatas a HUs posteriores si aparece caso real (D-005).

## Notas

- Al refinarse, se crea su change OpenSpec (`components-add-select`).

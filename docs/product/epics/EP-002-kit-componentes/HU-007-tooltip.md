# HU-007 — Tooltip de ayuda contextual (dev consumidor)

**Épica**: [EP-002 — Kit de componentes Angular](README.md)
**Actor**: Dev consumidor
**Estado**: Identificada (tanda 1, [D-009](../../decisiones.md))
**Decisiones que aplica**: [D-005, D-007, D-009](../../decisiones.md)

---

**COMO** dev que necesita aclarar controles compactos (iconos, botones, abreviaturas)
**QUIERO** una directiva `dsTooltip` accesible
**PARA** dar ayuda contextual sin recargar la UI ni romper la a11y de teclado.

## Criterios de aceptación

Pendientes de refinamiento. Temas a cubrir (base [FUTURE-WORK](../../../backlog/FUTURE-WORK.md)): directiva sobre cualquier elemento, placement (top/bottom/left/right + auto), delay configurable, trigger por hover **y** focus (nunca solo hover), `role="tooltip"` + `aria-describedby`, cierre con `Esc`, respeto de `prefers-reduced-motion`.

## Dependencias

- **Mecanismo de posicionamiento**: reutiliza el que decida el change de Select (HU-003, `@floating-ui/dom` vs plataforma) — no arrancar antes de esa decisión.

## Fuera de alcance

- Contenido interactivo dentro del tooltip (eso es un Popover, otro patrón ARIA): HU posterior si aparece caso real (D-005).
- Tooltips rich (HTML arbitrario con acciones).

## Notas

- FUTURE-WORK lo listaba como `[rmdTooltip]` (naming del repo previo); la convención vigente es prefijo `ds` (ADR-007) → `dsTooltip`.
- Al refinarse, se crea su change OpenSpec (`components-add-tooltip`).

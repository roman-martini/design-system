# HU-007 — Tooltip de ayuda contextual (dev consumidor)

**Épica**: [EP-002 — Kit de componentes Angular](README.md)
**Actor**: Dev consumidor
**Estado**: Refinada (2026-07-18, ambigüedades resueltas con el PO)
**Decisiones que aplica**: [D-005, D-007, D-009](../../decisiones.md)

---

**COMO** dev que necesita aclarar controles compactos (iconos, botones, abreviaturas)
**QUIERO** una directiva `dsTooltip` accesible
**PARA** dar ayuda contextual sin recargar la UI ni romper la a11y de teclado.

## Decisiones de refinamiento (PO, 2026-07-18)

1. **Estilo inverso theme-aware** — fondo oscuro/texto claro en light (patrón universal), logrado pareando semantic invertidos (`bg` ← `text.primary`, `text` ← `bg.surface`): en dark se invierte solo y el contraste queda ~17:1 en los 4 themes.
2. **Delay de apertura ~500ms** (default como token `component.tooltip.delay`, configurable por input) con **cierre inmediato**; el foco por teclado abre inmediato (sin delay).
3. **Tooltip = descripción, no label** — se asocia por `aria-describedby`; un botón ícono-only sigue necesitando su `aria-label` propio (responsabilidad del consumidor, documentada en story).
4. **Hereda ADR-014 completo** — Popover API (top layer) + fallback JS de posicionamiento, sin re-decidir.

## Criterios de aceptación

<!-- Al implementar, estos CAs se vuelven scenarios del spec components-package (delta del change components-add-tooltip). -->

- [ ] **CA-007.1** — Dado cualquier elemento con `dsTooltip="texto"`, entonces al interactuar muestra el tooltip con ese texto; con string vacío, la directiva no crea tooltip ni atributos ARIA.
- [ ] **CA-007.2** — Dado el elemento anfitrión, cuando recibe hover, entonces el tooltip abre tras el delay (default del token, configurable con `dsTooltipDelay`); cuando recibe **foco por teclado**, abre inmediato (nunca solo-hover); al salir el mouse o perder el foco, cierra inmediato.
- [ ] **CA-007.3** — Dado el tooltip visible, entonces cumple WCAG 1.4.13: `Escape` lo cierra sin mover el foco (dismissable), mover el mouse sobre el propio tooltip no lo cierra (hoverable), y no desaparece por tiempo (persistent).
- [ ] **CA-007.4** — Dado el tooltip visible, entonces su contenido tiene `role="tooltip"` e id único, y el anfitrión lo referencia por `aria-describedby`; al cerrarse, la referencia se limpia.
- [ ] **CA-007.5** — Dado el input de placement (`top | bottom | left | right`, default `top`), entonces el tooltip se posiciona relativo al anfitrión en top layer (Popover API), con flip automático si no hay espacio (fallback ADR-014) y sin quedar recortado por contenedores con overflow.
- [ ] **CA-007.6** — Dado el CSS de la directiva, entonces todo valor sale de tokens `component.tooltip.*` nuevos (bg/text invertidos vía semantic, padding, radius, font-size, max-width, shadow, delay) y el contraste pasa AA por script en los 4 themes.
- [ ] **CA-007.7** — Dada la transición de aparición, entonces usa los tokens de motion de overlay con su bloque `prefers-reduced-motion` (el delay de apertura no cuenta como motion y se mantiene).
- [ ] **CA-007.8** — Dada la primera **directiva** del kit, entonces sigue las convenciones: class `DsTooltip`, selector `[dsTooltip]` (ADR-007), archivos sin sufijo de rol en `src/lib/tooltip/` (ADR-010), exportada desde `public-api.ts`.

## Dependencias

- Ninguna bloqueante: el posicionamiento quedó resuelto por [ADR-014](../../../architecture/adr/ADR-014-overlays-anclados-popover-api.md) (reglas 1–6 reutilizables).

## Fuera de alcance

- Contenido interactivo o rich (HTML con acciones) dentro del tooltip — eso es un Popover, otro patrón ARIA (HU posterior con caso real, D-005).
- Comportamiento táctil dedicado (long-press): los tooltips son hover/focus por naturaleza; en touch la información debe estar disponible por otra vía (responsabilidad del consumidor, se documenta).

## Notas

- Change OpenSpec: `components-add-tooltip` (próximo ID en [openspec/README.md](../../../../openspec/README.md)).
- Referencias de implementación: capa y posicionamiento de `select.ts` (ADR-014), reenvío de ids/describedby de `input.ts`.

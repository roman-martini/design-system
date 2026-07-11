# HU-010 — Skeleton de contenido en carga (dev consumidor)

**Épica**: [EP-002 — Kit de componentes Angular](README.md)
**Actor**: Dev consumidor
**Estado**: Identificada (tanda 1, [D-009](../../decisiones.md))
**Decisiones que aplica**: [D-005, D-007, D-009](../../decisiones.md)

---

**COMO** dev que renderiza vistas con datos remotos
**QUIERO** un `ds-skeleton` para placeholders de carga
**PARA** mantener la estructura visual estable mientras llegan los datos (menos layout shift que un spinner a pantalla).

## Criterios de aceptación

Pendientes de refinamiento. Temas a cubrir (base [FUTURE-WORK](../../../backlog/FUTURE-WORK.md)): props `width`/`height`/`radius`, `shape: 'text' | 'rect' | 'circle'`, animación de pulso por tokens de motion con respeto de `prefers-reduced-motion`, semántica decorativa (`aria-hidden`, la región en carga se anuncia por el contenedor, no por cada bloque).

## Dependencias

- Ninguna bloqueante.

## Fuera de alcance

- Skeletons compuestos prearmados (card, tabla, lista): son patterns/recipes (nivel 5 de FUTURE-WORK), no componentes del package.

## Notas

- Al refinarse, se crea su change OpenSpec (`components-add-skeleton`).

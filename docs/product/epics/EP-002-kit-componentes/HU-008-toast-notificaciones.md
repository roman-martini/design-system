# HU-008 — Toast/Notification para feedback asíncrono (dev consumidor)

**Épica**: [EP-002 — Kit de componentes Angular](README.md)
**Actor**: Dev consumidor
**Estado**: Identificada (tanda 1, [D-009](../../decisiones.md))
**Decisiones que aplica**: [D-005, D-007, D-009](../../decisiones.md)

---

**COMO** dev que confirma resultados de acciones (guardado, error de red, deshacer)
**QUIERO** un sistema de toasts (`DsToastService` + componente) accesible
**PARA** notificar sin bloquear el flujo, con una API programática uniforme en toda la app.

## Criterios de aceptación

Pendientes de refinamiento. Temas a cubrir (base [FUTURE-WORK](../../../backlog/FUTURE-WORK.md)): API por servicio (`DsToastService`), variantes success/warning/danger/info, posiciones, auto-dismiss con pausa en hover/focus, stacking, acción opcional (ej. deshacer), a11y (`role="status"` vs `role="alert"` según severidad, anuncios a screen reader sin robar foco), z-index/top-layer según ADR-013, `prefers-reduced-motion`.

## Dependencias

- Ninguna bloqueante (tokens de z-index y motion de overlays entregados en aaa-009).

## Fuera de alcance

- Centro de notificaciones persistente (historial).
- Notificaciones del sistema operativo (Web Notifications API).

## Notas

- Al refinarse, se crea su change OpenSpec (`components-add-toast`).

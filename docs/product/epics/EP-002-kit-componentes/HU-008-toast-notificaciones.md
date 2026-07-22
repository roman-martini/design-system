---
epica: EP-002
actor: Dev consumidor
estado: Hecha (2026-07-18, aaa-021 components-add-toast)
decisiones: [D-005, D-007, D-009]
---

# HU-008 — Toast/Notification para feedback asíncrono (dev consumidor)

**COMO** dev que confirma resultados de acciones (guardado, error de red, deshacer)
**QUIERO** un sistema de toasts (`DsToastService` + componente) accesible
**PARA** notificar sin bloquear el flujo, con una API programática uniforme en toda la app.

## Decisiones de refinamiento (PO, 2026-07-18)

1. **Posición global configurable** vía provider (default `bottom-right`) — nunca por toast: una app notifica siempre desde el mismo lugar.
2. **Danger persiste** hasta cierre manual (los errores se leen, no se esfuman — WCAG 2.2.1); success/info/warning se auto-cierran (~5s default) **pausables en hover y foco**.
3. **Acción opcional entra**: un solo botón (label + callback, el caso "Deshacer" de la narrativa); con acción presente la pausa es obligatoria. Más de un botón o contenido rico quedan afuera.
4. **Top layer vía popover manual** (ADR-014, tercer consumidor): los toasts se ven por encima de modales abiertos; `z-index.toast` queda para consumidores no-top-layer (misma nota que ADR-013).

## Criterios de aceptación

<!-- Al implementar, estos CAs se vuelven scenarios del spec components-package (delta del change components-add-toast). -->

- [x] **CA-008.1** — Dado el servicio inyectado (primera service del kit: `DsToastService`, convención ADR-007), cuando se llama `show({ message, variant, duration?, action? })` o los atajos `success/info/warning/danger(message)`, entonces el toast aparece en el stack y la llamada devuelve una referencia con `dismiss()`.
- [x] **CA-008.2** — Dada la configuración del provider (`provideDsToasts({ position })`, default `bottom-right`), entonces todos los toasts de la app aparecen en esa posición; no existe posición por toast.
- [x] **CA-008.3** — Dado un toast success/info/warning, entonces se auto-cierra tras la duración (default tokenizado ~5s; `duration` lo ajusta y `0` lo hace persistente) y el timer **se pausa con hover o foco** dentro del toast (WCAG 2.2.1); dado un toast danger, entonces **no** se auto-cierra y siempre muestra botón de cierre.
- [x] **CA-008.4** — Dado un toast con `action` (label + callback), entonces renderiza un único botón de acción alcanzable por teclado **sin robar el foco** al aparecer; activarlo ejecuta el callback y cierra el toast.
- [x] **CA-008.5** — Dado un toast success/info/warning, entonces se anuncia como región de estado (`role="status"`, cortés); dado un danger, como `role="alert"`; en ningún caso el foco se mueve al aparecer, y el botón de cierre tiene `aria-label`.
- [x] **CA-008.6** — Dados múltiples toasts activos, entonces se apilan en orden en la posición global, el contenedor vive en el **top layer** (popover manual — visibles sobre un modal abierto) y cada cierre reacomoda el stack. ✔ jsdom cubre el cableado; la superposición real sobre el modal quedó demostrable en playground (botón dentro del modal).
- [x] **CA-008.7** — Dado el CSS del sistema, entonces todo valor sale de tokens `component.toast.*` nuevos + status semantic, y los pares de contraste por variante pasan AA por script en los 4 themes — **incluye ejecutar `tokens-fix-status-borders`** (los `border/bg` de status que arrastran fallas latentes detectadas en aaa-017). ✔ Nota: el fix real fue `*-600`/`*-700` en light (el `*-500` supuesto no alcanzaba 3:1).
- [x] **CA-008.8** — Dada la entrada/salida de un toast, entonces usa los tokens de motion de overlay con su bloque `prefers-reduced-motion`.

## Dependencias

- Ninguna bloqueante. **Activa** el item `tokens-fix-status-borders` del BACKLOG (Next → entra en este change por CA-008.7).

## Fuera de alcance

- Centro de notificaciones persistente (historial).
- Notificaciones del sistema operativo (Web Notifications API).
- Más de un botón por toast, contenido rico/HTML arbitrario, posiciones por toast.

## Notas

- **Cierre (2026-07-18)** — [`aaa-021 components-add-toast`](../../../../openspec/changes/archive/aaa-021-components-add-toast/) archivado; 15 tests, review sin altas, gate de contraste PASS en 4 themes.
- Change OpenSpec: `components-add-toast` (próximo ID en [openspec/README.md](../../../../openspec/README.md)).
- Referencias de implementación: panel interno + popover manual de `tooltip.ts` (ADR-014), timers con pausa de `tooltip.ts`, variantes por tokens de `tabs.css`.

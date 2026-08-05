---
epica: EP-002
actor: Dev consumidor
estado: Identificada
decisiones: [D-033, D-015, D-022, D-007]
---

# HU-041 — Alert de mensajes en página (dev consumidor)

**COMO** dev que comunica estados del sistema dentro de una vista (éxito de una operación, advertencia previa a una acción, error de validación general, información contextual)
**QUIERO** un componente `ds-alert` con variantes de status, tokenizado y accesible
**PARA** mostrar mensajes persistentes en el flujo de la página sin recurrir al toast (que es efímero y flotante) ni maquetar el patrón a mano en cada app.

## Origen

La [auditoría formal de tokens del 2026-08-04](../../../design/tokens/2026-08-04-audit.md) encontró `component/alert.json` con **24 tokens de un componente que no existe**: el único archivo de tokens de componente sin componente en el kit — spec anticipada escrita durante el bootstrap de tokens que nunca se materializó. [D-033](../../decisiones.md) resolvió **retirar el archivo** (la spec anticipada no sobreviviría al diseño real) y **conservar la capacidad** como esta HU, para que el retiro no borre del roadmap un componente que el kit razonablemente va a necesitar.

Esta HU registra la capacidad; no hereda los 24 tokens retirados como contrato. Al refinarse, los tokens del componente se diseñan de cero junto con él, con el estándar vigente entonces (hoy: variantes ADR-019, capa component que referencia semantic, gate de contraste por par).

## Criterios de aceptación

> Preliminares — se cierran al refinar la HU con el PO.

- [ ] **CA-041.1 (variantes de status)** — Dado un `ds-alert`, cuando se le asigna un status (`success | warning | danger | info`), entonces el fondo, borde, texto e ícono salen de tokens `component.alert.*` que referencian la capa semantic de status, coherentes con Badge y Toast.
- [ ] **CA-041.2 (semántica accesible)** — Dado un alert presente en el DOM al cargar o insertado dinámicamente, entonces expone la semántica ARIA adecuada a su urgencia sin robar el foco, y su ícono de status no es el único canal que comunica la severidad ([D-007](../../decisiones.md)).
- [ ] **CA-041.3 (contenido componible)** — Dado un alert con título, cuerpo y acción opcional, entonces las sub-partes se componen sin que el componente imponga estructura de heading a la página.
- [ ] **CA-041.4 (dismissible opcional)** — Dado un alert descartable, entonces el botón de cierre usa el naming canónico `closeLabel` (decisión A19 de la review del 2026-07-26) y el descarte es alcanzable por teclado.
- [ ] **CA-041.5 (gate visual del PO)** — Dado el componente implementado, entonces su showcase muestra las variantes en light/dark y el PO da el OK visual explícito antes de archivar ([D-022](../../decisiones.md)).

## Dependencias

- La ejecución de [D-033](../../decisiones.md) en `aaa-053` (retiro de `component/alert.json`) no bloquea esta HU, pero conviene que la preceda: si Alert se implementara antes, el retiro pierde objeto.
- Tokens semantic de status (`bg.*-subtle`, `border.*`, `text.*`, `icon.*`) ya existen y tienen consumidores (Badge, Toast); la auditoría lista además `semantic.color.bg.success/warning/info` sólidos sin consumidor que este componente podría estrenar.

## Fuera de alcance

- Feedback efímero flotante: es `DsToastService` ([HU-008](HU-008-toast-notificaciones.md)).
- Banner de página completa (full-bleed, cross-app): si aparece el caso de uso, es capacidad propia ([D-015](../../decisiones.md)).

## Notas

- Sin tanda: entra por decisión directa del PO ([D-033](../../decisiones.md), 2026-08-04) durante el triage de la deuda de tokens de la Parte H.
- El disparador de implementación queda a definir por el PO; mientras tanto la HU vive acá para que la capacidad no se pierda (pedido explícito del PO al decidir el retiro).

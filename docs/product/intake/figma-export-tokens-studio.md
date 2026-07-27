---
estado: Refinado
fecha-ingreso: 2026-07-26
---

# Export de tokens a Figma (sin disparador activo)

## Requerimiento

Sincronizar los tokens del código como Variables de Figma, one-way ([D-006](../decisiones.md): el código define, el diseño consume). El actor es el **diseñador**.

**Este intake no contiene el requerimiento** — es un puntero. El trabajo ya está comprometido y refinado en otro lado:

- [HU-001](../epics/EP-004-puente-codigo-diseno/HU-001-tokens-en-figma.md) (EP-004) — el qué y el porqué.
- Change `aaa-012` (`openspec/changes/tokens-figma-export/`) — 4 de 4 artefactos escritos, listo para implementar. **Permanece activo con nota de pausa** por [D-027](../decisiones.md).
- [ADR-009](../../architecture/adr/ADR-009-figma-tokens-export.md) — la decisión técnica.

Existe acá porque el PO lo sacó de la cola operativa el 2026-07-26: no bloquea nada y se retoma cuando sea necesario. El BACKLOG es para trabajo en cola; esto no lo está.

## Preguntas

- [ ] ¿Qué lo reactiva? Hoy no hay disparador escrito. El candidato natural: que el PO vaya a diseñar en Figma consumiendo el sistema, que es cuando el puente empieza a valer.
- [ ] ¿La migración a formato DTCG ([D-024](../decisiones.md)) cambia el alcance del change? Probablemente lo simplifica: DTCG es justamente lo que consume Tokens Studio. Conviene revisar los 4 artefactos de `aaa-012` después de esa migración, antes de implementarlos tal como están.

## Exploración

Su validación final requiere conectar Tokens Studio en Figma — trabajo del PO, no del repo. Ese es el motivo real por el que quedó pausado desde el 2026-07-03, siete semanas antes de esta revisión.

Al retomarse, este intake se borra: el trabajo ya vive en HU-001 y en el change.

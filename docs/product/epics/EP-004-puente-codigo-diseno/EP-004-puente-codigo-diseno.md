---
estado: En refinamiento (HU-001 con change propuesto, en pausa por decisión del PO)
actor: Diseñador
---

# EP-004 — Puente código ↔ diseño

## Contexto

Nace de la pregunta del PO (2026-06-09): _"¿mi package de tokens se lo puedo pasar a Figma y tener los componentes en Figma?"_. El refinamiento aclaró la expectativa — **tokens ≠ componentes de Figma**: lo que viaja son los valores (Variables), el dibujo de componentes sigue siendo trabajo de diseño — y fijó la dirección en D-006: el código define, Figma consume.

## Alcance

Export de tokens en formato estándar (DTCG) consumible por herramientas de diseño, sincronización one-way code→Figma, y la convención de modos (theme/brand) del lado diseño. Queda afuera: generar componentes de Figma, sync bidireccional (contradice D-006), API REST de Figma (requiere Enterprise; evaluación futura).

## Historias de usuario

| HU                                  | Título                                            | Actor     | Estado                                        |
| ----------------------------------- | ------------------------------------------------- | --------- | --------------------------------------------- |
| [HU-001](HU-001-tokens-en-figma.md) | Tokens del DS disponibles como Variables de Figma | Diseñador | Refinada (change aaa-012 propuesto, en pausa) |

## Decisiones aplicables

[D-006](../../decisiones.md) · Técnica: [ADR-009](../../../architecture/adr/ADR-009-figma-tokens-export.md) (Propuesto; se acepta al cerrar aaa-012).

## Preguntas abiertas

1. ¿Cuándo retomar aaa-012? El PO lo pausó explícitamente (2026-07-03: "export figma NO" por ahora). Bloquea HU-001. Nota: la validación final requiere trabajo del PO en Figma (conectar Tokens Studio).

## Orden sugerido

HU-001 es la única HU; su change ([aaa-012](../../../../openspec/changes/tokens-figma-export/)) está 4/4 artefactos, listo para apply cuando se retome.

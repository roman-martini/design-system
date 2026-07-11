# EP-001 — Fundamentos: tokens y theming

**Estado**: En desarrollo (base entregada; backlog abierto por disparador)

## Contexto

El cimiento del DS: sin tokens no hay componentes consistentes ni theming. Nace con el bootstrap (aaa-002) heredando la investigación del repo previo.

## Alcance

Design tokens en jerarquía `primitives → semantic → component → theme` (ADR-003), build con Style Dictionary, theming por CSS variables + atributos (`[data-theme]`, `[data-brand]`), y las capas transversales que los componentes necesitan (z-index, motion, efectos). Queda afuera: el export a Figma (EP-004) y los tokens de componentes concretos (nacen con cada componente en EP-002).

## Valor entregado

| Entrega                                                                                                   | Change                                                                           | Qué obtuvo el dev consumidor                                                            |
| --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Package `@romanmartinidev/tokens` completo (primitives, semantic, component, themes dark/brand-a/brand-b) | [aaa-002](../../../../openspec/changes/archive/aaa-002-bootstrap-fase-2-tokens/) | `import '@romanmartinidev/tokens/css'` y toda la paleta tokenizada con dark mode opt-in |
| Jerarquía z-index formalizada + motion de overlays + effect.blur                                          | [aaa-009](../../../../openspec/changes/archive/aaa-009-tokens-add-z-index/)      | Capas y animaciones de overlay consistentes sin hardcodear                              |
| Regla anti-duplicación component→semantic                                                                 | [aaa-014](../../../../openspec/changes/archive/aaa-014-components-add-modal/)    | Jerarquía de referencia auditada como contrato                                          |

## Historias de usuario

Sin HUs activas. Candidatas (cantera [FUTURE-WORK](../../../backlog/FUTURE-WORK.md) § tokens, entran con disparador según D-005): breakpoints responsive (cuando haya primer componente responsive), motion adicional (delays/easings extra), density tokens, `space.0`/negative-space/metric-typography (research Atlassian).

## Decisiones aplicables

[D-001, D-002, D-005, D-006](../../decisiones.md) · Técnica: [ADR-003](../../../architecture/adr/ADR-003-arquitectura-design-tokens.md).

## Orden sugerido

Reactivo: el próximo token entra cuando un componente o consumidor real lo pida (D-005).

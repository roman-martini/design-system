---
estado: En desarrollo (base entregada; backlog abierto por disparador)
actor: Dev consumidor
---

# EP-001 — Fundamentos: tokens y theming

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
| Contraste WCAG AA en tokens interactivos (primario + border.strong) + requirement anti-regresión en spec  | [aaa-015](../../../../openspec/changes/archive/aaa-015-tokens-fix-contrast-aa/)  | Button/Checkbox/Radio accesibles out-of-the-box en los 4 themes, verificado por script  |

## Historias de usuario

| HU                                            | Título                                    | Actor          | Estado                                                            |
| --------------------------------------------- | ----------------------------------------- | -------------- | ----------------------------------------------------------------- |
| [HU-004](HU-004-contraste-aa-tokens.md)       | Tokens interactivos con contraste WCAG AA | Dev consumidor | Hecha (aaa-015 archivado 2026-07-11)                              |
| [HU-018](HU-018-tokens-aditivos-atlassian.md) | Tokens aditivos del research Atlassian    | Dev consumidor | Identificada (Later; sin disparador activo — un change por token) |

Candidatas (en [intake/tokens-pendientes.md](../../intake/tokens-pendientes.md), entran con disparador o por decisión del PO según D-015): breakpoints responsive (cuando haya primer componente responsive), motion adicional (delays/easings extra), density tokens. Los aditivos del research Atlassian (`space.0`, `metric.*`, `space.negative.*`) ya están formalizados en [HU-018](HU-018-tokens-aditivos-atlassian.md), cada uno esperando su disparador.

## Decisiones aplicables

[D-001, D-002, D-006, D-007, D-008, D-015](../../decisiones.md) · Técnica: [ADR-003](../../../architecture/adr/ADR-003-arquitectura-design-tokens.md).

## Orden sugerido

HU-004 hecha ([aaa-015](../../../../openspec/changes/archive/aaa-015-tokens-fix-contrast-aa/) archivado, aprobado por D-008). Reactivo: el próximo token entra cuando un componente o consumidor real lo pida, o cuando el PO lo apruebe (D-015).

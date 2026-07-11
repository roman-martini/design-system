# EP-002 — Kit de componentes Angular

**Estado**: En desarrollo (5 componentes entregados; backlog abierto)

## Contexto

El corazón del producto para el dev consumidor: componentes Angular modernos (standalone, signals, OnPush/zoneless) que consumen los tokens de EP-001 y aplican a11y por diseño (D-007).

## Alcance

Componentes del kit publicable `@romanmartinidev/components`: form controls, acciones, overlays y su iconografía. Queda afuera: tokens base (EP-001), publicación/versionado (EP-003), tooling de calidad (EP-005).

## Valor entregado

| Entrega                                                               | Change                                                                                                                                                                        | Qué obtuvo el dev consumidor                           |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `DsButton` (variants, sizes, disabled accesible con `disabledReason`) | [aaa-003](../../../../openspec/changes/archive/aaa-003-bootstrap-fase-3-components/), [aaa-011](../../../../openspec/changes/archive/aaa-011-components-accessible-disabled/) | Botón accesible que explica por qué está deshabilitado |
| `DsCheckbox` (CVA, indeterminate, a11y)                               | [aaa-006](../../../../openspec/changes/archive/aaa-006-components-add-checkbox/)                                                                                              | Checkbox integrado a Angular Forms                     |
| `DsRadio` + `DsRadioGroup` (CVA, keyboard nav completa)               | [aaa-008](../../../../openspec/changes/archive/aaa-008-components-add-radio/)                                                                                                 | Selección única accesible, standalone o agrupada       |
| Iconografía Lucide (convención tree-shakeable 16/1.5)                 | [aaa-013](../../../../openspec/changes/archive/aaa-013-components-decide-icon-library/)                                                                                       | Iconos type-safe sin mantener un set propio            |
| `DsModal` (dialog nativo: focus trap/top layer por plataforma)        | [aaa-014](../../../../openspec/changes/archive/aaa-014-components-add-modal/)                                                                                                 | Primer overlay completo con a11y de plataforma         |

## Historias de usuario

| HU                                     | Título                                  | Actor          | Estado       |
| -------------------------------------- | --------------------------------------- | -------------- | ------------ |
| [HU-003](HU-003-select-formularios.md) | Select/Combobox para formularios reales | Dev consumidor | Identificada |

Candidatas (cantera [FUTURE-WORK](../../../backlog/FUTURE-WORK.md) § componentes, por prioridad de uso real): Tabs, Tooltip, Toast, Spinner, Skeleton, Input/TextField. Entran con disparador (D-005).

## Decisiones aplicables

[D-001, D-002, D-005, D-007](../../decisiones.md) · Técnicas: [ADR-004](../../../architecture/adr/ADR-004-arquitectura-components.md), [ADR-007](../../../architecture/adr/ADR-007-naming-prefijos.md), [ADR-010](../../../architecture/adr/ADR-010-file-naming-sin-sufijo-component.md)–[ADR-013](../../../architecture/adr/ADR-013-overlays-dialog-nativo.md).

## Orden sugerido

HU-003 (Select) es la próxima natural: desbloqueada por iconos (ADR-012) y con el patrón de overlay disponible (ADR-013). Su refinamiento decide la dependencia de posicionamiento (`@floating-ui/dom` u otra).

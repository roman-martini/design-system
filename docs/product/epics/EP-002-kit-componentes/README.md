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

| HU                                       | Título                                     | Actor          | Estado                                                               |
| ---------------------------------------- | ------------------------------------------ | -------------- | -------------------------------------------------------------------- |
| [HU-003](HU-003-select-formularios.md)   | Select/Combobox para formularios reales    | Dev consumidor | Refinada (activada por D-009)                                        |
| [HU-005](HU-005-input-textfield.md)      | Input/TextField para formularios reales    | Dev consumidor | Identificada (tanda 1)                                               |
| [HU-006](HU-006-tabs-navegacion.md)      | Tabs para navegación de contenido          | Dev consumidor | Identificada (tanda 1)                                               |
| [HU-007](HU-007-tooltip.md)              | Tooltip de ayuda contextual                | Dev consumidor | Identificada (tanda 1; espera decisión de posicionamiento de HU-003) |
| [HU-008](HU-008-toast-notificaciones.md) | Toast/Notification para feedback asíncrono | Dev consumidor | Identificada (tanda 1)                                               |
| [HU-009](HU-009-spinner.md)              | Spinner de carga                           | Dev consumidor | Identificada (tanda 1)                                               |
| [HU-010](HU-010-skeleton.md)             | Skeleton de contenido en carga             | Dev consumidor | Identificada (tanda 1)                                               |

Las HU-005…HU-010 forman la **tanda 1 de expansión** aprobada por [D-009](../../decisiones.md): completar el criterio "una app real se construye 100% con el DS". Candidatas restantes (cantera [FUTURE-WORK](../../../backlog/FUTURE-WORK.md) § componentes, requieren disparador propio según D-005): Progress, Accordion, Breadcrumbs, Pagination, Menu/Dropdown, DatePicker (wrapping).

## Decisiones aplicables

[D-001, D-002, D-005, D-007, D-009](../../decisiones.md) · Técnicas: [ADR-004](../../../architecture/adr/ADR-004-arquitectura-components.md), [ADR-007](../../../architecture/adr/ADR-007-naming-prefijos.md), [ADR-010](../../../architecture/adr/ADR-010-file-naming-sin-sufijo-component.md)–[ADR-013](../../../architecture/adr/ADR-013-overlays-dialog-nativo.md).

## Orden sugerido

Tanda 1 (D-009): **HU-003 Select → HU-005 Input** primero (formularios, el gap más grande), después **HU-006 Tabs**, **HU-007 Tooltip** (reutiliza la decisión de posicionamiento que tome el change de Select), y el trío de feedback **HU-008 Toast → HU-009 Spinner → HU-010 Skeleton**. Cada HU se refina (CAs binarios) justo antes de crear su change.

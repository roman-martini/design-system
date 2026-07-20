# EP-002 — Kit de componentes Angular

**Estado**: **Tandas 1 y 2 completas** (tanda 2 cerrada 2026-07-20 con aaa-029) — 16 entregas de componentes + 3 directivas + 1 service; sin HUs en cola (las siguientes entran con disparador real, D-005)

## Contexto

El corazón del producto para el dev consumidor: componentes Angular modernos (standalone, signals, OnPush/zoneless) que consumen los tokens de EP-001 y aplican a11y por diseño (D-007).

## Alcance

Componentes del kit publicable `@romanmartinidev/components`: form controls, acciones, overlays y su iconografía. Queda afuera: tokens base (EP-001), publicación/versionado (EP-003), tooling de calidad (EP-005).

## Valor entregado

| Entrega                                                                   | Change                                                                                                                                                                        | Qué obtuvo el dev consumidor                             |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `DsButton` (variants, sizes, disabled accesible con `disabledReason`)     | [aaa-003](../../../../openspec/changes/archive/aaa-003-bootstrap-fase-3-components/), [aaa-011](../../../../openspec/changes/archive/aaa-011-components-accessible-disabled/) | Botón accesible que explica por qué está deshabilitado   |
| `DsCheckbox` (CVA, indeterminate, a11y)                                   | [aaa-006](../../../../openspec/changes/archive/aaa-006-components-add-checkbox/)                                                                                              | Checkbox integrado a Angular Forms                       |
| `DsRadio` + `DsRadioGroup` (CVA, keyboard nav completa)                   | [aaa-008](../../../../openspec/changes/archive/aaa-008-components-add-radio/)                                                                                                 | Selección única accesible, standalone o agrupada         |
| Iconografía Lucide (convención tree-shakeable 16/1.5)                     | [aaa-013](../../../../openspec/changes/archive/aaa-013-components-decide-icon-library/)                                                                                       | Iconos type-safe sin mantener un set propio              |
| `DsModal` (dialog nativo: focus trap/top layer por plataforma)            | [aaa-014](../../../../openspec/changes/archive/aaa-014-components-add-modal/)                                                                                                 | Primer overlay completo con a11y de plataforma           |
| `DsSelect` + `DsOption` (combobox APG sobre Popover API, CVA)             | [aaa-016](../../../../openspec/changes/archive/aaa-016-components-add-select/)                                                                                                | Selección de opciones accesible sin dependencias nuevas  |
| `DsInput` (field completo: label/hint/error, invalid automático)          | [aaa-017](../../../../openspec/changes/archive/aaa-017-components-add-input/)                                                                                                 | Entrada de texto accesible con validación integrada      |
| `DsTabs` + `DsTab` (ARIA tabs, roving tabindex, 3 variantes)              | [aaa-018](../../../../openspec/changes/archive/aaa-018-components-add-tabs/)                                                                                                  | Navegación de contenido accesible sin construirla a mano |
| `DsTooltip` (directiva, WCAG 1.4.13, estilo inverso theme-aware)          | [aaa-019](../../../../openspec/changes/archive/aaa-019-components-add-tooltip/)                                                                                               | Ayuda contextual accesible en cualquier elemento         |
| `DsToastService` (service + provider, top layer, timers pausables)        | [aaa-021](../../../../openspec/changes/archive/aaa-021-components-add-toast/)                                                                                                 | Feedback asíncrono accesible con API programática        |
| `DsSpinner` (currentColor, label opt-out, reduced-motion por pulso)       | [aaa-023](../../../../openspec/changes/archive/aaa-023-components-add-spinner/)                                                                                               | Espera indeterminada accesible, inline o standalone      |
| `DsSkeleton` (shapes con defaults tokenizados, overrides CSS libres)      | [aaa-024](../../../../openspec/changes/archive/aaa-024-components-add-skeleton/)                                                                                              | Placeholders estables sin layout shift                   |
| Familia `DsMenu` (menu button APG, submenús anidados, danger, typeahead)  | [aaa-025](../../../../openspec/changes/archive/aaa-025-components-add-menu/)                                                                                                  | Acciones contextuales accesibles con teclado completo    |
| Familia `DsAccordion` (accordion APG, single/multi, anidados)             | [aaa-026](../../../../openspec/changes/archive/aaa-026-components-add-accordion/)                                                                                             | Contenido colapsable accesible para settings/FAQs        |
| Familia `DsBreadcrumbs` (breadcrumb APG, truncado, auto-rutas)            | [aaa-027](../../../../openspec/changes/archive/aaa-027-components-add-breadcrumbs/)                                                                                           | Ubicación jerárquica; primer secondary entry point       |
| `DsPagination` (ventana con elipsis, compacta, extremos ADR-011)          | [aaa-028](../../../../openspec/changes/archive/aaa-028-components-add-pagination/)                                                                                            | Navegación de listados largos accesible                  |
| `DsProgress` (determinada/indeterminada, tonos, reduced-motion por pulso) | [aaa-029](../../../../openspec/changes/archive/aaa-029-components-add-progress/)                                                                                              | Avance medible accesible; completa el trío de feedback   |

## Historias de usuario

| HU                                       | Título                                     | Actor          | Estado                                               |
| ---------------------------------------- | ------------------------------------------ | -------------- | ---------------------------------------------------- |
| [HU-003](HU-003-select-formularios.md)   | Select/Combobox para formularios reales    | Dev consumidor | Hecha (aaa-016 archivado 2026-07-11; generó ADR-014) |
| [HU-005](HU-005-input-textfield.md)      | Input/TextField para formularios reales    | Dev consumidor | Hecha (aaa-017 archivado 2026-07-11)                 |
| [HU-006](HU-006-tabs-navegacion.md)      | Tabs para navegación de contenido          | Dev consumidor | Hecha (aaa-018 archivado 2026-07-14)                 |
| [HU-007](HU-007-tooltip.md)              | Tooltip de ayuda contextual                | Dev consumidor | Hecha (aaa-019 archivado 2026-07-18)                 |
| [HU-008](HU-008-toast-notificaciones.md) | Toast/Notification para feedback asíncrono | Dev consumidor | Hecha (2026-07-18, aaa-021)                          |
| [HU-009](HU-009-spinner.md)              | Spinner de carga                           | Dev consumidor | Hecha (2026-07-19, aaa-023)                          |
| [HU-010](HU-010-skeleton.md)             | Skeleton de contenido en carga             | Dev consumidor | Hecha (2026-07-19, aaa-024 — cierra la tanda 1)      |
| [HU-012](HU-012-menu-dropdown.md)        | Menu/Dropdown de acciones                  | Dev consumidor | Hecha (2026-07-19, aaa-025 — genera ADR-016)         |
| [HU-013](HU-013-accordion.md)            | Accordion de contenido colapsable          | Dev consumidor | Hecha (2026-07-20, aaa-026)                          |
| [HU-014](HU-014-breadcrumbs.md)          | Breadcrumbs de ubicación                   | Dev consumidor | Hecha (2026-07-20, aaa-027 — genera ADR-017)         |
| [HU-015](HU-015-pagination.md)           | Pagination de listados                     | Dev consumidor | Hecha (2026-07-20, aaa-028)                          |
| [HU-016](HU-016-progress.md)             | Progress de avance medible                 | Dev consumidor | Hecha (2026-07-20, aaa-029 — cierra la tanda 2)      |

Las HU-005…HU-010 forman la **tanda 1 de expansión** aprobada por [D-009](../../decisiones.md): completar el criterio "una app real se construye 100% con el DS". Las HU-012…HU-016 forman la **tanda 2** aprobada por [D-011](../../decisiones.md) con criterio "navegación y estructura de apps reales". Candidatas restantes (cantera [FUTURE-WORK](../../../backlog/FUTURE-WORK.md) § componentes, requieren disparador propio según D-005): Stepper, Slider, DatePicker (wrapping).

## Decisiones aplicables

[D-001, D-002, D-005, D-007, D-009](../../decisiones.md) · Técnicas: [ADR-004](../../../architecture/adr/ADR-004-arquitectura-components.md), [ADR-007](../../../architecture/adr/ADR-007-naming-prefijos.md), [ADR-010](../../../architecture/adr/ADR-010-file-naming-sin-sufijo-component.md)–[ADR-014](../../../architecture/adr/ADR-014-overlays-anclados-popover-api.md).

## Orden sugerido

Tanda 1 (D-009, completa): **HU-003 Select → HU-005 Input** primero (formularios, el gap más grande), después **HU-006 Tabs**, **HU-007 Tooltip** (reutiliza la decisión de posicionamiento que tome el change de Select), y el trío de feedback **HU-008 Toast → HU-009 Spinner → HU-010 Skeleton**. Cada HU se refina (CAs binarios) justo antes de crear su change.

Tanda 2 (D-011): **HU-012 Menu/Dropdown** primero (el gap más grande del criterio de navegación; reutiliza Popover API de ADR-014), después **HU-013 Accordion**, y el par de navegación de listados **HU-014 Breadcrumbs → HU-015 Pagination**. **HU-016 Progress** es independiente del criterio (feedback) y puede intercalarse en cualquier punto. Misma regla: cada HU se refina justo antes de crear su change.

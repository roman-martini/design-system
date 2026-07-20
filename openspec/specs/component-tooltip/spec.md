---
name: component-tooltip
type: spec
status: active
created: 2026-07-20
---

# component-tooltip

## Purpose

Contrato de la directiva `DsTooltip`: placement, trigger (hover/focus), delay y accesibilidad.

## Requirements

### Requirement: Directiva DsTooltip

El package SHALL exponer la directiva `DsTooltip` (selector `[dsTooltip]`) — la primera directiva del kit, bajo las convenciones de ADR-007/ADR-010 — que muestra un tooltip de texto anclado a su elemento anfitrión. SHALL soportar `dsTooltip` (input string, el texto), `dsTooltipPlacement` (`'top' | 'bottom' | 'left' | 'right'`, default `'top'`) y `dsTooltipDelay` (input number ms, opcional — el default vive en el token `component.tooltip.delay`). El tooltip SHALL cumplir WCAG 1.4.13 (dismissable, hoverable, persistent), asociarse por `aria-describedby` (descripción, no label) y renderizarse en el top layer vía Popover API con posicionamiento según ADR-014 (fallback JS con flip). La superficie visual SHALL ser un componente interno **no exportado**; la API pública es solo la directiva.

#### Scenario: texto y directiva inerte con string vacío

- **GIVEN** `<button dsTooltip="Eliminar fila">`
- **WHEN** el usuario interactúa (hover o foco)
- **THEN** SHALL mostrarse el tooltip con el texto "Eliminar fila"
- **GIVEN** `dsTooltip=""`
- **THEN** SHALL NO crearse tooltip ni atributos ARIA en el anfitrión

#### Scenario: hover con delay y foco inmediato

- **GIVEN** el anfitrión con el tooltip cerrado
- **WHEN** recibe `mouseenter`
- **THEN** el tooltip SHALL abrirse recién tras el delay (default del token `component.tooltip.delay`; `dsTooltipDelay` lo sobreescribe)
- **WHEN** recibe foco por teclado (`focusin`)
- **THEN** el tooltip SHALL abrirse **inmediato** (sin delay)
- **WHEN** el mouse sale antes de cumplirse el delay
- **THEN** el timer SHALL cancelarse y el tooltip SHALL NO abrirse

#### Scenario: cierre inmediato al salir

- **GIVEN** el tooltip visible por hover
- **WHEN** el mouse sale del anfitrión (y no entra al panel)
- **THEN** el tooltip SHALL cerrarse sin delay
- **GIVEN** el tooltip visible por foco
- **WHEN** el anfitrión pierde el foco (`focusout`)
- **THEN** el tooltip SHALL cerrarse

#### Scenario: WCAG 1.4.13 — dismissable con ESC sin mover el foco

- **GIVEN** el tooltip visible (por hover o por foco)
- **WHEN** el usuario presiona `Escape`
- **THEN** el tooltip SHALL cerrarse
- **AND** el foco del documento SHALL permanecer donde estaba

#### Scenario: WCAG 1.4.13 — hoverable y persistent

- **GIVEN** el tooltip visible por hover
- **WHEN** el mouse se mueve del anfitrión al propio panel del tooltip
- **THEN** el tooltip SHALL permanecer visible
- **AND** el tooltip SHALL NO cerrarse por transcurso de tiempo (sin auto-cierre)

#### Scenario: ARIA — role tooltip y describedby dinámico

- **GIVEN** el tooltip visible
- **THEN** el panel SHALL tener `role="tooltip"` e id único
- **AND** el anfitrión SHALL incluir ese id en su `aria-describedby` **sin pisar** valores preexistentes del consumidor
- **WHEN** el tooltip se cierra
- **THEN** la referencia SHALL removerse (dejando intactos los valores preexistentes)

#### Scenario: placement con flip en top layer

- **WHEN** se renderiza con `dsTooltipPlacement` en cada uno de `top`/`bottom`/`left`/`right`
- **THEN** el panel SHALL posicionarse del lado indicado, centrado respecto del anfitrión, con el offset del token
- **AND** SHALL renderizarse en el top layer (popover), sin quedar recortado por contenedores con overflow
- **AND** sin espacio suficiente del lado pedido, SHALL flipear al opuesto (fallback ADR-014)

#### Scenario: estilo inverso por tokens con contraste verificado

- **WHEN** se inspecciona el CSS del panel
- **THEN** todo valor SHALL salir de tokens `component.tooltip.*` — con `bg` → `{semantic.color.text.primary}` y `text` → `{semantic.color.bg.surface}` (inverso theme-aware)
- **AND** el par `text`/`bg` SHALL cumplir AA calculado por script en los 4 themes

#### Scenario: transición con reduced motion

- **WHEN** se inspecciona el CSS del panel
- **THEN** la transición de aparición SHALL usar los tokens de motion de overlay con su bloque `@media (prefers-reduced-motion: reduce)`
- **AND** el delay de apertura SHALL mantenerse (no es motion)

#### Scenario: convenciones de la primera directiva y export

- **WHEN** se inspecciona `packages/components/src/lib/tooltip/`
- **THEN** existen `tooltip.ts` (directiva `DsTooltip`, selector `[dsTooltip]`), el panel interno, `tooltip.spec.ts`, `tooltip.stories.ts`, `index.ts`
- **AND** `public-api.ts` SHALL contener `export * from './lib/tooltip';`
- **AND** un consumidor SHALL poder hacer `import { DsTooltip, type DsTooltipPlacement } from '@romanmartinidev/components'`
- **AND** el componente panel SHALL NO ser parte de la API pública

#### Scenario: limpieza de recursos

- **GIVEN** un anfitrión con tooltip visible (timers y listeners activos)
- **WHEN** la directiva se destruye (el anfitrión sale del DOM)
- **THEN** el panel SHALL removerse, los timers cancelarse y los listeners de `document`/`window` desregistrarse

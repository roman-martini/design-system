---
name: component-modal
type: spec
status: active
created: 2026-07-20
---

# component-modal

## Purpose

Contrato de `DsModal`: overlay modal sobre `<dialog>` nativo, gestión de foco, y cierre por ESC/backdrop/API.

## Requirements

### Requirement: Componente DsModal

El package SHALL exponer `DsModal` (selector `ds-modal`), el primer componente overlay del kit, implementado sobre el elemento `<dialog>` nativo con `showModal()` (top layer, focus trap, fondo inerte y restauración de foco provistos por la plataforma — [ADR-013](../../../docs/architecture/adr/ADR-013-overlays-dialog-nativo.md)). Sigue ADR-004/ADR-007/ADR-010 (arquitectura y naming), ADR-012 (iconografía del botón de cierre) y el patrón de overlay de tokens de aaa-009. SHALL soportar `open` (model two-way boolean), `size` (`'sm' | 'md' | 'lg' | 'xl'`, default `'md'`), `heading` (input string para el título accesible), `closeLabel` (input string, default "Cerrar"), `closeOnEscape` (input boolean, default `true`), `closeOnOverlay` (input boolean, default `true`), slot default para el cuerpo y slot `[ds-modal-footer]` para acciones. SHALL aceptar además los alias `aria-label` y `aria-labelledby` para nombrar el diálogo cuando no hay `heading` visible, siguiendo el mismo patrón que `DsSelect` y `DsFieldBase`.

#### Scenario: estructura de archivos

- **WHEN** se inspecciona `packages/components/src/lib/modal/`
- **THEN** existen `modal.ts`, `modal.html`, `modal.css`, `modal.spec.ts`, `modal.stories.ts`, `index.ts`
- **AND** la class se llama `DsModal` y el selector es `ds-modal`

#### Scenario: apertura y cierre controlados con [(open)]

- **GIVEN** un consumidor con `<ds-modal [(open)]="opened">` y `opened = signal(false)`
- **WHEN** el consumidor setea `opened` en `true`
- **THEN** el modal SHALL mostrarse como diálogo modal (top layer, `showModal()`)
- **WHEN** el consumidor setea `opened` en `false`
- **THEN** el modal SHALL cerrarse

#### Scenario: cierre por tecla ESC sincroniza el model

- **GIVEN** un modal abierto con `closeOnEscape` default (`true`)
- **WHEN** el usuario presiona `Escape`
- **THEN** el modal SHALL cerrarse
- **AND** el model `open` del consumidor SHALL pasar a `false` (sin divergencia de estado)

#### Scenario: closeOnEscape=false mantiene el modal abierto

- **GIVEN** un modal abierto con `[closeOnEscape]="false"`
- **WHEN** el usuario presiona `Escape`
- **THEN** el modal SHALL permanecer abierto
- **AND** el model `open` SHALL seguir en `true`

#### Scenario: cierre por click en el overlay

- **GIVEN** un modal abierto con `closeOnOverlay` default (`true`)
- **WHEN** el usuario hace click sobre el backdrop (fuera del contenido)
- **THEN** el modal SHALL cerrarse y el model SHALL pasar a `false`
- **WHEN** `[closeOnOverlay]="false"`
- **THEN** el click en el backdrop NO SHALL cerrar el modal

#### Scenario: botón X de cierre según ADR-012

- **WHEN** se inspecciona el header del modal renderizado
- **THEN** SHALL existir un botón cuyo único contenido es el icono `LucideX` (16 / 1.5)
- **AND** el botón SHALL tener `aria-label` igual a `closeLabel` (default "Cerrar")
- **AND** el `<svg>` SHALL tener `aria-hidden="true"`
- **AND** el click en ese botón SHALL cerrar el modal y actualizar el model

#### Scenario: sizes consumen los tokens component.modal.size

- **WHEN** se renderiza `<ds-modal size="sm|md|lg|xl">`
- **THEN** el ancho del contenido SHALL derivar de `var(--ds-component-modal-size-<size>)` (sm=448px, md=640px, lg=896px, xl=1152px)
- **AND** NO SHALL haber anchos hardcodeados en el CSS del componente

#### Scenario: a11y de diálogo modal provista por la plataforma

- **GIVEN** un modal abierto vía `showModal()`
- **THEN** el foco SHALL quedar atrapado dentro del modal mientras esté abierto
- **AND** el contenido de fondo SHALL quedar inerte (interacción y árbol de accesibilidad)
- **AND** al cerrar, el foco SHALL restaurarse al elemento que tenía el foco antes de abrir

#### Scenario: el diálogo siempre tiene nombre accesible

- **GIVEN** `<ds-modal heading="Confirmar acción">`
- **WHEN** se inspecciona el DOM abierto
- **THEN** SHALL renderizarse un heading con ese texto e `id` único, y el `<dialog>` SHALL referenciarlo vía `aria-labelledby`
- **GIVEN** un modal sin `heading` y con `aria-label` provisto por el consumidor
- **THEN** el `<dialog>` SHALL exponer ese `aria-label`
- **GIVEN** un modal sin `heading` y con `aria-labelledby` provisto por el consumidor
- **THEN** el `<dialog>` SHALL referenciar ese id, que SHALL tener precedencia sobre el `heading` cuando ambos están presentes
- **AND** el nombre accesible SHALL aplicarse al `<dialog>` —el elemento con rol— y NO SHALL quedar declarado sobre el host `<ds-modal>`, donde sería inerte y además una violación por atributo ARIA no permitido

#### Scenario: estilos exclusivamente por tokens

- **WHEN** se inspecciona `modal.css`
- **THEN** todo valor visual SHALL referenciarse vía `var(--ds-*)`, incluido el ancho de borde
- **AND** SHALL NO existir hex codes ni px hardcodeados (excepto `0`)

#### Scenario: animación con tokens de overlay y reduced motion

- **WHEN** se inspecciona `modal.css`
- **THEN** las transiciones de entrada SHALL usar `var(--ds-semantic-motion-transition-overlay-enter)` y las de salida `var(--ds-semantic-motion-transition-overlay-exit)` (fade + scale)
- **AND** SHALL existir un bloque `@media (prefers-reduced-motion: reduce)` que desactiva las transiciones

#### Scenario: backdrop con tokens de overlay

- **WHEN** se inspecciona el estilo del `::backdrop`
- **THEN** el fondo SHALL ser `var(--ds-component-modal-overlay-bg)`, que resuelve a `{semantic.color.bg.overlay}`
- **AND** SHALL aplicar `backdrop-filter: blur(var(--ds-semantic-effect-blur-overlay))`

#### Scenario: body scroll lock mientras está abierto

- **GIVEN** un documento con scroll
- **WHEN** el modal se abre
- **THEN** el `<body>` SHALL quedar con el scroll bloqueado
- **WHEN** el modal se cierra (o el componente se destruye abierto)
- **THEN** el scroll del `<body>` SHALL restaurarse
- **AND** con múltiples modales abiertos, el scroll SHALL restaurarse recién cuando cierra el último

#### Scenario: peerDependency de Lucide declarada (ejecuta ADR-012 §2)

- **WHEN** se inspecciona `packages/components/package.json`
- **THEN** `peerDependencies` SHALL incluir `@lucide/angular`
- **AND** el README del package SHALL documentar la peer dependency y su motivo

#### Scenario: exportado desde public-api.ts

- **WHEN** se inspecciona `packages/components/src/public-api.ts`
- **THEN** SHALL contener `export * from './lib/modal';`
- **AND** un consumidor SHALL poder hacer `import { DsModal, type DsModalSize } from '@romanmartinidev/components'`

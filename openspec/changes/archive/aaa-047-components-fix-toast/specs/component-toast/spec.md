## MODIFIED Requirements

### Requirement: Sistema de toasts (DsToastService)

El package SHALL exponer `DsToastService` (primera service del kit, naming por ADR-007) junto con `provideDsToasts` y los types `DsToastPosition`, `DsToastVariant`, `DsToastOptions`, `DsToastRef`. La service SHALL ofrecer `show({ message, variant, duration?, action? })` y los atajos `success/info/warning/danger(message, options?)`, devolviendo una referencia con `dismiss()`. Los toasts SHALL renderizarse en un stack único de la app, en el **top layer** vía popover manual (ADR-014, regla de capa), en la posición global configurada por `provideDsToasts({ position })` (default `bottom-right`) — NO SHALL existir posición por toast. El contenedor y el item del toast SHALL ser internos no exportados: la API pública es la service. Los estilos SHALL salir exclusivamente de tokens (`component.toast.*` + semantic de status).

#### Scenario: show y atajos devuelven una referencia con dismiss (CA-008.1)

- **GIVEN** un consumidor que inyecta `DsToastService`
- **WHEN** llama `show({ message: 'Guardado', variant: 'success' })` o el atajo `success('Guardado')`
- **THEN** el toast SHALL aparecer en el stack con ese mensaje
- **AND** la llamada SHALL devolver una referencia cuyo `dismiss()` cierra ese toast

#### Scenario: posición global por provider, nunca por toast (CA-008.2)

- **GIVEN** una app con `provideDsToasts({ position: 'top-right' })`
- **WHEN** cualquier parte de la app dispara toasts
- **THEN** todos SHALL aparecer en `top-right`
- **AND** sin provider la posición SHALL ser `bottom-right`
- **AND** `DsToastOptions` NO SHALL aceptar posición por toast

#### Scenario: auto-dismiss pausable por hover y foco (CA-008.3)

- **GIVEN** un toast success/info/warning con `duration` default (token `component.toast.duration`, ~5s)
- **WHEN** transcurre la duración sin interacción
- **THEN** el toast SHALL cerrarse solo
- **WHEN** el puntero entra al toast o un elemento interno recibe foco
- **THEN** el timer SHALL pausarse, y al salir/perder foco SHALL reanudarse con el tiempo restante
- **AND** `duration: 0` SHALL hacerlo persistente

#### Scenario: danger persiste hasta cierre manual (CA-008.3)

- **GIVEN** un toast con `variant: 'danger'`
- **WHEN** transcurre cualquier cantidad de tiempo
- **THEN** el toast NO SHALL cerrarse solo
- **AND** SHALL mostrar siempre el botón de cierre

#### Scenario: acción única alcanzable por teclado (CA-008.4)

- **GIVEN** un toast con `action: { label: 'Deshacer', callback }`
- **WHEN** se renderiza
- **THEN** SHALL existir un único botón con ese label, alcanzable por Tab, sin que el foco se haya movido al aparecer el toast
- **WHEN** el usuario lo activa
- **THEN** el callback SHALL ejecutarse y el toast SHALL cerrarse

#### Scenario: la región de anuncios preexiste al primer toast (CA-008.5)

- **GIVEN** una app que inyectó `DsToastService` y todavía no mostró ningún toast
- **WHEN** se inspecciona el documento
- **THEN** SHALL existir una región de anuncios persistente, presente en el árbol de accesibilidad y sin presencia visual
- **AND** SHALL ofrecer una región `polite` y una `assertive` independientes, de modo que la urgencia del anuncio no dependa de mutar la de una región existente

#### Scenario: el mensaje se anuncia con la urgencia de su variante (CA-008.5)

- **WHEN** aparece un toast success/info/warning
- **THEN** su mensaje SHALL escribirse en la región `polite`
- **WHEN** aparece un toast danger
- **THEN** su mensaje SHALL escribirse en la región `assertive`
- **AND** el mensaje SHALL anunciarse aunque sea el primer toast de la sesión
- **AND** cada mensaje SHALL anunciarse una sola vez: el elemento visual del toast NO SHALL declarar por su cuenta un rol de live region
- **AND** en ningún caso el foco del documento SHALL moverse al aparecer
- **AND** el botón de cierre SHALL tener `aria-label` (default "Cerrar", configurable por provider)

#### Scenario: la región de anuncios no se crea fuera del navegador (CA-008.5)

- **GIVEN** un entorno sin DOM (renderizado del lado del servidor)
- **WHEN** se inyecta `DsToastService`
- **THEN** la inicialización SHALL completarse sin acceder al documento

#### Scenario: stack en top layer con reacomodo (CA-008.6)

- **GIVEN** tres toasts disparados en secuencia
- **THEN** SHALL apilarse en orden en la posición global, con el contenedor como popover manual (`showPopover()` con ≥1 toast, `hidePopover()` al vaciarse)
- **WHEN** se cierra el segundo
- **THEN** el stack SHALL reacomodarse sin huecos
- **AND** en playground SHALL verificarse manualmente que el stack queda visible sobre un `DsModal` abierto (límite jsdom)

#### Scenario: estilos exclusivamente por tokens (CA-008.7)

- **WHEN** se inspecciona el CSS del contenedor y del item
- **THEN** todo valor visual SHALL referenciarse vía `var(--ds-*)` (`component.toast.*`, `semantic.color.border/icon.<variant>`, motion)
- **AND** SHALL NO existir hex codes, px hardcodeados (excepto `0`) ni colores literales

#### Scenario: iconos por variante según ADR-012 (CA-008.5, WCAG 1.4.1)

- **WHEN** se renderiza un toast de cada variante
- **THEN** SHALL mostrar su icono Lucide (16 / 1.5 / `currentColor`) con `aria-hidden="true"`
- **AND** la variante SHALL distinguirse por icono + borde, no solo por color

#### Scenario: animación con tokens de motion y reduced motion (CA-008.8)

- **WHEN** se inspecciona el CSS de entrada/salida del toast
- **THEN** SHALL usar los tokens de motion de overlay (`--ds-semantic-motion-transition-overlay-*`)
- **AND** SHALL existir un bloque `@media (prefers-reduced-motion: reduce)` que desactiva las transiciones

#### Scenario: exportado desde public-api.ts solo el contrato de service

- **WHEN** se inspecciona `packages/components/src/public-api.ts`
- **THEN** SHALL contener `export * from './lib/toast';`
- **AND** un consumidor SHALL poder importar `DsToastService`, `provideDsToasts` y los types
- **AND** el contenedor y el item internos NO SHALL ser parte de la API pública

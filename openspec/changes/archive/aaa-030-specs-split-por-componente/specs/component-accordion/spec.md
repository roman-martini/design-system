## ADDED Requirements

### Requirement: Accordion de contenido colapsable (DsAccordion)

El package SHALL exponer la familia `DsAccordion` (`ds-accordion`, contenedor con `multiple` y `headingLevel`) y `DsAccordionItem` (`ds-accordion-item`, sección con `expanded` two-way y `disabled`), naming por ADR-007. Cada sección SHALL implementar el patrón APG _accordion_: header como heading (nivel configurable) que contiene un `<button>` con `aria-expanded`/`aria-controls`, y panel `role="region"` con `aria-labelledby`. La exclusividad single, la navegación por teclado y la jerarquía de headings SHALL operar scoped a cada instancia (los accordions anidados son independientes). Los estilos SHALL salir exclusivamente de tokens (`component.accordion.*` + primitives/semantic).

#### Scenario: estructura accesible (CA-013.1)

- **GIVEN** un `ds-accordion` con secciones proyectadas
- **THEN** cada header SHALL exponerse como heading de nivel configurable (`headingLevel`, default 3)
- **AND** el heading SHALL contener un `<button>` con `aria-expanded` y `aria-controls` apuntando al id del panel
- **AND** cada panel SHALL exponer `role="region"` y `aria-labelledby` referenciando su header

#### Scenario: toggle de una sección (CA-013.2)

- **GIVEN** un header habilitado
- **WHEN** se activa por click, Enter o Space
- **THEN** su panel SHALL alternar entre expandido y colapsado
- **AND** `aria-expanded` SHALL reflejar el estado actual
- **AND** el contenido de un panel colapsado SHALL quedar fuera del árbol de accesibilidad y del tab order

#### Scenario: exclusividad single y modo multi (CA-013.3)

- **GIVEN** un accordion sin `multiple` (default) con una sección expandida
- **WHEN** se expande otra sección
- **THEN** la que estaba expandida SHALL colapsarse (exclusividad scoped a la instancia)
- **GIVEN** un accordion con `multiple`
- **WHEN** se expanden varias secciones
- **THEN** cada una SHALL alternar de forma independiente sin colapsar a las demás

#### Scenario: teclado entre headers (CA-013.4)

- **GIVEN** el foco en un header
- **WHEN** se presiona ↑/↓
- **THEN** el foco SHALL moverse al header anterior/siguiente de la misma instancia, con wrap
- **WHEN** se presiona Home/End
- **THEN** el foco SHALL saltar al primer/último header de la instancia
- **AND** los headers de un accordion anidado SHALL quedar fuera de la navegación del padre

#### Scenario: sección disabled accesible (CA-013.5)

- **GIVEN** una sección con `disabled`
- **WHEN** su header recibe foco por teclado
- **THEN** SHALL ser focusable y exponer `aria-disabled="true"`
- **WHEN** se intenta activar
- **THEN** el panel SHALL mantener su estado (sin expandir ni colapsar), según ADR-011

#### Scenario: accordion anidado (CA-013.6)

- **GIVEN** un accordion dentro del panel de otro
- **WHEN** se opera el anidado (expansión, exclusividad, teclado)
- **THEN** su exclusividad single/multi SHALL resolverse solo entre sus propias secciones
- **AND** su `headingLevel` SHALL ser independiente del padre
- **AND** expandir una sección del anidado NO SHALL colapsar secciones del padre

#### Scenario: animación con reduced-motion (CA-013.7)

- **WHEN** un panel se expande o colapsa
- **THEN** la transición de altura SHALL usar los tokens de motion de `component.accordion.*`
- **AND** bajo `@media (prefers-reduced-motion: reduce)` el cambio SHALL ser instantáneo
- **AND** la animación SHALL tolerar que un panel anidado cambie de tamaño dentro de un panel del padre

#### Scenario: estilos exclusivamente por tokens (CA-013.8)

- **WHEN** se inspecciona el CSS de la familia
- **THEN** todo valor visual SHALL referenciarse vía `var(--ds-*)`
- **AND** SHALL NO existir hex codes, px hardcodeados (excepto `0`) ni colores literales
- **AND** los pares de contraste que consuma el componente SHALL pasar el gate AA por script

#### Scenario: exportado desde public-api.ts

- **WHEN** se inspecciona `packages/components/src/public-api.ts`
- **THEN** SHALL contener `export * from './lib/accordion';`
- **AND** un consumidor SHALL poder importar `DsAccordion` y `DsAccordionItem`

## ADDED Requirements

### Requirement: Spinner de carga (DsSpinner)

El package SHALL exponer `DsSpinner` (`ds-spinner`, naming por ADR-007) junto con el type `DsSpinnerSize`. El componente SHALL comunicar espera indeterminada con inputs `size` (`xs | sm | md | lg`, default `md`) y `label` (default "Cargando"), sin API de color: el indicador SHALL heredar `currentColor` del contexto y el track SHALL usar el mismo color con opacidad tokenizada. Los estilos SHALL salir exclusivamente de tokens (`component.spinner.*` + primitives/semantic), y bajo `prefers-reduced-motion` la rotación SHALL reemplazarse por un pulso de opacidad sin movimiento espacial.

#### Scenario: sizes por tokens (CA-009.1)

- **GIVEN** un `<ds-spinner />` con `size` en cada uno de `xs | sm | md | lg` (default `md`)
- **WHEN** se renderiza
- **THEN** el diámetro y el grosor de trazo SHALL salir de los tokens `component.spinner.size-<size>` y `component.spinner.stroke-<size>` vía `var(--ds-*)`

#### Scenario: color heredado por currentColor (CA-009.2)

- **GIVEN** un spinner dentro de un contexto con `color` definido (ej. un botón primary)
- **WHEN** se renderiza
- **THEN** el indicador SHALL dibujarse con `currentColor` y el track con el mismo color a la opacidad `component.spinner.track-opacity`
- **AND** el componente NO SHALL exponer inputs de color

#### Scenario: anuncio como región de estado (CA-009.3)

- **GIVEN** un spinner con `label` default
- **WHEN** se renderiza
- **THEN** SHALL exponerse como `role="status"` con el texto "Cargando" visually-hidden, sin mover el foco
- **GIVEN** un spinner con `label` custom (ej. "Guardando borrador")
- **THEN** SHALL anunciarse ese texto

#### Scenario: modo decorativo con label vacío (CA-009.3)

- **GIVEN** un spinner con `label=""` dentro de un contexto que ya comunica la carga
- **WHEN** se renderiza
- **THEN** el host SHALL llevar `aria-hidden="true"` sin `role`
- **AND** el árbol de accesibilidad NO SHALL contener texto del spinner

#### Scenario: animación tokenizada con reduced motion por reemplazo (CA-009.4)

- **WHEN** se inspecciona el CSS del componente
- **THEN** la rotación SHALL usar `component.spinner.duration-spin` con easing linear de tokens
- **AND** SHALL existir un bloque `@media (prefers-reduced-motion: reduce)` que reemplaza la rotación por un pulso de opacidad con `component.spinner.duration-pulse`

#### Scenario: estilos exclusivamente por tokens sin pares de contraste propios (CA-009.5)

- **WHEN** se inspecciona el CSS del componente
- **THEN** todo valor visual SHALL referenciarse vía `var(--ds-*)`
- **AND** SHALL NO existir hex codes, px hardcodeados (excepto `0`) ni colores literales
- **AND** el gate de contraste por script NO SHALL requerir pares nuevos (el contraste lo gobierna el contexto contenedor)

#### Scenario: gráfico decorativo para tecnología asistiva (CA-009.3)

- **WHEN** se renderiza cualquier spinner
- **THEN** el SVG interno SHALL llevar `aria-hidden="true"` (el canal accesible es el texto del label, no el dibujo)

#### Scenario: exportado desde public-api.ts

- **WHEN** se inspecciona `packages/components/src/public-api.ts`
- **THEN** SHALL contener `export * from './lib/spinner';`
- **AND** un consumidor SHALL poder importar `DsSpinner` y `DsSpinnerSize`

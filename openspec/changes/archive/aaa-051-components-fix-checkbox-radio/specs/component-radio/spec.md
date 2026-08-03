## ADDED Requirements

### Requirement: Estilos del radio por tokens de componente

`DsRadio` SHALL estilizarse con los tokens `component.radio.*` —fondos marcado y sin marcar, borde, color y tamaño del punto, color del label— y NO SHALL consumir `semantic.*` ni primitives directamente para esos valores, según la jerarquía de ADR-003 que exige `design-tokens-package`. El color del punto SHALL salir de `component.radio.dot-color` y SHALL adaptarse al theme, de modo que conserve contraste sobre el fondo del control marcado en todos los themes publicados. Los tokens SHALL describir el diseño que el componente renderiza: un token cuyo valor contradiga lo que se ve NO satisface este requirement.

#### Scenario: el punto del control marcado sale de un token theme-aware

- **WHEN** se inspecciona el CSS del radio
- **THEN** el color del punto SHALL referenciarse vía `var(--ds-component-radio-dot-color)`
- **AND** SHALL NO existir literales de color ni referencias a primitives de color en el archivo
- **GIVEN** el theme oscuro, donde el fondo del control marcado aclara
- **THEN** el punto SHALL cambiar de color con el theme, conservando contraste contra ese fondo

#### Scenario: los tokens del componente se consumen y describen el render

- **WHEN** se inspecciona el CSS del radio
- **THEN** fondo, borde, tamaños y color de label SHALL referenciarse vía `var(--ds-component-radio-*)`
- **AND** SHALL NO consumirse `semantic.*` ni primitives directamente para esos valores
- **AND** `component.radio.bg-on` SHALL describir el fondo que el control marcado realmente pinta
- **AND** todo token de `component.radio.*` que describa un estado que el componente renderiza SHALL tener consumidor en el CSS

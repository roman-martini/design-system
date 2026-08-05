## MODIFIED Requirements

### Requirement: Estilos del checkbox por tokens de componente

`DsCheckbox` SHALL estilizarse con los tokens `component.checkbox.*` —fondos marcado y sin marcar, sus estados hover, borde, radius, color de la marca y del label— y NO SHALL consumir `semantic.*` ni primitives directamente para esos valores, según la jerarquía de ADR-003 que exige `design-tokens-package`. El color de la marca (checkmark e indeterminate) SHALL salir de `component.checkbox.check-color` y SHALL adaptarse al theme, de modo que conserve contraste sobre el fondo del control marcado en todos los themes publicados. El control habilitado SHALL comunicar el hover del puntero cambiando su fondo según `component.checkbox.bg-off-hover` (sin marcar) y `component.checkbox.bg-on-hover` (marcado), como ya lo hace el track de `DsSwitch`.

#### Scenario: la marca del control sale de un token theme-aware

- **WHEN** se inspecciona el CSS del checkbox
- **THEN** el color del checkmark y del estado indeterminate SHALL referenciarse vía `var(--ds-component-checkbox-check-color)`
- **AND** SHALL NO existir literales de color (`white`, hex, `rgb(...)`) en ninguna parte del archivo, incluido el interior de un SVG embebido
- **GIVEN** el theme oscuro, donde el fondo del control marcado aclara
- **THEN** la marca SHALL cambiar de color con el theme, conservando contraste contra ese fondo

#### Scenario: el control comunica hover en ambos estados

- **GIVEN** un checkbox habilitado bajo el puntero
- **WHEN** está sin marcar
- **THEN** el fondo del control SHALL ser el que resuelve `component.checkbox.bg-off-hover`
- **WHEN** está marcado (o indeterminate)
- **THEN** el fondo SHALL ser el que resuelve `component.checkbox.bg-on-hover`
- **AND** un checkbox `disabled` SHALL NO reaccionar al hover

#### Scenario: los tokens del componente se consumen

- **WHEN** se inspecciona el CSS del checkbox
- **THEN** fondo, estados hover, borde, radius, tamaños y color de label SHALL referenciarse vía `var(--ds-component-checkbox-*)`
- **AND** SHALL NO consumirse `semantic.*` ni primitives directamente para esos valores
- **AND** todo token de `component.checkbox.*` que describa un estado que el componente renderiza SHALL tener consumidor en el CSS

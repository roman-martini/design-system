## ADDED Requirements

### Requirement: Los overlays sobre Popover API no generan caja cerrados

Todo CSS del kit que estilice un elemento con atributo `popover` SHALL declarar el `display` de autor únicamente para el estado abierto (selector `:popover-open`); el estado cerrado SHALL conservar la ocultación que aplica el UA (`display: none`). Un popover cerrado SHALL NO participar del layout: declarar `display` a secas en el bloque base pisa la regla del UA (el origen de autor gana) y deja el elemento generando caja invisible, con los efectos en cascada que `aaa-045` diagnosticó en el menú (desborde del containing block durante animaciones de transform). La convención SHALL verificarse con un test que barra los CSS del package que usan `:popover-open`.

#### Scenario: el display de autor vive solo en el estado abierto

- **WHEN** se inspecciona cualquier CSS de `packages/components/src/lib/` que contenga el selector `:popover-open`
- **THEN** toda declaración de `display` fuera de un bloque `:popover-open` SHALL ser `display: none` (o no existir, conservando la del UA)
- **AND** un overlay nuevo que declare otro `display` en su estado base SHALL hacer fallar la suite de tests del package

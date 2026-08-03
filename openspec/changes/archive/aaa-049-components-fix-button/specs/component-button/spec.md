## ADDED Requirements

### Requirement: Dimensionamiento tokenizado de DsButton

`DsButton` SHALL dimensionarse con los tokens `component.button.*` que le corresponden —altura por size, padding horizontal, tamaño de fuente, gap y radius— y NO SHALL derivar su tamaño de tokens `semantic.*` genéricos ni de primitives sueltos, según la jerarquía de ADR-003 que exige `design-tokens-package`. La altura SHALL declararse explícitamente, de modo que el alto del control no dependa del padding vertical ni de la métrica de la fuente. El texto SHALL quedar centrado verticalmente dentro del control, con el mismo espacio libre arriba y abajo.

#### Scenario: la altura del botón es la que declara su token

- **WHEN** se renderiza `<ds-button size="sm|md|lg">`
- **THEN** el alto del control SHALL corresponder a `component.button.height.<size>`
- **AND** un botón `md` SHALL tener el mismo alto que un `ds-select` y un campo de texto `md`, de modo que alineen al ponerse en una misma fila

#### Scenario: el texto queda centrado verticalmente

- **GIVEN** un botón renderizado con su texto
- **WHEN** se mide la caja del texto contra la caja del control
- **THEN** el espacio libre por encima y por debajo del texto SHALL ser el mismo
- **AND** la caja de línea del texto SHALL contenerlo por completo, sin recortarlo por debajo de su alto natural

#### Scenario: estilos exclusivamente por tokens de componente

- **WHEN** se inspecciona `button.css`
- **THEN** alto, padding, tamaño de fuente, gap, radius y ancho de borde SHALL referenciarse vía `var(--ds-component-button-*)` o primitives dimensionales explícitos
- **AND** SHALL NO existir px hardcodeados (excepto `0`) ni hex codes

### Requirement: Tipo de botón y nombre accesible de DsButton

`DsButton` SHALL exponer un input `type` (`'button' | 'submit' | 'reset'`, default `'button'`) que se refleja en el `<button>` interno, de modo que el kit cubra el botón de envío de un formulario. Cuando el botón esté bloqueado por `disabled` o por `loading`, la guarda SHALL impedir además el envío nativo del formulario, no solo la emisión de `clicked`. SHALL aceptar los alias `aria-label` y `aria-labelledby`, reenviados al `<button>` interno —el elemento con rol— y no declarados sobre el host, de modo que un botón cuyo único contenido es un icono pueda tener nombre accesible.

#### Scenario: type submit envía el formulario

- **GIVEN** un `<ds-button type="submit">` dentro de un `<form>`
- **WHEN** el usuario lo activa
- **THEN** el formulario SHALL enviarse
- **GIVEN** el mismo botón con `disabled` o `loading` activos
- **WHEN** el usuario lo activa
- **THEN** el formulario NO SHALL enviarse y `clicked` NO SHALL emitir

#### Scenario: el botón ícono-only tiene nombre accesible

- **GIVEN** un `<ds-button aria-label="Cerrar">` cuyo único contenido proyectado es un icono decorativo
- **WHEN** se inspecciona el DOM
- **THEN** el `<button>` interno SHALL exponer ese `aria-label`
- **AND** el host `<ds-button>` NO SHALL conservar el atributo, donde sería inerte y además una violación por atributo ARIA no permitido
- **AND** el motor de accesibilidad SHALL reportar el botón con nombre, sin violaciones de `button-name`

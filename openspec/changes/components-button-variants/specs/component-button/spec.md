# Delta — component-button (components-button-variants)

## ADDED Requirements

### Requirement: Variantes outline y danger de DsButton

`DsButton` SHALL ampliar `DsButtonVariant` con `outline`, `danger`, `danger-outline` y `danger-ghost`, manteniendo intactas las variantes y la API previas. `outline` SHALL renderizar fondo transparente, borde `border.default` y texto primario con interacción tokenizada. Las variantes danger SHALL usar los tokens `component.button.danger*` (sólida con texto inverso; outline/ghost con texto danger y hover `danger-subtle`), y sus pares de contraste SHALL cumplir WCAG AA verificados por el gate por script. El disabled accesible (ADR-011) y el estado `loading` SHALL funcionar idénticos en todas las variantes.

#### Scenario: variante outline (CA-020.1)

- **GIVEN** un `<ds-button variant="outline">`
- **WHEN** se renderiza
- **THEN** el fondo SHALL ser transparente, el borde `component.button.outline.border` (→ `border.default`) y el texto `text.primary`
- **AND** hover/active SHALL usar los fondos tokenizados de interacción (mismos que ghost)

#### Scenario: variante danger sólida con AA (CA-020.2)

- **GIVEN** un `<ds-button variant="danger">`
- **WHEN** se renderiza
- **THEN** SHALL usar `component.button.danger.*` (bg/hover/active + texto inverso)
- **AND** el par texto/fondo SHALL cumplir ≥4.5:1 en los 4 themes (gate por script)

#### Scenario: variantes danger-outline y danger-ghost (CA-020.3)

- **GIVEN** un `<ds-button variant="danger-outline">` o `variant="danger-ghost"`
- **WHEN** se renderiza
- **THEN** el texto SHALL usar `text.danger` (y el borde en outline), con fondo transparente
- **AND** hover/active SHALL usar `bg.danger-subtle`
- **AND** los pares de texto SHALL cumplir AA (pares verificados de D-012)

#### Scenario: cadena semantic danger del default (D-016, CA-020.4)

- **WHEN** se inspecciona `semantic/color.json` post-build
- **THEN** `bg.danger`/`danger-hover`/`danger-active` SHALL referenciar `red.600/700/800`
- **AND** la cadena dark SHALL referenciar `red.500/400/300` (aclara un paso, manteniendo AA con su `text.inverse`)
- **AND** el gate de contraste SHALL pasar sin regresión en pares existentes

#### Scenario: compatibilidad con disabled y loading (CA-020.5)

- **GIVEN** cualquier variante nueva con `disabled=true` + `disabledReason` o con `loading=true`
- **WHEN** se interactúa
- **THEN** el comportamiento SHALL ser idéntico al de las variantes previas (guarda, `aria-disabled`/`aria-busy`, sin hover)

#### Scenario: tests de variantes con Vitest (CA-020.1–020.5)

- **WHEN** se ejecuta `pnpm -F @romanmartinidev/components test`
- **THEN** Vitest SHALL cubrir: reflejo de cada variante nueva en `data-variant`, tokens por variante en el CSS fuente, y disabled/loading operativos en una variante danger

## ADDED Requirements

### Requirement: Colores de variante y peso tipográfico por la capa component

Los colores de cada variante de `DsButton` SHALL salir de sus tokens `component.button.<variant>.*` (que referencian la capa semantic), y el peso tipográfico del texto SHALL salir de `component.button.font-weight`, cuya cadena (`{semantic.font.weight.button}` → `{font.weight.semibold}`) declara **semibold (600)**. El CSS NO SHALL consumir `semantic.*` directamente para valores que la capa component ya declara, según la jerarquía de ADR-003 — el mismo contrato que checkbox, radio y switch ya cumplen. Los tokens SHALL describir el diseño que el botón renderiza: un token cuyo valor contradiga lo que se ve NO satisface este requirement.

#### Scenario: cada variante consume su capa component

- **WHEN** se inspecciona `button.css`
- **THEN** los colores de `primary`, `secondary`, `ghost`, `link`, `danger` y `danger-ghost` SHALL referenciarse vía `var(--ds-component-button-<variant>-*)`
- **AND** SHALL NO consumirse `--ds-semantic-color-*` directamente para colores que `component/button.json` declara
- **AND** el theming por atributo (`data-theme`, `data-brand`) SHALL seguir cascadeando a través de la capa component (referencias emitidas con `outputReferences`)

#### Scenario: el peso del texto es el que declara el token

- **WHEN** se renderiza un `ds-button` de cualquier variante y size
- **THEN** el peso computado del texto SHALL ser el que resuelve `component.button.font-weight` (semibold, 600)
- **AND** `button.css` SHALL referenciarlo vía `var(--ds-component-button-font-weight)`

#### Scenario: la capa component del botón no tiene tokens muertos

- **WHEN** se comparan los tokens de `component/button.json` contra los consumos de `button.css`
- **THEN** todo token que describa un estado que el botón renderiza SHALL tener consumidor en el CSS

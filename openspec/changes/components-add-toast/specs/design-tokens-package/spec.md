# Delta — design-tokens-package (components-add-toast)

## MODIFIED Requirements

### Requirement: Contraste WCAG AA de tokens interactivos

Los pares de tokens que pintan los controles interactivos del kit SHALL cumplir WCAG 2.2 AA en **todos los themes** (default y cada override en `theme/`): `semantic.color.text.inverse` sobre `semantic.color.bg.primary` SHALL alcanzar ≥ 4.5:1 (SC 1.4.3, texto normal); `semantic.color.border.strong` sobre `semantic.color.bg.surface` SHALL alcanzar ≥ 3:1 (SC 1.4.11, indicador no textual); y los borders de status `semantic.color.border.success/warning/info` (junto al ya corregido `border.danger`) sobre `semantic.color.bg.surface` SHALL alcanzar ≥ 3:1 (SC 1.4.11 — canal de variante de componentes de status como el toast). La verificación SHALL ser por cálculo (script `check-a11y/scripts/contrast.mjs` u otro determinístico), no por estimación visual.

#### Scenario: texto inverso sobre bg.primary cumple 4.5:1 en todos los themes

- **GIVEN** el build de tokens (`dist/tokens.css` + `dist/themes/*.css`)
- **WHEN** se calcula el ratio de contraste de `--ds-semantic-color-text-inverse` sobre `--ds-semantic-color-bg-primary` para el scope default y cada theme
- **THEN** cada ratio SHALL ser ≥ 4.5:1

#### Scenario: border.strong sobre bg.surface cumple 3:1 en todos los themes

- **GIVEN** el build de tokens
- **WHEN** se calcula el ratio de contraste de `--ds-semantic-color-border-strong` sobre `--ds-semantic-color-bg-surface` para el scope default y cada theme
- **THEN** cada ratio SHALL ser ≥ 3:1

#### Scenario: la cadena hover/active del primario no cae bajo el umbral

- **GIVEN** el build de tokens
- **WHEN** se calcula el ratio de `--ds-semantic-color-text-inverse` sobre `--ds-semantic-color-bg-primary-hover` y `--ds-semantic-color-bg-primary-active` en cada theme
- **THEN** cada ratio SHALL ser ≥ 4.5:1 (los estados interactivos no pueden ser menos legibles que el reposo)

#### Scenario: borders de status cumplen 3:1 en todos los themes

- **GIVEN** el build de tokens
- **WHEN** se calcula el ratio de `--ds-semantic-color-border-success`, `--ds-semantic-color-border-warning`, `--ds-semantic-color-border-info` y `--ds-semantic-color-border-danger` sobre `--ds-semantic-color-bg-surface` para el scope default y cada theme
- **THEN** cada ratio SHALL ser ≥ 3:1

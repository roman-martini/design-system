# Delta — design-tokens-package (tokens-fix-contrast-aa)

## MODIFIED Requirements

### Requirement: Jerarquía interna primitives → semantic → component → theme

Los tokens SHALL organizarse en cuatro niveles jerárquicos en `packages/tokens/src/`:

1. `primitives/` — valores crudos sin semántica de uso (escalas de color, dimensión, opacidad, tipografía, motion, shadow).
2. `semantic/` — tokens con intención de uso que referencian primitives (ej. `text.primary`, `bg.surface`, `border.default`, `space.md`, `radius.lg`).
3. `component/` — tokens específicos de un componente que referencian semantic o primitives.
4. `theme/` — overrides de tokens semánticos para distintos contextos (ej. `dark`, `brand-a`).

Las **reglas de referencia** SHALL ser:

- `semantic` puede referenciar `primitives` (no al revés).
- `component` puede referenciar `semantic` o `primitives` (no `theme`). Cuando un valor ya existe como token semantic, el token component SHALL **referenciarlo** en vez de duplicar el valor crudo.
- `theme` solo redefine tokens existentes en `semantic` (no introduce tokens nuevos).
- Ningún nivel SHALL referenciar a sí mismo en forma circular.

(Único cambio respecto de la versión anterior: el scenario de resolución de referencias actualiza su ejemplo de `bg.primary` a `{color.blue.600}` — mapeo vigente tras este change.)

#### Scenario: token semantic referencia primitive correctamente

- **GIVEN** `semantic/color.json` define `bg.primary` como `{color.blue.600}`
- **WHEN** Style Dictionary buildea
- **THEN** SHALL resolver la referencia y emitir `--ds-semantic-color-bg-primary: var(--ds-color-blue-600)` en CSS

#### Scenario: primitive referenciando semantic es rechazado

- **WHEN** alguien escribe `primitives/color.json` con `neutral.500` apuntando a `{semantic.color.bg.surface}`
- **THEN** el build SHALL fallar o el revisor SHALL rechazarlo (los primitives no dependen de semantics)

#### Scenario: theme no introduce tokens nuevos

- **WHEN** alguien agrega `theme/dark.json` con un token nuevo `semantic.color.brand-special` que no existe en `semantic/`
- **THEN** SHALL ser rechazado por revisión (el theme solo redefine, no crea)

#### Scenario: component no duplica valores que ya existen en semantic

- **GIVEN** `semantic.color.bg.overlay` definido en `semantic/color.json`
- **WHEN** se inspecciona `component/modal.json` → `modal.overlay-bg`
- **THEN** su value SHALL ser la referencia `{semantic.color.bg.overlay}`, no el valor crudo duplicado
- **AND** el CSS SHALL emitir `--ds-component-modal-overlay-bg: var(--ds-semantic-color-bg-overlay)`

## ADDED Requirements

### Requirement: Contraste WCAG AA de tokens interactivos

Los pares de tokens que pintan los controles interactivos del kit SHALL cumplir WCAG 2.2 AA en **todos los themes** (default y cada override en `theme/`): `semantic.color.text.inverse` sobre `semantic.color.bg.primary` SHALL alcanzar ≥ 4.5:1 (SC 1.4.3, texto normal), y `semantic.color.border.strong` sobre `semantic.color.bg.surface` SHALL alcanzar ≥ 3:1 (SC 1.4.11, indicador no textual). La verificación SHALL ser por cálculo (script `check-a11y/scripts/contrast.mjs` u otro determinístico), no por estimación visual.

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

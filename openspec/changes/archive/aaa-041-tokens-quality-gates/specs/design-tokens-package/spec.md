# design-tokens-package — delta de tokens-quality-gates

## MODIFIED Requirements

### Requirement: Contraste WCAG AA de tokens interactivos

Los pares de tokens que pintan los controles interactivos del kit SHALL cumplir WCAG 2.2 AA en **todos los themes** (default y cada override en `theme/`): `semantic.color.text.inverse` sobre `semantic.color.bg.primary` SHALL alcanzar ≥ 4.5:1 (SC 1.4.3, texto normal); `semantic.color.border.strong` sobre `semantic.color.bg.surface` SHALL alcanzar ≥ 3:1 (SC 1.4.11, indicador no textual); y los borders de status `semantic.color.border.success/warning/info` (junto al ya corregido `border.danger`) sobre `semantic.color.bg.surface` SHALL alcanzar ≥ 3:1 (SC 1.4.11 — canal de variante de componentes de status como el toast).

La verificación SHALL ser por cálculo determinístico, no por estimación visual, y SHALL ejecutarse como parte de la suite de tests del package — no como script invocable a demanda. Los pares SHALL declararse en un artefacto de datos versionado (`packages/tokens/test/contrast-pairs.json`), de modo que sumar un componente al kit sea sumar pares sin modificar la lógica de cálculo. Cada par SHALL declarar su umbral por nivel (`text` 4.5:1, `large-text` 3:1, `ui` 3:1) y la spec cuyo requirement respalda.

La lógica de cálculo SHALL tener una única implementación en el repo productivo (`packages/tokens/scripts/contrast.mjs`), consumida tanto por el gate como por cualquier herramienta de auditoría. NO SHALL existir una segunda implementación del cálculo de ratio.

El alcance del gate SHALL cubrir los pares de tokens `component.*` de los componentes cuyas specs declaran un requirement de contraste verificado por gate, no solo los pares de nivel `semantic`.

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

#### Scenario: el gate corre en cada PR sin step dedicado

- **GIVEN** el spec de contraste ubicado en `packages/tokens/test/`
- **WHEN** el pipeline ejecuta la suite de tests del monorepo
- **THEN** el gate de contraste SHALL ejecutarse como parte de ella
- **AND** NO SHALL requerir un step propio en el workflow ni la invocación manual de una herramienta externa

#### Scenario: un par bajo umbral falla el build informando el par, el theme y el ratio

- **GIVEN** un token de color modificado que deja un par declarado por debajo de su umbral en al menos un scope
- **WHEN** corre la suite del package
- **THEN** el gate SHALL fallar con exit code distinto de 0
- **AND** el mensaje SHALL identificar el par, el theme afectado, el ratio obtenido y el umbral requerido

#### Scenario: un par que no resuelve a color plano falla en vez de omitirse

- **GIVEN** un par cuyo `fg` o `bg` no existe, forma un ciclo de `var()` o resuelve a un valor no cromático
- **WHEN** corre el gate
- **THEN** SHALL fallar reportando el par no resoluble
- **AND** NO SHALL contarlo como aprobado ni saltearlo en silencio

#### Scenario: los tokens de componente están cubiertos

- **GIVEN** las specs de componente que declaran un requirement de contraste verificado por gate
- **WHEN** se inspecciona el artefacto de pares versionado
- **THEN** cada una de esas specs SHALL tener al menos un par que la referencia
- **AND** las specs sin par cubierto SHALL estar declaradas explícitamente en el gate con su justificación

#### Scenario: los pares del control desmarcado de checkbox y radio cumplen 3:1

- **GIVEN** el build de tokens
- **WHEN** se calcula el ratio de `--ds-component-checkbox-border-off` y `--ds-component-radio-border-off` contra `--ds-semantic-color-bg-surface` y contra su propio `bg-off`, en el scope default y cada theme
- **THEN** cada ratio SHALL ser ≥ 3:1 (el borde es el único indicador visual de un control sin texto propio)

### Requirement: Jerarquía interna primitives → semantic → component → theme

Los tokens SHALL organizarse en cuatro niveles jerárquicos en `packages/tokens/src/`:

1. `primitives/` — valores crudos sin semántica de uso (escalas de color, dimensión, opacidad, tipografía, motion, shadow).
2. `semantic/` — tokens con intención de uso que referencian primitives (ej. `text.primary`, `bg.surface`, `border.default`, `space.md`, `radius.lg`).
3. `component/` — tokens específicos de un componente que referencian semantic o primitives.
4. `theme/` — overrides de tokens semánticos para distintos contextos (ej. `dark`, `brand-a`).

Las **reglas de referencia** SHALL ser:

- `semantic` puede referenciar `primitives` (no al revés). Se admiten aliases intra-`semantic` no circulares.
- `component` puede referenciar `semantic` o `primitives` (no `theme`). Cuando un valor ya existe como token semantic, el token component SHALL **referenciarlo** en vez de duplicar el valor crudo.
- `theme` solo redefine tokens existentes en `semantic` (no introduce tokens nuevos).
- Ningún nivel SHALL referenciar a sí mismo en forma circular.

Las cuatro reglas SHALL verificarse por un test automático de la suite del package (`packages/tokens/test/hierarchy.spec.ts`) que parsea los JSON fuente de los cuatro niveles y falla ante cualquier violación. La verificación NO SHALL depender de revisión humana ni de la herramienta de build.

#### Scenario: token semantic referencia primitive correctamente

- **GIVEN** `semantic/color.json` define `bg.primary` como `{color.blue.600}`
- **WHEN** Style Dictionary buildea
- **THEN** SHALL resolver la referencia y emitir `--ds-semantic-color-bg-primary: var(--ds-color-blue-600)` en CSS

#### Scenario: primitive referenciando semantic falla el test de jerarquía

- **WHEN** alguien escribe `primitives/color.json` con `neutral.500` apuntando a `{semantic.color.bg.surface}`
- **THEN** el test de jerarquía SHALL fallar identificando el archivo, el token y el nivel destino inválido (los primitives no dependen de semantics)

#### Scenario: component referenciando theme falla el test de jerarquía

- **WHEN** un token de `component/` apunta a una clave que solo existe en `theme/`
- **THEN** el test de jerarquía SHALL fallar identificando el token y el nivel destino inválido

#### Scenario: theme que introduce un token nuevo falla el test de jerarquía

- **WHEN** alguien agrega `theme/dark.json` con un token nuevo `semantic.color.brand-special` que no existe en `semantic/`
- **THEN** el test de jerarquía SHALL fallar listando las claves de theme ausentes en `semantic` (el theme solo redefine, no crea)

#### Scenario: una referencia circular falla el test de jerarquía

- **WHEN** dos tokens se referencian mutuamente, directa o transitivamente
- **THEN** el test de jerarquía SHALL fallar informando la cadena del ciclo

#### Scenario: una referencia a un token inexistente falla el test de jerarquía

- **WHEN** un token referencia `{una.clave.que.no.existe}`
- **THEN** el test de jerarquía SHALL fallar identificando el origen y la referencia no resuelta

#### Scenario: component no duplica valores que ya existen en semantic

- **GIVEN** `semantic.color.bg.overlay` definido en `semantic/color.json`
- **WHEN** se inspecciona `component/modal.json` → `modal.overlay-bg`
- **THEN** su value SHALL ser la referencia `{semantic.color.bg.overlay}`, no el valor crudo duplicado
- **AND** el CSS SHALL emitir `--ds-component-modal-overlay-bg: var(--ds-semantic-color-bg-overlay)`

### Requirement: Jerarquía semantic.border respetada

Los tokens `semantic.color.border.subtle`, `semantic.color.border.default` y `semantic.color.border.strong` SHALL mantener jerarquía visual creciente: `subtle < default < strong` tanto en light como en dark theme. La jerarquía SHALL verificarse por cálculo de contraste en la suite del package, con la misma lógica que el gate de contraste AA, y no por inspección visual.

#### Scenario: contraste subtle < default

- **GIVEN** light theme aplicado
- **WHEN** se compara el contraste de `--ds-semantic-color-border-subtle` y `--ds-semantic-color-border-default` contra `--ds-semantic-color-bg-surface`
- **THEN** `subtle` SHALL tener menor contraste que `default`

#### Scenario: contraste default < strong

- **GIVEN** light o dark theme aplicado
- **WHEN** se compara el contraste de `--ds-semantic-color-border-default` y `--ds-semantic-color-border-strong` contra `--ds-semantic-color-bg-surface`
- **THEN** `default` SHALL tener menor contraste que `strong`

#### Scenario: la jerarquía se verifica en todos los scopes

- **GIVEN** el build de tokens con sus themes
- **WHEN** corre la suite del package
- **THEN** el orden `subtle < default < strong` SHALL comprobarse en el scope default y en cada theme
- **AND** una inversión del orden en cualquier scope SHALL fallar el test

## ADDED Requirements

### Requirement: Validación automática del artefacto emitido

El package SHALL verificar en su suite de tests que el artefacto de `dist/` —lo que efectivamente consume el usuario del package— cumple el contrato público, mediante un spec (`packages/tokens/test/build.spec.ts`) que parsea `dist/tokens.css` y `dist/themes/*.css`.

Las aserciones SHALL cubrir: prefijo `--ds-` en toda custom property emitida; ausencia de referencias de Style Dictionary sin resolver (`{…}` literales en el output); ausencia de `var()` apuntando a custom properties no declaradas; y **contención** de cada theme en el scope default — toda clave de un theme SHALL existir en el default.

La contención, y NO la igualdad de sets, es la propiedad verificable: los archivos de theme se emiten como deltas por diseño (`sd.config.mjs` filtra el output a los tokens de `src/theme/`), de modo que exigir el mismo set de propiedades que el default sería un gate imposible de satisfacer. Lo que la contención más la ausencia de `var()` colgantes detecta es el fallback silencioso: una variable que un theme referencia y que nadie declara.

El spec SHALL asumir `dist/` ya construido —el pipeline buildea antes de testear— y, si falta, SHALL fallar con un mensaje que nombre el comando de build, en vez de con aserciones sobre archivos ausentes.

#### Scenario: toda custom property emitida lleva el prefijo --ds-

- **GIVEN** `dist/tokens.css` construido
- **WHEN** se parsean todas sus custom properties
- **THEN** todas SHALL empezar con `--ds-`

#### Scenario: cero referencias de Style Dictionary sin resolver

- **GIVEN** el build de tokens
- **WHEN** se inspeccionan los valores emitidos en `dist/tokens.css` y `dist/themes/*.css`
- **THEN** ninguno SHALL contener una referencia literal con la forma `{algo.asi}`

#### Scenario: cero var() a custom properties inexistentes

- **GIVEN** el build de tokens
- **WHEN** se resuelve cada `var(--x)` emitido contra las propiedades declaradas en el scope default y en el propio theme
- **THEN** todas SHALL resolver a una propiedad declarada

#### Scenario: un theme no declara propiedades ausentes del default

- **GIVEN** `dist/themes/dark.css`, `brand-a.css` y `brand-b.css`
- **WHEN** se comparan sus claves contra las de `dist/tokens.css`
- **THEN** cada clave del theme SHALL existir en el default
- **AND** un theme que introduzca una custom property nueva SHALL fallar el test

#### Scenario: los artefactos declarados en exports existen

- **GIVEN** el build de tokens
- **WHEN** se resuelve cada path de `exports` del `package.json` contra `dist/`
- **THEN** todos SHALL existir

#### Scenario: la suite avisa si falta el build en vez de fallar en cascada

- **GIVEN** un working tree sin `dist/` construido
- **WHEN** corre la suite del package
- **THEN** el spec SHALL fallar con un mensaje que nombre el comando de build a ejecutar

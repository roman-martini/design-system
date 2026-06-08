## ADDED Requirements

### Requirement: Tokens semantic de z-index

El package SHALL exponer una jerarquía completa de tokens `semantic.z-index` que cubra todos los casos típicos de layering visual de una UI moderna. Los tokens SHALL declararse en `packages/tokens/src/semantic/z-index.json` y emitirse al output CSS bajo el prefijo `--ds-semantic-z-index-*` (Style Dictionary serializa la ruta completa del token). La jerarquía SHALL sustentar overlays de dropdowns, modales, popovers, toasts y tooltips sin requerir que componentes hardcodeen valores numéricos.

#### Scenario: el archivo z-index.json declara los 13 niveles esperados

- **WHEN** se inspeccionan las keys de `semantic.z-index` en `packages/tokens/src/semantic/z-index.json`
- **THEN** SHALL existir exactamente estos 13 niveles, en orden: `hide`, `auto`, `base`, `docked`, `dropdown`, `sticky`, `banner`, `overlay`, `modal`, `popover`, `skiplink`, `toast`, `tooltip`

#### Scenario: el orden numérico respeta la jerarquía visual

- **GIVEN** los niveles `base`, `docked`, `dropdown`, `sticky`, `banner`, `overlay`, `modal`, `popover`, `skiplink`, `toast`, `tooltip` (excluyendo `hide` y `auto`)
- **WHEN** se ordena por valor numérico ascendente
- **THEN** ese orden SHALL coincidir con el orden de la jerarquía visual (base más bajo, tooltip más alto)

#### Scenario: hide y base ocupan extremos opuestos

- **WHEN** se lee el valor de `hide`
- **THEN** SHALL ser un entero negativo (típicamente `-1`) que pone el elemento detrás del flujo normal
- **AND** el valor de `base` SHALL ser `0`

#### Scenario: auto preserva el comportamiento default del browser

- **WHEN** se lee el valor de `auto`
- **THEN** SHALL ser exactamente `"auto"` (string), no un número
- **AND** SHALL servir para resetear stacking context cuando un componente necesita devolver al default

#### Scenario: la escala de overlays usa miles para dejar margen entre capas

- **WHEN** se inspeccionan los niveles `dropdown`, `sticky`, `banner`, `overlay`, `modal`, `popover`, `skiplink`, `toast`, `tooltip`
- **THEN** todos SHALL tener valores ≥ 1000
- **AND** la diferencia entre niveles consecutivos SHALL ser de al menos 10 unidades (compat. Bootstrap, deja margen para intercalar capas nuevas sin colisión)

#### Scenario: los tokens están disponibles como CSS custom properties

- **GIVEN** un consumidor que importó `@romanmartinidev/tokens/css`
- **WHEN** se inspecciona el CSS de `:root`
- **THEN** SHALL existir un custom property por cada nivel (ej. `--ds-semantic-z-index-hide`, `--ds-semantic-z-index-base`, …, `--ds-semantic-z-index-tooltip`)
- **AND** los valores SHALL coincidir 1:1 con los declarados en `z-index.json`

### Requirement: Tokens semantic de motion para overlays

El package SHALL exponer 2 tokens `semantic.motion.transition` específicos para componentes overlay (Modal, Drawer, Toast, Popover, Tooltip) que componen duration + easing en un único string CSS-shorthand. Los componentes overlay SHALL consumir estos tokens en lugar de hardcodear duration/easing para mantener consistencia visual entre overlays del sistema.

#### Scenario: existen los 2 tokens de transition para overlays

- **WHEN** se inspecciona `semantic.motion.transition` en `packages/tokens/src/semantic/motion.json`
- **THEN** SHALL existir las keys `overlay-enter` y `overlay-exit`

#### Scenario: enter es deliberadamente más lento que exit

- **GIVEN** el valor del token `overlay-enter` con formato `<duration>ms <easing>`
- **WHEN** se compara la duración con la del token `overlay-exit`
- **THEN** el enter SHALL tener duración ≥ exit (convención UX: salidas más rápidas que entradas)

#### Scenario: los tokens incluyen duration + easing en sintaxis CSS shorthand

- **WHEN** se inspecciona el valor de `overlay-enter` o `overlay-exit`
- **THEN** SHALL ser un string con formato `<duration>ms cubic-bezier(<a>, <b>, <c>, <d>)`
- **AND** SHALL NO incluir property (el consumidor decide qué propiedad anima)

#### Scenario: disponibles como CSS custom properties

- **GIVEN** un consumidor que importó `@romanmartinidev/tokens/css`
- **WHEN** se inspecciona `:root`
- **THEN** SHALL existir `--ds-semantic-motion-transition-overlay-enter` y `--ds-semantic-motion-transition-overlay-exit`

### Requirement: Tokens semantic de effect

El package SHALL exponer una categoría `semantic.effect` para tokens de efectos visuales (blur, saturate, etc.) en un archivo dedicado `packages/tokens/src/semantic/effect.json`. La categoría empieza con `effect.blur.overlay` para soportar `backdrop-filter` de modales y drawers.

#### Scenario: existe el archivo y la categoría

- **WHEN** se inspecciona `packages/tokens/src/semantic/effect.json`
- **THEN** el archivo SHALL existir
- **AND** SHALL contener la estructura `semantic.effect.blur.overlay`

#### Scenario: blur.overlay tiene valor en píxeles

- **WHEN** se lee el valor de `effect.blur.overlay`
- **THEN** SHALL ser un string con formato `<n>px` (típicamente `8px`)
- **AND** SHALL NO ser hardcoded en CSS de componentes — siempre via `var(--ds-effect-blur-overlay)`

#### Scenario: disponible como CSS custom property

- **GIVEN** un consumidor que importó `@romanmartinidev/tokens/css`
- **WHEN** se inspecciona `:root`
- **THEN** SHALL existir `--ds-semantic-effect-blur-overlay`

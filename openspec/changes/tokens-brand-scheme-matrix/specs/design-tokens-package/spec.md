## ADDED Requirements

### Requirement: Matriz brand × scheme

El theming SHALL sostener la combinación de marca y color scheme como una matriz modelada, no como un accidente de la cascada. Toda marca que overridee un token **lightness-dependent** (fondos subtle, colores de texto/ícono, focus ring, la escala hover/active del primary) SHALL entregar además un **overlay dark** (`src/theme/<brand>-dark.json`) emitido bajo el selector combinado `[data-theme="dark"][data-brand="<x>"]`, siguiendo la dirección tonal del theme dark (texto/íconos/focus más claros, hover que aclara, subtle profundo). Un token de marca sin dependencia de lightness no necesita entrada en el overlay.

El gate de contraste SHALL evaluar cada par declarado también en los **scopes combinados** (`dark+<brand>`), componiendo la cascada completa (base → dark → marca → overlay) igual que el browser.

#### Scenario: la combinación dark + marca emite el overlay

- **GIVEN** `<html data-theme="dark" data-brand="a">` con base, dark, brand-a y su overlay importados
- **WHEN** se resuelve `var(--ds-semantic-color-bg-primary-subtle)`
- **THEN** SHALL resolver a un tono profundo de la paleta de la marca (no al subtle claro del scope light de la marca)
- **AND** `var(--ds-semantic-color-text-primary)` sobre esa superficie SHALL mantenerse legible

#### Scenario: los overlays existen para cada marca publicada

- **WHEN** se inspecciona `packages/tokens/src/theme/`
- **THEN** por cada `brand-<x>.json` que overridee tokens lightness-dependent SHALL existir `brand-<x>-dark.json`
- **AND** el build SHALL emitir `dist/themes/brand-<x>-dark.css` bajo el selector `[data-theme="dark"][data-brand="<x>"]`, exportado por el package

#### Scenario: el gate de contraste corre los scopes combinados

- **WHEN** corre la suite de contraste del package
- **THEN** cada par SHALL evaluarse además en `dark+brand-<x>` por cada marca, con la cascada base → dark → marca → overlay
- **AND** un par que falle solo en una combinación SHALL fallar la suite (el escenario exacto del bug del 2026-08-05)

#### Scenario: texto primario legible sobre el subtle de marca

- **WHEN** se evalúa el par `text.primary` sobre `bg.primary-subtle`
- **THEN** SHALL alcanzar 4.5:1 en el scope default, en cada theme y en cada scope combinado

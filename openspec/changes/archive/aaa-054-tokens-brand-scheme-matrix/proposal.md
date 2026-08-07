---
id: aaa-054
name: tokens-brand-scheme-matrix
type: change
status: archived
archived: 2026-08-07
modifies-specs:
  - design-tokens-package (matriz brand × scheme: overlays dark por marca + contraste en scopes combinados)
related-adrs:
  - ADR-003
---

# Matriz brand × scheme: las marcas pierden el modo oscuro

## Why

Reproducido en el playground (2026-08-05, reporte del PO sobre el prototipo H1): con `data-theme="dark"` + `data-brand="a"`, `bg.primary-subtle` resuelve a `green.50` (**claro**) mientras `text.primary` resuelve a `#fafafa` — texto invisible. Con `brand-b`, ídem con `purple.50`.

La causa es estructural, no un valor mal puesto: los archivos de marca declaran valores **light-only** y su selector `[data-brand]` le gana a `[data-theme="dark"]` en la cascada. **Todo token que una marca overridea pierde su variante oscura** — afecta también a `text.link`/`link-hover` (verde/violeta 700-800 sobre fondo oscuro) y a la dirección de los hovers de `bg.primary` (las marcas oscurecen al hover, dark aclara). El gate de contraste no lo detectó porque evalúa los 4 scopes **por separado, nunca combinados** — el mismo tipo de agujero que dejó vivir al focus ring azul de marca (aaa-052).

Respalda la **prioridad 2 (arquitecturas que escalen)**: el spec promete "combinar theme + brand sin código adicional" y el modelo actual no lo sostiene para ningún token lightness-dependent. Es como lo resuelven los sistemas multi-marca multi-scheme reales: la matriz se modela, no se deja al azar de la cascada.

## What Changes

1. **Overlays dark por marca**: `src/theme/brand-a-dark.json` y `brand-b-dark.json`, emitidos bajo el selector combinado `[data-theme="dark"][data-brand="a|b"]`. Redefinen solo los tokens lightness-dependent que la marca toca: `bg.primary/primary-hover/primary-active/primary-subtle`, `text.link/link-hover`, `icon.primary`, `focus-ring` — siguiendo la dirección tonal de `dark.json` (tonos más claros para texto/íconos/focus, hover que aclara, subtle profundo).
2. **Exports**: `./themes/brand-a-dark` y `./themes/brand-b-dark` en el package. Contrato de consumo: una app con marca + dark importa el overlay de su marca además del base, la marca y dark.
3. **El gate de contraste evalúa scopes combinados**: `loadScopes` suma `dark+brand-a` y `dark+brand-b` (cascada base → dark → marca → overlay), así cada par corre también en las combinaciones. Antes de este change, la combinación rota era invisible para la suite.
4. **Par nuevo**: `text.primary` sobre `bg.primary-subtle` (el del bug del radio card) entra a `contrast-pairs.json`.
5. **Playground**: importa los dos overlays para que los toggles de theme+brand muestren la matriz completa.
6. **Foco de fields solo por border** (decisión del PO en el gate, 2026-08-07): input/textarea (vía `field.css`) y el trigger del select apilaban border 1px + anillo de 2px = 3px visuales, más ancho que el border de 1px de las cards de referencia; cualquier shadow (normal o inset, ambos probados) se leía más ancho. Decisión: **sin ring en fields** — el indicador de foco es el cambio de color del border. Para que el único indicador cumpla contraste, `component.input.border-focus` y el nuevo `component.select.trigger.border-focus` se repuntan de `border.primary` a la cadena `semantic.color.focus-ring`, que el gate garantiza ≥3:1 en los 6 scopes (`border.primary` no lo cumple: el `green.500` de brand-a da 2.3:1 sobre blanco). AA se sostiene con contraste verificado; el anillo `semantic.shadow.focus` queda para los controles sin border propio (checkbox, radio, switch, slider, button). Compatible con la spec de input, que admite la vía `border-focus`.

**Fuera de alcance**: derivación automática de tonos por marca (estilo Material dynamic color) — los overlays son declarativos como el resto de los themes; si las marcas crecen, esa evolución es un change propio.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `design-tokens-package`: requirement **nuevo** "Matriz brand × scheme" (ADDED, para no colisionar con los deltas activos de aaa-052 sobre el requirement de theming): toda marca que overridee un token lightness-dependent SHALL entregar su overlay dark bajo el selector combinado, y el gate de contraste SHALL evaluar cada par también en los scopes combinados.

## Impact

- `packages/tokens/src/theme/` (+2 archivos), `sd.config.mjs` (+2 builds de theme), `package.json` (+2 exports).
- `packages/tokens/scripts/contrast.mjs` (`loadScopes` compone combinaciones), `test/contrast-pairs.json` (+1 par). `hierarchy.spec.ts` cubre los archivos nuevos sin cambios (mismo dir).
- `apps/playground` (+2 imports de CSS).
- `packages/components/src/lib/field/field.css` y `select/select.css` (composición del foco de fields a 2px; sin cambios de API ni de tokens).
- **Cambio visual** en dark+marca: el radio card, links y botones de marca pasan a verse — hoy están rotos. Gate visual del PO (D-022).

## Alternativas evaluadas

**A. Prohibir que las marcas overrideen tokens lightness-dependent** (subtle, links). Descartada: reduce la expresividad de marca a cambiar solo el primary, y el bug reaparece con cada token nuevo que una marca toque.

**B. Fusionar el overlay dentro de `brand-a.css`** (un solo import por marca, dos bloques de selector). Descartada por ahora: rompe la simetría un-archivo-un-scope del build y del gate, y carga el CSS dark a apps light-only. Si la DX de 4 imports molesta, se resuelve con un entry combinado aparte sin cambiar el modelo.

**C. Derivación tonal automática** (marca = paleta fuente, scheme deriva tonos). Es el estado del arte (Material), pero reordena el modelo completo de theming — one-way door que merece su propio ADR con las marcas reales sobre la mesa, no un fix.

## ADR

No genera ADR: extiende el modelo de theming existente (ADR-003, spec de theming) con el mismo mecanismo declarativo. La alternativa C queda anotada como evolución posible.

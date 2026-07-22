---
id: aaa-033
name: components-button-variants
type: change
status: archived
archived: 2026-07-22
modifies-specs:
  - component-button (ADDED: variantes outline y danger)
  - design-tokens-package (sin delta de spec; D-016 sube la cadena danger del default y se agregan bloques button.outline/danger-outline/danger-ghost)
related-adrs:
  - ADR-011
  - ADR-007
related-decisions:
  - D-014
  - D-016
---

# Proposal — components-button-variants

## Why

Segunda entrega de la **tanda 3** ([D-014](../../../docs/product/decisiones.md)): la referencia moder-minimal muestra las variantes **Outline** y **Delete** que `DsButton` no tiene (hoy: primary/secondary/ghost) — el dev que necesita una acción con borde liviano o un botón de borrado hoy recrea estilos a mano. [HU-020](../../../docs/product/epics/EP-002-kit-componentes/HU-020-button-outline-destructive.md) fue refinada con el PO el 2026-07-22 (naming `danger`, contraste corregido en la fuente vía [D-016](../../../docs/product/decisiones.md), alcance danger completo: sólida + outline + ghost). Respalda la **prioridad 1** (a11y de serie: el par danger pasa de 3.76:1 a 4.83:1 corrigiendo el token semantic, no parcheando el componente) y ejecuta D-007.

## What Changes

- **4 variantes nuevas** en `DsButton` (type `DsButtonVariant` ampliado, API previa intacta): `outline` (fondo transparente, borde `border.default`, texto primario, interacción como ghost), `danger` (sólida: estrena el bloque `component.button.danger.*` que el bootstrap dejó latente), `danger-outline` y `danger-ghost` (texto/borde danger, hover `danger-subtle` — pares ya sanos por D-012).
- **D-016 — cadena semantic danger del default un paso más oscura**: `bg.danger` `red.500→600` (blanco 4.83:1 ✓), `danger-hover` `600→700`, `danger-active` `700→800`. Dark no se toca (ya cumplía con `red.600` y hover que aclara). Impacto visual real hoy nulo: ningún componente construido consume `bg.danger` sólido.
- Tokens component **aditivos**: `button.outline.*`, `button.danger-outline.*`, `button.danger-ghost.*` referenciando semantic existentes. El bloque `button.danger.*` del bootstrap se reutiliza sin cambios.
- **Gate de contraste por script**: los pares nuevos (danger sólida en 4 themes, texto danger en outline/ghost) se verifican post-build; sin regresión en pares existentes.
- Showcase del playground: las 7 variantes con estados hover/disabled/loading de danger. Stories actualizadas.
- Changesets: **minor** de components (variantes aditivas) y **minor** de tokens (D-016 + bloques nuevos). Lockstep (ADR-015); el veto npm sigue vigente.

## Capabilities

### New Capabilities

(ninguna — se extiende `DsButton`, componente existente)

### Modified Capabilities

- `component-button`: ADDED Requirement "Variantes outline y danger de DsButton" — 4 variantes tokenizadas, compatibilidad con disabled (ADR-011) y loading (HU-017), pares AA por gate. Derivado 1:1 de los CAs de HU-020.
- `design-tokens-package`: sin delta de spec — D-016 cambia valores de referencias semantic existentes (sin renombrar) y los bloques component nuevos cumplen la jerarquía ADR-003.

## Alternativas evaluadas

Descartadas en el refinamiento con el PO (2026-07-22, decisiones en HU-020):

1. **Naming `destructive`** (shadcn) — descartado: el kit ya habla `danger` en tokens, `DsMenu` (D-012) y `text.danger`; un segundo término para el mismo concepto fragmenta el vocabulario. Badge (HU-021) hereda `danger`.
2. **Tokens component locales para el contraste** (`button.danger-bg → red.600` sin tocar semantic) — descartado: deja `bg.danger` semantic como trampa latente (cualquier consumidor futuro con texto inverso hereda el fallo 3.76:1). El criterio profesional del repo (D-008/D-012) es corregir el token fuente; con impacto visual real nulo hoy, es el mejor momento.
3. **Danger solo sólida** (como la referencia) — descartada por el PO (D-015): cubrir confirmaciones secundarias desde ya; los pares de texto danger ya estaban verificados por D-012, así que el costo marginal es bajo.

## Impact

- **Código**: `packages/components/src/lib/button/` (`button.ts` type + `button.css` variantes + `.spec.ts` + `.stories.ts`), showcase de Button en playground. `public-api.ts` sin cambios.
- **Tokens**: `semantic/color.json` (D-016, default only), `component/button.json` (3 bloques aditivos). Sin renombres: ningún consumidor rompe.
- **Dependencias**: ninguna nueva.
- **Sin ADR previsto**: no hay decisión one-way door (valores de tokens reversibles, variantes aditivas); D-016 registra la decisión de producto.

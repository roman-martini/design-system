---
id: aaa-032
name: components-add-card
type: change
status: archived
archived: 2026-07-22
introduces-specs:
  - component-card
modifies-specs:
  - design-tokens-package (sin delta de spec; component.card nuevo referenciando semantic/primitives)
related-adrs:
  - ADR-007
  - ADR-018
related-decisions:
  - D-014
---

# Proposal — components-add-card

## Why

Primera entrega de la **tanda 3** ([D-014](../../../docs/product/decisiones.md)): las 5 vistas de la referencia [`moder-minimal`](../../../docs/reference/components/moder-minimal/) (subscription, settings, auth, cookie consent, team) usan la card como contenedor — hoy el consumidor la recrea a mano con borde/sombra/padding ad-hoc en cada pantalla. [HU-019](../../../docs/product/epics/EP-002-kit-componentes/HU-019-card.md) fue refinada con el PO el 2026-07-22 (sub-partes híbridas, variantes de elevación, padding configurable). Es el componente **foundational** de la tanda: los 6 restantes se muestran dentro. Respalda la **prioridad 2** del repo (composición que escala: un contenedor tokenizado en vez de N copias) y la 1 (semántica de heading preservada, D-007).

## What Changes

- Nueva familia **`DsCard`** (`ds-card`, naming ADR-007): contenedor standalone + OnPush, sin dependencias nuevas.
- **Sub-partes híbridas** (decisión 1 de HU-019): `ds-card-header` / `ds-card-content` / `ds-card-footer` (elemento) y `dsCardTitle` / `dsCardDescription` usables como **elemento o atributo** (`<h2 dsCardTitle>` conserva el heading real en el árbol de accesibilidad). Todas opcionales; spacing entre partes por tokens.
- **Variantes de elevación** (decisión 2): input `variant` `outline` (default, borde + sombra sutil — reproduce la referencia) | `elevated` | `flat`, todas tokenizadas.
- **Padding configurable** (decisión 3): input `padding` `comfortable` (default) | `compact`, por tokens.
- Tokens **`component.card.*`**: el bootstrap ya dejó el set base en `component/card.json` (padding sm/md/lg, radius, bg/bg-elevated, border, shadow/shadow-hover, title/subtitle) — se **reutiliza sin renombrar** (tokens ya publicados) y se agregan solo dos aditivos: `gap` (spacing entre sub-partes) y `shadow-elevated` (alias de intención sobre `semantic.shadow.card-hover`). **Sin pares de contraste nuevos**.
- Spec **`component-card` nuevo** (componente nuevo → `introduces-specs`, regla de ADR-018).
- Showcase del playground (EP-006): página de `DsCard` que reproduce la vista Cookie Settings de la referencia + las 3 variantes y ambos paddings.
- Changesets: **minor** de components (familia nueva) y **minor** de tokens (`component.card.*`). Lockstep (ADR-015). El veto de publicación npm sigue vigente.

## Capabilities

### New Capabilities

- `component-card`: contrato de la familia `DsCard` — variantes tokenizadas, sub-partes híbridas opcionales con semántica preservada, padding configurable. Derivado 1:1 de los CAs de HU-019.

### Modified Capabilities

- `design-tokens-package`: sin delta de spec — `component/card.json` es un archivo component nuevo que cumple la jerarquía existente (ADR-003) y no agrega pares al requirement de contraste.

## Alternativas evaluadas

Descartadas en el refinamiento con el PO (2026-07-22, decisiones en HU-019):

1. **Solo proyección libre + clases CSS documentadas** — descartada: sin estructura verificable ni spacing garantizado entre partes; cada consumidor re-inventa el orden. Las sub-partes tipadas hacen el contrato testeable.
2. **Sub-componentes solo-elemento** (estilo shadcn, `<ds-card-title>texto</ds-card-title>`) — descartada: pierde la semántica de heading del consumidor (el título quedaría en un elemento genérico); el selector híbrido (`<h2 dsCardTitle>`) da estilos y conserva el `<h2>` real.
3. **Apariencia y padding únicos** (la recomendación por D-005) — descartada por el PO: optó por `variant` y `padding` configurables para cubrir dashboards y vistas densas sin change futuro; trade-off de superficie de API asumido y registrado en la HU.

## Impact

- **Código**: `packages/components/src/lib/card/` (familia + css + spec + stories), `public-api.ts` (+`DsCard`, sub-partes, `DsCardVariant`, `DsCardPadding`), `packages/tokens/src/component/card.json` (existente del bootstrap — se extiende aditivamente con `gap` y `shadow-elevated`), página del showcase en playground.
- **Dependencias**: ninguna nueva.
- **Clasificación** (workflow add-component): contenedor de layout puro — no es form control, no es overlay (ADR-013/014 no aplican), sin iconos (ADR-012 no aplica), sin JS de interacción (solo estilos + proyección).
- **Sin ADR previsto**: no hay decisión one-way door ni cross-package nueva; el patrón de selector híbrido es local a la familia — si un segundo componente lo adopta, se evalúa convención transversal al cierre.

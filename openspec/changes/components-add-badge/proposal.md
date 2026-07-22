---
id: aaa-034
name: components-add-badge
type: change
status: proposed
introduces-specs:
  - component-badge
modifies-specs:
  - design-tokens-package (sin delta de spec; agrega semantic bg.neutral/neutral-subtle + component.badge.*)
related-adrs:
  - ADR-019
  - ADR-012
  - ADR-007
related-decisions:
  - D-014
  - D-017
---

# Proposal — components-add-badge

# Why

Tercera entrega de la **tanda 3** ([D-014](../../../docs/product/decisiones.md)) y **primera implementación de referencia de [ADR-019](../../../docs/architecture/adr/ADR-019-modelo-variantes-tono-apariencia.md)** (modelo `tone × appearance`, estándar del kit por [D-017](../../../docs/product/decisiones.md)). La referencia moder-minimal muestra badges de estado (Badge/Secondary/Outline/Error) y roles de team; hoy el consumidor recrea pills a mano, sin garantía de contraste. [HU-021](../../../docs/product/epics/EP-002-kit-componentes/HU-021-badge.md) fue refinada con el PO el 2026-07-22 (dos ejes, sizes sm/md/lg, ícono + dot). Respalda la **prioridad 1** (a11y: cada combinación tono×apariencia cumple AA por gate) y ejecuta D-017 (patrón profesional aplicado como estándar).

# What Changes

- Nuevo **`DsBadge`** (`ds-badge`, ADR-007): standalone + OnPush, texto proyectado, inline.
- **Dos ejes** (ADR-019): `tone` (`neutral` default | `primary` | `danger` | `success` | `warning` | `info`) × `appearance` (`subtle` default | `solid` | `outline`), reflejados en `data-tone`/`data-appearance`.
- **Sizes** `sm | md | lg` (default `md`).
- **`icon`** (Lucide leading, ADR-012, hereda el color del tono) y **`dot`** (punto de estado leading) — decorativos (`aria-hidden`).
- **Tokens**: `component.badge.*` (sizing por size + `<tone>.<appearance>` de color) referenciando semantic. Se **completa la capa semantic** con `bg.neutral` y `bg.neutral-subtle` (+ overrides dark) para que el set de tonos de estado sea **uniforme** — no un caso especial hardcodeado (D-017).
- **Gate de contraste**: cada combinación `tone × appearance` (18) verificada AA en los 4 themes; en `solid` el texto es por tono (blanco en tonos oscuros, texto oscuro en `warning`).
- Spec **`component-badge` nuevo** (ADR-018). Showcase con la matriz completa + ejemplos en contexto.
- Changesets: **minor** de components (componente nuevo) y **minor** de tokens (semantic neutral + `component.badge.*`). Lockstep (ADR-015); veto npm vigente.

# Capabilities

## New Capabilities

- `component-badge`: contrato de `DsBadge` — dos ejes tono×apariencia, sizes, ícono/dot, contraste AA por combinación. Derivado 1:1 de los CAs de HU-021.

## Modified Capabilities

- `design-tokens-package`: sin delta de spec — se agregan `semantic.color.bg.neutral`/`neutral-subtle` (completan el set de tonos, con overrides dark) y `component/badge.json`, ambos cumpliendo la jerarquía ADR-003.

# Alternativas evaluadas

Descartadas en el refinamiento con el PO (2026-07-22, decisiones en HU-021 y ADR-019):

1. **`variant` plano como Button** — descartada por el PO: no escala al producto cartesiano tono×estilo (síntoma `danger-outline`, ×6 tonos). ADR-019 fija los dos ejes como estándar para componentes de estado.
2. **Solo tonos con texto blanco en `solid`** — descartada: `warning`/`success` claros fallan AA con blanco; el texto solid por tono (gate) es lo correcto y lo que justifica el modelo.
3. **Referenciar primitives para el tono neutral** (evitando tocar semantic) — descartada: no themea y deja el neutral como caso especial. Completar `bg.neutral`/`neutral-subtle` en semantic mantiene el set uniforme y theme-aware (D-017).

# Impact

- **Código**: `packages/components/src/lib/badge/` (componente + css + spec + stories), `public-api.ts` (+`DsBadge`, `DsBadgeTone`, `DsBadgeAppearance`, `DsBadgeSize`), `packages/tokens/src/component/badge.json` (nuevo), `semantic/color.json` + `theme/dark.json` (neutral), página del showcase.
- **Dependencias**: `@lucide/angular` (ya peer, ADR-012) para el ícono.
- **Clasificación**: componente de estado/display → modelo ADR-019; no es form control, no es overlay.
- **Sin ADR nuevo**: ADR-019 (que este change estrena) ya cubre el patrón; el semantic neutral es aditivo reversible.

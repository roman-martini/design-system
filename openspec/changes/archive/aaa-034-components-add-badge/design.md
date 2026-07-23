# Design — components-add-badge (aaa-034)

Decisiones técnicas del change. Muere al archivar; lo one-way door ya vive en ADR-019.

## Context

Primera implementación de [ADR-019](../../../docs/architecture/adr/ADR-019-modelo-variantes-tono-apariencia.md) (dos ejes `tone × appearance`). `DsBadge` es un componente de estado presentacional: texto proyectado + tono + apariencia + size + ícono/dot opcionales. El desafío real es el **contraste por combinación**: 6 tonos × 3 apariencias, y en `solid` los tonos claros (`warning`, `success`, `info`) no pasan AA con texto blanco.

## Goals / Non-Goals

**Goals:**

- Modelo `tone × appearance` completo y uniforme (sin tono que sea caso especial).
- Cada combinación AA por el gate en los 4 themes.
- Tokens que respeten ADR-003 sin overrides de component en themes.

**Non-Goals:**

- Badge numérico/notification-dot posicionado sobre otro elemento (composición).
- Chip removible (componente aparte).

## Decisions

### 1. API pública

```ts
DsBadge; // ds-badge — inputs: tone (default 'neutral'), appearance (default 'subtle'), size (default 'md'), icon?, dot?
type DsBadgeTone = 'neutral' | 'primary' | 'danger' | 'success' | 'warning' | 'info';
type DsBadgeAppearance = 'subtle' | 'solid' | 'outline';
type DsBadgeSize = 'sm' | 'md' | 'lg';
```

- `icon` (nombre Lucide) y `dot` (boolean) son leading y **mutuamente excluyentes**: si ambos, `icon` gana (el dot es el fallback sin ícono). Ambos decorativos (`aria-hidden`) — el significado lo lleva el texto (CA-021.5).
- Sin `role`: es un `<span>` de texto.

### 2. Arquitectura de tokens: subtle/outline temáticos, solid invariante

La clave para cumplir ADR-003 (theme redefine solo semantic) **sin** overrides de component:

- **`subtle` y `outline` referencian `semantic`** → adaptan a dark automáticamente (el semantic ya tiene overrides por theme).
- **`solid` referencia `primitives`** → es **theme-invariante a propósito**: un badge sólido de estado es un color saturado que se lee igual en light y dark (patrón estándar). Así el texto por tono se fija una vez y no necesita override.

Único agregado a semantic: **`bg.neutral-subtle`** (`neutral.100` light / `neutral.800` dark) — completa el set de tonos para que `neutral` no sea un caso especial. El resto del neutral usa tokens existentes (`text.secondary`, `border.default`).

### 3. Mapa tono × apariencia → tokens

| tone    | subtle-bg (semantic)   | text subtle/outline (semantic) | outline-border (semantic) | solid-bg (primitive) | solid-text (primitive) |
| ------- | ---------------------- | ------------------------------ | ------------------------- | -------------------- | ---------------------- |
| neutral | `bg.neutral-subtle` \* | `text.secondary`               | `border.default`          | `neutral.700`        | `white`                |
| primary | `bg.primary-subtle`    | `text.link`                    | `border.primary`          | `blue.600`           | `white`                |
| danger  | `bg.danger-subtle`     | `text.danger`                  | `border.danger`           | `red.600`            | `white`                |
| success | `bg.success-subtle`    | `text.success`                 | `border.success`          | `green.700`          | `white`                |
| warning | `bg.warning-subtle`    | `text.warning`                 | `border.warning`          | `yellow.400`         | `neutral.900` ⚠        |
| info    | `bg.info-subtle`       | `text.info`                    | `border.info`             | `teal.700`           | `white`                |

`*` = token nuevo. `⚠` = **warning solid usa texto oscuro** (el amarillo es claro; blanco fallaría) — el caso que justifica el modelo de texto por tono.

- Los pasos exactos de `solid-bg` los **ratifica el gate**: si `green.700`/`teal.700` no llegan a 4.5:1 con blanco, se baja un paso (green.800/teal.800). Se documenta el resultado en tasks §2.

### 4. Sizing por `component.badge.size.*`

- Por size (sm/md/lg): `padding-x`, `padding-y`, `font-size`, `radius`, `gap` (ícono/dot↔texto), `icon-size`, `dot-size` — referencian `dimension`/`semantic`.
- `radius` alto (pill) o `radius.sm` — a fijar visualmente; default badge = bordes suaves (`semantic.radius.sm`).

### 5. CSS por `data-tone` + `data-appearance` + `data-size`

- Tres atributos independientes en el host; el CSS combina `:host([data-appearance='solid'][data-tone='danger'])`. Patrón `[data-*]` del kit.
- El dot es un `<span>` con `background: currentColor`-del-tono; el ícono hereda el color del texto del tono.

## Risks / Trade-offs

- [`solid` theme-invariante] → un badge sólido no cambia en dark. Es intencional y estándar; si un caso pide solid adaptativo, se agrega un token semantic entonces (no antes).
- [18 combinaciones de contraste] → el gate las cubre todas; la lista de pares vive en el script del change (tasks §2), no a mano.
- [jsdom no computa colores] → tests asertan `data-*` + tokens en CSS fuente; ratios por el gate (criterio aaa-023/033).

## Open Questions

(ninguna — HU-021 cerró el modelo, sizes, ícono/dot; el gate fija los pasos exactos de solid en el apply)

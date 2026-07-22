# Design — components-add-card (aaa-032)

Decisiones técnicas del change. Muere al archivar; lo one-way door se promueve a ADR si aparece.

## Context

Primera entrega de la tanda 3 (D-014). HU-019 refinada (PO 2026-07-22) fija: sub-partes híbridas, `variant` outline/elevated/flat (default outline = referencia), `padding` comfortable/compact. Contenedor de layout puro: sin form, sin overlay, sin interacción JS — el contrato es estilos tokenizados + proyección + semántica preservada.

## Goals / Non-Goals

**Goals:**

- Familia `DsCard` con estructura descubrible (sub-partes tipadas) y spacing garantizado por tokens.
- Semántica del consumidor intacta: `<h2 dsCardTitle>` sigue siendo heading nivel 2.
- Variantes y padding 100% tokenizados, sin pares de contraste nuevos.

**Non-Goals:**

- Card clickable/interactiva (hover de card como link) — composición futura.
- Radio-card (composición Card + Radio en el showcase del consumidor).
- Slots de media/imagen.

## Decisions

### 1. API pública

```ts
// public-api.ts
DsCard; // selector ds-card — inputs: variant (default 'outline'), padding (default 'comfortable')
DsCardHeader; // ds-card-header
DsCardContent; // ds-card-content
DsCardFooter; // ds-card-footer
DsCardTitle; // ds-card-title, [dsCardTitle]
DsCardDescription; // ds-card-description, [dsCardDescription]
type DsCardVariant = 'outline' | 'elevated' | 'flat';
type DsCardPadding = 'comfortable' | 'compact';
```

- Sin outputs, sin lógica: familia puramente presentacional. Cualquier input extra (color, clickable) violaría D-005.

### 2. Sub-partes como componentes con selector híbrido (no directivas)

- `DsCardTitle`/`DsCardDescription` son **componentes** con selector `ds-card-title, [dsCardTitle]` y template `<ng-content />` — como atributo, el host es el elemento del consumidor (`<h2 dsCardTitle>`), que conserva su semántica (CA-019.4).
- **Por qué componentes y no directivas**: las directivas no llevan estilos; con ViewEncapsulation emulada, el CSS de `DsCard` no alcanza al contenido proyectado (pertenece al template del consumidor). Un componente con `:host { … }` propio se estila a sí mismo sin fugas — mismo mecanismo que usa Angular Material para `[mat-button]`.
- `DsCardHeader`/`Content`/`Footer`: solo-elemento (son wrappers de layout sin semántica que preservar).

### 3. Layout y spacing por el contenedor

- `ds-card` host: `display: flex; flex-direction: column; gap: var(--ds-component-card-gap)` — el spacing entre sub-partes lo gobierna la card, no cada parte (CA-019.2).
- `padding` por `data-padding` en el host (`comfortable`/`compact`), heredado por las sub-partes vía padding del host (no per-parte) — un solo lugar que cambia.

### 4. Variantes por `data-variant` + tokens `component.card.*` (set del bootstrap, reuso sin renombrar)

`component/card.json` **ya existe** desde el bootstrap (mismo caso que el "par latente" de alert en D-012) y sus nombres están publicados — se reutiliza tal cual y solo se agrega lo que falta (aditivo):

| Token                                                       | Estado    | Uso en la familia                                                                                                                                 |
| ----------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `card.padding.sm/md/lg` (16/24/32)                          | existente | `compact` → `padding.sm`; `comfortable` → `padding.md`                                                                                            |
| `card.radius` (`semantic.radius.xl`, 12px)                  | existente | radius del host (más redondeada que los controles, ✓ referencia)                                                                                  |
| `card.bg` / `card.bg-elevated`                              | existente | `outline`/`flat` → `bg`; `elevated` → `bg-elevated`                                                                                               |
| `card.border` (`border.default`)                            | existente | borde de `outline`/`flat`; transparente en `elevated`                                                                                             |
| `card.shadow` (`semantic.shadow.card`)                      | existente | sombra sutil de `outline`                                                                                                                         |
| `card.shadow-hover`                                         | existente | queda para una card interactiva futura (no se usa hoy)                                                                                            |
| `card.title.*` / `card.subtitle.*`                          | existente | `DsCardTitle` / `DsCardDescription` (subtitle = description)                                                                                      |
| `card.header-gap` / `card.footer-gap`                       | existente | gap interno de header y footer                                                                                                                    |
| **`card.gap`** (`{semantic.space.md}`)                      | **nuevo** | spacing entre sub-partes, gobernado por el contenedor                                                                                             |
| **`card.shadow-elevated`** (`{semantic.shadow.card-hover}`) | **nuevo** | sombra de la variante `elevated` (alias de intención — no se reutiliza `shadow-hover` para no acoplar el nombre "hover" a un estado que no lo es) |

- `outline` = borde + `card.shadow`; `elevated` = borde transparente + `bg-elevated` + `card.shadow-elevated`; `flat` = borde + sin sombra.
- `padding.lg` (32px) queda disponible sin API: si aparece el caso, se suma un valor al input (aditivo).

## Risks / Trade-offs

- [Selector de atributo en componente (`<h2 dsCardTitle>`) reemplaza el contenido del host por el template] → el template es solo `<ng-content />`, así que el contenido se re-proyecta 1:1; test de comportamiento lo cubre.
- [`elevated`/`flat` sin caso en la referencia] → riesgo de API muerta asumido por el PO (HU-019 decisión 2); si en 2 tandas nadie las usa, candidato a deprecación pre-1.0 (D-004).
- [jsdom no computa sombras/gap reales] → los tests asertan `data-variant`/`data-padding` y tokens en el CSS fuente; la geometría se verifica en playground (mismo criterio que aaa-023 §Risks).

## Open Questions

(ninguna — el refinamiento de HU-019 cerró las tres decisiones el 2026-07-22)

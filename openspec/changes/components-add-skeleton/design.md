# Design — components-add-skeleton (aaa-024)

Decisiones técnicas del change. Muere al archivar; lo one-way door se promueve a ADR si aparece.

## Context

Último componente de la tanda 1 (D-009). HU-010 refinada (PO 2026-07-19) fija: dimensiones libres con defaults por shape, pulso de opacidad, estático bajo reduced-motion, decorativo siempre, sin `lines`. Segundo componente decorativo/animado del kit (tras `DsSpinner`, aaa-023) — comparte el lenguaje del pulso pero, a diferencia del spinner, acá reduced-motion **apaga** en vez de reemplazar (el placeholder ya comunica estructura sin moverse).

## Goals / Non-Goals

**Goals:**

- `DsSkeleton` que imite cualquier contenido (texto, bloque, avatar) con API mínima y defaults tokenizados.
- Placeholder estable (sin layout shift) con motion accesible de serie.

**Non-Goals:**

- Compuestos prearmados (card/tabla/lista — recipes), input `lines`, variante shimmer.
- Orquestación de la carga (aria-busy, live regions): responsabilidad del contenedor del consumidor, solo se documenta.

## Decisions

### 1. API pública mínima

```ts
// public-api.ts
DsSkeleton; // selector ds-skeleton
type DsSkeletonShape = 'text' | 'rect' | 'circle';
// inputs: shape (default 'text'), width (''), height (''), radius ('')
```

- `width`/`height`/`radius` son strings CSS libres; vacío → default del shape. Se aplican por **host style bindings** (`[style.width]` etc. con `|| null`): sin valor, gana el CSS por `data-shape`; con valor, el inline style pisa el default. Sin parsing ni validación — el contrato es "cualquier valor CSS válido" (CA-010.2).
- Sin outputs, sin content projection, sin estado interno: cero lógica más allá de los bindings.

### 2. Host único, sin template interno

- El skeleton ES el bloque: `:host` lleva `display: block`, fondo, radius y animación. Template vacío (sin SVG ni spans) — no hay canal accesible que renderizar porque es decorativo por contrato.
- `aria-hidden="true"` **estático** en el host (no binding: nunca cambia — misma regla que el SVG del spinner).

### 3. Defaults por shape vía `:host([data-shape])` + tokens `component.skeleton.*`

| Token                     | Referencia                           |
| ------------------------- | ------------------------------------ |
| `skeleton.bg`             | `{semantic.color.bg.disabled}`       |
| `skeleton.radius`         | `{semantic.radius.sm}` (text/rect)   |
| `skeleton.circle-radius`  | `{semantic.radius.full}`             |
| `skeleton.text-height`    | `1em` raw documentado                |
| `skeleton.rect-height`    | `{dimension.64}`                     |
| `skeleton.circle-size`    | `{dimension.40}`                     |
| `skeleton.duration-pulse` | `2000ms` raw documentado             |
| `skeleton.pulse-opacity`  | `{opacity.60}` (mínimo del keyframe) |

- `bg.disabled` (neutral-100 light / neutral-800 dark): único semantic de superficie muted **theme-aware** — `bg.secondary` es blanco en light (invisible sobre surface). Semánticamente correcto: superficie inactiva.
- `text-height: 1em` raw: escala con la tipografía del contexto (una línea de texto imita a su párrafo); no hay primitive tipográfico aplicable a una altura de bloque.
- `duration-pulse` 2000ms = mismo valor que el spinner (lenguaje de "carga" consistente); `pulse-opacity` 0.6 (más sutil que el 0.4 del spinner: el skeleton cubre áreas grandes).
- Widths default: `text`/`rect` → `100%` (raw en CSS, no tokenizable — es "ocupá tu contenedor"); `circle` → `circle-size`.

### 4. Animación: pulso en `:host`, apagado bajo reduced-motion

- `@keyframes ds-skeleton-pulse` (`opacity 1 → 0.6 → 1`, `duration-pulse`, ease-in-out de tokens) sobre `:host` — anima solo `opacity` (compositor-friendly).
- `@media (prefers-reduced-motion: reduce)` → `animation: none` (decisión 3 de la HU). **No** repite el patrón "reemplazo" de aaa-023; queda registrado que con 1 caso de "reemplazo" y 1 de "apagado" no hay convención transversal que formalizar.

## Risks / Trade-offs

- [`radius` inline pisa también el radius de `circle` si el consumidor lo setea con shape circle] → aceptado: es el contrato de override; el showcase no lo promueve.
- [`bg.disabled` compartido con inputs deshabilitados: si su valor cambiara por rediseño, arrastra al skeleton] → aceptado y documentado acá; si aparece divergencia real, se introduce un semantic `bg.muted` (micro-change de tokens).
- [Animación de `opacity` sobre `:host` con muchos skeletons simultáneos] → `opacity` composita sin layout; verificación visual en showcase con un grid de bloques.

## Open Questions

(ninguna — el refinamiento de HU-010 cerró todas las decisiones de producto)

# Design — components-add-pagination (aaa-028)

Decisiones técnicas del change. Muere al archivar; lo one-way door se promueve a ADR si aparece.

## Context

Cuarta pieza de la tanda 2 (D-011). HU-015 refinada (PO 2026-07-20) fija: modelo `page`+`totalPages` two-way, ventana `siblingCount` con "…" estático, **variante compacta y first/last en v1**, disabled de extremos por ADR-011, labels configurables. Sin overlay, sin proyección de contenido, sin dependencias nuevas — el reto es puro cálculo de ventana y disciplina a11y.

## Goals / Non-Goals

**Goals:**

- Navegación de páginas accesible: nav + botones con nombre, `aria-current`, extremos disabled descubribles.
- Ventana de páginas como **cálculo puro** testeable (patrón `collapsedRange` de aaa-027).
- Dos variantes (numbered/compact) sobre el mismo modelo y los mismos controles de extremo.

**Non-Goals:**

- Jump box "ir a página", selector de pageSize, data fetching, infinite scroll (fuera de alcance de HU-015).
- "…" interactivo (saltar N páginas): la primera y la última ya son clickeables (D-005).

## Decisions

### 1. API pública

```ts
// public-api.ts
DsPagination; // selector ds-pagination
// model:  page (number, 1-based, two-way)
// inputs: totalPages (required), siblingCount (default 1), variant ('numbered' | 'compact', default 'numbered'),
//         aria-label (default 'paginación'), firstLabel/prevLabel/nextLabel/lastLabel (defaults en español),
//         pageLabel (default 'Página' → nombre accesible "Página N")
DsPaginationVariant; // type
```

- **Un único componente sin proyección**: los botones se generan desde `totalPages` — no hay caso de contenido rico por página (a diferencia de menu/accordion/breadcrumbs, acá el item ES un número). Sin familia de hijos ni registro.
- **Página efectiva** (patrón `activeValue` de DsTabs): si el consumidor setea `page` fuera de `[1, totalPages]`, el render usa el clamp y **toda emisión del componente** está dentro del rango; el model del consumidor no se corrige de oficio (el estado es suyo), solo se normaliza la vista.

### 2. Ventana de páginas como función pura

- `pageWindow(current, total, siblings)` → `(number | 'ellipsis')[]`: siempre incluye 1 y `total`; alrededor de `current`, `siblings` vecinas por lado; huecos → `'ellipsis'`. Regla anti-parpadeo: un hueco de exactamente una página se rellena con el número (nunca "…" para ocultar una sola página).
- Es una función exportada a nivel módulo (no método), testeable sin TestBed; el componente la consume desde un `computed`.

### 3. Render y a11y

- `<nav [attr.aria-label]>` → `<ul role="list">` con `<li>` por control (mismo criterio de roles explícitos… acá los `li` son template propio del componente, sin custom elements intermedios → semántica nativa directa, sin roles extra).
- Botón de página: `type="button"`, nombre accesible `"${pageLabel()} ${n}"`, actual con `aria-current="page"` + tokens de énfasis. "…": `<span aria-hidden="true">` no focusable.
- **Extremos**: first/prev/next/last con chevrons Lucide estáticos (`LucideChevronsLeft`, `LucideChevronLeft`, `LucideChevronRight`, `LucideChevronsRight`, ADR-012, decorativos) + `aria-label` configurable; disabled por ADR-011 (focusable + `aria-disabled` + guarda). Estado en el elemento propio (lección aaa-026): `[aria-disabled]`/`[aria-current]` alimentan el CSS, sin clases de estado por descendencia desde `:host`.
- **Compact**: mismos 4 controles de extremo + `<span>` contador `"${page} de ${totalPages}"`; sin live region (el cambio lo inicia el usuario con el foco en el control — anunciar además el contador sería redundante).

### 4. Tokens `component.pagination.*`

| Grupo    | Tokens                                                    | Referencia                                                                                                        |
| -------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| item     | min-width, height, radius, font-size, gap, text, bg-hover | `{dimension.*}`, `{semantic.radius.md}`, `{semantic.color.text.secondary}`, `{semantic.color.bg.secondary-hover}` |
| current  | bg, text, font-weight                                     | `{semantic.color.bg.primary}`, `{semantic.color.text.inverse}` (lenguaje de tabs pills active)                    |
| disabled | text                                                      | `{semantic.color.text.disabled}`                                                                                  |
| counter  | text                                                      | `{semantic.color.text.secondary}`                                                                                 |
| chevron  | size                                                      | `{dimension.16}`                                                                                                  |

- **Pares al gate**: current inverse/primary (mismo par que tabs pills active — se corre igual), item text/surface y text/bg-hover (verificados en breadcrumbs/accordion, se corren igual), disabled es exención WCAG pero se documenta.

## Risks / Trade-offs

- [`pageWindow` con `siblingCount` grande y totales chicos: solapamientos de rangos] → función pura con suite de casos borde propia (total ≤ ventana, current en extremos, siblings 0 y 2) antes de tocar el template.
- [Clamp de vista vs model del consumidor desincronizados] → contrato documentado (la vista normaliza, el model no se pisa); test del caso `page > totalPages`.
- [Labels default en español en lib publicable] → mismo criterio ya asumido en breadcrumbs (ellipsis label); todos los textos son inputs reemplazables (CA-015.6). Si el kit algún día encara i18n integral, será decisión transversal aparte.

## Open Questions

(ninguna — el refinamiento de HU-015 cerró todas las decisiones de producto; las técnicas quedan resueltas arriba)

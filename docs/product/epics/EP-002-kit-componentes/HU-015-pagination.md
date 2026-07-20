# HU-015 — Pagination de listados (dev consumidor)

**Épica**: [EP-002 — Kit de componentes Angular](EP-002-kit-componentes.md)
**Actor**: Dev consumidor
**Estado**: Hecha (2026-07-20) — [`aaa-028 components-add-pagination`](../../../../openspec/changes/archive/aaa-028-components-add-pagination/) archivado; 18 tests (7 de pageWindow + 11 de componente), review con 2 hallazgos bajos aplicados (@empty + selección por rol en tests), gate AA limpio, sin ADR (reutiliza ADR-011/012). Verificación manual del PO en playground OK (2026-07-20): ventana al navegar sin saltos de layout, hover/current en light y dark, y la compacta en `/pagination`
**Decisiones que aplica**: [D-005, D-007, D-011](../../decisiones.md)

---

**COMO** dev que renderiza listados largos de resultados
**QUIERO** un `ds-pagination` accesible
**PARA** navegar entre páginas de resultados sin construir la lógica de paginado visual a mano.

## Decisiones de refinamiento (PO, 2026-07-20)

1. **Modelo `page` + `totalPages`**: `[(page)]` two-way (1-based) + `totalPages` input. El componente solo navega — derivar páginas desde `pageSize`/`totalItems` es responsabilidad del consumidor (coherente con el fuera de alcance de datos). Se descartaron el modo derivado y el doble modo (más API y validación de combinaciones sin caso real).
2. **Ventana configurable con "…" estático**: primera y última página siempre visibles; `siblingCount` (vecinas de la actual, default 1) controla el medio; la elipsis es texto decorativo no interactivo (patrón MUI/Ant, sin foco ni anuncio).
3. **Variante compacta EN v1**: el PO acepta el alcance (prioriza el patrón completo, criterio de HU-012/013/014). `variant="compact"`: sin números, prev/next + saltos al extremo + contador "X de Y" accesible.
4. **First/last EN v1**: botones de salto al extremo (« ») además de prev/next (‹ ›). En la variante por números conviven como atajos; en la compacta son la única vía rápida a los extremos — les da el caso de uso.
5. **Disabled accesible en extremos sin re-decidir**: en la página 1, first/prev quedan por la rama "botón de acción" de [ADR-011](../../../architecture/adr/ADR-011-estado-disabled-accesible.md) (focusables + `aria-disabled` + guarda); ídem next/last en la última.

## Criterios de aceptación

<!-- Al implementar, estos CAs se vuelven scenarios del spec components-package (delta del change components-add-pagination). -->

- [x] **CA-015.1 (estructura accesible)** — Dado un `ds-pagination`, entonces el landmark es `<nav>` con nombre accesible configurable (default "paginación") y las páginas son botones con nombre accesible ("Página N"); la página actual expone `aria-current="page"`.
- [x] **CA-015.2 (modelo)** — Dado `[(page)]` (1-based) y `totalPages`, entonces la página actual se refleja en el render y todo cambio emitido por el componente está dentro de `[1, totalPages]`; un cambio programático del model actualiza el render.
- [x] **CA-015.3 (navegación)** — Dado un click en un número de página, prev (‹), next (›), first («) o last (»), entonces el model se actualiza a la página correspondiente; en la primera página first/prev quedan disabled accesibles (ADR-011: focusables, `aria-disabled="true"`, sin acción), ídem next/last en la última.
- [x] **CA-015.4 (ventana con elipsis)** — Dado `totalPages` grande, entonces siempre se muestran la primera, la última y las `siblingCount` vecinas de la actual (default 1), con "…" decorativo (no focusable, `aria-hidden`) en los huecos; dado un total que entra completo en la ventana, entonces no hay elipsis.
- [x] **CA-015.5 (variante compacta)** — Dado `variant="compact"`, entonces se renderizan solo first/prev/next/last y un contador "X de Y" (accesible como texto), sin botones de número; el modelo y los disabled de extremos se comportan igual que en la variante por números.
- [x] **CA-015.6 (labels configurables)** — Dado el default, entonces los nombres accesibles de nav/first/prev/next/last y el formato "Página N" están en español; dado inputs de labels, entonces el consumidor puede reemplazarlos (i18n).
- [x] **CA-015.7 (tokens)** — Dado el CSS del componente, entonces todo valor sale de tokens (`component.pagination.*` nuevos + primitives/semantic existentes) y los pares de contraste (número default/hover, actual, disabled) pasan el gate AA por script.
- [x] **CA-015.8 (showcase)** — Dado el playground, entonces el showcase (EP-006) incluye la página de `ds-pagination` con: básico, listado largo con elipsis y `siblingCount`, variante compacta, estado en extremos (disabled accesible) y nota de accesibilidad.

## Dependencias

- Ninguna bloqueante.

## Fuera de alcance

- Data fetching y estado de datos: el componente solo navega; los datos los maneja el consumidor.
- Infinite scroll / virtual scroll: otro patrón, no entra (D-005).
- Input "ir a página N" (jump box) y selector de `pageSize`: sin caso real (D-005); candidatos a change propio.

## Notas

- Change OpenSpec: `components-add-pagination` (próximo ID en [openspec/README.md](../../../../openspec/README.md)).
- Referencias de implementación: disabled accesible de `button/` (ADR-011); chevrons Lucide estáticos (ADR-012); ventana de páginas como `computed` puro (patrón `collapsedRange` de `breadcrumbs/`, aaa-027).

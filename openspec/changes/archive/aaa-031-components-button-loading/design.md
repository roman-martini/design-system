# Design — components-button-loading (aaa-031)

Decisiones técnicas del change. Muere al archivar; lo one-way door se promueve a ADR si aparece.

## Context

Estado `loading` de `DsButton`, separado de `ds-spinner` en el refinamiento de HU-009 (decisión 1) y refinado en HU-017 (PO 2026-07-22). El componente ya existe: hay que **extenderlo** sin tocar su API previa (variantes, sizes, `disabled`/`disabledReason`). El spinner embebido ya está resuelto (HU-009: `xs` + `currentColor` + `label=""` decorativo) y se consume por composición.

## Goals / Non-Goals

**Goals:**

- Input `loading` que muestre progreso embebido y bloquee la reactivación de forma accesible.
- Contenido configurable con un default seguro (cero layout shift, cero config) + opt-in `loadingText`.
- Coexistencia determinista con `disabled`/`disabledReason` (precedencia de `loading`).

**Non-Goals:**

- `loading` en otros componentes de acción (menú-item, tab) — cada uno con su disparador (D-005).
- Progreso determinado dentro del botón (`ds-progress`, HU-016).
- Prevención de submit nativo (`ds-button` es `type="button"`; se cubre si aparece un submit).

## Decisions

### 1. API pública: dos inputs aditivos

```ts
// DsButton (selector ds-button) — inputs nuevos
loading = input(false); // boolean
loadingText = input<string>(); // opcional; undefined = modo default (reemplazo)
```

- `loading` es la única API mínima obligatoria; `loadingText` es opt-in. Ningún input previo cambia (compatibilidad hacia atrás → changeset minor).
- Sin type nuevo en `public-api.ts` (`loadingText` es `string`).

### 2. Render: reemplazo con ancho congelado (default) vs. spinner + texto (opt-in)

- **Modo default** (`loading=true`, sin `loadingText`): el contenido original se mantiene en el DOM con `opacity: 0` (preserva el ancho intrínseco → **cero layout shift**, CA-017.4) y el `ds-spinner` (`xs`) se posiciona centrado sobre el botón. Se usa `opacity` y **no** `visibility: hidden`: este último sacaría el contenido del árbol de accesibilidad y el botón perdería su nombre accesible; con `opacity` el label sigue siendo el **nombre accesible**.
- **Modo `loadingText`**: el contenido original se reemplaza por `ds-spinner` (`xs`) + el texto; el botón se redimensiona al texto (comportamiento esperado de este modo, CA-017.5). `loadingText` pasa a ser el nombre accesible durante la carga.
- **Descartado** congelar el ancho también en modo `loadingText`: el texto de progreso suele ser más largo ("Guardar" → "Guardando…") y recortarlo/reservarlo empeora la legibilidad; el consumidor que elige `loadingText` acepta el resize.

### 3. Bloqueo: extender la guarda existente, no `disabled` nativo

- `DsButton` ya tiene una guarda de click para el patrón de `disabled` accesible (ADR-011). Se extiende: `if (loading() || <guarda disabled existente>) return;` cubriendo click y activación por teclado (Enter/Space).
- El botón conserva `type="button"` y **no** recibe `disabled` nativo mientras carga → permanece focuseable y anunciado (CA-017.2).
- **Feedback no interactivo**: mientras carga, `cursor: progress` y se suprime el hover/active de las variantes (`:not([data-loading])`) para que el estado se lea como ocupado y no como clickeable.

### 4. Anuncio: `aria-busy` en el host, spinner decorativo

- `[attr.aria-busy]="loading() ? 'true' : null"` en el `<button>`. Es el atributo semántico para "widget actualizándose"; se remueve al terminar (CA-017.3).
- El `ds-spinner` embebido va con `label=""` → decorativo (`aria-hidden`), reutilizando el opt-out de HU-009. Un solo anuncio, sin live region propia.

### 5. Precedencia `loading` > `disabled`

- `computed` de estado efectivo: si `loading()` es `true`, el botón **no** renderiza `disabledReason` y `aria-busy` manda; el `disabledReason` vuelve a mostrarse cuando `loading()` es `false` (CA-017.6).
- Racional: un botón cargando ya pasó el gate de habilitación; mostrar el motivo de "no disponible" mientras hay una operación en curso es contradictorio.

## Risks / Trade-offs

- [El contenido invisible por `opacity: 0` sigue en el árbol de accesibilidad] → es deliberado: preserva el nombre accesible del botón mientras `aria-busy` comunica el estado y el spinner es decorativo. Verificación real en playground con SR (límite jsdom).
- [Ancho congelado con contenido variable proyectado (íconos + texto largo)] → `opacity: 0` preserva el ancho de cualquier contenido proyectado; no asume solo texto.
- [Doble estado `loading` + `disabled` mal usado por el consumidor] → cubierto por contrato (CA-017.6, precedencia determinista) en vez de warning en runtime.

## Open Questions

(ninguna — el refinamiento de HU-017 cerró las tres decisiones de producto/comportamiento el 2026-07-22)

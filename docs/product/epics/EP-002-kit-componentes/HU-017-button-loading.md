---
epica: EP-002
actor: Dev consumidor
estado: Hecha (2026-07-22, aaa-031 components-button-loading; genera D-013)
decisiones: [D-005, D-007, D-013]
adrs: [ADR-011]
---

# HU-017 — Estado loading de ds-button (dev consumidor)

**COMO** dev que dispara una operación asíncrona desde un botón (submit, guardar, confirmar)
**QUIERO** un input `loading` en `DsButton` que muestre progreso y bloquee la reactivación
**PARA** comunicar "en curso" y evitar el doble submit sin cablear un spinner y un guardado manual en cada pantalla.

## Origen

Refinamiento de [HU-009 — Spinner](HU-009-spinner.md), decisión 1 (PO, 2026-07-19): el `ds-spinner` entró solo garantizando el caso embebido (`size xs` + `currentColor`); el estado `loading` de `ds-button` se separó a este item con disparador propio. Desbloqueado desde el cierre de `components-add-spinner` ([aaa-023](../../../../openspec/changes/archive/aaa-023-components-add-spinner/), 2026-07-19).

## Decisiones de refinamiento

<!-- Cerradas con el PO el 2026-07-22. Son de comportamiento local de ds-button: no ameritan D-XXX
     (no trascienden la HU) ni ADR (loading hoy solo lo adopta ds-button; ver Notas). -->

1. **Precedencia `loading` sobre `disabled`/`disabledReason`** (PO delegó en mejor práctica, 2026-07-22) — mientras `loading=true`, el botón bloquea la acción **por sí mismo** y **no** muestra `disabledReason`; al volver a `false`, `disabled`/`disabledReason` recuperan su comportamiento. Por qué: es el patrón de los DS profesionales — un botón cargando ya pasó el gate de habilitación, es un estado transitorio y debe comunicar un solo estado a la vez.

2. **Contenido durante la carga, configurable** (PO pidió configurable según el uso, 2026-07-22) — por **defecto** (sin config) el spinner **reemplaza el contenido** y el botón **congela su ancho** (cero layout shift, cero configuración, seguro). Input **opcional `loadingText`** para mostrar spinner + texto de progreso (ej. "Guardando…") cuando el caso lo pida; en ese modo el consumidor acepta que el botón se redimensione al texto. Por qué: un default robusto que garantiza la a11y/layout + un opt-in explícito, sin inflar la API.

3. **Anuncio con `aria-busy`** (PO, 2026-07-22) — `aria-busy="true"` en el `<button>` mientras carga; el spinner embebido es decorativo (`aria-hidden`, `label=""`, coherente con la decisión 4 de [HU-009](HU-009-spinner.md)). Por qué: atributo semánticamente correcto para "widget actualizándose", sin live region propia y sin doble anuncio con el nombre del botón.

## Criterios de aceptación

<!-- Binarios: sí/no sin interpretación. Al implementar se vuelven scenarios del spec
     components-package (delta del change components-button-loading). -->

- [x] **CA-017.1 (input loading)** — Dado `<ds-button [loading]="true">` (standalone, OnPush), cuando se renderiza, entonces embebe un `ds-spinner` (`size xs`, color por `currentColor`) sin que el consumidor lo componga a mano.
- [x] **CA-017.2 (bloqueo accesible)** — Dado `loading=true`, cuando el usuario hace click o presiona Enter/Space, entonces la acción no se dispara (guarda en el manejador) y el botón **permanece focuseable y anunciado** — no usa `disabled` nativo (coherente con el criterio de a11y de [ADR-011](../../../architecture/adr/ADR-011-estado-disabled-accesible.md)).
- [x] **CA-017.3 (aria-busy)** — Dado `loading=true`, entonces el `<button>` expone `aria-busy="true"` y el spinner es decorativo (`aria-hidden`, `label=""`); dado `loading=false`, `aria-busy` se remueve. No hay doble anuncio.
- [x] **CA-017.4 (default: reemplazo con ancho congelado)** — Dado `loading=true` **sin** `loadingText`, entonces el spinner reemplaza el contenido y el ancho del botón se mantiene estable en el ciclo `false → true → false` (cero layout shift); el label original persiste como nombre accesible.
- [x] **CA-017.5 (opt-in: loadingText)** — Dado `loading=true` **con** `loadingText`, entonces el botón muestra spinner + ese texto y lo usa como nombre accesible durante la carga; el redimensionamiento al texto es el comportamiento esperado de este modo.
- [x] **CA-017.6 (precedencia loading/disabled — caso de borde)** — Dado un botón con `loading=true` y `disabled=true`/`disabledReason` simultáneos, entonces `loading` gana: se bloquea la acción y **no** se muestra el `disabledReason`; al pasar `loading` a `false`, el estado `disabled`/motivo se restablece.
- [x] **CA-017.7 (tokens)** — Dado el CSS del estado loading, entonces todo valor sale de tokens (`component.spinner.*` existentes + primitives/semantic); al heredar `currentColor` no introduce pares de contraste nuevos.
- [x] **CA-017.8 (showcase)** — Dado el playground (EP-006), entonces la página de `DsButton` documenta el estado `loading` en sus dos modos (default y `loadingText`) y su interacción con `disabled`.

## Dependencias

- [HU-009 — Spinner](HU-009-spinner.md): **Hecha**. `ds-spinner` provee el caso embebido (`xs` + `currentColor` + `label=""` decorativo) que este estado consume.
- Ninguna otra bloqueante. El único gate de ejecución es el **disparador**: primer caso de uso real (playground o consumidor) que necesite bloquear un botón durante una operación async.

## Fuera de alcance

- Cambiar el patrón de disabled de `ds-button` o de los form controls ([ADR-011](../../../architecture/adr/ADR-011-estado-disabled-accesible.md) se respeta, no se toca).
- `loading` en otros componentes de acción (menú-item, tab): cada uno necesitaría su propio disparador (D-005) y recién ahí se evaluaría extraer un patrón compartido.
- Barra de progreso determinada dentro del botón: es `ds-progress` ([HU-016](HU-016-progress.md)), no este estado.
- Prevención de submit nativo: `ds-button` es `type="button"` (irrelevante hoy, igual que en ADR-011); si aparece un submit, se cubre con la guarda + no propagar y se documenta en su momento.

## Notas

- **Cierre (2026-07-22)** — change [`aaa-031`](../../../../openspec/changes/archive/aaa-031-components-button-loading/) archivado. 9 tests de comportamiento, `/ng:review` sin altas ni medias (1 baja corregida), y refinamiento visual del botón base ([D-013](../../decisiones.md)). Verificación visual del PO en playground OK (2026-07-22). **Ejecución adelantada al disparador orgánico por decisión del PO** — el caso de uso real no llegó a activarse (ver proposal §Why).
- Change OpenSpec tentativo: `components-button-loading`. Feature aditiva (`loading` + `loadingText` opcional; `disabled`/`disabledReason` se mantienen) → changeset **minor**.
- Referencias de implementación: caso embebido de [HU-009](HU-009-spinner.md) (spinner `xs` + `currentColor` + `label=""`); guarda de click del patrón de [ADR-011](../../../architecture/adr/ADR-011-estado-disabled-accesible.md).
- **Sin ADR nuevo**: `loading` hoy solo lo adopta `ds-button`. Por la misma lógica de ADR-011 ("sin primitiva compartida hasta el segundo consumidor"), un patrón transversal de loading se extraería —y se decidiría por ADR— recién si un segundo componente de acción lo adopta.

# Tasks — aaa-022 — Showcase navegable del playground

Cada tarea es ≤2 h con criterio binario. Diseño: registro único (design.md §1), shell (§2), vistas + ShowcaseCase (§3), snippets con clipboard (§4), tests (§5), done futuro (§6).

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan.
- [x] 1.2 Confirmar compatibilidad zoneless + `provideRouter`: verificada de facto — build y tests de navegación verdes con la config real. Nota: hubo que agregar `@angular/router` a las deps del playground (no estaba declarada).

**Criterio**: baseline verde; router arranca en zoneless.

## 2. Shell + routing

- [x] 2.1 `showcase/registry.ts` (§1): `ShowcaseEntry` + `SHOWCASE_ENTRIES` con las 11 entradas (slug, label, import lazy).
- [x] 2.2 `app.routes.ts` generado desde el registro + redirect de `''` y `'**'` a la primera entrada; `app.config.ts` con `provideRouter(routes)` (zoneless intacto).
- [x] 2.3 Shell en `App` (§2): header + `<nav aria-label>` iterando el registro (`routerLink`, `routerLinkActive`, `ariaCurrentWhenActive`) + `<main><router-outlet /></main>`; CSS Grid tokenizado con colapso simple en angosto.

**Criterio**: `pnpm -F playground start` navega entre 11 placeholders por sidebar y por URL directa.

## 3. Componente de caso de uso

- [x] 3.1 `showcase/ui/showcase-case.ts` (§3): inputs `title`/`snippet`, slot de demo, `<pre><code>` tokenizado y botón copiar (`ds-button` ghost sm con label visible "Copiar código" — nombre accesible sin aria extra).
- [x] 3.2 Copiar al clipboard (§4): `navigator.clipboard.writeText` con guard para entornos sin clipboard + feedback `DsToastService.success('Snippet copiado')`.

**Criterio**: un caso demo copia su snippet y anuncia el feedback por toast.

## 4. Migración de vistas (11)

- [x] 4.1 Vistas de formularios: `button`, `checkbox`, `radio`, `radio-group`, `select`, `input` — demos actuales migradas 1:1 con estado propio + snippets por caso.
- [x] 4.2 Vistas de overlays y navegación: `modal`, `tabs`, `tooltip`, `toast` (incluye el disparador de toast dentro del modal para la verificación de top layer) — ídem.
- [x] 4.3 Vista `iconography` (demo ADR-012) + eliminación de la página monolítica (`app.html` queda como shell puro; el estado demo salió de `App`; utilidades `.playground__*` movidas a `styles.css` global).

**Criterio**: los casos de uso previos funcionan igual, cada uno con snippet; el template monolítico no existe (CA-011.5).

## 5. Tests de navegación

- [x] 5.1 `app.spec.ts` reescrito al shell + navegación (§5): render por ruta (button, select vía `RouterTestingHarness`), redirect de `''` y de ruta desconocida, sidebar con 11 links y `aria-current` en el activo — 6 tests.
- [x] 5.2 Test de `ShowcaseCase`: título/demo/snippet, copiar invoca clipboard + toast de feedback, no-op sin Clipboard API — 3 tests.
- [x] 5.3 `pnpm -F playground test` (9/9) y `pnpm -F playground build` verdes; `pnpm -F playground build-storybook` sigue verde.

**Criterio**: cada scenario del delta cubierto; suites verdes.

## 6. Validación de cierre

- [x] 6.1 `pnpm openspec validate playground-showcase --strict`, `pnpm lint`, `pnpm format:check` pasan.
- [x] 6.2 `pnpm -r build` y `pnpm -r test` pasan (11 + 138 + 9).
- [x] 6.3 Auditoría **`/ng:review`** sobre `apps/playground/src/app/` — 0 altas, 1 media y 3 bajas, **todas aplicadas**: foco al `<main>` tras `NavigationEnd` (salteando la carga inicial), `handleClick` → `logDemoClick`, queries de tests por rol/contenido en vez de tags/clases CSS. Re-verificado: build + 9/9 + lint + format verdes.
- [x] 6.4 **Sin changeset** (app privada, nada publicable) — `.changeset/` solo conserva `add-toast.md` (de aaa-021, pendiente del release 0.3.0), nada de este change.
- [ ] 6.5 Verificación visual del PO: `pnpm -F playground start` — sidebar, deep links, snippets y copiar.
- [ ] 6.6 Proponer mensaje de commit (implementación) y esperar OK del usuario.

**Criterio**: automáticos verdes; gate resuelto; visual aprobado; aprobación explícita antes del commit.

## 7. Archive

- [x] 7.1 Actualizar la skill `/ds:add-component`: paso 6 ahora exige la vista `<slug>-showcase` + entrada en `SHOWCASE_ENTRIES` (§6).
- [x] 7.2 Mover a `archive/aaa-022-playground-showcase/`; frontmatter `archived`; sincronizar spec base `playground-app` (2 REMOVED + 1 ADDED + Purpose actualizado, texto autocontenido).
- [x] 7.3 Registros: `openspec/README.md` (próximo ID ya en `aaa-023`), catálogo, grooming del BACKLOG (showcase sale de Now; Spinner queda como único Now), HU-011 → Hecha con CAs tildados, EP-006 → En desarrollo (primera HU entregada).
- [x] 7.4 `pnpm openspec validate --all` pasa.
- [x] 7.5 Commits al final de todo el trabajo (regla del PO 2026-07-18): secuencia propuesta junto con la verificación visual pendiente (6.5).

**Criterio**: change archivado, spec base sincronizada, registros al día.

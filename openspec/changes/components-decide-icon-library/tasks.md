# Tasks — aaa-013 — Adopción de Lucide como iconografía del DS

Cada tarea es ≤2 h y tiene criterio de aceptación binario. Scope de código: **solo `apps/playground`** (design.md §1: `packages/components` no se toca hasta Modal).

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan.
- [x] 1.2 Instalar `@lucide/angular` en `apps/playground` (`pnpm -F playground add @lucide/angular`); verificar que la versión resuelta soporta Angular 21 (requiere 17+).

**Criterio**: dependencia instalada con caret en `apps/playground/package.json`; lockfile actualizado; `packages/*` intactos.

## 2. Demo de integración en el playground

- [x] 2.1 Agregar sección "Iconografía" en `app.html`: `LucideX` y `LucideChevronDown` a `size="16"` / `strokeWidth="1.5"`, uno heredando color de un token vía `currentColor`.
- [x] 2.2 Incluir el patrón semántico: un botón cuyo único contenido es la X, con `aria-label="Cerrar"` y el svg `aria-hidden="true"`.
- [x] 2.3 Importar los componentes de icono en `app.ts` (array `imports`).
- [x] 2.4 `pnpm -F playground build` y `pnpm -F playground test` pasan; verificación visual breve de la sección.

**Criterio**: demo renderiza los 2 iconos con el estilo del DS; suite del playground verde.

## 3. ADR-012 + registros

- [x] 3.1 Crear `docs/architecture/adr/ADR-012-iconografia-lucide.md` (MADR): opciones Lucide / Heroicons / Feather / custom+package propio; decisión Lucide con criterios (package Angular oficial standalone/signals/zoneless, estilo = research, activo/ISC, criterio ADR-003); **criterio de activación explícito** para migrar a `@romanmartinidev/icons` en el futuro; convención peer-al-primer-uso. Estado `Aceptado` al cierre.
- [x] 3.2 Fila en `docs/architecture/decisions-log.md`.
- [x] 3.3 Sin changeset (design.md §1: ningún package publicable cambia).

**Criterio**: ADR-012 existe y linkeado; decisions-log al día; `.changeset/` sin entradas nuevas.

## 4. Validación de cierre

- [x] 4.1 `pnpm openspec validate components-decide-icon-library --strict` pasa.
- [x] 4.2 `pnpm lint` y `pnpm format:check` pasan.
- [x] 4.3 `pnpm -r build` y `pnpm -r test` pasan.
- [x] 4.4 `packages/components/package.json` y `packages/tokens/package.json` sin diffs (verificación del scope).
- [ ] 4.5 Proponer mensaje de commit y esperar OK del usuario.

**Criterio**: automáticos verdes; scope respetado; aprobación explícita antes del commit.

## 5. Archivar el change

- [ ] 5.1 Mover a `openspec/changes/archive/aaa-013-components-decide-icon-library/`; frontmatter `status: archived` + fecha.
- [ ] 5.2 Sincronizar spec base `components-package` con el Requirement ADDED (convención de iconografía).
- [ ] 5.3 Actualizar `openspec/README.md`, catálogo de changes en `docs/architecture/README.md`, y `BACKLOG.md` (item icon-library sale; desbloquea `components-add-modal`).
- [ ] 5.4 `pnpm openspec validate --all` pasa.
- [ ] 5.5 Proponer commit del archive y esperar OK.

**Criterio**: change archivado, spec base sincronizada, Modal desbloqueado en el backlog.

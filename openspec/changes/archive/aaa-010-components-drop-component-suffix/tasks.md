# Tasks — aaa-010 — Drop del sufijo `.component` en file naming

Cada tarea es ≤2 h y tiene criterio de aceptación binario. Orden según design.md §2: por componente, con suite verde en cada paso. Todos los renames con `git mv` (design.md §1).

## 1. Pre-flight

- [x] 1.1 Confirmar suite verde de partida: `pnpm -r build` y `pnpm -r test` pasan. → 60/60 tests (tokens 11, components 45, playground 4).
- [x] 1.2 Confirmar que no hay deep imports externos al path `.component`: único hit `fixture.componentInstance` (API TestBed, no path). ✓
- [x] 1.3 Confirmar que configs (Vitest/Storybook/ng-packagr, raíz y por package) no referencian paths `.component` explícitos (los globs por extensión `*.spec.ts` / `*.stories.ts` no cuentan). ✓

**Criterio**: tres confirmaciones documentadas; nada modificado todavía.

## 2. Migrar `button`

- [x] 2.1 `git mv` de los 4 archivos: `button.component.{ts,html,css,spec.ts}` → `button.{ts,html,css,spec.ts}`.
- [x] 2.2 En `button.ts`: actualizar `templateUrl: './button.html'` y `styleUrl: './button.css'`.
- [x] 2.3 Actualizar imports: `index.ts`, `button.spec.ts`, `button.stories.ts` (`'./button.component'` → `'./button'`).
- [x] 2.4 `pnpm -F @romanmartinidev/components test` pasa. → 45/45.

**Criterio**: carpeta `button/` sin archivos `*.component.*`; tests verdes.

## 3. Migrar `checkbox`

- [x] 3.1 `git mv` de los 4 archivos a `checkbox.{ts,html,css,spec.ts}`.
- [x] 3.2 Actualizar `templateUrl`/`styleUrl` en `checkbox.ts`.
- [x] 3.3 Actualizar imports: `index.ts`, `checkbox.spec.ts`, `checkbox.stories.ts`.
- [x] 3.4 `pnpm -F @romanmartinidev/components test` pasa. → 45/45.

**Criterio**: ídem button.

## 4. Migrar `radio-group` y `radio`

- [x] 4.1 `git mv` de los 4 archivos de `radio-group` a `radio-group.{ts,html,css,spec.ts}`; actualizar `templateUrl`/`styleUrl`, `index.ts`, `radio-group.stories.ts`.
- [x] 4.2 `git mv` de los 4 archivos de `radio` a `radio.{ts,html,css,spec.ts}`; actualizar `templateUrl`/`styleUrl`, `index.ts`, `radio.spec.ts`, `radio.stories.ts`.
- [x] 4.3 Actualizar el import cruzado en `radio-group.spec.ts`: `'../radio/radio.component'` → `'../radio/radio'` (y `'./radio-group.component'` → `'./radio-group'`).
- [x] 4.4 Revisar cualquier otro import entre radio ↔ radio-group → encontrados y corregidos: `radio.ts` → `'../radio-group/radio-group'` y `radio-group.stories.ts` → `'../radio/radio'`.
- [x] 4.5 `pnpm -F @romanmartinidev/components test` pasa. → 45/45.

**Criterio**: cero archivos `*.component.*` en `packages/components/src/`; tests verdes.

## 5. Verificación integral del monorepo

- [x] 5.1 `grep -rn "\.component\." packages/ apps/ --include="*.ts" --include="*.html" --include="*.json"` devuelve vacío (excluyendo `node_modules` y `dist`). ✓
- [x] 5.2 `pnpm -r build` pasa (tokens + components + playground). ✓
- [x] 5.3 `pnpm -r test` pasa completo. → 60/60 (11+45+4).
- [x] 5.4 Stories verificadas vía `pnpm -F playground build-storybook` (build completo exitoso — equivalente no interactivo).
- [x] 5.5 `npm pack --dry-run` desde `packages/components/`: tarball con 6 archivos, FESM2022 con mismo nombre público, sin `*.stories.ts`/`*.spec.ts`. ✓

**Criterio**: los 5 puntos pasan sin residuos `.component`.

## 6. Sincronizar docs y config (design.md §4)

- [x] 6.1 `openspec/config.yaml`: _"Folder y file kebab-case (`button/`, `button.component.ts`)"_ → `button.ts`.
- [x] 6.2 `docs/architecture/README.md`: árbol de estructura (líneas `<name>.component.*`), ejemplo `styleUrl` y fila "Archivo" de la tabla de naming → patrón sin sufijo.
- [x] 6.3 `.claude/knowledge/ng-stack-profile.md`: reemplazar la excepción de nomenclatura por la convención moderna (`<nombre>.ts` sin sufijo, alineado con style-guide).
- [x] 6.4 `docs/architecture/FUTURE-WORK.md`: sección "Nomenclatura de archivos de componente" marcada ✅ resuelta con referencia a aaa-010/ADR-010.
- [x] 6.5 README del package components: sin menciones de `.component.ts` (verificado, nada que actualizar).

**Criterio**: `grep -rn "component\.ts" docs/ openspec/config.yaml .claude/knowledge/` sin menciones que prescriban el sufijo (referencias históricas en ADRs/archive quedan intactas — son inmutables).

## 7. ADR + changeset

- [x] 7.1 Crear **ADR-010** "Convención de file naming sin sufijo `.component`" (formato MADR): resuelve la open question de ADR-007, evoluciona su fila "Folder y file naming"; opciones = status quo / sin sufijo (+ref a Opción C descartada). Estado `Aceptado` al cierre del change.
- [x] 7.2 Agregar fila en `docs/architecture/decisions-log.md`.
- [x] 7.3 Crear `.changeset/drop-component-suffix.md` con bump **patch** de `@romanmartinidev/components` (design.md §5):

  ```
  ---
  '@romanmartinidev/components': patch
  ---

  refactor: rename internal component files to Angular v20+ style (`button.ts` instead of `button.component.ts`). No public API changes — consumers import from the package barrel.
  ```

**Criterio**: ADR-010 existe y linkeado; changeset con bump patch.

## 8. Validación de cierre

- [x] 8.1 `pnpm openspec validate --changes` pasa para `components-drop-component-suffix`. ✓ (strict)
- [x] 8.2 `pnpm lint` y `pnpm format:check` pasan. ✓ (4 archivos formateados con Prettier)
- [x] 8.3 `pnpm -r build` y `pnpm -r test` pasan. → 3 builds Done, 60/60 tests.
- [x] 8.4 Diff revisado con renames detectados (`git diff --cached --find-renames --stat`): 16 renames `R` limpios + ediciones de imports/URLs, sin deletes+adds espurios.
- [x] 8.5 Proponer mensaje de commit y esperar OK del usuario. → aprobado, commit de implementación hecho.

**Criterio**: todo verde; aprobación explícita antes del commit.

## 9. Archivar el change

- [x] 9.1 Mover `openspec/changes/components-drop-component-suffix/` → `openspec/changes/archive/aaa-010-components-drop-component-suffix/`.
- [x] 9.2 Sincronizar las specs base con los deltas MODIFIED: `components-package` (10 requirements) y `playground-app` (3 requirements).
- [x] 9.3 Actualizar frontmatter del proposal: `status: archived` + fecha.
- [x] 9.4 Actualizar `openspec/README.md` (nota de aaa-010 archivado) y catálogo de changes en `docs/architecture/README.md` (fila aaa-010 con ADR-010).
- [x] 9.5 `pnpm openspec validate --all` pasa (specs 5/5 y tokens-figma-export ✓; único fallo: aaa-011, preexistente — aún sin deltas).
- [ ] 9.6 Proponer mensaje del commit del archive y esperar OK del usuario.

**Criterio**: change archivado, specs base sincronizadas, openspec valida, commit aprobado.

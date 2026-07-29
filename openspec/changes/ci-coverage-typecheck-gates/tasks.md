# Tasks — aaa-040 — Gates de coverage y typecheck

Cada tarea es ≤2 h con criterio binario. Diseño: coverage (design D1–D4), typecheck (D5), errores preexistentes (D6), pipeline (D7), scripts (D8).

Orden: primero se arreglan los 12 errores que el gate va a exponer (§2 y §3), después se instalan los gates (§4 y §5), y recién ahí se cablea CI (§6). Instalar el gate antes de arreglar dejaría el repo rojo entre tareas.

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm -r build`, `pnpm -r test`, `pnpm lint`, `pnpm format:check` y `pnpm verify:packaging` pasan.
- [x] 1.2 Medir la cobertura real de los tres workspaces y registrar el número en `design.md` (hecho: tabla de §Context).
- [x] 1.3 Medir el estado real del typecheck en los tres workspaces y registrar los errores encontrados (hecho: 8 en components, 4 en tokens, playground limpio).
- [x] 1.4 `@vitest/coverage-v8@4.1.7` como devDependency de los tres workspaces, pinneado a la versión exacta de `vitest` resuelta en el lockfile (design §Risks).
- [x] 1.5 `typescript@~5.9` como devDependency de `packages/tokens`, que no lo tenía pese a tener specs en `.ts`.

**Criterio**: suite verde; cobertura y errores de tipos medidos y documentados; deps instaladas sin unmet peers nuevos.

## 2. Configuración de typecheck por workspace (design D5)

- [x] 2.1 `packages/components/tsconfig.spec.json`: quitar `"node"` de `types` — no está instalado (rompe con TS2688) y ningún spec ni story usa APIs de Node. Verificado por grep sobre `src/` y `router/`.
- [x] 2.2 `packages/tokens/tsconfig.json` **nuevo**: `strict`, `noEmit`, `resolveJsonModule: true` (sus specs importan JSON con import attributes), `types: ["vitest/globals"]`, `include: ["test/**/*.ts"]`.
- [x] 2.3 Confirmar que `apps/playground` no necesita configuración nueva: `tsconfig.spec.json` y `.storybook/tsconfig.json` ya existen y ya pasan.

**Criterio**: los cuatro tsconfig de typecheck (components, tokens, playground spec, playground storybook) son ejecutables con `tsc --noEmit` sin error de configuración.

## 3. Arreglar los 12 errores de tipos preexistentes (design D6)

- [x] 3.1 `packages/components`: 8 errores por pasar type arguments a llamadas sobre `fixture.nativeElement`, que es `any` (TS2347 y sus TS2322/TS18046 derivados) en `src/lib/menu/menu.spec.ts`, `src/lib/pagination/pagination.spec.ts` y `router/src/breadcrumbs-router.spec.ts`. Tipar el acceso al elemento nativo **sin cambiar la lógica ni las aserciones** del test.
- [x] 3.2 `packages/tokens`: 4 errores TS7053 en `test/z-index.spec.ts` por indexar con `string` un objeto JSON de claves literales. Tipar el acceso.
- [x] 3.3 Re-correr los tests de ambos packages: **la misma cantidad de tests pasando que antes del arreglo** (316 en components, 11 en tokens). Un test que cambia de resultado significa que se tocó la lógica.

**Criterio**: `tsc --noEmit` sale 0 en los cuatro tsconfig y la suite sigue en 316 + 11 + 9 tests verdes.

> Si aparece un error que exige tocar `src/lib` de un componente publicado, **detenerse y consultar al PO** antes de modificarlo (design §Risks).

## 4. Bloque de coverage en los tres vitest.config (design D1–D4)

- [x] 4.1 `packages/components/vitest.config.ts`: provider `v8`, reporters `text` + `lcov`, `include` acotado a `src/**/*.ts` y `router/src/**/*.ts`, `exclude` de specs, stories y `test-setup.ts`; thresholds **statements 93 / branches 76 / functions 96 / lines 93**.
- [x] 4.2 `apps/playground/vitest.config.ts`: mismo provider y reporters; thresholds **statements 23 / branches 49 / functions 17 / lines 25**, documentados en el propio archivo como piso de no-regresión de un laboratorio interno, no como vara de calidad.
- [x] 4.3 `packages/tokens/vitest.config.ts`: provider y reporters, **sin thresholds**, con un comentario que explique por qué (no hay código instrumentable; el contrato de tokens se verifica sobre el artefacto emitido — design D2).
- [x] 4.4 Agregar el directorio de salida de coverage al `.gitignore`.
- [x] 4.5 Verificar el gate en los dos sentidos: (a) `pnpm -r test:coverage` pasa tal como está el repo; (b) bajando temporalmente la cobertura —comentando un test— el step **falla** con exit code distinto de 0. Revertir la prueba.

**Criterio**: el gate pasa con el repo actual y falla cuando la cobertura baja. Probado, no asumido.

## 5. Scripts uniformes (design D8)

- [x] 5.1 En los tres workspaces: `test` → `vitest run`, `test:watch` → `vitest`, `test:coverage` → `vitest run --coverage`.
- [x] 5.2 Script `typecheck` por workspace: `tsc -p <tsconfig> --noEmit`; en `playground` encadena sus dos configuraciones (spec y storybook).
- [x] 5.3 Root: `typecheck` y `test:coverage` recursivos.
- [x] 5.4 Verificar en una terminal interactiva que `pnpm test` del root **termina** en vez de quedar en watch — es el defecto de `testing-06`.

**Criterio**: los cuatro scripts existen en los tres workspaces con la misma semántica y `pnpm test` del root retorna control.

## 6. Cablear los gates en `pr.yml` (design D7)

- [x] 6.1 Step `Typecheck` con `pnpm typecheck`, ubicado **antes** de `Build (recursive)`.
- [x] 6.2 El step `Test (recursive)` pasa a correr con cobertura (`pnpm -r test:coverage`), en el mismo lugar que ocupa hoy — no se agrega un step aparte que corra la suite dos veces.
- [x] 6.3 Verificar el YAML con `actionlint` (mismo binario y versión que usa el propio workflow).
- [x] 6.4 Confirmar que la corrida completa entra en el `timeout-minutes: 15` del job: medir el tiempo local de `typecheck` + `test:coverage` y dejarlo anotado.

**Criterio**: `actionlint` limpio y los dos steps declarados como bloqueantes.

## 7. Documentación

- [x] 7.1 `CONTRIBUTING.md`: política de coverage (los umbrales vigentes, el trinquete —solo suben, bajarlos requiere decisión del PO— y cómo correrlo local).
- [x] 7.2 `CONTRIBUTING.md`: comando de typecheck y la nota de que **las stories de components se typechequean desde el playground** vía `.storybook/tsconfig.json` (design D5), para que no sorprenda.
- [x] 7.3 Registrar en `design.md` el número final de cobertura tras los arreglos del §3, si cambió respecto de la medición inicial.

**Criterio**: un colaborador nuevo puede reproducir ambos gates leyendo solo `CONTRIBUTING.md`.

## 8. Cierre

- [x] 8.1 Suite completa verde: `pnpm typecheck`, `pnpm -r build`, `pnpm -r test:coverage`, `pnpm lint`, `pnpm format:check`, `pnpm verify:packaging`, `pnpm exec openspec validate --all`.
- [x] 8.2 Agregar changeset `patch` para ambos packages: el change toca `packages/*/package.json` y dispara el enforcement de `pr.yml`, aunque no altera el artefacto publicado.
- [x] 8.3 Actualizar `openspec/README.md`: próximo ID disponible y lista de IDs en vuelo.
- [x] 8.4 Marcar el avance de la Parte F en `docs/backlog/BACKLOG.md` y anotar que HU-026 queda entregada.
- [ ] 8.5 Proponer el mensaje de commit y **esperar el OK del PO** antes de commitear.

**Criterio**: repo verde, artefactos de gobernanza actualizados, commit propuesto y no ejecutado sin OK.

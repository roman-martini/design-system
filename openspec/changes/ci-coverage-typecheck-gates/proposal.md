---
id: aaa-040
name: ci-coverage-typecheck-gates
type: change
status: proposed
modifies-specs:
  - ci-cd-pipeline
  - monorepo-structure
related-decisions:
  - D-021
  - D-017
---

# Proposal — ci-coverage-typecheck-gates

# Why

**El repo publica dos librerías en npm sin saber qué porción de su código está cubierta por tests, y sin typechequear los archivos que el build de la lib excluye por diseño.** Son dos agujeros del mismo tipo: contratos que el repo declara importantes pero que ningún gate automático verifica.

1. **Cero coverage.** Los tres `vitest.config.ts` (components, tokens, playground) definen solo `globals`/`environment`/`setupFiles`/`include`; no hay bloque `coverage`, ni `@vitest/coverage-v8` en ninguna devDependency, y `pr.yml` corre `pnpm -r test` sin recolectar nada. Hoy nadie sabe qué porcentaje del kit está cubierto, y un componente nuevo con tests superficiales pasa CI igual que uno bien cubierto [testing-02, ci-cd-08]. Con 22 componentes entregados y 29 archivos de spec, el kit ya es lo bastante grande como para perder cobertura en silencio.

2. **Specs y stories nunca se typechequean.** `tsconfig.lib.json` excluye `*.spec.ts` y `*.stories.ts` del build — correcto para APF—, pero ningún paso compensa: `@analogjs/vite-plugin-angular` transpila sin typecheck, no existe script `typecheck` en ningún `package.json`, y `pr.yml` no corre `tsc --noEmit` en ninguna forma. Un rename de input de componente deja **22 stories** y **29 specs** potencialmente rotas en tipos y CI sale verde [tooling-repo-06]. Las stories son además la documentación viva del DS.

3. **El comando documentado no se comporta igual en local que en CI.** `components` y `playground` declaran `"test": "vitest"` (watch por default en TTY) mientras `tokens` declara `"test": "vitest run"`. `pnpm test` del root — comando esencial según `CLAUDE.md` — queda colgado en watch al llegar a components [testing-06].

Es la **Parte F** de la review integral 2026-07-26 (`docs/reviews/2026-07-26-review-integral/plan-de-accion.md`), ítems 1, 6 y 10, y entrega **HU-026** (EP-005). El PO aprobó la ampliación de EP-005 a "todos los gates de calidad, con una HU por gate y criterios binarios" en [D-021].

**Prioridad que lo respalda**: la **1 (buenas prácticas)** en primer lugar — coverage con piso y typecheck completo son práctica base de librerías publicadas —, y la **2 (escalar ordenado)**: el gate escala solo, cada componente nuevo entra con la vara puesta sin depender de la disciplina del reviewer. [D-017] refuerza el criterio: se elige el patrón robusto aunque cueste más.

## Revalidación de hallazgos (2026-07-29)

La regla 3 del plan exige revalidar contra el repo los hallazgos sin verificación adversarial. `tooling-repo-06` estaba en esa condición:

- **Confirmado** en lo esencial: no existe script `typecheck` en ningún `package.json`, ni step de typecheck en `pr.yml`.
- **Corregido un detalle de su recomendación**: el hallazgo pide "en components sumar un tsconfig que incluya `*.stories.ts`". No hace falta — `packages/components/tsconfig.spec.json` ya declara `include: ["src/**/*.ts", "router/src/**/*.ts"]` con `exclude: []`, de modo que **ya cubre specs y stories**. El gap es que nada lo ejecuta, no que falte configuración.
- **Gap adicional detectado**: `packages/tokens` **no tiene ningún `tsconfig.json`** — sus specs se transpilan sin typecheck y sin configuración de tipos. Ese package necesita un tsconfig nuevo, no solo un script.

# What Changes

- **Coverage con provider `v8` y thresholds bloqueantes** en los tres `vitest.config.ts` [testing-02, ci-cd-08]. Reporters aptos para consola y para máquina (`text` + `lcov`). Los umbrales se fijan **midiendo la cobertura real al implementar**, no en un número aspiracional — es lo que exige la decisión de refinamiento 2 de HU-026 y lo que recomiendan ambos hallazgos. El valor medido queda documentado en `design.md` de este change.
- **El piso es un trinquete**: una vez fijado, el umbral solo sube; bajarlo requiere decisión explícita del PO (decisión de refinamiento 3 de HU-026). Se documenta en `CONTRIBUTING.md`.
- **Script `typecheck` por workspace** [tooling-repo-06]: `tsc --noEmit` sobre el tsconfig que cubre specs y stories en cada package/app, más un `typecheck` recursivo en el root. Incluye un **`tsconfig.json` nuevo para `packages/tokens`**, que hoy no tiene ninguno.
- **Scripts de test unificados** [testing-06]: `"test": "vitest run"` y `"test:watch": "vitest"` en los tres workspaces, más `test:coverage`. Cierra la divergencia local ↔ CI del comando documentado en `CLAUDE.md`.
- **Dos steps nuevos y bloqueantes en `pr.yml`**: typecheck (antes del build, para que un error de tipos falle rápido y con mensaje claro) y tests con cobertura (reemplaza al `pnpm -r test` actual). Ambos fallan el PR, no advierten.
- **`CONTRIBUTING.md`** documenta la política de coverage (piso, trinquete, cómo correrlo local) y el comando de typecheck.

No hay cambio de API pública ni de output publicado: este change **no toca `packages/*/src`**, solo configuración de test, tsconfigs, scripts y workflow. No requiere changeset (el enforcement de `pr.yml` solo exige changeset ante cambios bajo `packages/` que no sean README/CHANGELOG — este change sí toca `packages/*/package.json` y `vitest.config.ts`, con lo que **el changeset será necesario**; se agrega como `patch` por ser tooling sin efecto en el artefacto publicado).

## Alternativas evaluadas

| Opción                                                               | Por qué se descarta                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Thresholds aspiracionales (80/80/80 desde el día uno)**            | Con la cobertura real sin medir, fijar 80% puede dejar el pipeline rojo desde el merge y forzar a bajarlo — exactamente lo contrario del trinquete. `ci-cd-08` insiste en medir primero. Se descarta a favor de arrancar en el nivel medido.                                                                   |
| **Coverage sin thresholds, solo reporte**                            | Un reporte que nadie mira no es un gate: la cobertura seguiría cayendo en silencio, que es el problema que origina el hallazgo. Contradice CA-026.3 de HU-026 ("no alcanza con emitir una advertencia").                                                                                                       |
| **Publicar coverage en Codecov/Coveralls con badge**                 | Declarado **fuera de alcance** por HU-026. Suma un servicio externo y un secret más al pipeline para un beneficio de visibilidad, no de enforcement. Puede evaluarse después con su propio disparador.                                                                                                         |
| **Typecheck vía `ng build` del playground en vez de `tsc --noEmit`** | El build del playground no incluye specs ni stories — es el mismo agujero, movido de lugar. Solo `tsc --noEmit` sobre un tsconfig que las incluya cierra el gap.                                                                                                                                               |
| **Un único `tsconfig` raíz con project references**                  | Más elegante en teoría, pero reordena la configuración TypeScript de los tres workspaces a la vez y arrastra decisiones de strictness que la **Parte N** del plan ya tiene asignadas (endurecer TS con su propio change). Se descarta por scope: este change instala el gate sobre la configuración existente. |

Este change toca los tres workspaces pero **no es one-way door** (todo es configuración reversible) y no introduce un patrón arquitectónico nuevo: no genera ADR. La política de coverage se documenta en `CONTRIBUTING.md` y el contrato queda en la spec.

# Capabilities

## New Capabilities

Ninguna.

## Modified Capabilities

- `ci-cd-pipeline`: el requirement de validación en cada PR suma **typecheck** y **tests con cobertura** como steps obligatorios y bloqueantes; se agrega un requirement nuevo de **gate de cobertura con umbral** (falla bajo el piso, el piso solo sube) y otro de **typecheck de specs y stories** en CI.
- `monorepo-structure`: se agrega un requirement de **scripts uniformes por workspace** (`test`, `test:watch`, `test:coverage`, `typecheck`) con semántica idéntica en los tres, y su agregación recursiva desde el root.

# Impact

**Código y configuración**

- `packages/tokens/vitest.config.ts`, `packages/components/vitest.config.ts`, `apps/playground/vitest.config.ts` — bloque `coverage`.
- `packages/tokens/package.json`, `packages/components/package.json`, `apps/playground/package.json` — scripts `test`, `test:watch`, `test:coverage`, `typecheck`; devDependency `@vitest/coverage-v8`.
- `package.json` (root) — scripts `typecheck` y `test:coverage` recursivos.
- `packages/tokens/tsconfig.json` — **archivo nuevo**.
- `.github/workflows/pr.yml` — dos steps nuevos; el step `Test (recursive)` pasa a correr con cobertura.
- `CONTRIBUTING.md` — política de coverage y typecheck.
- `.gitignore` — directorio de salida de coverage.

**Riesgos**

- El typecheck puede **descubrir errores de tipos preexistentes** en specs o stories (es su razón de ser). Si aparecen, se arreglan en este mismo change: entregar el gate desactivado o con excepciones contradice [D-017].
- Medir cobertura sobre `components` corre los 29 specs con instrumentación v8, lo que alarga el step de CI. Se acota configurando `coverage.include` a los sources reales del package, no a toda la carpeta.

**Sin impacto en**: la API pública de ambos packages, el contenido de los tarballs publicados, y el gate de publish de [ADR-022].

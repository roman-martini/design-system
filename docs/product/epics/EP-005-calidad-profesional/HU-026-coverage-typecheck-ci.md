---
epica: EP-005
actor: Mantenedor
estado: Refinada (2026-07-26)
decisiones: [D-021, D-002, D-017]
---

# HU-026 — Coverage con thresholds y typecheck en CI (mantenedor)

**COMO** mantenedor de dos librerías publicadas en npm
**QUIERO** que CI mida la cobertura con un piso que falle el build y que typechequee lo que el build de la lib excluye (specs y stories)
**PARA** que el kit no pueda perder cobertura ni divergir de su propia API en silencio a medida que crece.

## Decisiones de refinamiento (PO, 2026-07-26)

1. **Un solo gate, dos verificaciones** — coverage y typecheck se refinan juntos porque comparten el mismo problema (CI corre `pnpm -r test` y `build` sin medir ni typechequear lo que queda afuera) y la misma solución (dos steps nuevos en `pr.yml`). Se ejecutan en el mismo change ([D-021](../../decisiones.md), Parte F del plan).
2. **Los umbrales de coverage se fijan en el change, no acá** — la recomendación del hallazgo es arrancar en el **nivel actual medido**, no en un número aspiracional (`testing-02` sugiere 80% como referencia realista, `ci-cd-08` insiste en medir primero). El valor concreto por package se resuelve al implementar, midiendo; lo que esta HU exige es que exista un umbral y que su incumplimiento **falle** el build.
3. **El piso es un trinquete, no un objetivo** — una vez fijado, el umbral solo sube. Bajarlo requiere decisión explícita del PO.

## Criterios de aceptación

- [ ] **CA-026.1 (coverage configurado)** — Dado cualquiera de los tres `vitest.config.ts` (components, tokens, playground), cuando se inspecciona su bloque `test`, entonces existe configuración de `coverage` con provider `v8` y reporters aptos para consola y para CI (texto legible + formato máquina tipo lcov).
- [ ] **CA-026.2 (thresholds activos)** — Dado los packages publicables (`tokens` y `components`), cuando se corre la suite con cobertura, entonces se evalúan thresholds declarados en el config; el valor inicial de cada uno se fija midiendo la cobertura real al implementar y queda documentado en el change.
- [ ] **CA-026.3 (coverage bajo umbral falla)** — Dado un package cuya cobertura queda por debajo de su threshold, cuando corre el job de CI, entonces el job **termina en error** y el PR no puede mergearse — no alcanza con emitir una advertencia.
- [ ] **CA-026.4 (script typecheck por package)** — Dado cada package/app del workspace, cuando se ejecuta su script `typecheck`, entonces se typechequean **sin emitir** los archivos que el build de la lib excluye — `*.spec.ts` y `*.stories.ts` incluidos — y el root expone un `typecheck` que los corre a todos.
- [ ] **CA-026.5 (error de tipos en spec o story falla)** — Dado un spec o una story que referencia un input o un tipo inexistente (por ejemplo, tras renombrar un input de componente), cuando corre CI, entonces el step de typecheck **falla** señalando el archivo; hoy ese caso pasa verde.
- [ ] **CA-026.6 (cableado en el pipeline)** — Dado el workflow de PR, cuando se ejecuta, entonces incluye un step de typecheck y uno de tests con cobertura, ambos bloqueantes, y la política de coverage queda documentada en `CONTRIBUTING.md`.

## Dependencias

- Ninguna sobre otras HUs. Toca `vitest.config.ts` de los tres proyectos, los `package.json` (scripts y devDependency de cobertura), los `tsconfig` de typecheck y el workflow de PR.
- Coordinar con [HU-027](HU-027-gate-contraste-aa-ci.md) y [HU-028](HU-028-a11y-automatizada-axe.md): los tests nuevos que aporten entran al mismo cálculo de cobertura, así que conviene fijar los umbrales una vez incorporados o revisarlos al cerrar cada una.

## Fuera de alcance

- Publicar la cobertura en un servicio externo (Codecov, Coveralls) o mostrar badge en el README.
- Coverage de tipo mutation testing.
- Endurecer la configuración de TypeScript (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) — eso es otro hallazgo, con su propio change en la Parte N del plan.
- Subir la cobertura de los componentes existentes hasta un objetivo: esta HU instala el gate, no persigue un porcentaje.

## Notas

- Hallazgos que la originan: `testing-02` (cero coverage: sin provider, thresholds ni reporters en ningún `vitest.config`), `tooling-repo-06` (specs y stories nunca se typechequean) y `ci-cd-08` (tests corren en CI sin gate de cobertura) — [review integral 2026-07-26](../../../reviews/2026-07-26-review-integral/hallazgos.md).
- Ejecución: **Parte F** del [plan de acción](../../../reviews/2026-07-26-review-integral/plan-de-accion.md), como change OpenSpec.
- Los números de threshold quedan deliberadamente sin fijar acá (decisión de refinamiento 2): inventarlos ahora sería dato no verificado. Se miden y se fijan en el change.

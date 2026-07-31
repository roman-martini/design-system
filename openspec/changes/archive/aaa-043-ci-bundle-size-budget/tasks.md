# Tasks — aaa-043 — Presupuesto de tamaño de bundle

Cada tarea es ≤2 h con criterio binario. Diseño: qué se mide (D1), entrypoints (D2), techos y margen (D3), config única (D4), verificación en ambos sentidos (D5), pipeline (D6), diagnóstico (D7).

Orden: se **mide antes de fijar** (§2 antes de §3), y el gate se **prueba fallando antes de cablearse a CI** (§4 antes de §5). Cablear un gate no probado es instalarlo a ciegas — la lección que dejaron F1-b y F2.

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm -r build` y `pnpm exec size-limit` sobre el estado limpio.
- [x] 1.2 `size-limit@^13.0.3` y `@size-limit/file@^13.0.3` como devDependencies del root, sin unmet peers nuevos (los que reporta pnpm son preexistentes: `@angular/router` y `jsdom`).

**Criterio**: deps instaladas, build reproducible, sin cambios en `packages/*`.

## 2. Medir la línea base (design D3)

- [x] 2.1 `pnpm -r build` fresco y medición de los cinco entrypoints con `size-limit --json`, en bytes. Registrar la tabla en `design.md`.
- [x] 2.2 Medir el **costo real de un componente** quitando `accordion` del `public-api.ts` y reconstruyendo, para calibrar el margen contra un dato y no contra una intuición. Registrar en `design.md`.
- [x] 2.3 Restaurar el `public-api.ts` y confirmar que el bundle vuelve al byte exacto medido en 2.1.

**Criterio**: cinco medidas en bytes documentadas; costo de un componente medido (2 316 B); repo restaurado.

## 3. Fijar los techos (design D3, D2, D4)

- [x] 3.1 Decisión del PO sobre el margen, con las tres opciones evaluadas sobre la medición ya hecha → **5%** ([D-031]).
- [x] 3.2 `.size-limit.json` en el root con los **cinco entrypoints publicables** (los dos de `components`, los tres de `tokens`), cada uno con `limit` explícito y `gzip: true`, y `name` descriptivo que nombra package y subpath (es lo que se lee en el log de CI, design D7).
- [x] 3.3 Techos calculados con la regla declarada: `medido × 1.05` redondeado hacia arriba al siguiente múltiplo de 10 B.
- [x] 3.4 Script `size` en el `package.json` del root.

**Criterio**: `pnpm size` corre en local, exit 0, y los cinco entrypoints del `exports` de ambos packages tienen techo.

## 4. Verificar el gate en ambos sentidos (design D5)

- [x] 4.1 **Verde**: `pnpm size` sobre el estado limpio → exit 0, los cinco bajo el límite.
- [x] 4.2 **Rojo por `components`** (cadena ng-packagr): agregar componentes sonda al `public-api.ts`, reconstruir y confirmar exit 1 con el exceso reportado. Restaurar y reconstruir.
- [x] 4.3 **Rojo por `tokens`** (cadena Style Dictionary): agregar tokens sonda a `primitives/`, reconstruir y confirmar exit 1 en las dos salidas del build (CSS y JS). Restaurar y reconstruir.
- [x] 4.4 **Caso degenerado**: path inexistente y glob sin matches → confirmar que **falla** en vez de reportar 0 B. Es la pregunta que F2 dejó como obligatoria: qué hace el gate cuando no puede medir.
- [x] 4.5 Confirmar que tras cada restauración el bundle vuelve al byte exacto de 2.1 (build determinista y restauración completa).
- [x] 4.6 **Verificar que el margen no se consume en variación de entorno** (design D9): los techos se midieron en Windows y CI mide en Linux. Medir line endings y rutas absolutas embebidas en los tres artefactos grandes. Resultado: cero CRLF, cero rutas, gzip idéntico normalizado a LF — byte-idénticos entre plataformas.

**Criterio**: las cuatro pruebas ejecutadas y sus resultados registrados en `design.md`. Ningún gate se da por instalado sin haberlo visto fallar. El margen es margen real, no ruido de entorno.

## 5. Cablear el pipeline (design D6)

- [x] 5.1 Step `Bundle size budget` en `.github/workflows/pr.yml`, después de `Verify packaging` y antes de `OpenSpec validate`, corriendo `pnpm size`.
- [x] 5.2 Confirmar que el step queda **después** del build recursivo, de modo que mida el `dist` de esa corrida (CA-030.3).
- [x] 5.3 `actionlint` sobre el workflow modificado, sin errores.
- [x] 5.4 Step `if: failure()` que imprime la política de trinquete junto al fallo (design D8), **acotado por `steps.size-budget.conclusion`** para que no se dispare cuando el que falló fue otro step.

**Criterio**: el workflow es válido, el step es bloqueante y quien lee el fallo tiene la política a la vista.

## 6. Documentación (design D3, D6)

- [x] 6.1 `CONTRIBUTING.md`: sección de presupuesto de bundle — cómo correrlo en local, qué mide, la tabla de techos vigentes y la política para moverlos (decisión del PO, razón en el PR).
- [x] 6.2 `CONTRIBUTING.md`: agregar el step de `build-storybook` a la lista de `pr.yml`, que `aaa-042` había dejado sin registrar, y sumar el step nuevo. Renumerar.
- [x] 6.3 Registrar **D-031** (margen del 5%) en `docs/product/decisiones.md`.
- [x] 6.3-bis Sumar `pnpm size` a la validación de cierre de la skill `/ds:add-component` (design D8), con la instrucción de **subir el techo** al peso medido + 5% y registrar cuánto pesó el componente. Es la medida que evita que el caso previsto —componente nuevo excede el techo— llegue a CI como sorpresa.
- [x] 6.4 Marcar los criterios de aceptación de **HU-030** y actualizar el estado de EP-005.

**Criterio**: la política es reproducible por alguien que no participó del change.

## 7. Cierre

- [x] 7.1 Suite completa verde: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm -r build`, `pnpm test:coverage`, `pnpm verify:packaging`, `pnpm size`, `pnpm openspec validate --all`.
- [x] 7.2 Actualizar `plan-de-accion.md` y `BACKLOG.md`: F3 hecha, **Parte F cerrada**.
- [x] 7.3 Archivar el change en la misma sesión y sincronizar el delta con `openspec/specs/ci-cd-pipeline/spec.md`, verificando **scenario por scenario** (lección de `playground-app` en F2).

**Criterio**: repo verde, Parte F cerrada, change archivado.

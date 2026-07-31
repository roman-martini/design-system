---
id: aaa-041
name: tokens-quality-gates
type: change
status: archived
archived: 2026-07-31
modifies-specs:
  - design-tokens-package
related-decisions:
  - D-030
  - D-021
  - D-007
  - D-017
---

# Proposal — tokens-quality-gates

# Why

**El package de tokens declara tres contratos verificables por cálculo y ninguno tiene un test que los verifique.** La suite de `packages/tokens` son 3 specs (`z-index`, `overlay-motion`, `effect`) que importan JSON de `src/semantic/` y asertan estructura. Nada toca el artefacto emitido, nada valida la jerarquía y el gate de contraste vive fuera del repo productivo.

1. **El gate de contraste AA no corre en CI.** Varias specs delegan la verificación WCAG AA a un "gate por script" (`component-button` L89, `component-avatar` L35 "verificado por gate en los 4 themes", y once specs más), pero la única implementación es `.claude/skills/check-a11y/scripts/contrast.mjs` — un script de una skill de Claude que solo corre cuando un humano invoca `/ds:check-a11y`. `pr.yml` no tiene ningún step de contraste. Un cambio de tokens de color puede mergear rompiendo AA sin que nada falle, y con él las tres correcciones de tokens ya pagadas por contraste ([D-008], [D-012], [D-016]) [testing-01, tokens-04].

2. **Las reglas de jerarquía no tienen gate.** El requirement "Jerarquía interna primitives → semantic → component → theme" exige para cada regla que "el build SHALL fallar o el revisor SHALL rechazarlo", pero hoy solo existe el revisor humano: `sd.config.mjs` no tiene preprocessor ni validación. Con 827 tokens fuente en 4 niveles, 600 referencias entre ellos y un componente nuevo por change, la invariante arquitectónica central del package depende de que cada review la recuerde [tokens-03].

3. **Nada verifica el artefacto que consume el usuario.** `dist/tokens.css` es literalmente lo que se publica, y ningún test comprueba que el prefijo `--ds-` sea universal, que las referencias resuelvan, ni que un theme no introduzca una custom property que el scope default no declara — el caso en que una variable faltante produce fallback silencioso al valor default en producción [testing-09].

Es la **Parte F** de la review integral 2026-07-26, ítems 2, 3 y 4 (sub-parte **F1-b**), y entrega **HU-027** (EP-005). El PO aprobó la ampliación de EP-005 a "todos los gates de calidad, con una HU por gate y criterios binarios" en [D-021].

**Prioridad que lo respalda**: la **1 (buenas prácticas)** — un requirement normativo sin enforcement automático es papel mojado, y validar el artefacto emitido es estándar en pipelines de tokens —, y la **2 (escalar ordenado)**: los tres gates escalan solos, cada componente nuevo entra con la vara puesta. [D-017] refuerza el criterio: una sola lógica de cálculo adoptada como estándar, no dos implementaciones que puedan divergir.

## Medición previa (2026-07-30)

El patrón probado en [aaa-040] es **medir primero, después fijar el gate**. Estado del repo antes de este change:

| Gate                                                | Medición                                                                                              | Veredicto                    |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------- |
| Contraste (107 pares × 4 scopes = 428 evaluaciones) | 426 pasan · **2 pares fallan** en los 3 themes claros                                                 | un incumplimiento real       |
| Jerarquía (600 referencias)                         | 0 violaciones · 0 ciclos · 0 claves de theme fuera de `semantic`                                      | limpio, el gate es trinquete |
| Build (754 custom properties)                       | prefijo `--ds-` universal · 0 referencias `{…}` sin resolver · 0 `var()` colgantes · themes ⊆ default | limpio, el gate es trinquete |

Los **2 pares fallidos** son `component.checkbox.border-off` y `component.radio.border-off`: valían `{color.neutral.400}` (`#a3a3a3`) y daban **2.52:1 contra 3:1 requerido** sobre `bg.surface` en `default`, `brand-a` y `brand-b`. WCAG 1.4.11 aplica de lleno — el borde es el único indicador visual de un control desmarcado, que no tiene texto propio. Dos agravantes que la medición expuso: el token estaba clavado a un primitive y por eso **no era theme-aware** (en dark pasaba por casualidad, no por diseño), y como `bg-off` vale `{color.white}` fijo, el mismo borde daba 2.52:1 contra su **propio interior en todos los themes**, incluido dark.

Se corrige en este change apuntando ambos tokens a `{semantic.color.border.strong}` (`#737373`), bajo **[D-030]** y con el precedente de [D-008], [D-012] y [D-016] — correcciones de tokens pagadas por contraste, exactamente el camino que HU-027 prescribe para un par fallido en tokens ya publicados. Post-fix: 4.74:1 en los tres themes claros, 3.78:1 en dark contra la superficie y 4.74:1 contra el interior. **Las 428 evaluaciones pasan.**

## Revalidación de hallazgos (2026-07-30)

La regla 3 del plan exige revalidar los hallazgos sin verificación adversarial. `tokens-03` estaba en esa condición (verificación inline):

- **Confirmado**: `sd.config.mjs` no tiene preprocessor ni validación y ningún test cubre jerarquía.
- **Corregida una premisa de su recomendación**: pide que el gate incluya "reporte de huérfanos en semantic/component". Se **excluye a propósito** — hay 219 huérfanos sobre 754 tokens y separar deuda real de inventario deliberado es criterio, no aserción binaria. Ese triage es el item `tokens-audit-formal` del backlog, con su propia sesión. Un gate que falle por huérfanos entraría rojo el día uno.
- **Corregida la recomendación de `testing-09`**: pide verificar "que los 4 themes declaren exactamente el mismo set de custom properties que el scope default". Es incorrecto para esta arquitectura: los themes son **deltas** por diseño de `sd.config.mjs` (9, 9 y 55 propiedades contra 754 del default). La aserción correcta es la **contención** — ninguna clave de theme fuera del default — más cero `var()` colgantes, que es lo que realmente detecta el fallback silencioso descrito. Ver `design.md` D4.

# What Changes

- **La lógica de contraste se muda al repo productivo**: `packages/tokens/scripts/contrast.mjs` como módulo con funciones exportadas (parseo de custom properties, resolución de cadenas `var()`, parseo de color con compositado alpha, luminancia relativa y ratio WCAG 2.x) más `contrast-cli.mjs` como interfaz de línea de comandos. **Una sola implementación, dos consumidores**: el gate de CI y la skill `check-a11y` [testing-01, tokens-04] — CA-027.5.
- **Los pares son datos versionados**: `packages/tokens/test/contrast-pairs.json` con **107 pares** (`id`, `fg`, `bg`, `level`, `specRef`), derivados de los requirements de las specs. Sumar un componente es sumar pares, sin tocar la lógica de cálculo — CA-027.3. El campo `specRef` hace la trazabilidad verificable por el propio test, no por prosa — CA-027.6.
- **`packages/tokens/test/contrast.spec.ts`**: evalúa cada par en el scope default y en los 3 themes, y falla informando par, theme, ratio obtenido y umbral — CA-027.1, CA-027.2, CA-027.4. Cubre además el requirement "Jerarquía semantic.border respetada" (`subtle < default < strong`), hoy sin test y verificable con la misma lógica.
- **`packages/tokens/test/hierarchy.spec.ts`**: valida las 4 reglas de referencia del requirement de jerarquía sobre los 827 tokens fuente — `semantic` solo a `primitives` (más aliases intra-nivel), `component` nunca a `theme`, `theme` solo redefine claves existentes en `semantic`, y ausencia de ciclos [tokens-03].
- **`packages/tokens/test/build.spec.ts`**: valida el artefacto emitido — prefijo `--ds-` universal, cero referencias `{…}` sin resolver, cero `var()` a custom properties inexistentes, y contención de cada theme en el scope default [testing-09].
- **Fix de tokens bajo [D-030]**: `component.checkbox.border-off` y `component.radio.border-off` pasan de `{color.neutral.400}` a `{semantic.color.border.strong}`. Es el único cambio de valores de tokens del change y el único con efecto visual.
- **La skill `check-a11y` deja de tener lógica propia**: su `scripts/contrast.mjs` se elimina y el `SKILL.md` pasa a invocar el CLI del package. La skill sigue sirviendo para auditorías amplias con pares ad-hoc.

**Ningún step nuevo en `pr.yml`**: los tres specs viven en `test/` y entran gratis al `pnpm test:coverage` que el pipeline ya ejecuta después de `pnpm -r build` — el orden que `build.spec.ts` necesita ya está garantizado. Requiere changeset: el change toca `packages/tokens/src`, y el fix de [D-030] altera el artefacto publicado.

## Alternativas evaluadas

| Opción                                                         | Por qué se descarta                                                                                                                                                                                                                                                                                    |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Dejar la lógica en la skill y que el spec la importe**       | Invierte la dependencia: el package publicable pasaría a depender de `.claude/`, que es tooling de agente y no entra al tarball ni al pipeline de otro consumidor. El gate normativo no puede vivir fuera del repo productivo — es el hallazgo, no la solución.                                        |
| **Escribir la lógica en TypeScript en `test/lib/contrast.ts`** | Más idiomático para el repo, pero `.nvmrc` fija **Node 22**, sin type-stripping por default: la skill tendría que pasar por `tsx` o un build step para invocarla, y un gate normativo que depende de transpilación ad-hoc es más frágil. Se descarta a favor de `.mjs` + `.d.ts` colocado (design D1). |
| **Duplicar el cálculo: uno en el spec, otro en la skill**      | Viola CA-027.5 y [D-017] de frente. Dos implementaciones del mismo cálculo divergen; el día que divergen, el gate y la auditoría dan veredictos distintos sobre el mismo par.                                                                                                                          |
| **Gate solo con los 8 pares del requirement de tokens**        | No cierra `testing-01`, que nombra específicamente `component-button` CA-020.2 y `component-avatar` CA-022.2. El gate quedaría ciego justo en los requirements que originan el hallazgo.                                                                                                               |
| **Enumerar los pares dentro del código del spec**              | Contradice CA-027.3: sumar un componente exigiría editar la lógica del test. El artefacto de datos separado es lo que hace que el gate crezca sin tocar el cálculo.                                                                                                                                    |
| **Preprocessor de Style Dictionary para la jerarquía**         | Falla el build en vez de fallar un test, lo que confunde "el artefacto no se pudo generar" con "el artefacto viola una regla". Además la validación necesita ver los 4 niveles a la vez, que es más natural en un spec que en un hook de build por token.                                              |
| **Incluir el reporte de huérfanos en el gate de jerarquía**    | 219 huérfanos sobre 754 tokens: el gate entraría rojo el día uno. Separar deuda real de inventario deliberado (una escala de color completa, los 13 z-index de [aaa-009]) es criterio humano, y es el item `tokens-audit-formal` del backlog.                                                          |

Este change no introduce un patrón arquitectónico nuevo ni es one-way door: **no genera ADR**. El contrato queda en la spec `design-tokens-package` y el fix de tokens en [D-030].

# Capabilities

## New Capabilities

Ninguna.

## Modified Capabilities

- `design-tokens-package`: el requirement de **contraste WCAG AA** pasa de "verificación por cálculo (script `check-a11y/scripts/contrast.mjs` u otro determinístico)" a un gate versionado en el package, con pares como datos y cobertura de los tokens de componente; el requirement de **jerarquía** reemplaza "el build SHALL fallar o el revisor SHALL rechazarlo" por un test que falla; y se agrega un requirement de **validación automática del artefacto emitido** (prefijo, referencias resueltas, contención de themes).

# Impact

**Código y configuración**

- `packages/tokens/scripts/contrast.mjs` + `contrast.d.mts` + `contrast-cli.mjs` — **archivos nuevos** (lógica portada).
- `packages/tokens/test/contrast-pairs.json` — **archivo nuevo** (107 pares versionados).
- `packages/tokens/test/contrast.spec.ts`, `hierarchy.spec.ts`, `build.spec.ts` — **archivos nuevos**.
- `packages/tokens/src/component/checkbox.json`, `radio.json` — fix de [D-030] (2 líneas).
- `packages/tokens/tsconfig.json` — incluir las declaraciones de `scripts/` en el typecheck y sumar los tipos de Node.
- `packages/tokens/package.json` — devDependency `@types/node` (los gates leen el build con `node:fs`).
- `eslint.config.js` — el bloque de globals de Node pasa de `scripts/**/*.mjs` a `**/scripts/**/*.mjs`, para cubrir el `scripts/` de un workspace y no solo el del root.
- `.claude/skills/check-a11y/scripts/contrast.mjs` — **se elimina**; `SKILL.md` pasa a invocar el CLI del package.
- `docs/product/decisiones.md` — [D-030].

**Riesgos**

- El fix de [D-030] **cambia el aspecto** del borde de checkbox y radio desmarcados (`#a3a3a3` → `#737373`) en componentes ya publicados en `0.2.0`. Requiere el OK visual del PO antes de archivar, por [D-022].
- `build.spec.ts` depende de `dist/`. CI ya buildea antes de testear, pero en local `pnpm test` sin build previo daría un falso rojo: el spec falla con un mensaje que dice explícitamente qué comando correr (design D6).
- El margen más fino del set post-fix es `progress/fill-primary` sobre `track-bg` en dark: **3.07:1 contra 3:1**. Cualquier ajuste de esos dos tokens rompe el gate — que es exactamente lo que se busca, pero conviene saberlo antes de tocarlos.

**Sin impacto en**: la superficie de `exports` del package (los archivos nuevos no entran al tarball: `files` declara solo `dist`), el pipeline (ningún step nuevo), y el gate de publish de [ADR-022].

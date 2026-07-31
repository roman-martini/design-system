# Tasks — aaa-041 — Gates de calidad de tokens

Cada tarea es ≤2 h con criterio binario. Diseño: lógica portada (design D1), pares versionados (D2), alcance (D3), fix de [D-030] (D4), contención de themes (D5), dependencia de `dist/` (D6), skill (D7).

Orden: primero el fix de tokens (§2), después la lógica y los datos (§3), después los tres gates (§4–§6), y recién ahí la skill (§7). Instalar el gate de contraste antes del fix dejaría la suite roja entre tareas.

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm typecheck`, `pnpm -r build`, `pnpm -r test:coverage`, `pnpm lint`, `pnpm format:check`, `pnpm verify:packaging` y `pnpm exec openspec validate --all` pasan.
- [x] 1.2 Medición registrada en `design.md` § Context: inventario de 827 tokens, 600 referencias, 0 violaciones, 754 custom properties, 107 pares y los 2 fallidos.

**Criterio**: suite verde y estado de los tres gates medido y documentado antes de escribir una aserción.

## 2. Fix de contraste de checkbox y radio (design D4, [D-030])

- [x] 2.1 `packages/tokens/src/component/checkbox.json`: `border-off` de `{color.neutral.400}` a `{semantic.color.border.strong}`.
- [x] 2.2 `packages/tokens/src/component/radio.json`: el mismo cambio.
- [x] 2.3 Rebuildear y verificar por cálculo los cuatro pares afectados (`border-off` contra `bg.surface` y contra `bg-off`, en los 4 scopes): todos ≥ 3:1. (Medido: 4.74 en los tres claros y 3.78 en dark contra la superficie; 4.74 en los cuatro contra el interior.)
- [x] 2.4 Registrar **[D-030]** en `docs/product/decisiones.md` con el ratio antes/después, el precedente de [D-008]/[D-012]/[D-016] y la nota de que `bg-off` fijo en blanco queda como hallazgo para la Parte G.

**Criterio**: los 4 pares pasan por cálculo, y la decisión está registrada con sus números.

## 3. Portar la lógica de contraste al repo productivo (design D1, D2)

- [x] 3.1 `packages/tokens/scripts/contrast.mjs` **nuevo**: funciones exportadas para parseo de custom properties, resolución de `var()` con detección de ciclo, parseo de color (hex 3/4/6/8, `rgb()`, `rgba()`, nombrados) con compositado alpha, luminancia relativa y ratio WCAG 2.x, más `loadScopes` y `evaluatePairs`. Sin efectos al importar.
- [x] 3.2 `packages/tokens/scripts/contrast.d.mts` **nuevo**: firmas de todo lo exportado, para que el spec en TypeScript las consuma con tipos y el typecheck de [aaa-040] las cubra. (La extensión es `.d.mts`, no `.d.ts`: es la que TypeScript resuelve para un import de `./contrast.mjs`.)
- [x] 3.3 `packages/tokens/scripts/contrast-cli.mjs` **nuevo**: interfaz de línea de comandos con la misma superficie que usaba la skill (`--pairs`, `--pairs-inline`, `--tokens`, JSON por stdout, exit 0/1/2) más `--pairs-default` para correr el set versionado del package.
- [x] 3.4 `packages/tokens/test/contrast-pairs.json` **nuevo**: los **107 pares** con `id`, `fg`, `bg`, `level` y `specRef`. Los 6 pares descartados en design D3 **no** entran.
- [x] 3.5 `packages/tokens/tsconfig.json`: incluir las declaraciones de `scripts/` en el `include`. **Gap descubierto al ejecutar**: el package no tenía `@types/node` y los gates leen el build con `node:fs` — se suma como devDependency alineada al Node 22 de `.nvmrc`, y `types` pasa a `["vitest/globals", "node"]`.
- [x] 3.6 Verificar el CLI a mano: `--pairs-default` sale 0 sobre el repo buildeado, y un par con token inexistente sale 2.

**Criterio**: el CLI corre el set versionado con exit 0, `pnpm -F @romanmartinidev/tokens typecheck` pasa, y ningún archivo nuevo queda fuera del typecheck.

> **Gap adicional descubierto y corregido**: el bloque de globals de Node de `eslint.config.js` apuntaba a `scripts/**/*.mjs`, que solo alcanza al `scripts/` del root — el del package quedaba sin lintear (11 errores `no-undef`). Pasa a `**/scripts/**/*.mjs`. Como `.claude/**` está en `ignores`, la lógica de contraste **nunca se había lintado** hasta ahora.

## 4. Gate de contraste (design D1–D4)

- [x] 4.1 `packages/tokens/test/contrast.spec.ts` **nuevo**: carga los scopes una vez, evalúa los 107 pares en los 4 scopes con `it.each` y falla informando **par, theme, ratio y umbral**.
- [x] 4.2 Un par que no resuelve a color plano SHALL fallar, no saltearse: aserción explícita sobre la ausencia de errores de resolución.
- [x] 4.3 Aserción de trazabilidad (CA-027.6): toda spec de componente está cubierta por pares o declarada exenta con su motivo (`component-skeleton`, `component-spinner`, `component-modal`, `component-textarea`). **Cambio respecto de lo planeado**: la verificación enumera los directorios de `openspec/specs/` en vez de buscar "gate por script" en la prosa — un patrón sobre lenguaje natural daba falsos positivos con las negaciones de `skeleton`/`spinner` y falsos negativos con la redacción de `tabs`. Enumerar detecta el caso que importa: un componente nuevo sin decisión sobre sus pares.
- [x] 4.4 Cubrir el requirement "Jerarquía semantic.border respetada": `subtle < default < strong` por cálculo en los 4 scopes.
- [x] 4.5 Verificar el gate en los dos sentidos: (a) pasa con el repo actual; (b) con `text.inverse` degradado a `neutral.300` **falla en 21 casos** con el mensaje completo. Prueba revertida.

**Criterio**: 428 evaluaciones verdes, y el gate probado en ambos sentidos — no asumido.

## 5. Gate de jerarquía (design D3, [tokens-03])

- [x] 5.1 `packages/tokens/test/hierarchy.spec.ts` **nuevo**: recorre los JSON de los cuatro niveles y construye el índice de tokens con su nivel de origen.
- [x] 5.2 Aserciones de las 4 reglas: `semantic → primitives` (+ aliases intra-nivel), `component` nunca a `theme`, claves de `theme` ⊆ claves de `semantic`, y ausencia de ciclos. Cada fallo nombra archivo, token y nivel destino.
- [x] 5.3 Aserción de referencias inexistentes: toda `{ref}` resuelve a un token declarado.
- [x] 5.4 **No** incluir reporte de huérfanos, con un comentario que explique por qué y remita al item `tokens-audit-formal`.
- [x] 5.5 Verificar el gate con una violación inyectada de cada tipo: primitive→semantic ✓, component→theme ✓, theme con clave nueva ✓, ciclo ✓, referencia inexistente ✓. Las cinco fallaron con el mensaje esperado; todas revertidas.

**Criterio**: 0 violaciones sobre el repo actual y las reglas probadas con una violación inyectada cada una.

## 6. Gate del artefacto emitido (design D5, D6, [testing-09])

- [x] 6.1 `packages/tokens/test/build.spec.ts` **nuevo**: falla temprano con el comando de build si `dist/` no existe.
- [x] 6.2 Aserciones: prefijo `--ds-` universal, cero `{…}` sin resolver, cero `var()` colgantes, y contención de cada theme en el scope default.
- [x] 6.3 Aserción de que cada path de `exports` existe en `dist/`.
- [x] 6.4 Comentario que documente por qué es **contención y no igualdad** de sets, con la referencia al filtro de `sd.config.mjs`, para que nadie lo "corrija" a igualdad más adelante.
- [x] 6.5 Verificar en los dos sentidos: propiedad sin prefijo ✓, `var()` colgante ✓, theme con propiedad nueva ✓, y `dist/` ausente ✓ (falla con el comando de build en el mensaje). Restaurado con un rebuild.

**Criterio**: el gate pasa sobre el build real y falla ante un artefacto corrupto.

## 7. Una sola lógica: adaptar la skill (design D7, CA-027.5)

- [x] 7.1 Eliminar `.claude/skills/check-a11y/scripts/contrast.mjs`.
- [x] 7.2 `SKILL.md`: invocar `packages/tokens/scripts/contrast-cli.mjs`, documentar `--pairs-default` y la relación con el gate (la skill audita amplio con pares ad-hoc; el gate protege el set versionado).
- [x] 7.3 Verificar que la skill sigue siendo ejecutable end-to-end con un `pairs.json` ad-hoc en el scratchpad.
- [x] 7.4 Confirmar por búsqueda que no queda ninguna referencia viva al path viejo. Quedan menciones en `docs/design/a11y/2026-07-11-audit.md`, `docs/reviews/2026-07-26-review-integral/hallazgos.md` y changes archivados: son **evidencia fechada**, no se reescriben. Sí se actualizó el comentario operativo de HU-004, que apuntaba al script como herramienta vigente.

**Criterio**: una sola implementación del cálculo en el repo, verificado por búsqueda; la skill corre igual que antes.

## 8. Cierre

- [x] 8.1 Suite completa verde: `pnpm typecheck`, `pnpm -r build`, `pnpm -r test:coverage`, `pnpm lint`, `pnpm format:check`, `pnpm verify:packaging`, `pnpm exec openspec validate --all`.
- [x] 8.2 Registrar el conteo final de tests y el tiempo de la suite de tokens en `design.md`.
- [x] 8.3 Changeset **minor** para ambos packages (el fix de [D-030] altera el artefacto publicado; lockstep de [ADR-015]).
- [x] 8.4 Marcar los CAs de **HU-027** como cumplidos, con la matriz de trazabilidad de CA-027.6.
- [x] 8.5 Actualizar `openspec/README.md` (próximo ID, IDs en vuelo), el avance de la Parte F en `docs/backlog/BACKLOG.md`, el plan de acción, la épica EP-005 y la tabla global de HUs.
- [x] 8.6 **OK visual del PO** sobre checkbox y radio en el playground ([D-022]) antes de archivar. (OK del PO el 2026-07-31.)
- [x] 8.7 Proponer el mensaje de commit y **esperar el OK del PO** antes de commitear. (OK del PO el 2026-07-31.)

**Criterio**: repo verde, artefactos de gobernanza actualizados, OK visual obtenido y commit propuesto sin ejecutar.

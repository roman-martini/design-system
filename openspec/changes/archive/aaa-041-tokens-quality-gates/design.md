# Design — tokens-quality-gates

## Context

Tres gates sobre `packages/tokens`, todos verificables por cálculo determinístico y todos hoy inexistentes: contraste WCAG AA [testing-01, tokens-04], jerarquía de referencias [tokens-03] y validez del artefacto emitido [testing-09]. Los tres entran como specs de Vitest en `packages/tokens/test/`, donde el pipeline ya los ejecuta.

### Medición de partida (2026-07-30, sobre HEAD `6a81a9c`)

**Inventario fuente**: 827 tokens en 4 niveles — 180 `primitives`, 131 `semantic`, 443 `component`, 73 `theme`. El build emite 754 custom properties en `dist/tokens.css` (827 − 73 de theme, que van a `dist/themes/*.css`).

**Referencias entre niveles** (600 en total): `component → semantic` 251, `component → primitives` 167, `semantic → primitives` 103, `theme → primitives` 72, `semantic → semantic` 6 (aliases intra-nivel), `primitives → primitives` 1 (`shadow.focus` → `{color.blue.500}`, documentada). **Cero violaciones, cero ciclos, cero claves de theme fuera de `semantic`.**

**Artefacto emitido**: prefijo `--ds-` en las 754 propiedades, cero referencias `{…}` sin resolver, cero `var()` a propiedades inexistentes. Themes: `brand-a` 9 propiedades, `brand-b` 9, `dark` 55 — todas contenidas en el default.

**Contraste**: 107 pares × 4 scopes = 428 evaluaciones. Antes del fix de [D-030]: 422 pasaban y 6 fallaban (2 pares × 3 themes claros). Después: **428 pasan**. Margen más fino del set: `progress/fill-primary` sobre `track-bg` en dark, 3.07:1 contra 3:1.

## Goals / Non-Goals

**Goals**

- Que los requirements de contraste que 13 specs declaran "gate por script" tengan un gate real, versionado y bloqueante.
- Una sola implementación del cálculo de ratio, consumida por el gate y por la skill de auditoría (CA-027.5, [D-017]).
- Que las 4 reglas de jerarquía y la validez del artefacto emitido dejen de depender de revisión humana.
- Que sumar un componente al kit sea sumar filas de datos, no editar lógica de test (CA-027.3).

**Non-Goals**

- Reporte de huérfanos (219 sobre 754): es el item `tokens-audit-formal`, que exige criterio para separar deuda de inventario deliberado.
- Contraste de texto grande (3:1) y de estados de foco: fuera de alcance por HU-027. Los pares 1.4.11 que **ya** son normativos en la spec (borders de status, `border.strong`) sí entran — son requirement vigente, no ampliación.
- Migración de la fuente a formato DTCG [tokens-05] y export a Figma [aaa-012, en pausa por D-027].
- Auditoría de a11y sobre DOM renderizado: es HU-028, la sub-parte F2.

## Decisions

### D1 — La lógica vive en `packages/tokens/scripts/contrast.mjs`, en JavaScript, no en TypeScript

CA-027.5 exige que el gate y la skill `check-a11y` compartan **el mismo** cálculo. Eso fija dos requisitos simultáneos: el módulo tiene que ser importable desde un spec de Vitest y ejecutable por `node` directo desde la skill, sin build step.

`.nvmrc` fija **Node 22**, donde el type-stripping de TypeScript existe solo detrás de `--experimental-strip-types`. Un módulo `.ts` obligaría a la skill a pasar por `tsx` o por un artefacto compilado; un gate normativo que depende de transpilación ad-hoc es más frágil que el problema que resuelve.

La forma elegida es **`.mjs` con un `.d.mts` colocado al lado**: `contrast.mjs` exporta las funciones puras, `contrast.d.mts` declara sus firmas, y el spec en TypeScript las importa con tipos completos — el typecheck instalado en [aaa-040] las cubre. La extensión de tipos es `.d.mts` y no `.d.ts` porque es la que TypeScript resuelve para un import de `./contrast.mjs`. `contrast-cli.mjs` es una cáscara delgada: parsea argumentos, llama al módulo y emite JSON con exit code (0 todo pasa, 1 algún par falla, 2 algo no resuelve).

Consecuencia menor y deseable: al importar el módulo, el reporte de cobertura de `tokens` deja de medir 0/0. El package sigue **sin thresholds** por la decisión D2 de [aaa-040] — cuando este código crezca, el umbral entra con él, que es exactamente la condición que esa decisión dejó escrita.

**Separación de responsabilidades del módulo**: parseo de CSS (`parseCustomProperties`, `resolveVar`), parseo de color (`parseColor`, `composite`), WCAG (`relativeLuminance`, `contrastRatio`) y evaluación (`loadScopes`, `evaluatePairs`). El spec usa `loadScopes` + `evaluatePairs`; el CLI usa lo mismo y solo agrega serialización.

### D2 — Los pares son un JSON versionado con referencia a su spec

`packages/tokens/test/contrast-pairs.json`: array de `{ id, fg, bg, level, specRef }`.

- `id` con prefijo de dominio (`semantic/…`, `button/…`) para que el mensaje de fallo diga de entrada qué se rompió.
- `level` ∈ `text` (4.5:1), `large-text` (3:1), `ui` (3:1, WCAG 1.4.11) — el umbral es un dato del par, no un `if` en el test.
- `specRef` nombra la spec que declara el requirement (`design-tokens-package`, `component-button`, …). Es lo que convierte CA-027.6 en algo que el test verifica: un spec aparte comprueba que **toda spec con un requirement de contraste tenga al menos un par** que la referencie, y la lista de specs sin par cubierto está declarada explícitamente en el propio test como constante documentada.

Elegir JSON y no un `.ts` es deliberado: es el formato que el CLI de la skill consume sin transpilar, y hace que sumar un componente sea agregar filas de datos (CA-027.3).

### D3 — 107 pares: cobertura de componentes, con 6 pares retirados por análisis

El gate cubre los 8 pares del requirement de `design-tokens-package` **más los pares de los tokens de componente**, porque `testing-01` nombra específicamente `component-button` CA-020.2 y `component-avatar` CA-022.2: un gate limitado a los 8 no cierra el hallazgo que lo origina.

La primera enumeración fueron 111 pares y arrojó 29 evaluaciones fallidas. El análisis las separó en dos grupos, y el trabajo real fue distinguirlos:

**6 pares mal derivados, retirados** (no los exige su spec ni WCAG):

| Par retirado                | Ratio | Por qué no corresponde                                                                                                                                                             |
| --------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `card/border-on-surface`    | 1.48  | Borde decorativo de contenedor: 1.4.11 aplica a componentes de UI y objetos gráficos que transmiten información, no al límite visual de una superficie.                            |
| `modal/border-on-bg`        | 1.42  | Ídem.                                                                                                                                                                              |
| `menu/panel-border`         | 1.48  | Ídem (borde del panel, no del item interactivo).                                                                                                                                   |
| `select/listbox-border`     | 1.48  | Ídem.                                                                                                                                                                              |
| `button/outline-border`     | 1.48  | El control es identificable por su texto, que cumple 4.5:1 sobre la superficie. El borde no es el único indicador.                                                                 |
| `switch/thumb-on-track-off` | 1.26  | `component-switch` L37 pide `thumb.bg` vs `bg-on` y establece que el estado se comunica **por la posición del thumb**. Exigir contraste en `off` contradice el propio requirement. |

Retirarlos no es bajar la vara: es no inventar requirements que las specs no declaran. Los 4 primeros resuelven a `semantic.color.border.default`, cuyo bajo contraste es **deliberado** — la spec tiene un requirement propio (`subtle < default < strong`) que este mismo change pasa a verificar.

**2 pares con incumplimiento real, corregidos bajo [D-030]** — ver D4.

### D4 — El fix de `checkbox`/`radio` `border-off` entra en este change

`component.checkbox.border-off` y `component.radio.border-off` valían `{color.neutral.400}` (`#a3a3a3`) y daban **2.52:1 contra 3:1** sobre `bg.surface` en `default`, `brand-a` y `brand-b`.

Acá 1.4.11 sí aplica sin discusión: a diferencia del botón outline, un checkbox o radio desmarcado **no tiene texto propio** — su borde es el único indicador visual de que el control existe y de cuál es su área. Dos agravantes que la medición expuso:

1. El token estaba clavado a un primitive, así que **no era theme-aware**: en dark valía el mismo `#a3a3a3` y pasaba por casualidad de luminancia, no por diseño.
2. Como `bg-off` vale `{color.white}` fijo, el borde daba 2.52:1 contra su **propio interior en los cuatro scopes**, incluido dark.

El fix apunta ambos a `{semantic.color.border.strong}` (`#737373`): 4.74:1 en los tres themes claros, 3.78:1 en dark contra la superficie, 4.74:1 contra el interior. Se hace acá y no se difiere porque son dos líneas, porque HU-027 prescribe exactamente este camino para un par fallido en tokens publicados ("se trata como hallazgo con su propia decisión de producto, igual que D-008/D-012/D-016") y porque dejarlo abierto obligaría a marcar el gate con una excepción — lo que [D-017] descarta.

**Queda anotado, no corregido**: `checkbox.bg-off` y `radio.bg-off` valen `{color.white}` fijo, de modo que un control desmarcado se pinta blanco también en dark theme. No es un problema de contraste (el fix lo deja en 4.74:1) sino de theming, y corregirlo cambia el aspecto del componente en dark. Va como hallazgo para la Parte G, no acá.

### D5 — Paridad de themes es **contención**, no igualdad

`testing-09` recomienda verificar "que los 4 themes declaren exactamente el mismo set de custom properties que el scope default". Es incorrecto para esta arquitectura y aplicarlo dejaría el gate rojo sin que nada esté mal: `sd.config.mjs` construye cada theme con `filter: (token) => token.filePath.startsWith('src/theme/')`, así que cada `themes/*.css` emite **solo sus propios overrides** — 9, 9 y 55 propiedades contra 754 del default. Los deltas chicos son el diseño, no un drift.

La aserción que sí detecta el fallback silencioso que el hallazgo describe es la **contención en ambos planos**:

1. Toda clave de un theme SHALL existir en el scope default (ningún theme introduce una custom property nueva) — es la regla de jerarquía "theme solo redefine" verificada sobre el artefacto.
2. Todo `var(--x)` emitido SHALL resolver a una propiedad declarada en el default o en el propio theme (cero colgantes).

Juntas cubren el caso real: una variable que un theme referencia y nadie declara. La igualdad de sets, en cambio, es imposible por construcción.

Esto también explica el warning benigno de Style Dictionary al buildear `brand-b` ("filtered out token references were found"): el filtro excluye del output los primitives incluidos para resolver referencias, y `outputReferences: true` los emite como `var(--ds-color-purple-*)`, que existen en `:root`. Medido: cero colgantes en los tres themes. El gate lo verifica de verdad, en vez de confiar en la ausencia de warnings.

### D6 — El gate de build exige `dist/`, no lo genera

`build.spec.ts` lee `dist/tokens.css` y `dist/themes/*.css`. Podría invocar el build, pero eso metería un efecto de escritura y ~2 s en cada corrida de la suite, y haría que el test valide un artefacto que él mismo produjo en vez del que produce el pipeline.

`pr.yml` ya corre `pnpm -r build` **antes** de `pnpm test:coverage`, así que en CI el orden está garantizado sin cambiar nada. En local, `pnpm test` sin build previo daría un falso rojo: el spec falla temprano con un mensaje que nombra el comando exacto a correr (`pnpm -F @romanmartinidev/tokens build`), en vez de con 40 aserciones crípticas.

### D7 — La skill pierde su copia del script

`.claude/skills/check-a11y/scripts/contrast.mjs` se elimina y `SKILL.md` pasa a invocar `packages/tokens/scripts/contrast-cli.mjs`. Mantener las dos copias "por si acaso" es precisamente el escenario que CA-027.5 prohíbe: dos implementaciones que divergen y dan veredictos distintos sobre el mismo par.

El CLI conserva la interfaz que la skill ya usaba (`--pairs`, `--pairs-inline`, `--tokens`, salida JSON, exit codes 0/1/2), así que el cambio en la skill es de path, no de flujo. Gana además el flag `--pairs-default`, que corre el set versionado del package sin tener que escribir un archivo en el scratchpad.

## Risks / Trade-offs

| Riesgo                                                                                                          | Mitigación                                                                                                                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| El fix de [D-030] cambia el aspecto de dos componentes publicados en `0.2.0`.                                   | Changeset `minor` y **OK visual del PO antes de archivar** ([D-022]). El cambio va en la dirección de la accesibilidad y es sutil (`#a3a3a3` → `#737373`).                                                                             |
| `progress/fill-primary` sobre `track-bg` en dark queda a 3.07:1 — 0.07 de margen.                               | Queda documentado acá y en el propio JSON de pares. Cualquier ajuste de esos tokens rompe el gate, que es el comportamiento buscado; lo importante es que no sorprenda.                                                                |
| 107 pares × 4 scopes en cada corrida de la suite.                                                               | El cálculo es aritmética sobre un CSS ya parseado: los scopes se cargan una vez por archivo de spec. Medido en el cierre, junto al tiempo total de la suite.                                                                           |
| Un componente nuevo puede sumarse al kit sin sumar sus pares, y el gate no lo notaría.                          | El spec de trazabilidad (D2) falla si una spec con requirement de contraste no tiene ningún par que la referencie. No cubre el caso de un par faltante dentro de una spec ya cubierta: eso queda para el checklist de `add-component`. |
| `hierarchy.spec.ts` parsea los JSON fuente con su propio recorrido, en paralelo a lo que hace Style Dictionary. | Es intencional: el gate debe ser independiente de la herramienta que valida. Si SD cambia su semántica de resolución, el test lo expone en vez de heredarlo.                                                                           |

## Migration Plan

No hay migración: los tres specs son aditivos y el estado medido de jerarquía y build ya los satisface. El único cambio con efecto observable es el fix de [D-030], que se aplica antes de instalar el gate de contraste para que la suite nunca quede roja entre tareas.

## Resultado (2026-07-30, al cerrar la implementación)

**Suite**: 809 tests verdes — `tokens` pasa de **11 a 484** (los 473 nuevos son 428 evaluaciones de contraste, 4 de jerarquía de borders, 4 de trazabilidad, 2 de sanidad del set, y las aserciones de jerarquía estructural y de artefacto emitido), `components` 316 sin cambios, `playground` 9 sin cambios. La suite de tokens corre en **~370 ms**: el cálculo es aritmética sobre un CSS parseado una vez por archivo de spec, así que el costo de las 428 evaluaciones es despreciable y no hace falta acotar el set.

**Los tres gates, verificados en ambos sentidos** (no asumidos): contraste con un token degradado → 21 fallos con par, scope, ratio, umbral y spec de origen; jerarquía con una violación inyectada de cada uno de los 5 tipos → falla en los 5; artefacto con propiedad sin prefijo, `var()` colgante, theme con propiedad nueva y `dist/` ausente → falla en los 4, y el último con el comando de build en el mensaje.

**Cobertura de `tokens`**: pasa de medir 0/0 a **63.33 % statements / 41.79 % branches** sobre `scripts/contrast.mjs`. Sigue **sin thresholds**, como fijó la decisión D2 de [aaa-040]: ahora hay código instrumentable, pero el piso se fija midiendo en la sesión que lo instala, no de arrastre. Lo no cubierto son ramas defensivas del parseo de color (hex de 4 y 8 dígitos, `rgba()`, colores nombrados) y del compositado alpha, que los tokens actuales no ejercitan — son el camino que sí usará la skill al auditar CSS de componentes con overlays.

**Dos gaps de tooling que el change destapó** y corrigió, ninguno previsto en el plan:

1. `packages/tokens` **no tenía `@types/node`** y los tres gates leen el filesystem. Se suma como devDependency alineada al Node 22 de `.nvmrc` en vez de heredar la versión que vite/vitest arrastran (25.x): typechequear contra los tipos de una versión de Node distinta de la que corre en CI habilita APIs inexistentes.
2. El bloque de globals de Node de `eslint.config.js` apuntaba a `scripts/**/*.mjs`, que **solo alcanza al `scripts/` del root**. El del package quedaba sin lintear (11 errores `no-undef` al primer `pnpm lint`). Pasa a `**/scripts/**/*.mjs`. Como `.claude/**` está en `ignores`, la lógica de contraste **nunca había pasado por el linter** en su vida anterior dentro de la skill — un argumento extra a favor de mover código normativo al repo productivo.

## Open Questions

Ninguna. La decisión de qué hacer con los 2 pares fallidos la tomó el PO el 2026-07-30 (corregir ahora, [D-030]); el orden de las tareas y el alcance de pares quedan resueltos en D3 y D4.

Queda **un pendiente derivado, no una pregunta abierta**: `checkbox.bg-off` y `radio.bg-off` valen `{color.white}` fijo, de modo que el control desmarcado se pinta blanco también en dark theme. Es theming, no contraste (el fix de [D-030] deja ese par en 4.74:1 en los cuatro scopes), y está registrado como ítem para la Parte G en el BACKLOG.

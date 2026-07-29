# Design — ci-coverage-typecheck-gates

## Context

El repo corre `pnpm -r test` en CI sin medir cobertura y sin typechequear los archivos que `tsconfig.lib.json` excluye del build por exigencia de APF (`*.spec.ts`, `*.stories.ts`). Ver `proposal.md` para la motivación completa y los hallazgos que lo originan.

Este diseño se apoya en **mediciones hechas sobre el repo el 2026-07-29** (HEAD `b3fd84c`), no en estimaciones. Todo número de esta sección salió de correr la herramienta.

### Cobertura real medida

`vitest run --coverage` con provider `v8`, excluyendo specs, stories y `test-setup`:

| Workspace                     | Statements         | Branches         | Functions        | Lines              | Tests              |
| ----------------------------- | ------------------ | ---------------- | ---------------- | ------------------ | ------------------ |
| `@romanmartinidev/tokens`     | `0/0`              | `0/0`            | `0/0`            | `0/0`              | 11 en 3 archivos   |
| `@romanmartinidev/components` | 94.80% (1169/1233) | 77.23% (380/492) | 97.15% (341/351) | 94.65% (1062/1122) | 316 en 24 archivos |
| `playground`                  | 24.29% (52/214)    | 50.00% (3/6)     | 18.64% (11/59)   | 26.99% (44/163)    | 9 en 2 archivos    |

**`components` está sustancialmente mejor cubierto de lo que asumía el hallazgo** (`testing-02` proponía 80% como umbral realista). El dato cambia la decisión: 80% no sería un piso, sería permiso para perder 15 puntos.

**`tokens` mide `0/0`**: el package no tiene código fuente TypeScript. Su fuente son JSON de tokens (`src/`) más el script de build `sd.config.mjs`; sus 3 specs validan el **artefacto generado** en `dist/`. El `100%` que reporta v8 es el resultado vacuo de dividir por cero, no una medición.

### Estado real del typecheck

`tsc --noEmit` sobre los tsconfig que cubren specs y stories:

| Workspace    | tsconfig                                                                                        | Resultado                                                                                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components` | `tsconfig.spec.json` (ya incluye specs **y** stories: `include: src/**/*.ts` con `exclude: []`) | **TS2688** — declara `types: ["vitest/globals", "node"]` pero `@types/node` no está instalado en ningún workspace. Corregido eso: **8 errores** de tipos en 3 specs |
| `tokens`     | **no existe ningún tsconfig**                                                                   | Faltaba también `typescript` como devDependency. Con un tsconfig mínimo: **4 errores** TS7053 en `test/z-index.spec.ts`                                             |
| `playground` | `tsconfig.spec.json`                                                                            | limpio (exit 0)                                                                                                                                                     |
| `playground` | `.storybook/tsconfig.json` — cubre las **22 stories** de components más `src/` del playground   | limpio (exit 0)                                                                                                                                                     |

Los 12 errores son preexistentes y están hoy ocultos porque **nada ejecuta estos tsconfig**: `@analogjs/vite-plugin-angular` transpila sin verificar tipos.

## Goals / Non-Goals

**Goals**

- Un piso de cobertura que **falle** el PR cuando la cobertura cae, fijado en el nivel real medido.
- Typecheck completo de specs y stories, cableado como gate bloqueante en CI.
- Semántica idéntica de `test` / `test:watch` / `test:coverage` / `typecheck` en los tres workspaces.
- Dejar el repo en verde: los 12 errores preexistentes se arreglan dentro de este change.

**Non-Goals**

- Subir la cobertura de `components` o `playground` hacia un objetivo — este change **instala el gate**, no persigue un porcentaje (HU-026, fuera de alcance).
- Publicar cobertura en un servicio externo (Codecov/Coveralls) o badge en README.
- Endurecer la configuración de TypeScript (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) — Parte N del plan, con su propio change.
- Typechequear los archivos de configuración del repo (`vitest.config.ts`, `sd.config.mjs`). Requeriría `@types/node` en cada workspace y amplía el scope; queda anotado como gap conocido.
- Mutation testing.

## Decisions

### D1 — Provider `v8` y reporters `text` + `lcov`

`v8` usa la instrumentación nativa del runtime en vez de reescribir el código como `istanbul`: es el default de Vitest 4, no agrega paso de transformación y no interfiere con el pipeline de `@analogjs/vite-plugin-angular`, que ya hace su propia transformación de Angular. `text` para leer el resultado en la corrida local y en el log de CI; `lcov` como formato máquina, que es el que consume cualquier herramienta posterior sin atarnos hoy a ninguna.

**Alternativa descartada**: `istanbul` — más preciso en branches con transpilación agresiva, pero suma una capa de instrumentación sobre un pipeline Angular ya compuesto, a cambio de una exactitud que este gate no necesita.

### D2 — `tokens` lleva coverage configurado pero **sin thresholds** (decisión del PO, 2026-07-29)

`tokens` tendrá el bloque `coverage` (provider + reporters), cumpliendo CA-026.1, pero **no declara thresholds**.

**Por qué**: no hay código instrumentable. Un umbral sobre `0/0` no puede fallar nunca; instalarlo sería un gate decorativo, exactamente lo que [D-021] quiso eliminar al pedir criterios binarios, y lo que [D-017] prohíbe ("nada a medias").

**Desviación declarada**: CA-026.2 de HU-026 exige thresholds para "los packages publicables (`tokens` y `components`)". Se cumple en `components` y se documenta la excepción en `tokens`. **El contrato de calidad de `tokens` no es cobertura de líneas sino la validez del artefacto generado**, y eso es precisamente lo que cubre el segundo change de la Parte F1 (gate de contraste AA versionado, spec estructural de jerarquía y `build.spec.ts` de paridad). El gate de `tokens` existe: es otro.

**Revisión futura**: si `tokens` incorpora código TypeScript propio (helpers, transforms custom de Style Dictionary), el threshold entra con él.

### D3 — Umbrales de `components`: nivel medido menos 1 punto

| Métrica    | Medido | Threshold |
| ---------- | ------ | --------- |
| statements | 94.80% | **93**    |
| branches   | 77.23% | **76**    |
| functions  | 97.15% | **96**    |
| lines      | 94.65% | **93**    |

El margen de 1 punto absorbe la variación de instrumentación entre corridas sin convertir el piso en un objetivo móvil: sigue siendo trinquete (solo sube), pero un PR legítimo no se traba por una décima. Decisión del PO (2026-07-29) sobre las alternativas "nivel exacto" y "80% parejo"; esta última se descartó porque **permitiría perder ~15 puntos de cobertura sin que CI dijera nada**.

**El piso es un trinquete**: solo sube. Bajarlo requiere decisión explícita del PO (decisión de refinamiento 3 de HU-026). Se documenta en `CONTRIBUTING.md`.

### D4 — `playground` lleva thresholds de no-regresión, no de calidad

| Métrica    | Medido | Threshold |
| ---------- | ------ | --------- |
| statements | 24.29% | **23**    |
| branches   | 50.00% | **49**    |
| functions  | 18.64% | **17**    |
| lines      | 26.99% | **25**    |

`playground` no es publicable ([D-001]: laboratorio interno), así que CA-026.2 no lo alcanza. Aun así lleva piso, con el mismo margen de 1 punto que `components`: es gratis y evita que la cobertura del laboratorio caiga en silencio. **Los números se leen como "no bajar de acá", no como vara de calidad** — el showcase es mayormente markup declarativo. El ítem 8 de la Parte F (`it.each` sobre las 23 rutas del showcase, change F2) los va a subir; cuando eso pase, el piso sube con ellos.

### D5 — Un tsconfig de typecheck por workspace, reutilizando lo que ya existe

- **`components`** — usa `tsconfig.spec.json`, que ya incluye specs y stories. Se le **quita `"node"` de `types`**: ningún spec ni story usa APIs de Node (verificado por grep sobre `src/` y `router/`), y el type library declarado no está instalado, que es lo que hoy rompe la configuración con TS2688. Se descarta instalar `@types/node` para satisfacer una declaración que nadie usa.
- **`tokens`** — se crea `tsconfig.json` (archivo nuevo) con `resolveJsonModule: true`, necesario porque sus specs importan los JSON de tokens con import attributes (`with { type: 'json' }`). Se suma `typescript` como devDependency del package.
- **`playground`** — corre **dos** tsconfig: `tsconfig.spec.json` (specs de la app) y `.storybook/tsconfig.json` (las 22 stories de components más el `src/` del playground). Ambos ya existen y ambos pasan hoy.

**Alternativa descartada**: un `tsconfig` raíz con project references. Más elegante, pero reordena la configuración TypeScript de los tres workspaces a la vez y arrastra decisiones de strictness que la Parte N ya tiene asignadas. Este change instala el gate sobre la configuración existente.

**Consecuencia deliberada**: el typecheck de las stories de components vive en el **playground**, no en `components`. Es donde ya está configurado Storybook y evita duplicar la configuración de un tsconfig de stories en el package. Queda anotado en `CONTRIBUTING.md` para que no sorprenda.

### D6 — Los 12 errores preexistentes se arreglan en este change

- **`components` (8)** — `fixture.nativeElement` es `any` en Angular, y TS prohíbe pasar type arguments a una llamada no tipada (**TS2347**, con los TS2322/TS18046 derivados). Afecta `menu.spec.ts`, `pagination.spec.ts` y `router/src/breadcrumbs-router.spec.ts`. Se corrige tipando el acceso al elemento nativo, sin tocar la lógica del test.
- **`tokens` (4)** — **TS7053**: indexar con una variable `string` un objeto JSON cuyo tipo inferido tiene claves literales, en `test/z-index.spec.ts`. Se corrige tipando el acceso.

Entregar el gate con excepciones, con los archivos afectados fuera del tsconfig, o con el step en modo advertencia contradice [D-017]. Ninguno de los 12 es un defecto de la librería publicada: todos están en archivos de test, que es exactamente lo que el gate viene a cubrir.

### D7 — Orden de los steps en `pr.yml`

El typecheck va **antes** del build recursivo: es más rápido que el build y falla con el archivo y la línea exactos, así que un error de tipos se ve como error de tipos y no como un build roto. El step `Test (recursive)` pasa a correr con cobertura en el mismo lugar que ocupa hoy — no se agrega un step separado de coverage, para no correr la suite dos veces.

### D8 — Scripts uniformes en los tres workspaces

| Script          | Comando                                                    | Dónde            |
| --------------- | ---------------------------------------------------------- | ---------------- |
| `test`          | `vitest run`                                               | los 3 workspaces |
| `test:watch`    | `vitest`                                                   | los 3 workspaces |
| `test:coverage` | `vitest run --coverage`                                    | los 3 workspaces |
| `typecheck`     | `tsc -p <tsconfig> --noEmit` (playground encadena sus dos) | los 3 workspaces |

El root agrega `typecheck` y `test:coverage` recursivos. Cierra `testing-06`: hoy `pnpm test` del root —comando documentado en `CLAUDE.md`— queda colgado en watch al llegar a `components`.

## Risks / Trade-offs

- **El typecheck descubre más errores preexistentes de los 12 medidos** (por ejemplo al corregir los actuales) → se arreglan en este change; son todos archivos de test, sin impacto en la API publicada. Si apareciera un error que exige cambiar código de `src/lib`, se detiene y se consulta al PO antes de tocar un componente publicado.
- **El piso de `components` es alto (93/76/96/93) y puede frenar un PR legítimo** → el margen de 1 punto es la mitigación; y frenar un PR que baja la cobertura es el objetivo del gate, no un efecto colateral. La válvula de escape es explícita y con dueño: bajarlo requiere decisión del PO.
- **La instrumentación alarga el step de CI** → medido: 16.4s la suite de `components` con cobertura, sobre un job con `timeout-minutes: 15`. Se acota con `coverage.include` apuntado a los sources reales en vez de a toda la carpeta.
- **`@vitest/coverage-v8` exige la versión exacta de `vitest`** (su peer es `vitest@<version>` estricto): instalarlo con `^4` resolvió 4.1.10 contra el `vitest` 4.1.7 del lockfile y quedó en unmet peer. Se pinea a **4.1.7**, la versión resuelta hoy → Dependabot los va a subir juntos; si un PR de Dependabot mueve uno solo, el unmet peer aparece en el install de CI.
- **El threshold de `playground` puede leerse como "la calidad aceptable es 24%"** → mitigado por escrito en `CONTRIBUTING.md` y en D4: es piso de no-regresión de un laboratorio interno, no vara de calidad.

## Verificación tras la implementación (2026-07-29)

- **Los cuatro tsconfig salen en exit 0** después de corregir los 12 errores, y la suite quedó en **316 + 11 + 9 tests pasando** — idéntica a antes del arreglo, lo que confirma que no se tocó lógica de ningún test.
- **La cobertura no cambió tras los arreglos de tipos**: `components` sigue en 94.80 / 77.23 / 97.15 / 94.65 y `playground` en 24.29 / 50 / 18.64 / 26.99. Los thresholds fijados en D3 y D4 siguen siendo válidos.
- **El gate se probó en los dos sentidos**: pasa con el repo actual (exit 0) y falla con exit 1 y mensaje explícito (`ERROR: Coverage for statements (94.8%) does not meet global threshold (99%)`) al forzar un umbral por encima de lo medido.
- **Tiempo de los gates nuevos** (tarea 6.4): `pnpm typecheck` 5.6s y `pnpm test:coverage` 29.8s, ~35s sumados sobre un job con `timeout-minutes: 15`. Holgura amplia.
- **`actionlint` limpio** sobre los workflows con los steps nuevos. Corrido con el binario de Windows en local; **el checksum SHA256 declarado en `pr.yml` corresponde al build `linux_amd64`**, así que la verificación de identidad del binario sigue siendo la de CI.
- **`.gitignore` no necesitó cambios** (tarea 4.4): ya cubría `coverage/`, `.nyc_output/` y `*.lcov`.

## Migration Plan

No hay migración: todo el cambio es configuración, scripts y workflow. **Rollback**: revertir el commit deja el pipeline exactamente como está hoy; no hay estado persistido, ni artefacto publicado afectado, ni consumidor externo tocado.

## Open Questions

Ninguna bloqueante. Anotadas para después:

- Typechequear los archivos de configuración del repo (`vitest.config.ts`, `sd.config.mjs`) requiere `@types/node` por workspace — hoy nadie los verifica. Candidato a ítem propio.
- ~~`HU-030` (bundle size budget con `size-limit`) no está asignada a ninguna parte del plan~~ → **resuelto el 2026-07-29**: el PO delegó la ubicación; se incorporó como **ítem 12 de la Parte F**, ejecutable como **F3** (change propio, después de F2). Registrado en el plan de acción y en el BACKLOG.

# Design — ci-bundle-size-budget

Decisiones de implementación del presupuesto de tamaño. Todo número de este documento fue **medido** el 2026-07-31 sobre un `pnpm -r build` fresco, no estimado.

## D1 — Qué se mide: el `dist`, con `@size-limit/file`

`@size-limit/file` mide el archivo emitido tal cual, comprimido, **sin bundlear ni resolver imports**. Es lo correcto para este caso por dos razones:

1. Lo que se gatea es **el artefacto que se publica**. Cualquier medición que bundlee introduce una capa propia (resolución de externals, tree-shaking del bundler) cuyo resultado puede moverse sin que el artefacto haya cambiado — un rojo que no se corresponde con el problema.
2. `components` declara todo Angular como `peerDependencies`. Bundlear el entrypoint sin marcarlos external arrastraría el framework entero al número; marcarlos external es config que hay que mantener alineada con el `package.json`, y desalinearla degrada el gate en silencio.

**Contrapartida asumida y explícita**: el número mide el **bundle completo**, no lo que paga un consumidor que importa un solo componente con tree-shaking. Detecta "el kit engordó", que es exactamente el objetivo de `ci-cd-14` (degradación acumulativa). Medir el costo de un import puntual es más informativo y queda como candidato de fase 2 (ver alternativas del `proposal.md`).

## D2 — Los cinco entrypoints

Se gatea **todo path publicable declarado en el `exports` de cada package**, no una muestra:

| Entrypoint                                         | Declarado en                        |
| -------------------------------------------------- | ----------------------------------- |
| `components/dist/fesm2022/…-components.mjs`        | `exports["."]` de components        |
| `components/dist/fesm2022/…-components-router.mjs` | `exports["./router"]` de components |
| `tokens/dist/tokens.css`                           | `exports["./css"]` de tokens        |
| `tokens/dist/tokens.js`                            | `exports["."]` de tokens            |
| `tokens/dist/themes/*.css`                         | `exports["./themes/*"]` de tokens   |

Los tres themes van en **una sola entrada** (`themes/*.css`): pesan 998 B sumados, y tres límites de ~200 B cada uno serían ruido sin valor de gate. `size-limit` comprime cada archivo del glob y suma — verificado contra la medición individual (0.55 + 0.21 + 0.21 KiB).

CA-030.1 pedía "al menos un entrypoint por package"; se cubren los cinco porque un entrypoint sin techo es una vía de escape.

## D3 — Los techos: medición y margen

`size-limit` reporta en **kB decimales (1000 B)**, no KiB. Los valores de esta tabla son los que emite `size-limit --json`, en bytes:

| Entrypoint              | Medido (B) | Medido (kB) | Techo    | Margen absoluto |
| ----------------------- | ---------- | ----------- | -------- | --------------- |
| components (principal)  | 43 218     | 43.22       | 45.38 kB | 2 162 B         |
| components (`./router`) | 2 003      | 2.00        | 2.11 kB  | 100 B           |
| tokens (`tokens.css`)   | 5 849      | 5.85        | 6.15 kB  | 292 B           |
| tokens (`tokens.js`)    | 5 526      | 5.53        | 5.81 kB  | 276 B           |
| tokens (themes)         | 998        | 1.00        | 1.05 kB  | 50 B            |

**Regla aplicada**: `techo = medido × 1.05`, redondeado **hacia arriba** al siguiente múltiplo de 10 B (dos decimales de kB). Es reproducible: cualquiera puede recalcular el techo desde la medición sin interpretar un criterio.

**El margen del 5% es decisión del PO** ([D-031], 2026-07-31), tomada sobre tres opciones (5%, 10%, sin margen) con la medición ya en la mano.

### Por qué 5% mantiene el techo filoso — dato medido

El margen tenía que quedar **por debajo del costo de un componente**, o el gate dejaría entrar un componente entero sin decir nada. Se midió el costo real quitando `accordion` del `public-api.ts` y reconstruyendo:

- con `accordion`: **43 218 B** · sin `accordion`: **40 902 B** → **2 316 B** por un componente real.
- margen del 5% sobre el bundle: **2 162 B**.

**2 162 < 2 316**: un componente real no entra en el margen. Un `components-add-*` va a tener que subir el techo en su PR, que es el comportamiento buscado.

> **Un dato que corrige un supuesto intuitivo**: un componente _minimalista_ (tres inputs, sin lógica) pesa solo **260 B** — se midió con una sonda temporal. Es decir, "un componente" no es una unidad de peso: va de 0.26 a 2.3 kB. El margen se calibró contra un componente **real** del kit, no contra el caso mínimo, porque es el caso mínimo el que haría parecer holgado a un margen que no lo es.

## D4 — Config única en el root

`.size-limit.json` vive en la raíz y declara los cinco entrypoints con paths relativos al repo. Las alternativas y su descarte están en el `proposal.md`; el argumento decisivo es que en pnpm los binarios del root **no** se resuelven desde el `node_modules` de cada workspace, así que una config por package obligaría a duplicar la devDependency en ambos. El precedente del repo es `verify:packaging`: un script único de root que verifica los dos packages.

## D5 — Verificación del gate en ambos sentidos

Regla heredada de F1-b y F2: **un gate que no se probó fallando no está instalado**. Se ejecutaron cuatro pruebas, todas sobre el repo real:

| Prueba                                                                                                | Resultado                                                                                                  |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Verde**: los cinco entrypoints contra sus techos                                                    | exit **0**, los cinco bajo el límite                                                                       |
| **Rojo por `components`**: 12 componentes sonda agregados al `public-api.ts` + rebuild con ng-packagr | exit **1** — `has exceeded by 275 B`, 45.66 kB contra 45.38 kB                                             |
| **Rojo por `tokens`**: 120 tokens sonda agregados a `primitives/` + rebuild con Style Dictionary      | exit **1** — falla en `tokens.css` (+139 B) **y** en `tokens.js` (+179 B), las dos salidas del mismo build |
| **Sin artefacto**: path inexistente y glob sin matches                                                | exit **1**, `Size Limit can't find files at …` — **no hay verde falso cuando el gate no puede medir**      |

Las dos pruebas de rojo se hicieron sobre **las dos cadenas de build distintas** (ng-packagr y Style Dictionary) a propósito: probar solo una habría dejado sin verificar la mitad del presupuesto.

La cuarta prueba es la que la lección de F2 obliga a hacer siempre — _qué pasa cuando el gate no puede medir_. `size-limit` falla en vez de reportar 0 B, así que un `dist` ausente (build que no corrió, path renombrado) da rojo y no verde. **No hizo falta blindaje extra**: a diferencia de los helpers de axe y de CSS fuente de F2, la herramienta ya se comporta bien en el caso degenerado.

Tras cada prueba se restauró el source y se reconstruyó: `components` volvió **exactamente** a 43 218 B, lo que confirma de paso que el build es determinista y que la restauración fue completa.

## D6 — Ubicación del step en `pr.yml`

Va **después de `Verify packaging`** y antes de `OpenSpec validate`. Ambos son gates sobre el artefacto emitido y comparten precondición (`pnpm -r build` ya corrió), así que quedan contiguos y se leen como un bloque. No necesita infraestructura nueva: el build recursivo ya está en el pipeline desde antes.

Esto satisface CA-030.3 por construcción — el `dist` que mide es el que el propio PR acaba de construir, no un artefacto previo ni el código fuente.

## D7 — Diagnóstico

CA-030.5 exige que el fallo se entienda sin reproducir la medición en local. La salida de `size-limit` ya lo cumple sin trabajo extra — es la salida real de la prueba de rojo:

```
@romanmartinidev/components — entrypoint principal (fesm2022)
Package size limit has exceeded by 275 B
Size limit: 45.38 kB
Size:       45.66 kB gzipped
…
Try to reduce size or increase limit at .size-limit.json
```

Trae el entrypoint, el exceso, el límite y el medido. Por eso los `name` de la config son descriptivos y nombran el package y el subpath: son lo que se lee en el log de CI.

## D8 — La política tiene que estar donde se lee el fallo

El riesgo de un techo apretado **no es que empuje a recortar componentes** —el techo se sube y listo— sino la **habituación**: un gate que se pone rojo por causas rutinarias enseña a subir el número sin mirar, y ahí deja de ser un gate. La mitigación no es aflojar el techo; es que la subida sea un **paso previsto del flujo** y no una interrupción. Dos medidas, ambas baratas:

1. **`pnpm size` entra a la validación de cierre de `/ds:add-component`**, con la instrucción explícita de subir el límite al nuevo peso medido + 5%. Así el autor de un componente ve el número **al cerrar**, no cuando CI le frena el PR. Es donde la fricción se elimina de verdad, porque el caso previsto —componente nuevo excede el techo— deja de ser una sorpresa.
2. **Un step `if: failure()` en `pr.yml` imprime la política junto al fallo.** `size-limit` cierra con `Try to reduce size or increase limit`, que pone "reduce" primero; en este repo el default es el opuesto. Sin esta nota la política vive solo en `CONTRIBUTING.md`, que no es lo que tiene delante quien lee un job rojo.

El step va **acotado por `steps.<id>.conclusion`**, no con un `if: failure()` pelado: este último dispararía el mensaje cuando lo que falló fue el lint, y un consejo sobre presupuesto de bundle al pie de un error de ESLint es exactamente la clase de ruido que hace que se dejen de leer los logs.

**Frecuencia real de fallo esperada**, que es lo que decide si el techo apretado se sostiene: un componente nuevo lo excede (2 316 B contra 2 162 B); los fixes de la Parte G no (suman cientos de bytes); la variación de entorno tampoco (ver D9). En el horizonte visible eso es **un fallo**, el de HU-025 — y con la medida 1 ni siquiera llega a CI en rojo.

## D9 — El margen no se lo come la variación entre plataformas

Los techos se midieron en Windows y CI mide en Linux. Con 292 B de margen en `tokens.css`, una diferencia de line endings alcanzaría para moverlo, así que se verificó en vez de suponerlo:

| Artefacto          | CRLF  | Rutas absolutas embebidas | gzip tal cual vs. normalizado a LF |
| ------------------ | ----- | ------------------------- | ---------------------------------- |
| `tokens.css`       | **0** | **0**                     | 5 849 B = 5 849 B (delta 0)        |
| `tokens.js`        | **0** | **0**                     | 5 526 B = 5 526 B (delta 0)        |
| `…-components.mjs` | **0** | **0**                     | 43 218 B = 43 218 B (delta 0)      |

Los tres emiten **LF puro incluso en Windows** y no embeben rutas ni timestamps, así que son byte-idénticos entre plataformas. El margen del 5% queda íntegro para crecimiento real. Sin esta verificación el margen habría sido una apuesta: parte de él podría haberse consumido en ruido de entorno, y el primer rojo habría sido inexplicable.

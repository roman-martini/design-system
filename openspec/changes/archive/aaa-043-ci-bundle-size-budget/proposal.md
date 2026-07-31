---
id: aaa-043
name: ci-bundle-size-budget
type: change
status: archived
archived: 2026-07-31
modifies-specs:
  - ci-cd-pipeline
related-decisions:
  - D-021
  - D-017
  - D-031
---

# Proposal — ci-bundle-size-budget

# Why

**El repo publica dos librerías en npm sin que nada mida el peso que paga el consumidor.** Es el último gate declarado y no cableado del pipeline: una dependencia accidental, un import barrel o un componente que arrastra más de lo que aparenta engordan el artefacto publicado sin que ningún check lo note, hasta que un consumidor lo sufre en su app [ci-cd-14].

El ítem venía anotado en la Cantera del backlog y [ADR-006](../../../docs/architecture/adr/ADR-006-estrategia-ci-cd.md) lo había diferido explícitamente como `ci-bundle-budget`. El hallazgo recomienda **fijar la línea base ahora que los números son chicos**, y ese argumento se refuerza con la medición de este change: el kit son 43.22 kB gzip con 23 componentes, y la Parte G más HU-025 (Slider) van a tocar ocho de ellos.

Es la **Parte F, sub-parte F3** de la review integral 2026-07-26 (`docs/reviews/2026-07-26-review-integral/plan-de-accion.md`, ítem 12) y entrega **HU-030** (EP-005). Cierra la Parte F. El PO aprobó la ampliación de EP-005 a "todos los gates de calidad, con una HU por gate y criterios binarios" en [D-021].

**Prioridad que lo respalda**: la **1 (buenas prácticas)** — presupuesto de tamaño es práctica base de una librería front publicada — y la **2 (escalar ordenado)**: el techo escala solo, cada componente nuevo entra con el costo visible sin depender de que alguien se acuerde de mirarlo. [D-017] refuerza el criterio: se elige el patrón robusto aunque cueste más.

## Revalidación del hallazgo (2026-07-31)

`ci-cd-14` tenía verificación adversarial ("Confirmado"). Revalidado contra el repo antes de implementar:

- **Confirmado**: no existe ninguna config de `size-limit`, `bundlesize` ni `bundlewatch` en el repo, ningún script mide peso, y `pr.yml` no tiene step de tamaño. El único rastro es documental (Cantera del backlog y el diferimiento de ADR-006).
- **Corregido un supuesto de la recomendación**: el hallazgo ofrece "`size-limit` **o** `pnpm pack` + medición del tarball" como equivalentes. No lo son, y la decisión de refinamiento 1 de HU-030 ya había elegido `dist` sobre tarball. La medición lo confirma: el tarball de `components` incluye los `.map` (225 kB solo el del entrypoint principal), que el consumidor nunca descarga en runtime — un presupuesto sobre el tarball mediría mayormente sourcemaps.

# What Changes

- **`size-limit` + `@size-limit/file` como devDependency del root**, con **una única `.size-limit.json` en la raíz** que declara los **cinco entrypoints publicables** de ambos packages, cada uno con su límite explícito y `gzip: true`.
- **Los techos se fijaron midiendo el `dist` construido**, no en un número aspiracional, y con el **margen del 5%** que decidió el PO ([D-031]). Los valores medidos, la regla de redondeo y el razonamiento están en `design.md`.
- **El techo es un trinquete invertido**: solo se mueve por decisión explícita del PO, con la razón registrada en el PR que lo mueve (decisión de refinamiento 3 de HU-030). Se documenta en `CONTRIBUTING.md`.
- **Script `size` en el root** (`pnpm size`), ejecutable en local con el mismo comando que corre CI.
- **Step nuevo y bloqueante en `pr.yml`**, ubicado después del build recursivo y junto a `verify:packaging` — ambos son gates sobre el artefacto emitido. Falla el PR, no advierte.
- **`CONTRIBUTING.md`** documenta el presupuesto: cómo correrlo en local, qué significa cada límite y cuál es la política para moverlo.

Este change **no toca `packages/`** en absoluto —ni sources, ni configs, ni manifests—: solo el `package.json` del root, un archivo de config nuevo en la raíz, el workflow y documentación. Por lo tanto **no requiere changeset**: el enforcement de `pr.yml` solo lo exige ante cambios bajo `packages/`.

## Corrección de drift detectada al ejecutar

`CONTRIBUTING.md` enumera los steps de `pr.yml` y **le falta el de `build-storybook`**, que `aaa-042` (F2) agregó al workflow sin actualizar la lista. Se corrige en este change por ser el mismo archivo y la misma lista que el step nuevo modifica; no se deja como nota suelta.

## Alternativas evaluadas

| Opción                                                                      | Por qué se descarta                                                                                                                                                                                                                                                                                                                                             |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Medir el tarball con `pnpm pack`**                                        | Descartado por la decisión de refinamiento 1 de HU-030 y confirmado al medir: el tarball de `components` está dominado por sourcemaps (225 kB de `.map` contra 293 kB de código), que el consumidor no descarga. Mediría el empaquetado, no el peso real.                                                                                                       |
| **`@size-limit/esbuild` para medir un import tree-shakeado**                | Mide lo que paga un consumidor que importa un solo componente — más informativo, y el candidato natural para una fase 2. Se descarta ahora porque exige declarar todo Angular como external y mantener un set de imports representativos: el gate pasaría a depender de un bundling propio, y su rojo podría venir de la config del bundler y no del artefacto. |
| **Config `size-limit` por package en vez de una única en el root**          | Idiomático de `size-limit`, pero obliga a duplicar la devDependency en ambos packages (los binarios del root no se resuelven desde el `node_modules` de cada workspace en pnpm) y dispersa el presupuesto en dos archivos. El repo ya tiene el precedente opuesto y bueno: `verify:packaging` es un script único de root que verifica ambos packages.           |
| **Presupuesto también sobre `apps/playground`**                             | Declarado **fuera de alcance** por HU-030: no es artefacto publicable ([D-001], laboratorio interno).                                                                                                                                                                                                                                                           |
| **Reportar el diff de peso como comentario en el PR (`size-limit-action`)** | Fuera de alcance por HU-030. Suma una action externa con permisos de escritura sobre el PR para un beneficio de visibilidad, no de enforcement. Candidato a futuro si el gate se vuelve poco visible.                                                                                                                                                           |

El change **no es one-way door** (todo es configuración reversible) y no introduce un patrón arquitectónico nuevo — hereda el de `aaa-040`: medir, fijar con margen, trinquete, step bloqueante. **No genera ADR.** La política queda en `CONTRIBUTING.md` y el contrato en la spec.

# Capabilities

## New Capabilities

Ninguna.

## Modified Capabilities

- `ci-cd-pipeline`: se agrega un requirement de **presupuesto de tamaño de bundle** — límite por entrypoint publicable medido sobre el `dist` del propio PR, con exceso bloqueante y techo que solo se mueve por decisión del PO.

# Impact

**Código y configuración**

- `.size-limit.json` — **archivo nuevo** en el root: cinco entrypoints con límite y `gzip`.
- `package.json` (root) — script `size`; devDependencies `size-limit` y `@size-limit/file`.
- `.github/workflows/pr.yml` — step nuevo `Bundle size budget`, bloqueante, después de `Verify packaging`.
- `CONTRIBUTING.md` — sección de presupuesto de bundle, más la corrección del step de Storybook faltante en la lista de `pr.yml`.

**Riesgos**

- **El techo de `components` se mueve con cada componente nuevo.** Es deliberado: con el margen del 5% (2.16 kB) y un componente real costando ~2.3 kB gzip (medido sacando `accordion`), un `components-add-*` va a tener que subir el techo en su propio PR. Eso es la función del gate —dejar registrado cuánto pesó cada componente—, no un efecto colateral. La válvula de escape es explícita y con dueño.
- **Un salto de versión de `ng-packagr` o de Angular puede mover el peso sin que nadie haya agregado nada.** El margen del 5% absorbe variación menor; un salto mayor se trata como lo que es —el artefacto cambió— y se registra al subir el techo.

**Sin impacto en**: la API pública de ambos packages, el contenido de los tarballs publicados, la suite de tests y el gate de publish de [ADR-022].

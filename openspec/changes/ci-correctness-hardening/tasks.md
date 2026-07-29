# Tasks — aaa-039 — CI: correctness + hardening

Cada tarea es ≤2 h con criterio binario. Diseño: enforcement (design §1), gate de publish (§2), pinning (§3), CLI de OpenSpec (§4), actionlint (§5), commitlint (§6), Dependabot (§7), scripts (§8), alcance de verificación (§9).

Orden: primero lo que destraba el pipeline (2 y 3), después el hardening.

## 1. Pre-flight

- [x] 1.1 Suite verde de partida: `pnpm -r build`, `pnpm -r test`, `pnpm lint`, `pnpm format:check` y `pnpm verify:packaging` pasan.
- [x] 1.2 Dejar `actionlint` disponible en local para poder verificar los YAML de este change (design §9).
- [x] 1.3 Correr `actionlint` sobre los workflows **actuales** como línea base: registrar qué reporta antes de tocar nada.

**Criterio**: suite verde; actionlint ejecutable; línea base registrada.

## 2. CLI de OpenSpec correcto y pinneado

- [x] 2.1 `@fission-ai/openspec@1.6.0` como devDependency del root (versión exacta, sin rango) + script `"openspec": "openspec"` en el root.
- [x] 2.2 Verificar con el binario del repo (no el global): `pnpm exec openspec validate --all` → 27 passed, 0 failed, igual que la línea base del §4 del diseño.
- [x] 2.3 Verificar que `pnpm openspec validate --changes` funciona — es el comando que `openspec/README.md` y `CONTRIBUTING.md` ya documentan y que hoy no corre.
- [x] 2.4 Reemplazar el step de `pr.yml` por `pnpm exec openspec validate --all`.

**Criterio**: el CLI resuelve desde `node_modules`, valida el repo entero, y los comandos documentados funcionan tal como están escritos.

## 3. Changeset enforcement determinista

- [x] 3.1 Reescribir el step según design §1: detección por archivos, SHAs del evento (`base.sha`/`head.sha`), `--diff-filter=AM` en los changesets, `|| true` acotado al grep, y excepción `if: github.head_ref != 'changeset-release/main'` a nivel step.
- [x] 3.2 Mensaje de salida que distinga los tres desenlaces: sin cambios en packages, excepción "solo README/CHANGELOG de package" reconocida (lo exige el scenario de la spec), y falta de changeset con la instrucción `pnpm changeset`.
- [x] 3.3 Verificar la lógica **ejecutando el script a mano** contra escenarios reales de git del repo (design §9): (a) PR que toca sólo `docs/`; (b) PR que toca `packages/*/src` sin changeset → falla; (c) el mismo con changeset → pasa; (d) PR que toca sólo `packages/*/README.md`; (e) diff que simula el PR de release (bump de `package.json` + CHANGELOG, borrado de `.changeset/*.md`); (f) `git diff` con una ref inexistente → el step falla en vez de pasar mudo.

**Criterio**: los escenarios dan el veredicto esperado corriendo el script fuera de Actions. Ejecutados 7 (se sumó CHANGELOG-only aparte de README-only), todos OK; el harness extrae el bloque `run:` del `pr.yml` real, así que testea el código que corre en CI y no una copia.

## 4. Gate de aprobación del publish

- [x] 4.1 Partir `release.yml` en job `version` (expone `hasChangesets` como output) y job `publish` (`needs: version`, `if: needs.version.outputs.hasChangesets == 'false'`, `environment: npm-publish`), según design §2.
- [x] 4.2 Mover `NPM_TOKEN` al job de publish únicamente; el job `version` no lo referencia.
- [x] 4.3 Permisos por job: `version` con `contents: write` + `pull-requests: write`; `publish` con `id-token: write` (provenance, D-018c) y `contents: **write**` — corregido durante la ejecución: se planeó `read`, pero el fuente de `changesets/action` v1.9.0 confirma que `runPublish` pushea los tags de release y crea los GitHub releases. El least-privilege de ese job lo aporta el gate de aprobación, no el permiso.
- [x] 4.4 Documentar en `CONTRIBUTING.md` la creación del environment `npm-publish` con required reviewer, junto a la advertencia de que **hasta que exista no protege** (GitHub lo crea implícito y sin reviewers).
- [x] 4.5 Registrar la decisión en **ADR-022** (matiza el modelo de release de ADR-006) y agregar la fila en `docs/architecture/decisions-log.md`.

**Criterio**: el publish queda tras un environment; el YAML no expone el token fuera de ese job; la acción manual del mantenedor está documentada y no se presenta como resuelta.

> **Acción del mantenedor, no automatizable**: crear el environment en GitHub Settings → Environments con required reviewer y mover el secret. Sin ese paso el gate es decorativo.

## 5. Hardening de workflows

- [x] 5.1 `permissions: contents: read` a nivel workflow en `pr.yml`; permisos por job en `release.yml` (ver 4.3).
- [x] 5.2 `timeout-minutes` en todos los jobs (`validate`, `version`, `publish`).
- [x] 5.3 Pinear las cuatro actions por SHA completo con el tag como comentario, subiendo a la última major (design §3): checkout `3d3c42e5…` (v7.0.1), setup-node `82076278…` (v7.0.0), pnpm/action-setup `0ebf4713…` (v6.0.9), changesets/action `a45c4d59…` (v1.9.0). Incluye `.github/actions/setup/action.yml`.
- [x] 5.4 Verificar que la composite action sigue coherente tras el salto de majors: `cache: 'pnpm'` explícito y `version:` omitido a propósito (design §3) siguen siendo el comportamiento buscado.

**Criterio**: cero referencias `uses:` con tag mutable en todo `.github/`; todos los jobs acotados en tiempo y permisos.

## 6. Gates nuevos en pr.yml

- [x] 6.1 Step de `actionlint`: descarga de la versión fija `1.7.12`, verificación del SHA256 `8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8` **antes** de extraer, y ejecución sobre `.github/workflows/*.yml` (design §5). Alcance corregido durante la ejecución: **la composite action queda fuera** — actionlint solo entiende el schema de workflow y la reporta como inválida por no declarar `on` ni `jobs`; incluirla habría roto el step en todo PR.
- [x] 6.2 Step de `commitlint` sobre `base.sha`→`head.sha` con `--verbose` (design §6), reutilizando la config existente.
- [x] 6.3 Verificar commitlint en local sobre el rango de commits de este mismo change: debe pasar.

**Criterio**: ambos gates corren y fallan por la razón correcta.

## 7. Dependabot

- [x] 7.1 `.github/dependabot.yml` con ecosistemas `github-actions` y `npm`, weekly, agrupando minor/patch y dejando los majors sueltos (design §7).
- [x] 7.2 Verificar el YAML con actionlint / validación de schema.

**Criterio**: config válida y coherente con el pinning por SHA.

## 8. Scripts del root y alineación documental

- [x] 8.1 Renombrar `"version"` → `"changeset:version"` y **eliminar** el script `"release"` (design §8).
- [x] 8.2 Actualizar el comentario de `release.yml` sobre el builtin de pnpm: ya no hace falta esquivar la colisión.
- [x] 8.3 Alinear con el publish real (build separado + `changeset publish`) y con la eliminación del script: `CONTRIBUTING.md` (§ CI / Release, § Secrets, § Lint de workflows — sacar el "no es obligatorio"), `docs/architecture/README.md`, `CLAUDE.md` y `openspec/README.md` (nota del CLI vía `npx`).
- [x] 8.4 Verificar que ninguna doc versionada sigue citando `pnpm release` ni `npx --yes openspec` como el camino oficial.

**Criterio**: cero drift entre lo documentado y lo que corre.

## 9. Validación de cierre

- [x] 9.1 `actionlint` verde sobre los workflows finales (ver el alcance corregido en 6.1).
- [x] 9.2 `pnpm install --frozen-lockfile`, `pnpm -r build`, `pnpm -r test`, `pnpm lint`, `pnpm format:check`, `pnpm verify:packaging` verdes.
- [x] 9.3 `pnpm exec openspec validate --all` verde (incluye este change).
- [x] 9.4 Confirmar que este change **no lleva changeset**: no toca `packages/*`. Es la primera prueba real del gate reescrito.
- [x] 9.5 Dejar registrado el hallazgo del package `openspec` equivocado (design §4) donde corresponda por gobernanza — no se pierde en el artefacto de un change que se archiva.
- [x] 9.6 Proponer mensaje de commit y **esperar el OK del PO** antes de commitear.

**Criterio**: repo verde, gobernanza registrada, commit a la espera de aprobación.

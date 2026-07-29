---
id: aaa-039
name: ci-correctness-hardening
type: change
status: proposed
modifies-specs:
  - ci-cd-pipeline
related-adrs:
  - ADR-006
  - ADR-022
related-decisions:
  - D-018
  - D-028
---

# Proposal — ci-correctness-hardening

# Why

**El pipeline de CI del repo hoy no funciona.** No es una degradación de calidad: son dos gates obligatorios rotos, y cualquiera de los dos alcanza para dejar todo PR en rojo.

1. **El gate de changesets rompe el PR de release.** El enforcement de `pr.yml` detecta cambios bajo `packages/` excluyendo solo `(README|CHANGELOG).md`, pero el PR autogenerado `changeset-release/main` bumpea `packages/*/package.json` — así que entra en la rama que exige changeset, y en esa rama los changesets ya fueron consumidos, con lo que `changeset status --since=origin/main` sale con exit 1 y el gate falla. Con branch protection exigiendo el check `Validate`, el PR de release no se puede mergear sin bypass de admin. Es lo que bloquea el `0.3.0` acordado en D-028 [ci-cd-01].

2. **El gate de OpenSpec nunca validó nada — y falla siempre en CI.** El step corre `npx --yes openspec validate --all`, pero **el package `openspec` de npm no es el CLI de OpenSpec**: es un placeholder de 2019 (`openspecio/openspec`), versión única `0.0.0`, sin campo `bin`. `npx` no puede determinar un ejecutable y el step aborta. Localmente la ilusión se sostiene porque el binario existe en el PATH global del mantenedor (`@fission-ai/openspec@1.3.1` instalado global). El CLI real es **`@fission-ai/openspec`**. Este es un **hallazgo nuevo de esta sesión**: es la causa raíz debajo de [ci-cd-05] y [openspec-01], que estaban redactados como "falta pinear la versión" — el problema no es la versión, es el package.

Sobre esa base, el resto del pipeline arrastra los gaps de hardening que la review identificó: el publish a npm sin gate de aprobación pese a que D-018(b) lo decidió como control técnico [ci-cd-02], `permissions` y `timeout-minutes` ausentes [ci-cd-03], cuatro actions pineadas por tag mutable [ci-cd-04], Conventional Commits sin enforcement fuera del hook local [ci-cd-06], cero automatización de updates [ci-cd-07, tooling-repo-02], drift entre la spec y el `release.yml` real [ci-cd-12], `actionlint` declarado como SHALL sin correr en CI [ci-cd-13] y un script `version` que el builtin de pnpm pisa [tooling-repo-12].

Es la Parte E de la review integral 2026-07-26 (`docs/reviews/2026-07-26-review-integral/plan-de-accion.md`) y el segundo de sus tres críticos. D-028 la declaró bloqueante del release: sin esta parte no hay `0.3.0`.

# What Changes

- **Changeset enforcement determinista** [ci-cd-01]: detección basada en archivos (`git diff --name-only`), sin parsear el output decorado del CLI; excepción explícita para el branch `changeset-release/main`; `|| true` acotado al grep de exclusión (hoy cubre todo el pipeline y convierte un error de git en un pase silencioso); mensaje que nombra la excepción reconocida, como exige el scenario de la spec.
- **CLI de OpenSpec correcto y pinneado**: `@fission-ai/openspec@1.6.0` como devDependency del root, script `openspec` en el root y step de CI vía `pnpm exec`. Arregla además los comandos documentados en `openspec/README.md` y `CONTRIBUTING.md`, que hoy no corren para nadie sin instalación global [ci-cd-05, openspec-01].
- **Gate de aprobación del publish** [ci-cd-02, D-018(b)]: `release.yml` se parte en dos jobs — `version` (sin gate, abre/actualiza el PR de versionado) y `publish` (con `environment: npm-publish`, corre solo cuando no quedan changesets pendientes). El `NPM_TOKEN` pasa a ser secret del environment. Genera **ADR-022**, que matiza el modelo de release de ADR-006.
- **Hardening de workflows** [ci-cd-03, ci-cd-04]: `permissions` de least-privilege en ambos workflows, `timeout-minutes` en todos los jobs, y las cuatro actions externas pineadas por **SHA completo** con el tag en comentario — subiendo de paso a la última major de cada una (checkout v4→v7, setup-node v4→v7, pnpm/action-setup v4→v6, changesets/action v1.9.0).
- **Gates nuevos en `pr.yml`**: `actionlint` (binario pineado por versión + verificación de checksum SHA256) [ci-cd-13] y `commitlint` sobre el rango real del PR [ci-cd-06].
- **Dependabot** [ci-cd-07, tooling-repo-02]: `.github/dependabot.yml` con los ecosistemas `npm` y `github-actions`, cadencia semanal y agrupamiento de minor/patch. Es lo que convierte el pinning por SHA en algo mantenible.
- **Alineación spec ↔ implementación** [ci-cd-12]: la spec y la documentación pasan a describir el publish real (build separado + `changeset publish`); el script `release` del root se **elimina** por ser un camino de publish manual de un comando, y `version` se renombra a `changeset:version` para sacar la colisión con el builtin de pnpm [tooling-repo-12].

# Capabilities

## Modified Capabilities

- `ci-cd-pipeline`: el requirement de changeset enforcement suma la excepción del PR de release y la exigencia de detección por archivos; el de release se reescribe sobre el modelo de dos jobs con gate de aprobación; se agregan requirements de hardening (permissions, timeouts, pinning por SHA, automatización de updates) y de enforcement en CI de `actionlint` y Conventional Commits; el requirement de validación OpenSpec pasa a nombrar el package real y a exigirlo bajo lockfile.

# Alternativas evaluadas

**Excepción del PR de release** — se evaluó (a) detectar el patrón de cambios (bump de `package.json` + `CHANGELOG.md` sin otros archivos) y (b) excluir por nombre de branch. Se elige (b): `changeset-release/main` es el branch que `changesets/action` crea por contrato, es explícito en el YAML y no depende de heurísticas sobre el contenido del diff, que un cambio futuro de Changesets podría invalidar en silencio.

**Gate de publish** — se evaluó poner `environment: npm-publish` en el job único actual. Descartado: obligaría a aprobar manualmente **cada push a main**, incluidos los que solo actualizan el PR de versionado, y el gate se volvería ruido que se aprueba por reflejo. Partir en dos jobs pone la aprobación exactamente donde el acto es irreversible. Detalle en `design.md` §2.

**Pinning por SHA** — se evaluó pinear el SHA de la v4 que el repo ya usa (cambio mínimo, cero riesgo funcional). Descartado: congela actions de 2024 y contradice el criterio del PO de elegir el estándar que se sostiene a futuro. Se sube a la última major de cada action, con los breaking changes verificados uno por uno contra sus release notes (design.md §3).

# Impact

- **Archivos**: `.github/workflows/{pr.yml, release.yml}`, `.github/actions/setup/action.yml`, `.github/dependabot.yml` (nuevo), `package.json` root (scripts + devDependency), `pnpm-lock.yaml`, `CONTRIBUTING.md`, `openspec/README.md`, `CLAUDE.md`, `docs/architecture/README.md`, `docs/architecture/adr/ADR-022-*.md` (nuevo), `docs/architecture/decisions-log.md`.
- **Packages publicables**: ninguno se toca. **Este change no lleva changeset** — y eso es a la vez la primera prueba del gate reescrito.
- **Acción manual del mantenedor** (no automatizable por código): crear el environment `npm-publish` en GitHub con required reviewer y mover `NPM_TOKEN` a sus secrets. **Hasta que eso ocurra el gate no protege**: GitHub crea al vuelo un environment inexistente, sin reviewers. Queda documentado en `CONTRIBUTING.md` y como task explícita.
- **Consecuencia conocida**: un PR de Dependabot que toque una dependencia de `packages/*` va a exigir changeset. Es correcto (cambia el artefacto publicado) y se resuelve agregándolo al PR.
- **Verificación**: el pipeline no se puede ejecutar localmente. Lo que sí se verifica acá: `actionlint` sobre los YAML finales, simulación del script de enforcement contra escenarios reales de git, y `openspec validate --all` con el CLI pinneado. El resto se confirma en el primer PR real.
- **Desbloquea**: el `0.3.0` de D-028, que además espera las Partes G e I.

---
epica: EP-003
actor: Dev consumidor
estado: Hecha (2026-07-18, aaa-020 repo-release-lockstep; 0.2.0 en npm, lockstep ADR-015)
decisiones: [D-003, D-004]
adrs: [ADR-015]
---

# HU-002 — Primer release publicado en npm (dev consumidor)

**COMO** dev de una app Angular (empezando por los proyectos del propio PO)
**QUIERO** instalar `@romanmartinidev/tokens` y `@romanmartinidev/components` desde npm
**PARA** usar el DS en proyectos reales fuera de este monorepo.

## Criterios de aceptación

- [x] **CA-002.1** — Dado los changesets acumulados, cuando corre el pipeline de release (aaa-005), entonces `@romanmartinidev/tokens` y `@romanmartinidev/components` quedan publicados en npm con `access: public` y versiones `0.x` acordes a los changesets. ✔ 0.2.0/0.2.0 (lockstep ADR-015), 2026-07-18.
- [x] **CA-002.2** — Dado el tarball publicado de `components`, entonces la dependencia a `tokens` figura como rango semver real (nada de `workspace:*`). ✔ `npm view` muestra `>=0.1.0 <1.0.0`, sin `dependencies` filtradas.
- [x] **CA-002.3** — Dado un proyecto Angular limpio fuera del monorepo, cuando se instala desde npm y se sigue el quickstart de los READMEs, entonces un `ds-button` con tokens aplicados renderiza sin pasos no documentados. ✔ `ng new` + quickstart → build de producción verde con `--ds-*` y dark theme en el bundle.
- [x] **CA-002.4** — Dado el release publicado, entonces el repo queda consistente: changesets consumidos, versiones commiteadas y tag/changelog generados por el pipeline. ✔ PR #1 mergeado: `.changeset/` sin pendientes, CHANGELOGs y versiones en main.

## Dependencias

- Decisión del PO de estrenar el pipeline (pregunta abierta 1 de la épica) — es el **disparador de ejecución**, no bloquea el refinamiento.

## Fuera de alcance

- Política de estabilidad 1.0 (D-004: se acuerda al llegar; este primer release es `0.x`).
- Promoción/difusión del package.

## Notas

- **Cierre (2026-07-18)** — `tokens@0.2.0` y `components@0.2.0` publicados en npm por el pipeline (aaa-005) tras el merge del PR de versionado; preparación del repo en [aaa-020 repo-release-lockstep](../../../../openspec/changes/archive/aaa-020-repo-release-lockstep/) (lockstep [ADR-015](../../../architecture/adr/ADR-015-versionado-lockstep.md)).
- El pipeline (GitHub Actions + Changesets que abre PR de versionado) existe desde [aaa-005](../../../../openspec/changes/archive/aaa-005-bootstrap-fase-5-ci/) y nunca se estrenó.

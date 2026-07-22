---
estado: En desarrollo (primer release 0.2.0 en npm 2026-07-18; próximos releases son operación normal del pipeline)
actor: Dev consumidor
---

# EP-003 — Consumo y distribución

## Contexto

De nada sirve un DS que no se puede instalar: esta épica cubre todo el camino desde "las libs existen en el monorepo" hasta "un dev las instala desde npm y arranca en minutos".

## Alcance

Empaquetado (APF/exports/tree-shaking), versionado (Changesets), pipeline de release, documentación de consumo (READMEs, quickstart) y la experiencia de instalación (peers documentadas). Queda afuera: el contenido de las libs (EP-001/002) y Storybook como laboratorio (es interno).

## Valor entregado

| Entrega                                                             | Change                                                                               | Qué obtuvo el dev consumidor   |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------ |
| Monorepo + Changesets + Conventional Commits                        | [aaa-001](../../../../openspec/changes/archive/aaa-001-bootstrap-fase-1-monorepo/)   | Versionado semver disciplinado |
| Tokens npm-ready (exports granulares, tree-shaking, tarball limpio) | [aaa-002](../../../../openspec/changes/archive/aaa-002-bootstrap-fase-2-tokens/)     | Importa solo lo que usa        |
| Components npm-ready (APF, peerDependencies, barrel único)          | [aaa-003](../../../../openspec/changes/archive/aaa-003-bootstrap-fase-3-components/) | Instalación estándar Angular   |
| CI/CD: PR validation + release pipeline con Changesets              | [aaa-005](../../../../openspec/changes/archive/aaa-005-bootstrap-fase-5-ci/)         | Releases reproducibles         |
| Primer release npm: 0.2.0 en lockstep, peer con rango plano         | [aaa-020](../../../../openspec/changes/archive/aaa-020-repo-release-lockstep/)       | Instala las libs desde npm     |

## Historias de usuario

| HU                                     | Título                          | Actor          | Estado             |
| -------------------------------------- | ------------------------------- | -------------- | ------------------ |
| [HU-002](HU-002-primer-release-npm.md) | Primer release publicado en npm | Dev consumidor | Hecha (2026-07-18) |

## Decisiones aplicables

[D-003, D-004](../../decisiones.md) · Técnicas: [ADR-002](../../../architecture/adr/ADR-002-conventional-commits-changesets.md), [ADR-006](../../../architecture/adr/ADR-006-estrategia-ci-cd.md).

## Preguntas abiertas

1. ~~¿Cuándo estrenar el pipeline?~~ Resuelta por [D-010](../../decisiones.md) (2026-07-18): el PO aprobó publicar antes de Toast; el estreno agregó la política de versionado lockstep ([ADR-015](../../../architecture/adr/ADR-015-versionado-lockstep.md)) vía [aaa-020](../../../../openspec/changes/archive/aaa-020-repo-release-lockstep/).

## Orden sugerido

Sin HUs pendientes. Los próximos releases salen solos del pipeline (changesets → PR de versionado → merge → publish); la próxima HU de esta épica nacerá de una necesidad real de consumo (ej. docs de migración, canal de feedback de consumidores).

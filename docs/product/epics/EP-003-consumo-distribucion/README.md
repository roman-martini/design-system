# EP-003 — Consumo y distribución

**Estado**: En desarrollo (npm-ready; primer release pendiente de decisión del PO)

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

## Historias de usuario

| HU                                     | Título                          | Actor          | Estado       |
| -------------------------------------- | ------------------------------- | -------------- | ------------ |
| [HU-002](HU-002-primer-release-npm.md) | Primer release publicado en npm | Dev consumidor | Identificada |

## Decisiones aplicables

[D-003, D-004](../../decisiones.md) · Técnicas: [ADR-002](../../../architecture/adr/ADR-002-conventional-commits-changesets.md), [ADR-006](../../../architecture/adr/ADR-006-estrategia-ci-cd.md).

## Preguntas abiertas

1. ¿Cuándo estrenar el pipeline? Hay changesets acumulados (minors de components, patch de tokens). Bloquea HU-002; la responde el PO.

## Orden sugerido

HU-002 cuando el PO lo decida — el pipeline (aaa-005) está listo y sin estrenar.

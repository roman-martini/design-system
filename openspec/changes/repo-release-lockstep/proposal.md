---
id: aaa-020
name: repo-release-lockstep
type: change
status: proposed
modifies-specs:
  - components-package (MODIFIED: peerDependency a tokens con workspace:^ y reescritura a rango)
related-adrs:
  - ADR-015
---

# Proposal — repo-release-lockstep

## Why

El pre-flight del primer release npm ([HU-002](../../../docs/product/epics/EP-003-consumo-distribucion/HU-002-primer-release-npm.md), aprobado por [D-010](../../../docs/product/decisiones.md)) destapó dos problemas con dry-run verificado:

1. **Cascada peer→major**: con versionado independiente, los minors de `tokens` fuerzan a Changesets a bumpear `components` con **major** (el peer `^0.x` no cruza minors — semver honesto pero produce `1.0.0`, violando D-004).
2. **`workspace:*` publica pin exacto**: pnpm lo reescribe a `0.2.0` (versión clavada), no al rango `^0.2.0` que el spec y ADR-004 esperan.

## What Changes

La combinación exacta (verificada por matriz de dry-runs — ni `fixed` solo, ni el flag con `workspace:` protocol funcionan; detalle en ADR-015):

- **Versionado lockstep**: `fixed: [[tokens, components]]` en `.changeset/config.json` — ambos packages siempre en la misma versión (primer release: `0.2.0` los dos). Decisión formalizada en **ADR-015**.
- **Peer `workspace:*` → rango plano `>=0.1.0 <1.0.0`** en `packages/components/package.json` (transitorio pre-1.0; el techo hace que el salto a 1.0 dispare el major del par a propósito). Se publica tal cual — sin pin exacto ni reescritura.
- **Flag `onlyUpdatePeerDependentsWhenOutOfRange: true`** (experimental de Changesets) — habilita la evaluación de rango del peer.
- Spec delta `components-package`: los 2 requirements que contractualizaban `workspace:*` pasan al rango plano con la política lockstep referenciada.
- **Sin publicación en este change**: la ejecución del release (repo GitHub + `NPM_TOKEN` + push) sigue el pipeline de aaa-005 y queda documentada como pasos del PO en tasks.md.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `components-package`: MODIFIED "Angular y tokens como peerDependencies" y "Reglas de dependencia respetadas" — `workspace:^` y reescritura a `^x.y.z` al publicar.

## Impact

- **Código**: `.changeset/config.json`, `packages/components/package.json` (1 línea). Sin cambios de runtime.
- **Consumidores**: reciben `^0.2.0` (aceptan patches/minors en lockstep) en vez de un pin exacto — instalación más flexible y correcta.
- **Trade-off aceptado** (detalle en ADR-015): components bumpea aunque solo haya cambiado tokens; irrelevante en la práctica para un DS que shippea el par junto.

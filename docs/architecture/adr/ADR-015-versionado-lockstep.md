# ADR-015 — Versionado lockstep de tokens + components

- **Fecha**: 2026-07-18
- **Estado**: Aceptado
- **Dominio**: transversal / build
- **ADRs relacionados**: [ADR-002](ADR-002-conventional-commits-changesets.md) (Changesets), [ADR-004](ADR-004-arquitectura-components.md) §10 (tokens como peerDependency), [ADR-006](ADR-006-estrategia-ci-cd.md) (pipeline de release)

## Contexto

El pre-flight del primer release npm (HU-002, aprobado por D-010) reveló con dry-run que el versionado independiente produce un efecto en cascada: `components` declara a `tokens` como peerDependency, y cuando `tokens` recibe un minor, Changesets bumpea a `components` con **major** — porque un peer `^0.x` no cruza minors (en semver, `^0.1.0` excluye `0.2.0`), y un peer fuera de rango es breaking para el consumidor. Resultado del dry-run: `components 1.0.0`, violando D-004 (primer release `0.x`; la política 1.0 se acuerda al llegar, no por accidente del tooling).

Hallazgos adicionales del pre-flight, todos verificados por dry-run (matriz de combinaciones en rama descartable):

- `workspace:*` se reescribe al publicar como **pin exacto** (`0.2.0`), no como rango — contrario a lo que ADR-004 y el spec `components-package` esperaban.
- El flag experimental de Changesets `onlyUpdatePeerDependentsWhenOutOfRange` **no parsea el `workspace:` protocol** en el chequeo de rango del peer (con `workspace:*` y `workspace:^` igual fuerza el major); **sí funciona con rangos semver planos** (`>=0.1.0` in-range → no bumpea al dependent).
- `fixed` (lockstep) por sí solo no elimina la cascada: el major del peer se computa antes y el lockstep lo **propaga** a ambos (dry-run: 1.0.0/1.0.0).

Decisión de política de versionado que afecta a ambos packages publicables → ADR.

## Opciones consideradas

### Opción A — Versionado independiente, aceptando la cascada

- **Pros**: cada package refleja exactamente su propio ritmo de cambio; es lo semvericamente honesto con peers `^0.x`.
- **Contras**: cualquier minor de tokens dispara un major de components — pre-1.0 significa llegar a `1.0.0` por efecto colateral del tooling (viola D-004), y post-1.0 significa majors constantes sin breaking real del kit.

### Opción B — Versionado lockstep con `fixed` (elegida)

`fixed: [[tokens, components]]`: ambos siempre en la misma versión; el bump aplicado es el mayor de los dos.

- **Pros**: elimina la cascada por construcción (con versiones iguales, el peer `workspace:^` siempre está en rango); modelo mental simple para el consumidor ("DS versión X" — mismo esquema que los packages de Angular); refleja la realidad del producto: tokens y components se diseñan y shippean juntos (cada componente nuevo trae sus tokens en el mismo change).
- **Contras**: components puede bumpear sin cambios propios (cuando solo cambió tokens) — releases "vacíos" para uno de los dos. Aceptado: el changelog por package sigue siendo preciso y el costo de un número de versión sin cambios es nulo.

### Opción C — `linked` (misma línea, bump solo a quien cambió)

- **Pros**: intermedio — versiones alineadas cuando ambos cambian.
- **Contras**: no elimina la cascada (el peer-dependent igual se evalúa fuera de rango cuando solo cambia tokens); complejidad de política sin resolver el problema central.

## Decisión

Se adopta la **Opción B — lockstep vía `fixed`**, con tres ajustes acoplados (la combinación exacta verificada por dry-run: `0.2.0`/`0.2.0`):

1. `.changeset/config.json`: `"fixed": [["@romanmartinidev/tokens", "@romanmartinidev/components"]]`.
2. `packages/components/package.json`: peerDependency a tokens pasa de `workspace:*` a un **rango semver plano `>=0.1.0 <1.0.0`** (transitorio pre-1.0). Descartados con evidencia: `workspace:^` (caret 0.x deja los minors fuera de rango — cascada legítima) y `workspace:*` (el chequeo de peers de Changesets no parsea el protocol). El rango se publica **tal cual** (no requiere reescritura). El **techo `<1.0.0` es deliberado**: cuando el par salte a 1.0 (decisión de D-004), el peer quedará fuera de rango y Changesets forzará el major del par — exactamente la semántica correcta para ese momento; ahí el peer pasa a `^1.0.0` (modelo Angular canónico) y esta transición termina.
3. `.changeset/config.json`: flag experimental `onlyUpdatePeerDependentsWhenOutOfRange: true` — sin él, todo bump del peer fuerza major al dependent sin evaluar el rango.

Criterios contra las prioridades del repo: (1) **buenas prácticas** — los rangos publicados son correctos y la versión 1.0 se decide, no se accidenta; (2) **escalar ordenado** — política explícita antes del primer release, no parche post-hoc; (3) **mantenibilidad** — cero intervención manual por release.

## Consecuencias

### Positivas

- Primer release: **ambos packages en `0.2.0`** (verificado por dry-run), cumpliendo D-004.
- La cascada peer→major desaparece de forma estructural, no con workarounds por release.
- Consumidores instalan `^0.2.0`: reciben patches/minors del par en lockstep sin reinstalar.

### Negativas / trade-offs aceptados

- Versiones "de arrastre" para el package que no cambió — costo nominal, changelog sigue exacto.
- **El rango publicado `>=0.1.0 <1.0.0` promete más compatibilidad de la que semver 0.x garantiza** (un consumidor podría mezclar components 0.2 con tokens 0.5). Mitigado: el lockstep publica siempre el par en la misma versión y el README documenta instalar versiones iguales; mezclar deliberadamente queda fuera de contrato.
- **Dependencia de un flag experimental de Changesets** (`___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH`): puede cambiar en un patch del tooling. Mitigado: el dry-run de versionado es parte del checklist de release, y si el flag muere, el fallback es editar la versión en el PR de versionado (visible y auditable).
- Si algún día se separa el par (tokens consumido sin components a otro ritmo), revertir exige ADR nuevo y una estrategia para los peers — puerta documentada, no cerrada.

### Acciones de seguimiento

- El pipeline de aaa-005 no requiere cambios (Changesets lee `fixed` del config).
- Al llegar a 1.0: revisar D-004 y esta política juntas (¿lockstep se mantiene? probablemente sí).

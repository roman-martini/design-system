---
id: aaa-037
name: components-add-avatar
type: change
status: archived
archived: 2026-07-26
introduces-specs:
  - component-avatar
modifies-specs:
  - design-tokens-package (sin delta de spec; agrega semantic space.negative.* y component.avatar.tone.*)
related-adrs:
  - ADR-004
  - ADR-007
related-decisions:
  - D-014
  - D-015
  - D-017
---

# Proposal — components-add-avatar

# Why

Sexta entrega de la **tanda 3** (D-014): la referencia moder-minimal muestra el grupo S/J/I apilado (img 1) y filas de team con avatares de iniciales (img 5). Hoy el dev no tiene forma consistente y accesible de representar usuarios. HU-022 fue refinada con el PO el 2026-07-26: fallback por **hash del nombre**, grupo con **`max` + "+N"**, sizes **xs–xl**, y **`space.negative.*` entregado en este mismo change** — es su disparador real (HU-018 CA-018.3, D-015) y lo implementa él.

# What Changes

- Nuevo **`DsAvatar`** (`ds-avatar`, ADR-007): circular, `src` (imagen con `alt` = `name`) con fallback a iniciales derivadas de `name` ante ausencia o error de carga; tono del fallback **determinístico por hash de `name`** sobre una paleta subtle tokenizada, con override manual `tone`; sizes `xs–xl` (tokens del bootstrap); a11y por `name` (`role="img"` + `aria-label` en iniciales) o decorativo (`aria-hidden`) sin él.
- Nuevo **`DsAvatarGroup`** (`ds-avatar-group`): apila avatares proyectados con solape por `space.negative.*` y borde de separación tokenizado; `max` colapsa los excedentes en un item "+N" con nombre accesible ("y N más").
- **Tokens**: `semantic.space.negative.*` (espejo de `space.*`, referenciando la jerarquía vía `calc(-1 * {semantic.space.*})` — sin duplicar valores, CA-018.4); `component.avatar.tone.<t>.{bg,text}` (paleta subtle por tono, misma cadena semántica gateada AA que Badge subtle); los planos `component.avatar.bg/text` del bootstrap se reemplazan por la paleta (sin consumidor publicado → no breaking).
- Spec **`component-avatar` nuevo** (ADR-018). Showcase con iniciales/hash, imagen con fallback, sizes, grupo con "+N" y las filas de team de la referencia.
- **Cumple HU-018 CA-018.3 de paso** (primer consumidor real de `space.negative`); al archivar se registra en HU-018.
- Changesets: **minor** de components y **minor** de tokens. Lockstep (ADR-015); veto npm vigente.

# Capabilities

## New Capabilities

- `component-avatar`: contrato de `DsAvatar` + `DsAvatarGroup` — identidad visual con fallback determinístico, grupo apilado con overflow accesible. Derivado 1:1 de los CAs de HU-022.

## Modified Capabilities

- `design-tokens-package`: sin delta de spec — `space.negative.*` y `component.avatar.*` cumplen la jerarquía ADR-003 (cada semantic referencia primitives; component referencia semantic).

# Alternativas evaluadas

Refinamiento con el PO (2026-07-26, decisiones en HU-022):

1. **Fallback neutral fijo** (como la referencia) y **primary-subtle del bootstrap** — descartadas a favor del **hash determinístico** con override: distingue usuarios sin configuración, estándar en kits profesionales; el override `tone` cubre el caso uniforme.
2. **`tokens-add-negative-space` como change separado previo** — descartado: un ciclo propose/apply/archive completo para ~6 tokens espejo; el delta viaja en este change igual que otros changes de componente extienden tokens, y HU-018 CA-018.3 se marca cumplido por referencia.
3. **Grupo sin límite en v1** — descartado: incumpliría CA-022.3; el "+N" es parte del contrato desde el inicio.

# Impact

- **Código**: `packages/components/src/lib/avatar/` (avatar + group + index), `public-api.ts`, `packages/tokens/src/semantic/space.json` (+negative), `packages/tokens/src/component/avatar.json` (tone.\*), showcase, stories.
- **Gate de contraste**: pares `avatar-tone-<t>` (texto sobre bg subtle) en los 4 themes — mismos valores ya gateados para Badge subtle, declarados también acá (regla: cada componente declara sus pares).
- **Dependencias**: ninguna nueva.
- **ADR**: no genera — el hash de tono es local a Avatar (regla ADR: ≥2 componentes o one-way door); `space.negative` lo gobierna ADR-003 (jerarquía).

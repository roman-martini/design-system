# HU-022 — Avatar y grupo de avatares (dev consumidor)

**Épica**: [EP-002 — Kit de componentes Angular](EP-002-kit-componentes.md)
**Actor**: Dev consumidor
**Estado**: Identificada — tanda 3 ([D-014](../../decisiones.md), 2026-07-22). CAs binarios al refinar, justo antes de su change.
**Decisiones que aplica**: [D-005, D-007](../../decisiones.md) · Técnica: [ADR-004](../../../architecture/adr/ADR-004-arquitectura-components.md)

---

**COMO** dev que representa usuarios (listas, perfiles, team, comentarios)
**QUIERO** un `ds-avatar` (iniciales o imagen) y un grupo apilado
**PARA** mostrar identidad visual de forma consistente y accesible.

## Origen

Tanda 3 ([D-014](../../decisiones.md)), referencia [`moder-minimal`](../../../reference/components/moder-minimal/) img 1 (grupo S/J/I apilado) e img 5 (filas de team con avatar de iniciales).

## Criterios de aceptación (candidatos)

- [ ] **CA-022.1 (avatar)** — `<ds-avatar>` (standalone, OnPush) circular; muestra `src` (imagen) o, en su ausencia/error, iniciales como fallback; tamaño por tokens `component.avatar.*`.
- [ ] **CA-022.2 (fallback)** — El fondo del fallback de iniciales sale de tokens neutrales (**decisión a refinar**: color fijo vs. derivado del nombre).
- [ ] **CA-022.3 (grupo apilado)** — `ds-avatar-group` solapa los avatares usando `space.negative.*` y soporta overflow "+N". **Activa el disparador de [HU-018](../EP-001-fundamentos-tokens/HU-018-tokens-aditivos-atlassian.md) CA-018.3** (`space.negative`) — decisión a refinar: implementar el token en este change o depender de que HU-018 lo entregue antes.
- [ ] **CA-022.4 (a11y)** — El nombre del usuario se expone como nombre accesible (`alt`/`aria-label`); avatar puramente decorativo puede ser `aria-hidden`.
- [ ] **CA-022.5 (showcase)** — El showcase muestra iniciales, imagen, el grupo apilado con "+N" y las filas de team.

## Decisiones a resolver al refinar

1. Sizes (xs/sm/md/lg).
2. Color del fallback (fijo vs. por hash del nombre).
3. Overflow "+N": límite configurable y su a11y.
4. `space.negative` propio de este change vs. dependencia de HU-018.

## Dependencias

- **[HU-018](../EP-001-fundamentos-tokens/HU-018-tokens-aditivos-atlassian.md) CA-018.3** (`space.negative.*`) para el grupo — este es su **disparador real** (D-005). Se resuelve el orden al refinar.

## Fuera de alcance

- Status dot (online/offline) y badge sobre avatar (composición/futuro).
- Editor/upload de avatar.

## Notas

- Primer consumidor real de `space.negative` → dispara HU-018. Change tentativo: `components-add-avatar`.

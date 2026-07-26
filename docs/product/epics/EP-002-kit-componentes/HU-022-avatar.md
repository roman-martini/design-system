---
epica: EP-002
actor: Dev consumidor
estado: Refinada (2026-07-26; ejecución vía change components-add-avatar — BACKLOG Now, sexta entrega de la tanda 3)
decisiones: [D-007, D-014, D-015, D-017]
adrs: [ADR-004]
---

# HU-022 — Avatar y grupo de avatares (dev consumidor)

**COMO** dev que representa usuarios (listas, perfiles, team, comentarios)
**QUIERO** un `ds-avatar` (iniciales o imagen) y un grupo apilado
**PARA** mostrar identidad visual de forma consistente y accesible.

## Origen

Tanda 3 ([D-014](../../decisiones.md)), referencia [`moder-minimal`](../../../reference/components/moder-minimal/) img 1 (grupo S/J/I apilado) e img 5 (filas de team con avatar de iniciales).

## Decisiones de refinamiento (PO, 2026-07-26)

1. **Fallback por hash del nombre** — sin `src` (o si la imagen falla), las iniciales se muestran sobre un tono elegido **determinísticamente** por hash de `name` sobre una paleta subtle del kit (misma cadena semántica ya gateada AA). Override manual opcional por input `tone` para fijar un tono concreto. Distingue usuarios sin configuración (estándar en kits profesionales).
2. **`space.negative` se entrega en este change** — el delta de tokens agrega `space.negative.*` a `semantic/space` (cumple [HU-018](../EP-001-fundamentos-tokens/HU-018-tokens-aditivos-atlassian.md) CA-018.3 de paso, referenciando la jerarquía sin duplicar valores — CA-018.4). No se abre `tokens-add-negative-space` como change separado.
3. **Grupo con `max` configurable + "+N"** — `ds-avatar-group` solapa con `space.negative.*`; los que exceden `max` se colapsan en un item "+N" con nombre accesible ("y N más").
4. **Sizes xs–xl** — los 5 del bootstrap (`component.avatar.size.*`: 24/32/40/48/64); default `md`.

## Criterios de aceptación

<!-- Binarios: al implementar se vuelven scenarios del spec component-avatar (nuevo, ADR-018). -->

- [ ] **CA-022.1 (avatar)** — `<ds-avatar>` (standalone, OnPush) circular; muestra `src` (imagen con `alt` = `name`) o, en su ausencia o error de carga, iniciales derivadas de `name` (1–2 letras) como fallback; sizes `xs–xl` por tokens `component.avatar.*` (default `md`).
- [ ] **CA-022.2 (fallback por hash)** — Dado un avatar sin `src`, el tono del fondo sale del hash determinístico de `name` sobre la paleta subtle tokenizada (mismo `name` → mismo tono, siempre); el input `tone` lo fija manualmente; cada par bg/texto de la paleta cumple AA verificado por gate en los 4 themes.
- [ ] **CA-022.3 (grupo apilado)** — `ds-avatar-group` solapa los avatares usando `space.negative.*` (nuevo, jerarquía intacta: semantic → primitive sin duplicar valores) con borde de separación tokenizado; `max` colapsa el resto en "+N" accesible ("y N más").
- [ ] **CA-022.4 (a11y)** — Con `name`, el avatar expone nombre accesible (`alt` en imagen; `role="img"` + `aria-label` en iniciales); sin `name`, es decorativo (`aria-hidden="true"`).
- [ ] **CA-022.5 (showcase)** — El showcase muestra iniciales (hash y `tone` manual), imagen con fallback por error, sizes, el grupo apilado con "+N" y las filas de team de la referencia.

## Dependencias

- **[HU-018](../EP-001-fundamentos-tokens/HU-018-tokens-aditivos-atlassian.md) CA-018.3** (`space.negative.*`) — se **resuelve dentro de este change** (decisión 2): este es su disparador real (D-015) y lo implementa él mismo.

## Fuera de alcance

- Status dot (online/offline) y badge sobre avatar (composición/futuro; los tokens `status-size`/`status-border` del bootstrap quedan reservados).
- Editor/upload de avatar.
- Tooltip con nombres al hover del "+N" (requiere DsTooltip sobre overlay; iteración futura si aparece caso).

## Notas

- Change OpenSpec: `components-add-avatar` — introduce el spec `component-avatar` (ADR-018); modifica `design-tokens-package` (delta: `space.negative.*`).
- Al cerrar, HU-018 CA-018.3 se marca cumplido por este change (registrarlo en HU-018).
- Changeset **minor** de components (DsAvatar + DsAvatarGroup) y **minor** de tokens (`space.negative.*` + tonos de avatar). Lockstep (ADR-015).

---
'@romanmartinidev/components': minor
'@romanmartinidev/tokens': minor
---

Avatar y grupo de avatares (aaa-037, HU-022).

- `DsAvatar` (`ds-avatar`): circular, imagen (`src` con `alt` = `name`) con fallback automático a iniciales ante error de carga o ausencia; tono del fallback determinístico por hash de `name` sobre la paleta subtle (override manual por `tone`); sizes `xs–xl`; a11y por `name` (`role="img"` + `aria-label`) o decorativo (`aria-hidden`) sin él. Types `DsAvatarSize` y `DsAvatarTone`.
- `DsAvatarGroup` (`ds-avatar-group`): apila avatares con solape por `space.negative.*` y anillo de separación tokenizado; `max` colapsa los excedentes en un item "+N" accesible ("y N más"); `role="group"` con `label`.
- Tokens: `semantic.space.negative.2xs–xl` (espejo de `space.*` vía `calc(-1 * ref)` — jerarquía intacta, primer consumidor real: el grupo); `component.avatar.tone.*` (paleta subtle por 6 tonos, AA verificada por gate en los 4 themes), `radius` full y `group.overlap`; se retiran los provisionales `component.avatar.bg/text` del bootstrap (sin consumidor previo).

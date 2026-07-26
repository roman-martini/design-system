# Delta — component-avatar (components-add-avatar)

## ADDED Requirements

### Requirement: Avatar (DsAvatar)

El package SHALL exponer `DsAvatar` (`ds-avatar`, naming por ADR-007) junto con los types `DsAvatarSize` y `DsAvatarTone`. El componente SHALL ser circular (radius full tokenizado) y renderizar la imagen de `src` (con `alt` igual a `name`) o, en su ausencia o ante error de carga, iniciales derivadas de `name` (1–2 letras) sobre un tono de fondo determinístico por hash de `name` sobre la paleta `component.avatar.tone.*`, con override manual por `tone`. SHALL soportar `size` (`xs | sm | md | lg | xl`, default `md`) por tokens `component.avatar.size.*`. Todo estilo SHALL salir de tokens (sin hex ni literales).

#### Scenario: imagen con fallback a iniciales (CA-022.1)

- **GIVEN** un `<ds-avatar>` (standalone, OnPush) con `name` y `src`
- **WHEN** la imagen carga correctamente
- **THEN** SHALL renderizar `<img>` con `alt` igual a `name`
- **WHEN** la imagen falla su carga (evento `error`) o no hay `src`
- **THEN** SHALL renderizar las iniciales de `name` (primera letra de las dos primeras palabras, uppercase) como fallback

#### Scenario: tono determinístico por hash con override (CA-022.2)

- **GIVEN** un avatar sin `src`
- **WHEN** `tone` es `'auto'` (default)
- **THEN** el tono del fondo SHALL derivarse por hash determinístico de `name` sobre la paleta (mismo `name` → mismo tono, siempre)
- **WHEN** `tone` es un tono concreto (`neutral | primary | success | warning | info | danger`)
- **THEN** ese tono SHALL aplicarse ignorando el hash
- **AND** cada par bg/texto de `component.avatar.tone.*` SHALL cumplir contraste AA (≥4.5) verificado por gate en los 4 themes

#### Scenario: nombre accesible o decorativo (CA-022.4)

- **GIVEN** un avatar con `name`
- **WHEN** se renderiza como iniciales
- **THEN** SHALL exponer `role="img"` con `aria-label` igual a `name`
- **GIVEN** un avatar sin `name`
- **THEN** SHALL marcarse `aria-hidden="true"` (decorativo)

### Requirement: Grupo de avatares (DsAvatarGroup)

El package SHALL exponer `DsAvatarGroup` (`ds-avatar-group`) que apila `<ds-avatar>` proyectados con solape por `space.negative.*` (semantic, jerarquía ADR-003 intacta: la fuente referencia `semantic.space.*` sin duplicar valores) y anillo de separación tokenizado (`border-width`/`border-color`). SHALL soportar `max` (default sin límite): los avatares que exceden SHALL ocultarse y colapsar en un item "+N" con el estilo de fallback en tono neutral y nombre accesible. El host SHALL exponer `role="group"` con `aria-label` opcional por input `label`.

#### Scenario: solape con space.negative (CA-022.3)

- **GIVEN** un `<ds-avatar-group>` con varios `<ds-avatar>`
- **WHEN** se renderiza
- **THEN** los avatares SHALL solaparse usando un token que referencia `semantic.space.negative.*`
- **AND** `semantic/space.json` SHALL contener `space.negative.*` referenciando la jerarquía (sin valores duplicados fuera de ella)

#### Scenario: overflow "+N" accesible (CA-022.3)

- **GIVEN** un grupo con `max` menor que la cantidad de avatares
- **WHEN** se renderiza
- **THEN** SHALL mostrarse `max` avatares y un item "+N" con el resto contabilizado
- **AND** el "+N" SHALL exponer `role="img"` con `aria-label` "y N más"

#### Scenario: exportado desde public-api.ts (CA-022.1)

- **WHEN** se inspecciona `packages/components/src/public-api.ts`
- **THEN** SHALL contener `export * from './lib/avatar';` y exportar `DsAvatar`, `DsAvatarGroup`, `DsAvatarSize` y `DsAvatarTone`

#### Scenario: tests del comportamiento con Vitest (CA-022.1–022.4)

- **WHEN** se ejecuta `pnpm -F @romanmartinidev/components test`
- **THEN** Vitest SHALL cubrir: imagen vs fallback (incl. error de carga), iniciales (1 y 2 palabras), hash determinístico y override `tone`, sizes por data-attr, a11y (`alt`/`role="img"`/`aria-label`/decorativo), grupo (solape, `max`, "+N" accesible) y no-hardcodes por CSS fuente

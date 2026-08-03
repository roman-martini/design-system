## MODIFIED Requirements

### Requirement: Grupo de avatares (DsAvatarGroup)

El package SHALL exponer `DsAvatarGroup` (`ds-avatar-group`) que apila `<ds-avatar>` proyectados con solape por `space.negative.*` (semantic, jerarquía ADR-003 intacta: la fuente referencia `semantic.space.*` sin duplicar valores) y anillo de separación tokenizado (`border-width`/`border-color`). SHALL soportar `max` (default sin límite): los avatares que exceden SHALL ocultarse y colapsar en un item "+N" con el estilo de fallback en tono neutral y nombre accesible. El host SHALL exponer `role="group"` con `aria-label` opcional por input `label`. El nombre accesible del item "+N" SHALL ser configurable por el consumidor mediante un input que recibe la cantidad oculta, de modo que pueda traducirse y pluralizarse.

#### Scenario: solape con space.negative (CA-022.3)

- **GIVEN** un `<ds-avatar-group>` con varios `<ds-avatar>`
- **WHEN** se renderiza
- **THEN** los avatares SHALL solaparse usando un token que referencia `semantic.space.negative.*`
- **AND** `semantic/space.json` SHALL contener `space.negative.*` referenciando la jerarquía (sin valores duplicados fuera de ella)

#### Scenario: overflow "+N" accesible y traducible (CA-022.3)

- **GIVEN** un grupo con `max` menor que la cantidad de avatares
- **WHEN** se renderiza
- **THEN** SHALL mostrarse `max` avatares y un item "+N" con el resto contabilizado
- **AND** el "+N" SHALL exponer `role="img"` con un nombre accesible que comunique cuántos quedan ocultos
- **GIVEN** un consumidor que provee su propio texto para ese nombre
- **WHEN** se renderiza el grupo con overflow
- **THEN** el nombre accesible SHALL ser el que el consumidor definió, recibiendo la cantidad oculta para poder redactarlo en su idioma y con la pluralización que corresponda
- **AND** sin configuración explícita SHALL usarse el texto por defecto del kit

#### Scenario: exportado desde public-api.ts (CA-022.1)

- **WHEN** se inspecciona `packages/components/src/public-api.ts`
- **THEN** SHALL contener `export * from './lib/avatar';` y exportar `DsAvatar`, `DsAvatarGroup`, `DsAvatarSize` y `DsAvatarTone`

#### Scenario: tests del comportamiento con Vitest (CA-022.1–022.4)

- **WHEN** se ejecuta `pnpm -F @romanmartinidev/components test`
- **THEN** Vitest SHALL cubrir: imagen vs fallback (incl. error de carga), iniciales (1 y 2 palabras), hash determinístico y override `tone`, sizes por data-attr, a11y (`alt`/`role="img"`/`aria-label`/decorativo), grupo (solape, `max`, "+N" accesible y su texto configurable) y no-hardcodes por CSS fuente

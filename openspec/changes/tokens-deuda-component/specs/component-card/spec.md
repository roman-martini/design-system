## MODIFIED Requirements

### Requirement: Card contenedor (familia DsCard)

El package SHALL exponer la familia `DsCard` (`ds-card`, naming por ADR-007) con las sub-partes opcionales `DsCardHeader` (`ds-card-header`), `DsCardContent` (`ds-card-content`), `DsCardFooter` (`ds-card-footer`), `DsCardTitle` (`ds-card-title`, `[dsCardTitle]`) y `DsCardDescription` (`ds-card-description`, `[dsCardDescription]`), junto con los types `DsCardVariant` y `DsCardPadding`. El contenedor SHALL soportar `variant` (`outline | elevated | flat`, default `outline`) y `padding` (`comfortable | compact`, default `comfortable`), con todos los estilos desde tokens `component.card.*`. Las sub-partes usadas como atributo SHALL preservar la semántica del elemento del consumidor. Las variantes con sombra (`outline`, `elevated`) SHALL elevar al hover según `component.card.shadow-hover`; `flat` SHALL permanecer plana también bajo el puntero.

#### Scenario: variantes tokenizadas con default de la referencia (CA-019.1)

- **GIVEN** un `<ds-card>` con `variant` en cada uno de `outline | elevated | flat` (default `outline`)
- **WHEN** se renderiza
- **THEN** borde, radius, sombra y fondo SHALL salir de tokens `component.card.*` vía `var(--ds-*)`
- **AND** el default `outline` SHALL combinar borde y sombra sutil (la apariencia de la referencia)

#### Scenario: las variantes con sombra elevan al hover

- **GIVEN** una card `outline` o `elevated` bajo el puntero
- **WHEN** se inspecciona su sombra
- **THEN** SHALL ser la que resuelve `component.card.shadow-hover`, con la transición desde tokens de motion
- **GIVEN** una card `flat` bajo el puntero
- **THEN** SHALL conservar su ausencia de sombra

#### Scenario: sub-partes opcionales con spacing del contenedor (CA-019.2)

- **GIVEN** una card con cualquier subconjunto de `ds-card-header`, `ds-card-content`, `ds-card-footer`
- **WHEN** se renderiza
- **THEN** cada sub-parte presente SHALL aplicar sus estilos tokenizados
- **AND** el spacing entre partes SHALL salir de `component.card.gap` (gobernado por el contenedor)
- **AND** una card sin sub-partes SHALL renderizar el contenido proyectado directamente

#### Scenario: título y descripción como elemento o atributo (CA-019.2)

- **GIVEN** `<ds-card-title>` como elemento o `dsCardTitle` como atributo sobre un elemento del consumidor
- **WHEN** se renderiza
- **THEN** ambos usos SHALL aplicar la misma tipografía tokenizada
- **AND** el contenido SHALL re-proyectarse 1:1

#### Scenario: semántica del consumidor preservada (CA-019.4)

- **GIVEN** un `<h2 dsCardTitle>` dentro de la card
- **WHEN** se inspecciona el árbol de accesibilidad
- **THEN** el heading nivel 2 SHALL conservarse
- **AND** el host `ds-card` NO SHALL exponer `role` alguno

#### Scenario: padding configurable por tokens (CA-019.3)

- **GIVEN** una card con `padding` en `comfortable` (default) y `compact`
- **WHEN** se renderiza
- **THEN** el padding SHALL salir de `component.card.padding.md` y `component.card.padding.sm` respectivamente (set del bootstrap, reutilizado sin renombrar)

#### Scenario: estilos exclusivamente por tokens sin pares de contraste nuevos (CA-019.5)

- **WHEN** se inspecciona el CSS de la familia
- **THEN** todo valor visual SHALL referenciarse vía `var(--ds-*)`
- **AND** SHALL NO existir hex codes, px hardcodeados (excepto `0`) ni colores literales
- **AND** el gate de contraste por script NO SHALL requerir pares nuevos (superficies con `bg`/`border` existentes)

#### Scenario: exportado desde public-api.ts (CA-019.6)

- **WHEN** se inspecciona `packages/components/src/public-api.ts`
- **THEN** SHALL contener `export * from './lib/card';`
- **AND** un consumidor SHALL poder importar `DsCard`, las cinco sub-partes, `DsCardVariant` y `DsCardPadding`

#### Scenario: tests del comportamiento con Vitest (CA-019.1–019.5)

- **WHEN** se ejecuta `pnpm -F @romanmartinidev/components test`
- **THEN** Vitest SHALL cubrir: variantes y padding por `data-*` + tokens, elevación al hover por variante, sub-partes opcionales, uso híbrido elemento/atributo con re-proyección, preservación del heading y ausencia de hardcodes en el CSS fuente

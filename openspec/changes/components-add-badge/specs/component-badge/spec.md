# Delta — component-badge (components-add-badge)

## ADDED Requirements

### Requirement: Badge de estado (DsBadge)

El package SHALL exponer `DsBadge` (`ds-badge`, naming por ADR-007) junto con los types `DsBadgeTone`, `DsBadgeAppearance` y `DsBadgeSize`. El componente SHALL implementar el modelo de dos ejes de [ADR-019](../../../../docs/architecture/adr/ADR-019-modelo-variantes-tono-apariencia.md): `tone` (`neutral | primary | danger | success | warning | info`, default `neutral`) × `appearance` (`subtle | solid | outline`, default `subtle`), con `size` (`sm | md | lg`, default `md`). El texto va proyectado; `icon` (Lucide leading) y `dot` (punto de estado leading) son opcionales y decorativos. Cada combinación `tone × appearance` SHALL cumplir WCAG AA verificado por el gate de contraste por script. Todo estilo SHALL salir de tokens `component.badge.*`.

#### Scenario: dos ejes reflejados en el host (CA-021.1)

- **GIVEN** un `<ds-badge>` (standalone, OnPush) con `tone` y `appearance`
- **WHEN** se renderiza
- **THEN** el host SHALL exponer `data-tone`, `data-appearance` y `data-size` con los valores dados (defaults `neutral`/`subtle`/`md`)
- **AND** el texto proyectado SHALL renderizarse inline

#### Scenario: contraste AA por combinación tono × apariencia (CA-021.2)

- **WHEN** se evalúa cada una de las 18 combinaciones `tone × appearance` en los 4 themes
- **THEN** el par texto/fondo SHALL cumplir ≥4.5:1 y el borde de `outline` ≥3:1 (gate por script)
- **AND** en `solid` el color de texto SHALL elegirse por tono (blanco en tonos oscuros; texto oscuro en `warning`)

#### Scenario: sizes por tokens (CA-021.3)

- **GIVEN** un badge con `size` en `sm | md | lg` (default `md`)
- **WHEN** se renderiza
- **THEN** padding, font-size, radius y el tamaño de ícono/dot SHALL salir de `component.badge.size-<size>.*`

#### Scenario: ícono y dot decorativos con color del tono (CA-021.4)

- **GIVEN** un badge con `icon` (nombre Lucide) o con `dot` en `true`
- **WHEN** se renderiza
- **THEN** SHALL mostrar el ícono leading (o el punto de estado) con el color del tono
- **AND** el gráfico SHALL ser decorativo (`aria-hidden`); dado ambos, `icon` SHALL prevalecer

#### Scenario: significado por texto, no por color (CA-021.5)

- **WHEN** se inspecciona el badge
- **THEN** el host NO SHALL imponer `role`
- **AND** el estado SHALL comunicarse por el texto proyectado (WCAG 1.4.1: no depende solo del color)

#### Scenario: estilos exclusivamente por tokens (CA-021.6)

- **WHEN** se inspecciona el CSS del componente
- **THEN** todo valor SHALL referenciarse vía `var(--ds-*)` (`component.badge.*`)
- **AND** SHALL NO existir hex codes ni colores literales

#### Scenario: exportado desde public-api.ts (CA-021.7)

- **WHEN** se inspecciona `packages/components/src/public-api.ts`
- **THEN** SHALL contener `export * from './lib/badge';`
- **AND** un consumidor SHALL poder importar `DsBadge`, `DsBadgeTone`, `DsBadgeAppearance` y `DsBadgeSize`

#### Scenario: tests del comportamiento con Vitest (CA-021.1–021.6)

- **WHEN** se ejecuta `pnpm -F @romanmartinidev/components test`
- **THEN** Vitest SHALL cubrir: reflejo de `data-tone`/`data-appearance`/`data-size`, defaults, ícono vs. dot (precedencia y `aria-hidden`), ausencia de `role`, y no-hardcodes en el CSS fuente

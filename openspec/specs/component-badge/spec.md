---
name: component-badge
type: spec
status: active
created: 2026-07-22
---

# component-badge

## Purpose

Contrato de `DsBadge`: componente de estado con el modelo de dos ejes `tone × appearance` (ADR-019), sizes, ícono/dot opcionales y contraste AA por combinación verificado por gate.

## Requirements

### Requirement: Badge de estado (DsBadge)

El package SHALL exponer `DsBadge` (`ds-badge`, naming por ADR-007) y la directiva `DsBadgeIcon` (`[dsBadgeIcon]`), junto con los types `DsBadgeTone`, `DsBadgeAppearance` y `DsBadgeSize`. El componente SHALL implementar el modelo de dos ejes de [ADR-019](../../../docs/architecture/adr/ADR-019-modelo-variantes-tono-apariencia.md): `tone` (`neutral | primary | danger | success | warning | info`, default `neutral`) × `appearance` (`subtle | solid | outline`, default `subtle`), con `size` (`sm | md | lg`, default `md`). El texto va proyectado; el ícono leading (marcado con `dsBadgeIcon`) y el `dot` (punto de estado leading) son opcionales y decorativos, con el ícono teniendo precedencia sobre el dot. Cada combinación `tone × appearance` SHALL cumplir WCAG AA verificado por el gate de contraste por script. Todo estilo SHALL salir de tokens `component.badge.*`.

#### Scenario: dos ejes reflejados en el host (CA-021.1)

- **GIVEN** un `<ds-badge>` (standalone, OnPush) con `tone` y `appearance`
- **WHEN** se renderiza
- **THEN** el host SHALL exponer `data-tone`, `data-appearance` y `data-size` con los valores dados (defaults `neutral`/`subtle`/`md`)
- **AND** el texto proyectado SHALL renderizarse inline

#### Scenario: contraste AA por combinación tono × apariencia (CA-021.2)

- **WHEN** se evalúa cada una de las 18 combinaciones `tone × appearance` en los 4 themes
- **THEN** el par texto/fondo SHALL cumplir ≥4.5:1 (gate por script)
- **AND** en `solid` el color de texto SHALL elegirse por tono (blanco en tonos oscuros; texto oscuro en `warning`)

#### Scenario: sizes por tokens (CA-021.3)

- **GIVEN** un badge con `size` en `sm | md | lg` (default `md`)
- **WHEN** se renderiza
- **THEN** padding, font-size, radius y el tamaño del dot SHALL salir de `component.badge.*` por size

#### Scenario: ícono decorativo con precedencia sobre el dot (CA-021.4)

- **GIVEN** un elemento con `dsBadgeIcon` proyectado y/o `dot` en `true`
- **WHEN** se renderiza
- **THEN** el ícono SHALL exponer `aria-hidden="true"` (aplicado por la directiva `DsBadgeIcon`)
- **AND** el dot (cuando se muestra) SHALL ser decorativo (`aria-hidden`) con el color del tono
- **AND** dado un ícono y `dot` a la vez, el ícono SHALL prevalecer (el dot no se renderiza)

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
- **AND** un consumidor SHALL poder importar `DsBadge`, `DsBadgeIcon`, `DsBadgeTone`, `DsBadgeAppearance` y `DsBadgeSize`

#### Scenario: tests del comportamiento con Vitest (CA-021.1–021.6)

- **WHEN** se ejecuta `pnpm -F @romanmartinidev/components test`
- **THEN** Vitest SHALL cubrir: reflejo de `data-tone`/`data-appearance`/`data-size`, defaults, ícono decorativo y precedencia sobre el dot, ausencia de `role`, y no-hardcodes en el CSS fuente

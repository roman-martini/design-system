---
name: component-skeleton
type: spec
status: active
created: 2026-07-20
---

# component-skeleton

## Purpose

Contrato de `DsSkeleton`: shapes (text/rect/circle), dimensiones y comportamiento bajo `prefers-reduced-motion`.

## Requirements

### Requirement: Skeleton de contenido en carga (DsSkeleton)

El package SHALL exponer `DsSkeleton` (`ds-skeleton`, naming por ADR-007) junto con el type `DsSkeletonShape`. El componente SHALL renderizar un placeholder decorativo de carga con input `shape` (`text | rect | circle`, default `text`) cuyos defaults de dimensiones y radius salen de tokens, e inputs `width`/`height`/`radius` que aceptan cualquier valor CSS y overridean esos defaults. El skeleton SHALL ser decorativo siempre (`aria-hidden="true"`, sin role ni texto). Los estilos SHALL salir exclusivamente de tokens (`component.skeleton.*` + primitives/semantic), la animación SHALL ser un pulso de opacidad tokenizado y bajo `prefers-reduced-motion` SHALL apagarse (bloque estático).

#### Scenario: defaults tokenizados por shape (CA-010.1)

- **GIVEN** un `<ds-skeleton />` con `shape` en cada uno de `text | rect | circle` (default `text`)
- **WHEN** se renderiza
- **THEN** el host SHALL reflejar el shape en `data-shape` y aplicar sus defaults vía tokens: `text` ancho completo × `component.skeleton.text-height` con `component.skeleton.radius`; `rect` ancho completo × `component.skeleton.rect-height` con `component.skeleton.radius`; `circle` `component.skeleton.circle-size` con `component.skeleton.circle-radius`

#### Scenario: overrides CSS libres (CA-010.2)

- **GIVEN** un skeleton con `width="12rem"`, `height="40%"` o `radius="8px"`
- **WHEN** se renderiza
- **THEN** cada valor SHALL aplicarse como estilo inline del host pisando el default del shape
- **AND** sin esos inputs el host NO SHALL llevar estilos inline de dimensión

#### Scenario: decorativo siempre (CA-010.3)

- **WHEN** se renderiza cualquier skeleton
- **THEN** el host SHALL llevar `aria-hidden="true"` sin `role`
- **AND** el árbol de accesibilidad NO SHALL contener texto del skeleton
- **AND** el showcase SHALL documentar el patrón del contenedor que anuncia la carga

#### Scenario: pulso tokenizado apagado bajo reduced motion (CA-010.4)

- **WHEN** se inspecciona el CSS del componente
- **THEN** el pulso SHALL usar `component.skeleton.duration-pulse` con rango de opacidad tokenizado (`component.skeleton.pulse-opacity`) y easing de tokens
- **AND** SHALL existir un bloque `@media (prefers-reduced-motion: reduce)` que apaga la animación (`animation: none`)

#### Scenario: estilos exclusivamente por tokens sin pares de contraste (CA-010.5)

- **WHEN** se inspecciona el CSS del componente
- **THEN** todo valor visual SHALL referenciarse vía `var(--ds-*)`
- **AND** SHALL NO existir hex codes, px hardcodeados (excepto `0`) ni colores literales
- **AND** el gate de contraste NO SHALL requerir pares nuevos (elemento decorativo no textual, fondo `bg.disabled` theme-aware)

#### Scenario: exportado desde public-api.ts

- **WHEN** se inspecciona `packages/components/src/public-api.ts`
- **THEN** SHALL contener `export * from './lib/skeleton';`
- **AND** un consumidor SHALL poder importar `DsSkeleton` y `DsSkeletonShape`

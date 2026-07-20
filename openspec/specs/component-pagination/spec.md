---
name: component-pagination
type: spec
status: active
created: 2026-07-20
---

# component-pagination

## Purpose

Contrato de `DsPagination`: modelo `[(page)]`/`totalPages`, ventana con elipsis, variante compacta y disabled accesible en extremos.

## Requirements

### Requirement: Pagination de listados (DsPagination)

El package SHALL exponer `DsPagination` (`ds-pagination`), naming por ADR-007: navegación de páginas con modelo `page` two-way (1-based) + `totalPages`, ventana de páginas con elipsis estática, controles first/prev/next/last con disabled accesible (ADR-011), variante `compact` y labels configurables (defaults en español). El componente SHALL limitarse a navegar (sin datos). Los estilos SHALL salir exclusivamente de tokens (`component.pagination.*` + primitives/semantic).

#### Scenario: estructura accesible (CA-015.1)

- **GIVEN** un `ds-pagination` con `totalPages`
- **THEN** el landmark SHALL ser `<nav>` con nombre accesible configurable (default "paginación")
- **AND** cada página SHALL ser un botón con nombre accesible "Página N" (prefijo configurable)
- **AND** la página actual SHALL exponer `aria-current="page"`

#### Scenario: modelo two-way con emisiones acotadas (CA-015.2)

- **GIVEN** `[(page)]` y `totalPages`
- **WHEN** el consumidor cambia el model programáticamente
- **THEN** el render SHALL reflejar la nueva página
- **AND** toda emisión del componente SHALL estar dentro de `[1, totalPages]`
- **GIVEN** un `page` fuera de rango seteado por el consumidor
- **THEN** la vista SHALL normalizarse al rango sin sobrescribir el model de oficio

#### Scenario: navegación y extremos disabled accesibles (CA-015.3)

- **WHEN** se activa un número, prev, next, first o last
- **THEN** el model SHALL actualizarse a la página correspondiente
- **GIVEN** la primera página activa
- **THEN** first y prev SHALL quedar focusables con `aria-disabled="true"` y sin acción al activarse (ADR-011)
- **AND** en la última página SHALL ocurrir lo mismo con next y last

#### Scenario: ventana con elipsis estática (CA-015.4)

- **GIVEN** un `totalPages` grande
- **THEN** SHALL mostrarse siempre la primera, la última y las `siblingCount` vecinas de la actual (default 1)
- **AND** los huecos SHALL renderizar "…" decorativo (`aria-hidden="true"`, no focusable)
- **AND** un hueco de exactamente una página SHALL rellenarse con el número (nunca elipsis para ocultar una sola página)
- **GIVEN** un total que entra completo en la ventana
- **THEN** SHALL renderizarse sin elipsis

#### Scenario: variante compacta (CA-015.5)

- **GIVEN** `variant="compact"`
- **THEN** SHALL renderizarse solo first/prev/next/last y un contador "X de Y" como texto accesible, sin botones de número
- **AND** el modelo y los disabled de extremos SHALL comportarse igual que en la variante por números

#### Scenario: labels configurables (CA-015.6)

- **GIVEN** el default
- **THEN** los nombres accesibles de nav, first, prev, next, last y el prefijo de página SHALL estar en español
- **GIVEN** inputs de labels del consumidor
- **THEN** SHALL reemplazar los defaults (i18n por inputs)

#### Scenario: estilos exclusivamente por tokens (CA-015.7)

- **WHEN** se inspecciona el CSS del componente
- **THEN** todo valor visual SHALL referenciarse vía `var(--ds-*)`
- **AND** SHALL NO existir hex codes, px hardcodeados (excepto `0`) ni colores literales
- **AND** los pares de contraste (item/surface, item/bg-hover, current inverse/primary) SHALL pasar el gate AA por script

#### Scenario: exportado desde public-api.ts

- **WHEN** se inspecciona `packages/components/src/public-api.ts`
- **THEN** SHALL contener `export * from './lib/pagination';`
- **AND** un consumidor SHALL poder importar `DsPagination` y el type `DsPaginationVariant`

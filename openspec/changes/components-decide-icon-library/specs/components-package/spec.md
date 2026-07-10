## ADDED Requirements

### Requirement: Convención de iconografía con Lucide

El sistema de diseño SHALL usar **Lucide** (package `@lucide/angular`) como librería de iconos, según [ADR-012](../../../../docs/architecture/adr/ADR-012-iconografia-lucide.md). Los iconos SHALL importarse como **componentes standalone por icono** (tree-shakeable, type-safe), NO vía registry por nombre. Los usos de iconos en componentes del DS SHALL declarar el estilo explícitamente — tamaño base `16` y `strokeWidth` `1.5` (starting point del DS), color heredado vía `currentColor` — sin depender de configuración global de la app consumidora. Mientras ningún componente publicado consuma iconos, `@lucide/angular` NO SHALL declararse como dependencia de `@romanmartinidev/components`; cuando el primer componente publicado los consuma, SHALL declararse como **`peerDependency`** (mismo criterio que Angular y `@romanmartinidev/tokens`).

#### Scenario: import tree-shakeable por icono

- **WHEN** un componente o demo del repo usa un icono
- **THEN** SHALL importarlo por nombre desde `@lucide/angular` (ej. `import { LucideX } from '@lucide/angular'`)
- **AND** SHALL renderizarlo con su componente standalone (ej. `<svg lucideX>`)
- **AND** NO SHALL existir un registry central de iconos por string

#### Scenario: estilo explícito del DS

- **WHEN** se inspecciona un uso de icono del DS
- **THEN** SHALL declarar `size="16"` y `strokeWidth="1.5"` (o valores justificados por el componente)
- **AND** el color SHALL resolverse por `currentColor` desde el contexto (tokenizado), no hardcodeado en el icono

#### Scenario: icono decorativo oculto para lectores de pantalla

- **GIVEN** un icono que acompaña texto visible
- **WHEN** se inspecciona el DOM
- **THEN** el `<svg>` SHALL tener `aria-hidden="true"`

#### Scenario: icono semántico nombrado por su control

- **GIVEN** un control interactivo cuyo único contenido es un icono (ej. botón X de cierre)
- **WHEN** se inspecciona el DOM
- **THEN** el control SHALL tener `aria-label` con el nombre de la acción
- **AND** el `<svg>` SHALL tener `aria-hidden="true"` (el nombre lo da el control)

#### Scenario: la demo de integración renderiza los iconos del disparador

- **GIVEN** el playground levantado
- **WHEN** se navega a la sección de iconografía
- **THEN** SHALL renderizarse `LucideX` y `LucideChevronDown` con el estilo del DS (16 / 1.5 / currentColor)

#### Scenario: la dependencia se declara como peer recién con el primer consumo publicado

- **WHEN** ningún componente de `@romanmartinidev/components` consume iconos
- **THEN** `packages/components/package.json` NO SHALL declarar `@lucide/angular` (en ninguna sección de dependencias de runtime)
- **WHEN** el primer componente publicado consuma iconos (ej. Modal)
- **THEN** `@lucide/angular` SHALL declararse en `peerDependencies` de `@romanmartinidev/components` y documentarse en su README

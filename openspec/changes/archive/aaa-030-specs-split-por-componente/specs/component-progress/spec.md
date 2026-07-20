## ADDED Requirements

### Requirement: Barra de progreso (DsProgress)

El package SHALL exponer `DsProgress` (`ds-progress`), naming por ADR-007: barra de progreso con variante determinada (`value`/`max` → `role="progressbar"` + `aria-valuenow/min/max`) e indeterminada (sin `value` → sin `aria-valuenow`, animación continua con reemplazo por pulso bajo `prefers-reduced-motion`), label accesible con opt-out, porcentaje visible opt-in (`showValue`), sizes sm/md/lg y tonos primary/success/danger. Los estilos SHALL salir exclusivamente de tokens (`component.progress.*` + primitives/semantic) y los pares fill/track SHALL pasar el gate como UI no-texto (3:1, WCAG 1.4.11).

#### Scenario: determinada accesible (CA-016.1)

- **GIVEN** un `ds-progress` con `value` y `max` (default 100)
- **THEN** SHALL exponer `role="progressbar"` con `aria-valuemin="0"`, `aria-valuemax` = max y `aria-valuenow` = value clampeado a `[0, max]`
- **AND** el ancho del fill SHALL ser proporcional a `value/max`

#### Scenario: indeterminada (CA-016.2)

- **GIVEN** un `ds-progress` sin `value`
- **THEN** SHALL exponer `role="progressbar"` sin `aria-valuenow`
- **AND** el fill SHALL animarse de forma continua (fuente CSS con keyframes)
- **AND** la guía de uso spinner vs progress SHALL estar documentada en el showcase

#### Scenario: label accesible con opt-out (CA-016.3)

- **GIVEN** el default
- **THEN** el progressbar SHALL tener nombre accesible "Progreso" (configurable por input)
- **GIVEN** `label=""`
- **THEN** SHALL quedar sin label propio (el contexto visible provee el anuncio)

#### Scenario: porcentaje visible opt-in (CA-016.4)

- **GIVEN** `showValue` en una barra determinada
- **THEN** SHALL mostrarse el porcentaje redondeado como texto tokenizado
- **GIVEN** `showValue` en una barra indeterminada
- **THEN** NO SHALL mostrarse valor

#### Scenario: sizes y tonos (CA-016.5, CA-016.6)

- **GIVEN** `size` sm/md/lg (default md)
- **THEN** la altura de la barra SHALL salir del token del size
- **GIVEN** `tone` primary/success/danger (default primary)
- **THEN** el fill SHALL usar el color semántico tokenizado del tono
- **AND** cada par fill/track SHALL pasar el gate AA como UI no-texto (3:1) por script

#### Scenario: reduced-motion por pulso (CA-016.7)

- **WHEN** se inspecciona la fuente CSS
- **THEN** SHALL declarar `@media (prefers-reduced-motion: reduce)` reemplazando el desplazamiento indeterminado por pulso de opacidad y desactivando la transición de la determinada

#### Scenario: estilos exclusivamente por tokens (CA-016.8)

- **WHEN** se inspecciona el CSS del componente
- **THEN** todo valor visual SHALL referenciarse vía `var(--ds-*)`
- **AND** SHALL NO existir hex codes, px hardcodeados (excepto `0`) ni colores literales

#### Scenario: exportado desde public-api.ts

- **WHEN** se inspecciona `packages/components/src/public-api.ts`
- **THEN** SHALL contener `export * from './lib/progress';`
- **AND** un consumidor SHALL poder importar `DsProgress` y los types `DsProgressSize`/`DsProgressTone`

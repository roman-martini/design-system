# Delta — component-button (components-button-loading)

## ADDED Requirements

### Requirement: Estado loading de DsButton

`DsButton` SHALL exponer un input `loading` (boolean, default `false`) y un input opcional `loadingText` (string). Con `loading` en `true`, el botón SHALL embeber un `ds-spinner` (`size xs`, `currentColor`) por composición, SHALL bloquear la emisión de `clicked` manteniéndose focuseable y anunciado (sin `disabled` nativo), y SHALL exponer `aria-busy="true"`. El contenido durante la carga SHALL ser configurable: sin `loadingText`, el spinner reemplaza el contenido conservando el ancho del botón (sin layout shift); con `loadingText`, el botón muestra spinner + ese texto. Cuando `loading` y `disabled` coincidan, `loading` SHALL tener precedencia.

#### Scenario: input loading embebe el spinner (CA-017.1)

- **GIVEN** un `<ds-button [loading]="true">` (standalone, OnPush)
- **WHEN** se renderiza
- **THEN** SHALL embeber un `ds-spinner` con `size` `xs` que hereda `currentColor` del botón, sin que el consumidor lo componga a mano

#### Scenario: bloqueo accesible sin disabled nativo (CA-017.2)

- **GIVEN** un botón con `loading=true`
- **WHEN** el usuario hace click o presiona Enter/Space
- **THEN** el output `clicked` SHALL NO emitir
- **AND** el botón SHALL permanecer focuseable y anunciado (NO SHALL usar el atributo `disabled` nativo)

#### Scenario: anuncio con aria-busy (CA-017.3)

- **GIVEN** un botón con `loading=true`
- **WHEN** se renderiza
- **THEN** el `<button>` SHALL exponer `aria-busy="true"` y el spinner embebido SHALL ser decorativo (`aria-hidden`, `label=""`)
- **GIVEN** el mismo botón con `loading=false`
- **THEN** `aria-busy` SHALL NO estar presente

#### Scenario: modo default reemplaza contenido con ancho estable (CA-017.4)

- **GIVEN** un botón con `loading=true` y sin `loadingText`
- **WHEN** se alterna `loading` en el ciclo `false → true → false`
- **THEN** el spinner SHALL reemplazar el contenido y el ancho del botón SHALL mantenerse estable (sin layout shift)
- **AND** el label original SHALL persistir como nombre accesible

#### Scenario: modo loadingText muestra spinner y texto (CA-017.5)

- **GIVEN** un botón con `loading=true` y `loadingText` (ej. "Guardando…")
- **WHEN** se renderiza
- **THEN** SHALL mostrar el spinner junto al texto de `loadingText`
- **AND** `loadingText` SHALL ser el nombre accesible del botón durante la carga

#### Scenario: precedencia de loading sobre disabled (CA-017.6)

- **GIVEN** un botón con `loading=true` y `disabled=true`/`disabledReason` simultáneos
- **WHEN** se renderiza
- **THEN** `loading` SHALL ganar: la acción SHALL estar bloqueada y el `disabledReason` NO SHALL mostrarse
- **AND** al pasar `loading` a `false`, el estado `disabled` y su motivo SHALL restablecerse

#### Scenario: estilos por tokens sin pares de contraste nuevos (CA-017.7)

- **WHEN** se inspecciona el CSS del estado loading
- **THEN** todo valor visual SHALL referenciarse vía `var(--ds-*)` (`component.spinner.*` + tokens de `button`)
- **AND** al heredar `currentColor` NO SHALL introducir pares de contraste propios

#### Scenario: tests del comportamiento loading con Vitest (CA-017.1–017.6)

- **WHEN** se ejecuta `pnpm -F @romanmartinidev/components test`
- **THEN** Vitest SHALL cubrir: bloqueo de `clicked` con `loading`, presencia/ausencia de `aria-busy`, spinner decorativo embebido, modo default vs. `loadingText` y precedencia sobre `disabled`

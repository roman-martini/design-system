## ADDED Requirements

### Requirement: Tests del Button con Vitest

El package SHALL incluir tests para Button con Vitest + `@analogjs/vitest-angular`. Los tests SHALL cubrir: creación del componente, renderizado del `<button>`, comportamiento del output `clicked` con y sin `disabled`.

#### Scenario: corre con pnpm test

- **WHEN** se ejecuta `pnpm -F @romanmartinidev/components test`
- **THEN** Vitest SHALL ejecutar `button.spec.ts` y SHALL retornar exit 0 con todos los tests passing

#### Scenario: test del comportamiento disabled

- **GIVEN** un Button renderizado con `disabled` set a `true`
- **WHEN** se simula un click
- **THEN** el output `clicked` SHALL NO emitir

#### Scenario: test del comportamiento enabled

- **GIVEN** un Button renderizado sin disabled (default false)
- **WHEN** se simula un click
- **THEN** el output `clicked` SHALL emitir exactamente una vez

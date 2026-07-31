# components-package — delta de a11y-testing-gates

## ADDED Requirements

### Requirement: Verificación automática de accesibilidad del DOM renderizado

Todo componente público del kit SHALL tener su render por defecto verificado con un motor de accesibilidad automatizado (`axe-core`) como parte de la suite de tests del package, ejecutada por el pipeline sin step ni servicio adicional. La verificación SHALL cubrir las reglas de nivel WCAG 2.0/2.1 A y AA; una violación SHALL hacer fallar el test identificando la regla, su impacto y el nodo — NO SHALL emitirse como advertencia.

La configuración SHALL vivir en **un único helper compartido** (`packages/components/src/testing/axe.ts`): el conjunto de reglas evaluadas, las reglas deshabilitadas con su justificación escrita, y la lista de exclusiones. NO SHALL configurarse axe por componente ni duplicarse la invocación.

Una corrida que **no pudo evaluar nada** SHALL fallar. La ausencia de violaciones NO SHALL contarse como éxito por sí sola: el helper SHALL exigir además que el motor haya evaluado reglas con éxito y que ninguna regla haya quedado indeterminada por error interno del motor. Una excepción a esta regla SHALL declarar su motivo en el punto de invocación.

Lo que el entorno de test (jsdom) no permita evaluar SHALL declararse en una **lista de exclusiones versionada** en el mismo helper, con su motivo técnico y el destino que lo cubre. NO SHALL deshabilitarse una regla para ocultar un hallazgo real.

#### Scenario: cada componente público asserta axe sobre su render por defecto

- **GIVEN** el package de componentes
- **WHEN** se ejecuta `pnpm -F @romanmartinidev/components test`
- **THEN** cada componente público SHALL tener al menos una aserción de axe sobre su render por defecto
- **AND** la suite SHALL retornar exit 0

#### Scenario: una violación AA hace fallar la suite

- **GIVEN** un componente al que se le introduce una violación de nivel AA (por ejemplo un control sin nombre accesible)
- **WHEN** corre su spec
- **THEN** el test SHALL fallar
- **AND** el mensaje SHALL nombrar la regla de axe violada, su impacto y el nodo afectado

#### Scenario: una corrida no concluyente falla en vez de pasar

- **GIVEN** un árbol que el motor no puede auditar (subárbol oculto, o reglas que fallan por límites del entorno)
- **WHEN** corre la aserción de axe sin declarar una excepción con motivo
- **THEN** el test SHALL fallar indicando que la corrida no fue concluyente
- **AND** NO SHALL reportarse como éxito por ausencia de violaciones

#### Scenario: reglas deshabilitadas declaradas y justificadas en un solo lugar

- **WHEN** se inspecciona el helper compartido
- **THEN** SHALL enumerar las reglas deshabilitadas con su motivo escrito
- **AND** SHALL enumerar las exclusiones no cubribles en el entorno de test con su motivo técnico y el destino que las cubre

#### Scenario: el gate corre en el pipeline sin infraestructura nueva

- **GIVEN** el workflow de PR
- **WHEN** se ejecuta el step de tests existente
- **THEN** las aserciones de accesibilidad SHALL ejecutarse con él
- **AND** NO SHALL requerirse un step, job ni servicio adicional

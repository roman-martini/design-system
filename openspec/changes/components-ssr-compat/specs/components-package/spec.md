## ADDED Requirements

### Requirement: Compatibilidad con server-side rendering

Todo componente, directiva y service del kit SHALL poder instanciarse y renderizarse en la plataforma server de Angular (`@angular/platform-server`) sin lanzar excepción y sin acceder a los globals del navegador (`document`, `window` y las funciones que cuelgan de ellos). El comportamiento que requiere un navegador real (abrir overlays imperativos, lockear scroll, medir cajas, registrar listeners globales) SHALL materializarse recién en el cliente, cuando la app se hidrata.

El código del package SHALL acceder al documento únicamente a través de la referencia que provee la inyección de dependencias de Angular, y a la ventana únicamente derivándola de ese documento — nunca por el identificador global. La regla vale también para las rutas event-driven (que en server no se ejecutan): una sola vía de acceso es lo que hace la convención verificable por barrido y evita que un refactor mueva un acceso sin guarda a una ruta que sí corre en server. El patrón completo (qué primitiva usar en cada tipo de ruta) lo gobierna ADR-024.

#### Scenario: la página kitchen-sink se renderiza en server

- **GIVEN** una página que instancia todos los componentes públicos del kit (incluidos un `ds-modal` con `open=true` y un toast disparado durante el render)
- **WHEN** se renderiza con la plataforma server de Angular dentro de la suite de tests del package
- **THEN** el render SHALL completar sin excepción
- **AND** el HTML resultante SHALL contener el selector de cada componente instanciado

#### Scenario: un componente nuevo queda cubierto o la suite falla

- **GIVEN** un componente público nuevo agregado a `src/public-api.ts`
- **WHEN** corre la suite de tests del package sin que la página kitchen-sink lo instancie
- **THEN** la suite SHALL fallar identificando el componente ausente — la cobertura SSR de un componente nuevo no depende de que su autor se acuerde

#### Scenario: un acceso a los globals del navegador hace fallar la suite

- **WHEN** un archivo de `packages/components/src/lib/` (excluidos specs y stories) referencia los identificadores globales `document` o `window`, o invoca `getComputedStyle` sin derivarlo de la ventana del documento inyectado
- **THEN** la suite de tests del package SHALL fallar señalando archivo y línea

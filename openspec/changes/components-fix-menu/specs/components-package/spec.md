## MODIFIED Requirements

### Requirement: Surface de exports a través de public-api.ts

El package SHALL exponer `src/public-api.ts` como entry point. Solo lo re-exportado desde `public-api.ts` SHALL ser parte de la API pública. Detalles internos (helpers, tipos privados) SHALL NO re-exportarse aunque vivan en `src/lib/`.

El `index.ts` de cada componente SHALL enumerar los símbolos que expone, uno por uno. Un símbolo entra a la API pública porque alguien lo escribió en ese índice, no porque comparta archivo con otro que sí corresponde.

#### Scenario: import de Button funciona

- **WHEN** un consumidor escribe `import { DsButton } from '@romanmartinidev/components';`
- **THEN** el bundler SHALL resolver al export desde `dist/index.d.ts` y `dist/fesm2022/<entry>.mjs` (rutas exactas las define ng-packagr)

#### Scenario: import a internals está bloqueado

- **WHEN** un consumidor escribe `import { ... } from '@romanmartinidev/components/internals';`
- **THEN** el bundler SHALL fallar con error de export no encontrado (consecuencia del `exports` cerrado del package.json)

#### Scenario: cada índice de componente enumera su superficie

- **WHEN** se inspecciona cualquier `src/lib/<name>/index.ts`
- **THEN** SHALL contener únicamente exports con nombre (`export { … }` / `export type { … }`)
- **AND** agregar un símbolo exportado a un archivo del componente SHALL dejarlo fuera de la API pública mientras nadie lo agregue a ese índice

## ADDED Requirements

### Requirement: Output DTCG para integración con Figma

El package SHALL emitir, además de los outputs CSS y JS/TS, un artefacto en formato **DTCG (W3C Design Tokens)** apto para ser consumido por Figma vía Tokens Studio. El output SHALL usar `$value`/`$type`, SHALL **preservar las referencias como aliases** (`{group.token}`) en lugar de resolverlas a valores crudos, y SHALL emitir los temas como sets diferenciados. La dirección de la integración es **code → Figma (one-way)**, según ADR-009. Este output es **aditivo**: no altera los outputs CSS/JS ni el prefix `--ds-*`.

#### Scenario: el build emite el artefacto DTCG

- **GIVEN** las fuentes en `packages/tokens/src/`
- **WHEN** se ejecuta `pnpm -F @romanmartinidev/tokens build`
- **THEN** SHALL generarse al menos un archivo de tokens en formato DTCG bajo la carpeta de export de Figma del package (ej. `packages/tokens/figma/`)
- **AND** el comando SHALL retornar exit 0

#### Scenario: el DTCG es JSON válido con estructura `$value`/`$type`

- **WHEN** se parsea cualquier archivo del export DTCG
- **THEN** SHALL ser JSON válido
- **AND** los tokens hoja SHALL exponer `$value` (y `$type` cuando el tipo aplica), no la forma `{ "value": … }` del formato clásico de Style Dictionary

#### Scenario: las referencias se preservan como aliases DTCG

- **GIVEN** que `semantic/color.json` define `bg.primary` como referencia a un primitive
- **WHEN** se inspecciona el token correspondiente en el export DTCG
- **THEN** su `$value` SHALL ser un alias DTCG (ej. `"{color.blue.500}"`), no el valor crudo resuelto (ej. `"#3b82f6"`)
- **AND** así la cadena `component → semantic → primitive` SHALL reconstruirse en Figma como Variables que referencian Variables

#### Scenario: los temas se emiten como sets diferenciados

- **WHEN** se inspecciona el export DTCG
- **THEN** SHALL existir un set/archivo por cada tema declarado (`dark`, `brand-a`, `brand-b`) que contenga únicamente los overrides de `semantic`, apto para mapearse a modes de Figma

#### Scenario: paridad de tokens entre el DTCG y el set CSS base

- **GIVEN** el set base del export DTCG (primitives + semantic + component, sin temas)
- **WHEN** se compara la cantidad de tokens hoja con la cantidad de custom properties `--ds-*` emitidas en `dist/tokens.css` (sin contar las específicas de tema)
- **THEN** ambas cantidades SHALL coincidir (la transformación no pierde ni inventa tokens)

#### Scenario: los outputs existentes no se alteran

- **WHEN** se ejecuta el build con el target DTCG activo
- **THEN** `dist/tokens.css`, `dist/tokens.js` y `dist/tokens.d.ts` SHALL seguir emitiéndose con el prefix `--ds-*` y el contenido previo
- **AND** la incorporación del DTCG SHALL NO requerir cambios en los consumidores de CSS/JS existentes

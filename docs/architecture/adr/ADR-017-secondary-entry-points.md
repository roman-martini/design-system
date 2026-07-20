# ADR-017 — Secondary entry points del package components para integraciones opcionales

- **Fecha**: 2026-07-20
- **Estado**: Aceptado
- **Dominio**: frontend / components / build
- **ADRs relacionados**: [ADR-004](ADR-004-surface-libs-publicables.md) (surface de libs publicables — este ADR extiende su §barrel único a "un public-api por entry point"), [ADR-011](ADR-011-estado-disabled-accesible.md) (precedente "no sumar dependencias sin necesidad real")

## Contexto

HU-014 (Breadcrumbs, change [`aaa-027`](../../../openspec/changes/archive/aaa-027-components-add-breadcrumbs/)) incluye auto-generación de items desde las rutas de Angular. Eso requiere `@angular/router`, que el kit **no** tiene como dependencia — y dos decisiones del PO entran en tensión: el core del componente debe ser agnóstico del router (links proyectados) y la pieza de auto-generación debe entrar en v1. Meter `@angular/router` como peer dura del entry principal haría que **toda** app consumidora del kit pague el router aunque no lo use. La forma de empaquetar integraciones opcionales define la estructura del package hacia adelante → one-way door que amerita ADR.

## Opciones consideradas

### Opción A — Secondary entry point con peer opcional (elegida)

`@romanmartinidev/components/router` como secondary entry point APF (ng-packagr) con `@angular/router` en `peerDependencies` + `peerDependenciesMeta: { optional: true }`.

- **Pros**: el core queda agnóstico (cero imports de router fuera de `router/`); quien no importa el entry point no necesita el router instalado ni lo arrastra al bundle (tree-shaking por entry point); APF lo soporta de primera clase (FESM y types propios en el mismo tarball); patrón estándar del ecosistema (`@angular/material/*`, `@angular/fire/*`).
- **Contras**: estructura de build más compleja (un `ng-package.json` por entry point, `include` de tsconfigs, alias en vitest); el `exports` manual del `package.json` debe mantenerse alineado con lo que emite ng-packagr.

### Opción B — Todo en el entry principal con `@angular/router` como peer dura

- **Contras**: toda app del kit pasa a requerir `@angular/router` instalado aunque use solo botones; contradice la decisión de core agnóstico y encarece la adopción. Descartada.

### Opción C — Package npm separado (`@romanmartinidev/components-router`)

- **Contras**: overhead completo de un package publicable (versionado, changesets, README, lockstep a tres) para una pieza de integración; fragmenta la instalación sin beneficio sobre A. Descartada.

## Decisión

**Las integraciones opcionales del kit con dependencias que el core no debe arrastrar se empaquetan como secondary entry points de `@romanmartinidev/components`**, con estas reglas:

1. **Criterio de creación**: un secondary entry point existe solo para aislar una **dependencia opcional** (ej. `@angular/router`) — no para organizar código por tema. Sin dependencia nueva que aislar, el código va al entry principal. No se crean entry points especulativos (D-005).
2. **Estructura**: `packages/components/<entry>/` con `ng-package.json` propio (`lib.entryFile: src/public-api.ts`); cada entry point tiene su único barrel `public-api.ts` (extiende ADR-004 §barrel). El entry point importa el core por nombre de package (`@romanmartinidev/components`), nunca por path relativo.
3. **Peers opcionales**: la dependencia aislada entra a `peerDependencies` con `peerDependenciesMeta.optional: true`, y como devDependency para compilar/testear. **Guarda verificable**: cero imports de esa dependencia fuera del directorio del entry point.
4. **Exports**: el `package.json` publicado mapea `./<entry>` a los paths emitidos por ng-packagr en `dist/` (alinear con el `dist/package.json` generado tras el primer build).
5. **Tooling**: los tsconfigs (`lib`, `spec`) incluyen `<entry>/src/**`; vitest resuelve el nombre del package al source del core vía alias.

## Consecuencias

### Positivas

- Integraciones con dependencias pesadas u opcionales sin encarecer el kit base; el consumidor paga solo lo que importa.
- Patrón repetible y documentado para futuras integraciones reales (ej. un hipotético `components/forms` avanzado) sin re-decidir.
- El primer caso (`router`, aaa-027) queda como implementación de referencia con sus guardas en tests y gates.

### Negativas / trade-offs aceptados

- El `exports` manual del `package.json` puede desalinearse de lo que emite ng-packagr (warning de conflicto en build) — mitigado con el gate de `npm pack --dry-run` que verifica los bundles del entry point.
- Más superficie de configuración (tsconfig include, vitest alias) por cada entry point nuevo — aceptado: se paga una vez por integración real.

### Acciones de seguimiento

- Próximo entry point (si aparece caso real): seguir reglas 1–5 sin re-decidir; si alguna no aplica, ADR nuevo.
- Si ng-packagr incorpora la gestión automática del `exports` del package.json raíz, adoptar y simplificar la regla 4.

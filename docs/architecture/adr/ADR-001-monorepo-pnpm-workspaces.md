# ADR-001 — Adoptar pnpm workspaces como herramienta de monorepo

- **Fecha**: 2026-05-30
- **Estado**: Aceptado
- **Dominio**: transversal
- **ADRs relacionados**: —

## Contexto

`agent-design-sistem` aloja al menos dos librerías publicables (`@romanmartinidev/tokens`, `@romanmartinidev/components`) y una app de prueba (`apps/playground`) que las consume. Esta topología obliga a:

1. Compartir devDependencies (TypeScript, ESLint, Prettier, Vitest…) sin duplicarlas en cada workspace.
2. Resolver dependencias internas (`components → tokens`) sin acoplarse a versiones publicadas todavía inexistentes.
3. Ejecutar tareas atómicas y recursivas (`build`, `test`, `lint`) con orden topológico.
4. Soportar la incorporación futura de más packages (`icons`, `forms`, etc.) sin reescribir la infraestructura.

La elección de herramienta de monorepo es **one-way door**: cambiarla más adelante implica reescribir scripts, configuración de CI, política de versionado y posiblemente la estructura de imports.

El repo prioriza, en estricto orden:

1. Aplicar buenas prácticas.
2. Diseños/arquitecturas que escalen ordenado.
3. Mantenibilidad vía estándares y convenciones claras.

## Opciones consideradas

### Opción A — npm workspaces

- **Pros**:
  - Sin instalación extra: ya viene con Node.
  - Soporte oficial del ecosistema npm.
  - Conocido por todo dev JS.
- **Contras**:
  - Almacenamiento no es content-addressable: replica deps en cada workspace.
  - No tiene `strict-peer-dependencies` por default: silencia mismatches que después explotan en producción.
  - Performance de `npm install` inferior a pnpm en monorepos medianos/grandes.
  - Soporte para `workspace:*` agregado tarde y menos pulido.

### Opción B — yarn (Classic o Berry) workspaces

- **Pros**:
  - Yarn 1 (Classic) tiene soporte maduro de workspaces.
  - Yarn Berry (v4+) ofrece PnP, plugins, mejor caching.
- **Contras**:
  - Ecosistema fragmentado: 1.x vs 2+ tienen comportamientos distintos.
  - Yarn Berry tiene curva alta (Plug'n'Play rompe muchas tools), y el equipo lo ha dejado de mantener activamente.
  - Yarn 1 entró en modo mantenimiento; ya no es la opción defecto del ecosistema moderno.

### Opción C — pnpm workspaces (status quo de la decisión del kickoff)

- **Pros**:
  - Almacenamiento content-addressable: cero duplicación entre workspaces.
  - `strict-peer-dependencies=true` por default: cazar mismatches temprano.
  - Protocolo `workspace:*` nativo y bien resuelto al publicar (se reescribe a versiones reales por Changesets).
  - Performance de instalación superior (uso de hardlinks/CoW).
  - Adoptado por la mayoría de monorepos frontend modernos (Vite, Vue, Astro, Svelte, Remix, Nuxt, Storybook).
- **Contras**:
  - Requiere instalación adicional (corepack o npm install -g).
  - Menos ubicuo en hostings de CI antiguos (mitigable con `packageManager` field en `package.json`).
  - Symlinks pueden confundir herramientas legacy (no aplica al stack elegido).

### Opción D — Nx o Turborepo encima de pnpm

- **Pros**:
  - Task runner con caché distribuida, dep-graph, generators.
  - Nx tiene generators Angular nativos.
- **Contras**:
  - Lock-in (especialmente Nx).
  - Curva más alta, configuración opinionated.
  - Innecesario para 2-3 packages: el costo de mantenimiento supera el beneficio a esta escala.
  - Se puede agregar después (Turbo sobre pnpm es composable), no es una decisión one-way door.

## Decisión

Se adopta **pnpm workspaces** como única herramienta de monorepo, sin task runner adicional por ahora.

**Criterio de selección**: pnpm es la opción que mejor cumple las tres prioridades del repo simultáneamente:

- **Buenas prácticas**: estándar adoptado por la mayoría de proyectos serios del ecosistema frontend moderno.
- **Escalar ordenado**: `strict-peer-dependencies` + `workspace:*` permiten sumar packages sin acumular deuda silenciosa.
- **Mantenibilidad**: `packageManager` + `engine-strict` fijan la herramienta para todos los devs y CI; lockfile único en root evita drift.

La pregunta "Nx/Turbo encima?" se difiere: se puede sumar en cualquier momento sin invalidar este ADR. Si el monorepo supera los ~5 packages o aparece dolor real de build/test orchestration, se evalúa en un ADR posterior.

## Consecuencias

### Positivas

- Instalación rápida y deduplicada.
- Detección temprana de peer mismatches.
- Cero ambigüedad sobre la herramienta a usar (CI, devs, IDE).
- Posibilidad de sumar Turbo/Nx después sin reescribir.

### Negativas / trade-offs aceptados

- Devs deben instalar pnpm (no viene en Node por default).
- Sin caché de tasks ni dep-graph automatizado: a esta escala se acepta correr `pnpm -r <task>` manualmente.
- Symlinks de pnpm pueden requerir flags específicos en hostings que no los soportan (ej. algunos CI Windows). Mitigación: documentar en README si aparece.

### Acciones de seguimiento

- Documentar la versión exacta de pnpm en `packageManager` del root `package.json`. ✅ ya hecho en Fase 1.
- `engine-strict=true` en `.npmrc` para enforcement. ✅ ya hecho.
- Si el monorepo crece a >5 packages o la build orchestration empieza a doler, evaluar Turborepo en un ADR posterior.

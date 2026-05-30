# ADR-002 — Adoptar Conventional Commits + Changesets para versionado y release

- **Fecha**: 2026-05-30
- **Estado**: Aceptado
- **Dominio**: transversal
- **ADRs relacionados**: [ADR-001](ADR-001-monorepo-pnpm-workspaces.md)

## Contexto

El monorepo publicará al menos dos librerías independientes (`@romanmartinidev/tokens` y `@romanmartinidev/components`) que pueden evolucionar con cadencias distintas. Esto exige:

1. Una **convención de commits** que comunique intención (feat / fix / breaking) tanto a humanos como a herramientas.
2. Una **estrategia de versionado** que respete semver por package (no por commit del repo), porque distintos packages se versionan en distintos momentos.
3. **Changelogs automáticos** por package, no globales.
4. Una **publicación reproducible** que reescriba `workspace:*` a versiones reales al publicar.
5. **Validación automática** del formato de commits para que la convención no dependa de buena memoria.

La decisión es one-way door en el sentido de que cambiar la convención de commits después implica reescribir historia o convivir con mezcla; cambiar la estrategia de versionado obliga a re-generar changelogs y posiblemente ajustar tags.

## Opciones consideradas

### Opción A — Versionado manual + sin convención de commits

- **Pros**:
  - Cero tooling. Cero curva.
- **Contras**:
  - Errores humanos al elegir versiones.
  - Changelogs hechos a mano → drift garantizado.
  - Sin señal en el historial sobre qué fue feature, fix o breaking.
  - **Viola "buenas prácticas"** del ecosistema moderno.

### Opción B — Conventional Commits + semantic-release

- **Pros**:
  - Conventional Commits es estándar de facto (lo usa Angular, React, Vue, etc.).
  - semantic-release infiere versiones automáticamente desde commits.
  - CI corre release sin intervención.
- **Contras**:
  - **Diseñado para un único package por repo**: en monorepos se necesita configuración pesada o el plugin `semantic-release-monorepo` (mantenimiento incierto).
  - El developer no controla la versión: cualquier `feat:` dispara un minor, cualquier `BREAKING CHANGE` dispara un major, incluso si la intención era postergar.
  - Releases por cada merge a `main` (puede ser indeseado en pre-1.0).

### Opción C — Conventional Commits + Changesets

- **Pros**:
  - **Diseñado para monorepos**: cada changeset declara qué packages cambian y con qué bump.
  - El developer elige el bump (`patch`/`minor`/`major`) explícitamente → control fino sobre semver, especialmente útil pre-1.0.
  - Reescribe `workspace:*` a versiones reales al publicar.
  - Changelogs por package, no globales.
  - Adoptado por React, Astro, Remix, Svelte, Storybook, TanStack, etc.
- **Contras**:
  - Requiere disciplina: si el developer olvida crear un changeset, la PR no actualiza versión.
  - Mitigación: workflow CI futuro (Fase 5) puede bloquear PRs sin changeset.

### Opción D — Conventional Commits sin tooling de release (manual semver)

- **Pros**:
  - Convención clara, sin lock-in en tools.
- **Contras**:
  - Pierde el principal beneficio: automatizar changelogs y versionado por package.
  - Drift entre commits y versiones publicadas es cuestión de tiempo.

## Decisión

Se adoptan **dos convenciones combinadas**:

1. **Conventional Commits** como formato obligatorio de mensajes de commit, validado por **commitlint** en el hook `commit-msg` de Husky.
2. **Changesets** (`@changesets/cli`) como herramienta de versionado y publicación, configurada con `access: "public"`, `baseBranch: "main"`, `updateInternalDependencies: "patch"`.

**Criterio de selección**:

- **Buenas prácticas**: ambas son los estándares vigentes del ecosistema frontend moderno para monorepos.
- **Escalar ordenado**: Changesets fue diseñado explícitamente para el problema que tenemos (múltiples packages con cadencias distintas); semantic-release no.
- **Mantenibilidad**: el formato de commits es legible para humanos y máquinas; cada release queda documentado en CHANGELOG.md por package.

El control manual del bump (Changesets) sobre el automático (semantic-release) se prefiere especialmente **pre-1.0**, donde la superficie API todavía evoluciona y cualquier feature puede convertirse en breaking sin que lo digan los commits.

## Consecuencias

### Positivas

- Historial de commits con intención clara: `feat:`, `fix:`, `chore:`, etc.
- Changelogs auto-generados por package.
- Publicación reproducible con `workspace:*` reescritos.
- Pre-commit hook (`lint-staged`) + commit-msg hook (`commitlint`) impiden commits malformados o sin lint.
- Compatible con CI futuro (Fase 5): un workflow puede correr `changeset version` y `changeset publish` automáticamente al merge.

### Negativas / trade-offs aceptados

- Devs deben aprender el formato de commits (curva mínima).
- Cada PR que afecta una lib publicable debe agregar un changeset. Hasta que haya CI que lo enforce, depende de disciplina humana.
- Husky agrega ~10ms a cada commit y requiere `prepare` script + `node_modules/.husky` instalado.

### Acciones de seguimiento

- Documentar la convención de commits y el flujo de Changesets en `CONTRIBUTING.md`. ✅ ya hecho en Fase 1.
- En Fase 5 (CI): agregar workflow que **bloquee PRs sin changeset** si tocan archivos en `packages/*` (estándar: `changesets/action` con flag `requireChangeset`).
- Definir la política definitiva de versionado al primer release (1.0): hoy aceptamos cambios breaking en `0.x.y` con `minor` bump según convención `0ver` de Changesets.

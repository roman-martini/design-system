# agent-design-sistem

Monorepo `pnpm` con librerías de **arquitectura frontend** publicables bajo el scope `@romanmartinidev` y una app de prueba (`apps/playground`) para validarlas en condiciones reales.

## Prioridades estrictas (en orden)

1. **Aplicar buenas prácticas.**
2. **Diseños/arquitecturas que escalen ordenado.**
3. **Mantenibilidad** vía estándares y convenciones claras.

Toda decisión arquitectónica o de proceso debe poder justificarse contra estas prioridades. Frente a una disyuntiva, no elegir por velocidad; ofrecer 2-3 opciones evaluadas con pros/contras y recomendación.

## Estructura del repo

```
agent-design-sistem/
├── packages/                    # Librerías publicables
│   ├── tokens/                  # @romanmartinidev/tokens — design tokens (Style Dictionary)
│   └── components/              # @romanmartinidev/components — componentes Angular (ng-packagr)
├── apps/
│   └── playground/              # App Angular para probar libs y crear prototipos
├── docs/
│   ├── architecture/            # Fuente de verdad arquitectónica
│   │   ├── README.md            # Visión general
│   │   ├── decisions-log.md     # Índice tabular de decisiones
│   │   └── adr/                 # ADRs en formato MADR
│   └── reference/                  # Material de referencia (no normativo, otros repos)
├── openspec/                    # Specs y propuestas de cambio significativo
│   ├── config.yaml
│   ├── specs/
│   └── changes/
├── .changeset/                  # Versionado con Changesets (a crear en Fase 1)
├── package.json                 # Root del monorepo (workspaces, devDeps compartidas)
├── pnpm-workspace.yaml
├── .nvmrc                       # Versión de Node fija
├── .npmrc                       # Config pnpm
├── .editorconfig
├── CLAUDE.md                    # Este archivo
└── README.md                    # Punto de entrada del repo
```

## Stack

- **Package manager**: pnpm (workspaces)
- **Node**: ver `.nvmrc`
- **TypeScript**: 5.9
- **Angular**: 21
- **Build libs Angular**: ng-packagr (Angular Package Format)
- **Build tokens**: Style Dictionary 4.x
- **Testing**: Vitest 4
- **Storybook**: 10
- **Docs componentes**: Compodoc (en `apps/playground/` si se mantiene)
- **Versionado packages**: Changesets
- **Lint**: ESLint
- **Format**: Prettier
- **Commits**: Conventional Commits + commitlint
- **Pre-commit**: Husky + lint-staged

## Fuentes de verdad

Cada artefacto del repo responde una pregunta distinta. **No mezclarlos**. Si tenés una duda, mirá la tabla:

| Pregunta                                                    | Fuente de verdad                      | Naturaleza                                                                |
| ----------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------- |
| ¿Qué debe hacer el sistema?                                 | `openspec/specs/<capability>/spec.md` | Contratos testables (Given/When/Then)                                     |
| ¿Qué cambios significativos están en curso?                 | `openspec/changes/<change-name>/`     | Propuesta activa (`proposal.md` + `design.md` + `tasks.md` + spec deltas) |
| ¿Cuál es el historial de cambios cerrados?                  | `openspec/changes/archive/`           | Auditoría de cambios pasados                                              |
| ¿Por qué se decidió X?                                      | `docs/architecture/adr/ADR-NNN-*.md`  | Decisión inmutable + opciones evaluadas                                   |
| ¿Hay un índice de todas las decisiones?                     | `docs/architecture/decisions-log.md`  | Tabla cronológica                                                         |
| ¿Cómo está organizado el repo (visión general, principios)? | `docs/architecture/README.md`         | Mapa mental                                                               |
| ¿Cómo trabajo como dev en este repo?                        | `CONTRIBUTING.md`                     | Flujo de PR, commits, changesets                                          |
| ¿Cómo arranco como dev nuevo?                               | `README.md` (root)                    | Quickstart                                                                |
| ¿Cómo debe trabajar Claude acá?                             | `CLAUDE.md` (este archivo)            | Contrato Claude ↔ repo                                                    |
| Componentes futuros + tokens faltantes (backlog del DS)     | `docs/architecture/FUTURE-WORK.md`    | Backlog inspiracional (no normativo)                                      |
| Material de investigación de referencia (no normativo)      | `docs/reference/`                     | Histórico/inspiración                                                     |

### Reglas para no mezclar

1. **Specs ≠ ADRs.** Specs describen comportamiento testable (qué). ADRs justifican decisiones tecnológicas (por qué). Si dudás: ¿se puede convertir en un test? → spec. ¿Documenta una elección entre alternativas? → ADR.
2. **`design.md` de un change ≠ ADR.** El `design.md` muere cuando el change se archiva. El ADR queda eterno. Decisiones one-way door del change se promueven a ADR al cerrarse.
3. **`docs/architecture/README.md` no duplica specs.** Da contexto (diagramas, principios, mapa). Las reglas testables linkean al spec correspondiente.
4. **OpenSpec excluye explícitamente** elecciones de framework/librería y detalles de implementación. Eso va a `design.md` o ADRs, no a specs.

## Convenciones

### Conventional Commits

Todos los commits siguen [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[body opcional]

[footer opcional, ej. BREAKING CHANGE]
```

Tipos: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`.

Scopes habituales: `tokens`, `components`, `playground`, `repo`, `ci`, `docs`.

### ADRs (Architecture Decision Records)

Toda decisión one-way door o que afecta ≥2 packages genera un ADR en formato MADR en `docs/architecture/adr/`. Los ADRs son **inmutables**: para revertir, crear un nuevo ADR que referencia al anterior. Ver `docs/architecture/adr/README.md` para el formato.

### OpenSpec

Todo cambio significativo (nueva lib, refactor mayor, cambio de tooling base) arranca como propuesta en `openspec/changes/`. Los cambios triviales o de implementación local **no** requieren propuesta OpenSpec.

**IDs de Changes** (formato `<bloque>-<numero>`, ver [ADR-008](docs/architecture/adr/ADR-008-convencion-ids-openspec.md)):

- Cada change recibe un ID **permanente** (`aaa-001`, `aaa-002`, …) declarado en el **frontmatter YAML** del `proposal.md`.
- Cuando `aaa-999` se llena, el siguiente change arranca `aab-001`, después `aac-001`, etc.
- Los **paths de changes activos NO incluyen el ID** (los directorios siguen con kebab-case). El ID vive solo en el frontmatter. Al archivar, el directorio se renombra a `<id>-<name>` y se mueve a `archive/`.
- Las **specs NO tienen ID**. Se identifican por su nombre de carpeta (`openspec/specs/<name>/`).
- Tabla maestra: [`openspec/IDS.md`](openspec/IDS.md) — único lugar para resolver `aaa-NNN` ↔ nombre y obtener próximo ID disponible.
- Convención del frontmatter detallada en `openspec/IDS.md → Convención`.

### Versionado

- Cada PR que afecta una lib publicable agrega un changeset con `pnpm changeset`.
- Pre-1.0: respetar semver pero entendiendo que la superficie API puede cambiar (la política definitiva se acuerda al primer release).

### Naming de packages

- Scope: `@romanmartinidev/`
- Nombre kebab-case corto y descriptivo (ej. `tokens`, `components`, `icons`).
- Mismo nombre que la carpeta en `packages/`.

## Comandos esenciales (post-Fase 1)

```bash
# Setup
pnpm install

# Build de toda la cadena
pnpm -r build

# Build de un package específico
pnpm -F @romanmartinidev/tokens build

# Levantar playground
pnpm -F playground start

# Storybook
pnpm -F playground storybook

# Lint + format
pnpm lint
pnpm format

# Agregar un changeset
pnpm changeset

# Versionar (en release)
pnpm changeset version

# Publicar (en release)
pnpm -r publish
```

> Los comandos se completan a medida que avanzan las fases del bootstrap.

## Cómo trabajar en este repo (para Claude)

1. **Leer siempre primero** `docs/architecture/README.md`, `docs/architecture/decisions-log.md` y los ADRs aceptados antes de proponer cambios estructurales.
2. **Detectar y marcar malas prácticas**. Si el código viola las prioridades de arriba, mencionarlo y proponer alternativa fundamentada — no continuar en silencio.
3. **Cambios significativos siguen el flujo de OpenSpec** — propuesta → review → apply → archive. Ver `openspec/IDS.md` para el catálogo de changes/specs.
4. **No modificar ADRs aceptados.** Para cambiar una decisión, crear un nuevo ADR.
5. **Documentar decisiones nuevas.** Toda decisión arquitectónica significativa actualiza `decisions-log.md` y genera ADR si corresponde.
6. **No crear archivos `*.md` de planificación o resumen ad-hoc** salvo que se pidan explícitamente. Las decisiones van a ADRs; los cambios significativos van a OpenSpec.

## Referencias

- Síntesis arquitectónica: `docs/architecture/README.md`
- Material de investigación: `docs/reference/`
- Contexto original del proyecto: `docs/contexto_inicial.md`

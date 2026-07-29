# Contributing

Gracias por considerar contribuir a `design-system`. Este documento describe el flujo de trabajo del repo: convenciones de commits, versionado, gobernanza de cambios y calidad.

## Prioridades del repo

Toda contribución se evalúa contra estas prioridades, en orden:

1. **Aplicar buenas prácticas.**
2. **Diseños/arquitecturas que escalen ordenado.**
3. **Mantenibilidad** vía estándares y convenciones claras.

Frente a una disyuntiva, no elegir por velocidad: proponer 2-3 opciones evaluadas con pros/contras.

## Setup inicial

```bash
nvm use            # Node de .nvmrc
pnpm install       # instala todo el monorepo
```

`pnpm install` ejecuta `husky` automáticamente (vía `prepare` script) y deja los hooks de git listos.

## Conventional Commits

Todos los commits siguen [Conventional Commits](https://www.conventionalcommits.org/). El hook `commit-msg` valida el formato con commitlint y rechaza mensajes malformados.

### Formato

```
<type>(<scope>): <subject>

[body opcional]

[footer opcional, ej. BREAKING CHANGE]
```

### Tipos válidos

`feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`.

### Scopes habituales

`tokens`, `components`, `playground`, `repo`, `ci`, `docs`, `deps`.

### Ejemplos

✅ Válidos:

- `feat(tokens): add neutral color scale`
- `fix(components): correct button focus ring`
- `chore(repo): update pnpm to 9.5.0`
- `docs(architecture): add ADR-005`

❌ Inválidos:

- `arreglo cosas` — sin tipo
- `feat: ` — subject vacío
- `Feat(tokens): Add stuff` — case incorrecto

### Subject

- En minúsculas, sin punto final.
- Imperativo presente (ej. "add", no "added" ni "adds").
- ≤ 72 caracteres.

## Pre-commit hooks

Sobre archivos staged, antes de cada commit corre:

- `eslint --fix` en `*.{ts,tsx,js,jsx,mjs,cjs}`
- `prettier --write` en `*.{ts,tsx,js,jsx,mjs,cjs,json,md,yaml,yml,css,scss,html}`

Si hay errores no auto-fixables, el commit se aborta.

Para correr lint/format manualmente:

```bash
pnpm lint            # ESLint en todo
pnpm format          # auto-formatea con Prettier
pnpm format:check    # verifica formato sin escribir
```

## Versionado con Changesets

Cada PR que afecta una librería publicable (cualquier cosa en `packages/*`) **requiere un changeset**. El último gate de `pr.yml` lo verifica y bloquea el merge si falta.

### Crear un changeset

```bash
pnpm changeset
```

El CLI interactivo pregunta:

1. **Qué packages cambiaron** (selección con espacio).
2. **Tipo de bump**:
   - `patch`: bug fix sin cambios de API (`0.2.0 → 0.2.1`).
   - `minor`: feature nueva backward-compatible (`0.2.0 → 0.3.0` en pre-1.0; `1.0.0 → 1.1.0` en post-1.0).
   - `major`: breaking change (`0.2.0 → 0.3.0` en pre-1.0; `1.0.0 → 2.0.0` en post-1.0).
3. **Descripción** del cambio, que va al CHANGELOG generado.

Genera un archivo en `.changeset/<random-name>.md`. **Commiteá ese archivo junto con tus cambios** en el PR.

**Idioma**: los changesets y los CHANGELOG se escriben en **español**, igual que el resto del repo ([D-018](docs/product/decisiones.md)). El histórico del `0.2.0` quedó en inglés y se acepta como está — no se reescribe.

### Lockstep: tokens y components versionan juntos

Desde [ADR-015](docs/architecture/adr/ADR-015-versionado-lockstep.md), `@romanmartinidev/tokens` y `@romanmartinidev/components` están configurados como `fixed` en Changesets: **comparten una única versión**. Consecuencias prácticas al escribir un changeset:

- El bump que elegís **aplica al par**, no a un package suelto: si marcás un `minor` en `tokens`, `components` sube igual aunque no lo hayas tocado.
- El peer de tokens dentro de components es un **rango plano pre-1.0** (`>=0.1.0 <1.0.0`) con `onlyUpdatePeerDependentsWhenOutOfRange`, lo que evita que cada bump de tokens fuerce un major en components.
- Elegí el bump por el **impacto mayor** de los dos packages.

### Pre-1.0

Mientras los packages no lleguen a 1.0, respetamos semver pero entendiendo que la superficie API puede cambiar. La política definitiva se acuerda al primer release.

### Release (mantenedores)

El release está automatizado vía GitHub Actions + Changesets (ver [`ADR-006`](docs/architecture/adr/ADR-006-estrategia-ci-cd.md)). El mantenedor NO publica manualmente — todo pasa por el workflow `release.yml`. Ver sección [CI / Release](#ci--release) más abajo.

> **Aprobación por versión**: el veto de publicación fue levantado el 2026-07-28 ([D-028](docs/product/decisiones.md)), pero eso no habilita publicar en automático. Cada release requiere la aprobación explícita del PO en el environment `npm-publish` ([ADR-022](docs/architecture/adr/ADR-022-gate-aprobacion-publish-npm.md)).

## CI / Release

El repo usa **dos workflows de GitHub Actions** que se autovalidan en cada PR y orquestan releases automáticos vía Changesets.

### Workflow `pr.yml` — Validación en cada PR

**Trigger**: `pull_request` apuntando a `main`.

Valida en orden:

1. **actionlint** — fallo: hay un error de sintaxis o de expresión en un workflow. Reproducilo local (ver [Lint de workflows](#lint-de-workflows)).
2. **commitlint** — fallo: algún commit del PR no cumple Conventional Commits. Corré `pnpm exec commitlint --from origin/main --to HEAD --verbose` y reescribí el mensaje.
3. `pnpm format:check` — fallo: corré `pnpm format` y commiteá.
4. `pnpm lint` — fallo: corré `pnpm lint --fix` y revisá los errores no auto-fixables.
5. `pnpm -r build` — fallo: revisá el error de build localmente con el mismo comando.
6. `pnpm -r test` — fallo: corré `pnpm test` localmente y arreglá los specs.
7. `pnpm verify:packaging` — fallo: el artefacto emitido no cumple el contrato de publicación ([ADR-021](docs/architecture/adr/ADR-021-estrategia-publicacion-packages.md)).
8. `pnpm exec openspec validate --all` — fallo: corré `pnpm openspec validate --all` localmente y arreglá la spec/change.
9. **Changeset enforcement** — fallo: el PR toca `packages/*` sin agregar un changeset. Corré `pnpm changeset` y agregá el archivo generado al PR.

> El step 9 se **omite** en el PR autogenerado `changeset-release/main`: ese PR bumpea `packages/*/package.json` después de consumir los changesets, así que por construcción no puede satisfacer el gate. También se omite si el PR solo toca `README.md` o `CHANGELOG.md` de un package.

Si cualquier step falla, el PR queda con check rojo y NO debería mergearse (la branch protection lo bloquea, ver más abajo).

### Workflow `release.yml` — Release con Changesets

**Trigger**: `push` a `main` (cualquier merge dispara el workflow).

Tiene **dos jobs**, uno por modo ([ADR-022](docs/architecture/adr/ADR-022-gate-aprobacion-publish-npm.md)):

**Job `version` — Hay changesets pendientes en `.changeset/`**:

Abre o actualiza un PR titulado `chore(repo): version packages` con:

- Bumps de versión en `packages/*/package.json`.
- CHANGELOG.md actualizado por package afectado.
- Los archivos `.changeset/*.md` consumidos eliminados.

Corre sin aprobación: la operación es reversible y ocurre en cada merge.

**Job `publish` — No quedan changesets pendientes** (típicamente porque el PR de release recién se mergeó):

Buildea y ejecuta `pnpm changeset publish`. **Queda en espera de aprobación** del required reviewer del environment `npm-publish` antes de correr: publicar es irreversible (npm no permite republicar una versión). Nada llega a npm sin ese OK explícito.

> El workflow invoca `changeset publish` directo y no un script del root: el script `release` fue **eliminado** a propósito para que no exista un camino de publish manual de un comando. Para versionar, el script se llama `changeset:version` (no `version`, que colisiona con un builtin de pnpm).

### Flujo completo de release

```mermaid
sequenceDiagram
    actor Dev
    actor Maintainer
    participant GH as GitHub
    participant NPM as npm

    Dev->>GH: PR con changeset (pnpm changeset)
    GH->>GH: pr.yml valida (actionlint + commitlint + lint + test + build + packaging + openspec + changeset)
    Maintainer->>GH: Merge PR
    GH->>GH: release.yml — job version detecta changesets pendientes
    GH->>GH: Abre/actualiza PR "chore(repo): version packages"
    Note right of GH: PR de release tiene<br/>bumps + CHANGELOG +<br/>borra .changeset/*.md
    Maintainer->>GH: Revisa CHANGELOG + merge PR de release
    GH->>GH: job version ya no encuentra changesets pendientes
    GH->>GH: job publish queda EN ESPERA (environment npm-publish)
    Maintainer->>GH: Aprueba el deployment
    GH->>NPM: build + pnpm changeset publish
    NPM-->>GH: Packages publicados
```

### Branch protection (acción del mantenedor)

Las branch protection rules se configuran **manualmente** en GitHub UI (Settings → Branches → Add rule para `main`). El mantenedor debe aplicar este checklist:

- [x] **Require pull request reviews before merging** — minimum 1 reviewer (vacío si trabajás solo, pero igual te obliga a abrir PR).
- [x] **Require status checks to pass before merging**:
  - [x] Require branches to be up to date before merging.
  - [x] Status checks required: `Validate` (job del workflow `pr.yml`).
- [x] **Require linear history** (recomendado — fuerza rebase merge en lugar de merge commits).
- [x] **Do not allow bypassing the above settings**.
- [x] **Restrict who can push to matching branches** — solo el mantenedor.
- [x] **Restrict pushes that create matching branches** — bloquear creación de branches `main` desde forks.
- [ ] **Allow force pushes**: NO marcar.
- [ ] **Allow deletions**: NO marcar.

Estas reglas garantizan que ningún PR llegue a `main` sin pasar `pr.yml` y que `main` nunca se reescribe destructivamente.

### Environment `npm-publish` (acción del mantenedor)

El job de publish de `release.yml` declara `environment: npm-publish`. Ese environment se crea **manualmente** en GitHub UI (Settings → Environments → New environment), y es lo que convierte la publicación a npm en una acción que requiere aprobación explícita ([ADR-022](docs/architecture/adr/ADR-022-gate-aprobacion-publish-npm.md), [D-018](docs/product/decisiones.md)(b)).

> ⚠️ **Hasta que el environment exista con su reviewer, el gate NO protege nada.** GitHub crea implícitamente un environment desconocido en el primer run que lo referencia — sin reviewers y sin avisar. El workflow no falla: publica. La garantía la da esta configuración, no el YAML.

Checklist:

- [ ] Crear el environment llamado exactamente **`npm-publish`**.
- [ ] **Required reviewers**: agregar al mantenedor. Sin esto el environment es decorativo.
- [ ] **Deployment branches**: restringir a `main`.
- [ ] Agregar **`NPM_TOKEN`** como secret **del environment** (Environment secrets), no del repositorio.
- [ ] Si `NPM_TOKEN` ya existía como repository secret, **borrarlo** de ahí: mientras siga a nivel repo, cualquier job puede leerlo.

### Secrets requeridos (acción del mantenedor)

| Secret          | Dónde va                                 | Cómo obtener                                                                                                     | Permisos requeridos                    |
| --------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **`NPM_TOKEN`** | Secret del **environment `npm-publish`** | `npm token create --read-only=false --cidr=0.0.0.0/0` (o vía UI: npmjs.com → Access Tokens → Generate New Token) | Publish sobre scope `@romanmartinidev` |

**`GITHUB_TOKEN`** lo provee GitHub Actions automáticamente, no requiere setup.

Si `NPM_TOKEN` falta, el job de publish fallará con error de autenticación de npm.

### Lint de workflows

`actionlint` **corre como primer step de `pr.yml`**: un error de sintaxis o de expresión en un workflow deja el PR en rojo. Para reproducirlo local antes de pushear:

```bash
# Vía Docker (sin instalar nada):
docker run --rm -v "$(pwd):/repo" -w /repo rhysd/actionlint:latest -color

# O instalando localmente:
brew install actionlint  # macOS
go install github.com/rhysd/actionlint/cmd/actionlint@latest  # Go
actionlint .github/workflows/*.yml
```

CI usa una **versión fija** verificada por checksum SHA256 antes de ejecutarse (ver `ACTIONLINT_VERSION` en `pr.yml`); si tu binario local es de otra versión el veredicto puede diferir.

> No le pases `.github/actions/**/action.yml`: actionlint solo entiende el schema de workflow y reporta una composite action como inválida por no declarar `on` ni `jobs`.

## Cambios significativos: OpenSpec

Si tu cambio es:

- Una nueva librería.
- Un refactor mayor que afecta ≥2 packages.
- Cambio de tooling base (build, lint, versionado).

→ **arranca como propuesta en `openspec/changes/`** antes de codear:

```bash
# El comando exacto depende del scaffolding instalado.
# Estructura mínima:
openspec/changes/<change-name>/
├── proposal.md      # Intent + Scope + Approach
├── design.md        # decisiones técnicas + opciones evaluadas
├── tasks.md         # checklist binaria
└── specs/<capability>/spec.md   # deltas con G/W/T
```

Validar con `pnpm openspec validate --changes`. Cambios triviales (typo, fix local) **no** requieren propuesta OpenSpec.

La convención de IDs (`aaa-NNN`) y el próximo ID disponible viven en [`openspec/README.md`](openspec/README.md).

## Decisiones arquitectónicas: ADRs

Toda decisión one-way door (irreversible) o que afecta ≥2 packages genera un ADR en formato MADR en `docs/architecture/adr/`. Los ADRs son **inmutables** una vez aceptados: para cambiar una decisión, crear un nuevo ADR que referencia al anterior.

Ver [`docs/architecture/adr/README.md`](docs/architecture/adr/README.md) para el formato.

## Flujo de PR

1. Branch desde `main`: `feat/<descripcion>` o `fix/<descripcion>`.
2. Commits siguiendo Conventional Commits.
3. Si afecta una lib publicable: agregar changeset (`pnpm changeset`).
4. Si es cambio significativo: linkear la propuesta OpenSpec correspondiente.
5. `pnpm lint` y `pnpm format:check` deben pasar.
6. Tests deben pasar (`pnpm test`).
7. Abrir PR con descripción clara: qué cambia, por qué, qué validaste.

## Fuentes de verdad

Si tenés dudas sobre dónde mirar:

| Pregunta                       | Fuente                                          |
| ------------------------------ | ----------------------------------------------- |
| ¿Qué debe hacer el sistema?    | `openspec/specs/`                               |
| ¿Qué cambios están en curso?   | `openspec/changes/`                             |
| ¿Por qué se decidió X?         | `docs/architecture/adr/`                        |
| ¿Cómo está organizado el repo? | `docs/architecture/README.md`                   |
| ¿Por qué se prioriza X?        | `docs/product/` (épicas, HUs, decisiones D-XXX) |
| ¿Qué está en cola?             | `docs/backlog/BACKLOG.md`                       |
| ¿Cómo trabajo?                 | este archivo                                    |
| ¿Cómo arranco?                 | [`README.md`](README.md)                        |

Ver también [`CLAUDE.md`](CLAUDE.md) para el contrato con Claude Code.

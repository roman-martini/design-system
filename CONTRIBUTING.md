# Contributing

Gracias por considerar contribuir a `agent-design-sistem`. Este documento describe el flujo de trabajo del repo: convenciones de commits, versionado, gobernanza de cambios y calidad.

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

Cada PR que afecta una librería publicable (cualquier cosa en `packages/*`) **requiere un changeset**.

### Crear un changeset

```bash
pnpm changeset
```

El CLI pregunta:

1. Qué packages cambiaron.
2. Tipo de bump por package: `patch` (fix), `minor` (feature), `major` (breaking).
3. Descripción del cambio (va al CHANGELOG generado).

Esto crea un archivo en `.changeset/` que se commitea junto con tus cambios.

### Pre-1.0

Mientras los packages no lleguen a 1.0, respetamos semver pero entendiendo que la superficie API puede cambiar. La política definitiva se acuerda al primer release.

### Release (mantenedores)

```bash
pnpm version       # aplica changesets a versiones + CHANGELOG
git push --follow-tags
pnpm release       # build + publish
```

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

Validar con `openspec validate --changes`. Cambios triviales (typo, fix local) **no** requieren propuesta OpenSpec.

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

| Pregunta                       | Fuente                        |
| ------------------------------ | ----------------------------- |
| ¿Qué debe hacer el sistema?    | `openspec/specs/`             |
| ¿Qué cambios están en curso?   | `openspec/changes/`           |
| ¿Por qué se decidió X?         | `docs/architecture/adr/`      |
| ¿Cómo está organizado el repo? | `docs/architecture/README.md` |
| ¿Cómo trabajo?                 | este archivo                  |
| ¿Cómo arranco?                 | [`README.md`](README.md)      |

Ver también [`CLAUDE.md`](CLAUDE.md) para el contrato con Claude Code.

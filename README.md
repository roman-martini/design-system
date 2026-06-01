# agent-design-sistem

Monorepo `pnpm` con librerías de **arquitectura frontend** publicables bajo el scope [`@romanmartinidev`](https://www.npmjs.com/org/romanmartinidev) y una app de prueba (`apps/playground`) para validarlas en condiciones reales.

## Stack

- **pnpm workspaces** — gestión del monorepo
- **TypeScript 5.9** — lenguaje base
- **Angular 21** + **ng-packagr** — librería de componentes
- **Style Dictionary 4** — generación de design tokens
- **Vitest 4**, **Storybook 10** — testing y documentación visual
- **Changesets** — versionado y publicación
- **ESLint** + **Prettier** + **Husky** + **commitlint** + **lint-staged** — calidad automatizada

## Estructura

```
agent-design-sistem/
├── packages/
│   ├── tokens/        @romanmartinidev/tokens
│   └── components/    @romanmartinidev/components  (a crear en Fase 3)
├── apps/
│   └── playground/    Angular app de prueba       (a crear en Fase 4)
├── docs/
│   ├── architecture/  Fuente de verdad arquitectónica (ADRs + visión)
│   └── ...
├── openspec/          Specs y propuestas de cambio
└── ...
```

Detalles: ver [`docs/architecture/README.md`](docs/architecture/README.md).

## Quickstart

Requisitos:

- **Node** ≥ 22.12 (recomendado vía [nvm](https://github.com/nvm-sh/nvm) — ver `.nvmrc`)
- **pnpm** ≥ 9.0 (instalado vía [corepack](https://nodejs.org/api/corepack.html) o npm)

```bash
# Clonar
git clone https://github.com/romanmartinidev/agent-design-sistem.git
cd agent-design-sistem

# Versión de Node correcta
nvm use

# Instalar todo el monorepo
pnpm install

# Build de toda la cadena
pnpm build

# Lint + format check
pnpm lint
pnpm format:check
```

## Scripts útiles

| Script              | Qué hace                                         |
| ------------------- | ------------------------------------------------ |
| `pnpm build`        | Build recursivo de todos los workspaces          |
| `pnpm test`         | Tests recursivos                                 |
| `pnpm lint`         | ESLint en todo el repo                           |
| `pnpm format`       | Auto-formatea con Prettier                       |
| `pnpm format:check` | Verifica formato sin escribir                    |
| `pnpm changeset`    | Registra un cambio para versionar                |
| `pnpm version`      | Aplica los changesets pendientes a las versiones |
| `pnpm release`      | Build + publica packages a npm                   |

## Cómo contribuir

Ver [`CONTRIBUTING.md`](CONTRIBUTING.md).

Resumen rápido:

- Commits siguen [Conventional Commits](https://www.conventionalcommits.org/) (validado por commitlint).
- Cambios en libs publicables requieren un changeset (`pnpm changeset`).
- Cambios arquitectónicos one-way door requieren un ADR en `docs/architecture/adr/`.
- Cambios significativos arrancan como propuesta en `openspec/changes/`.

## CI / Release

Dos workflows GitHub Actions automatizan validación y publishing:

- **`pr.yml`** corre en cada PR: format check, lint, build recursivo, tests, OpenSpec validate, changeset enforcement. PR rojo si algo falla.
- **`release.yml`** corre al merge a `main`: si hay changesets pendientes, abre PR `chore(repo): version packages`; al merge de ese PR, publica los packages cambiados a npm.

Setup como mantenedor (una vez): secret `NPM_TOKEN` + branch protection rules. Checklist completo en [`CONTRIBUTING.md § CI / Release`](CONTRIBUTING.md#ci--release). Decisión arquitectónica en [`ADR-006`](docs/architecture/adr/ADR-006-estrategia-ci-cd.md).

## Estado del repo

Bootstrap **completo** (Fases 0–5). Ver [`docs/architecture/`](docs/architecture/) para la fuente de verdad arquitectónica (síntesis + ADRs + specs) y [`openspec/IDS.md`](openspec/IDS.md) para el catálogo de changes históricos.

## Licencia

[MIT](LICENSE) © 2026 Roman Martini

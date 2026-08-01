# design-system

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
design-system/
├── packages/
│   ├── tokens/        @romanmartinidev/tokens
│   └── components/    @romanmartinidev/components
├── apps/
│   └── playground/    Angular app de prueba + showcase navegable + Storybook
├── docs/
│   ├── architecture/  Fuente de verdad arquitectónica (ADRs + síntesis + catálogos)
│   ├── product/       Épicas, HUs y decisiones de producto (D-XXX)
│   ├── backlog/       Cola operativa Now/Next/Later
│   └── ...
├── openspec/          Specs y propuestas de cambio
└── ...
```

Detalles: ver [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md).

## Soporte

| Dimensión            | Soportado                                                                                                                                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Angular**          | `^21.0.0` (peer dependency de `@romanmartinidev/components`)                                                                                                                                                                                                       |
| **Node**             | `>=22.12.0` (solo para desarrollar y buildear; los packages publicados no ejecutan Node en runtime)                                                                                                                                                                |
| **pnpm**             | `>=9.0.0` (desarrollo del monorepo)                                                                                                                                                                                                                                |
| **Browsers**         | Los 2 majors más recientes de Chrome, Edge, Firefox y Safari — el kit se apoya en `<dialog>` nativo ([ADR-013](docs/architecture/adr/ADR-013-overlays-dialog-nativo.md)) y Popover API ([ADR-014](docs/architecture/adr/ADR-014-overlays-anclados-popover-api.md)) |
| **Peers opcionales** | `@angular/router` (solo para el entry point `@romanmartinidev/components/router`), `@lucide/angular` para iconografía                                                                                                                                              |
| **SSR**              | No soportado todavía — los overlays acceden a `document` sin guardas de plataforma                                                                                                                                                                                 |

**Accesibilidad**: el objetivo declarado del sistema es **WCAG 2.2 nivel AA**. El contraste de los pares de tokens se verifica por script y los patrones de interacción siguen [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/). La última auditoría vive en [`docs/design/a11y/`](docs/design/a11y/).

## Quickstart

Requisitos:

- **Node** ≥ 22.12 (recomendado vía [nvm](https://github.com/nvm-sh/nvm) — ver `.nvmrc`)
- **pnpm** ≥ 9.0 (instalado vía [corepack](https://nodejs.org/api/corepack.html) o npm)

```bash
# Clonar
git clone https://github.com/roman-martini/design-system.git
cd design-system

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

| Script                   | Qué hace                                                                    |
| ------------------------ | --------------------------------------------------------------------------- |
| `pnpm dev` / `start`     | Levanta el playground (showcase navegable)                                  |
| `pnpm storybook`         | Levanta Storybook con las stories de `packages/components`                  |
| `pnpm storybook:build`   | Build estático de Storybook                                                 |
| `pnpm build`             | Build recursivo de todos los workspaces                                     |
| `pnpm test`              | Tests recursivos                                                            |
| `pnpm lint`              | ESLint en todo el repo                                                      |
| `pnpm format`            | Auto-formatea con Prettier                                                  |
| `pnpm format:check`      | Verifica formato sin escribir                                               |
| `pnpm changeset`         | Registra un cambio para versionar                                           |
| `pnpm changeset version` | Aplica los changesets pendientes a las versiones (lo corre `release.yml`)   |
| `pnpm release`           | Build + publica packages a npm — **solo desde `release.yml`, nunca a mano** |

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

Bootstrap **completo** (Fases 0–5). El kit publica **21 familias de componentes** — una spec `component-<name>` por familia, incluida la service `DsToastService` — sobre el sistema de tokens; ambos packages están en **0.2.0** y versionan en lockstep ([ADR-015](docs/architecture/adr/ADR-015-versionado-lockstep.md)).

> **Publicación a npm pausada.** Los changesets se acumulan a propósito hasta orden explícita del mantenedor; `release.yml` sigue abriendo el PR de versionado, pero no se publica.

Dónde mirar:

- [`docs/architecture/`](docs/architecture/) — fuente de verdad arquitectónica: síntesis, ADRs, catálogo de specs y de changes.
- [`docs/product/`](docs/product/README.md) — épicas, historias de usuario y decisiones de producto.
- [`docs/backlog/BACKLOG.md`](docs/backlog/BACKLOG.md) — qué está en cola y qué lo activa.
- [`openspec/README.md`](openspec/README.md) — convención operativa de OpenSpec + próximo ID disponible.

## Licencia

[MIT](LICENSE) © 2026 Roman Martini

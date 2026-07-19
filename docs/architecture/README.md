# Arquitectura — design-system

**Fuente única de verdad agregada** de la arquitectura del repo. Sintetiza todas las decisiones tomadas en los ADRs y los contratos definidos en specs. Para detalle de cada decisión con opciones evaluadas, ir a los ADRs linkeados.

> Si querés **replicar esta arquitectura en otro repo desde cero**, ver [PLAYBOOK.md](PLAYBOOK.md).

---

## Tabla de contenidos

1. [Visión general](#visión-general)
2. [Stack tecnológico](#stack-tecnológico)
3. [Principios arquitectónicos](#principios-arquitectónicos)
4. [Estructura del monorepo](#estructura-del-monorepo)
5. [Reglas de dependencia](#reglas-de-dependencia)
6. [Arquitectura de tokens (@romanmartinidev/tokens)](#arquitectura-de-tokens-romanmartinidevtokens)
7. [Arquitectura de components (@romanmartinidev/components)](#arquitectura-de-components-romanmartinidevcomponents)
8. [Arquitectura del playground (apps/playground)](#arquitectura-del-playground-appsplayground)
9. [Convenciones del repo](#convenciones-del-repo)
10. [Pipeline de releases](#pipeline-de-releases)
11. [Catálogo de ADRs](#catálogo-de-adrs)
12. [Catálogo de Specs](#catálogo-de-specs)
13. [Catálogo de Changes](#catálogo-de-changes)

---

## Visión general

`design-system` es un **monorepo `pnpm`** que aloja librerías de **arquitectura frontend** publicables a npm bajo el scope `@romanmartinidev`, junto con una aplicación de prueba (`apps/playground`) que actúa como laboratorio de validación y plataforma de prototipado.

```mermaid
flowchart TB
    subgraph packages [packages — publicables a npm]
        T[tokens<br/>@romanmartinidev/tokens<br/>Style Dictionary 4]
        C[components<br/>@romanmartinidev/components<br/>Angular 21 + ng-packagr]
    end
    subgraph apps [apps — internas]
        P[playground<br/>Angular 21 zoneless<br/>+ Storybook 10]
    end
    T -- workspace:* (peerDep CSS via vars) --> C
    T -- workspace:* (CSS @import) --> P
    C -- workspace:* (TS import) --> P
```

## Stack tecnológico

| Dominio                     | Tecnología                             | Versión                   | ADR/Spec                                                                                             |
| --------------------------- | -------------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Package manager**         | pnpm workspaces                        | 9.x                       | [ADR-001](adr/ADR-001-monorepo-pnpm-workspaces.md)                                                   |
| **Runtime**                 | Node                                   | 22 LTS (≥22.12)           | [ADR-001](adr/ADR-001-monorepo-pnpm-workspaces.md)                                                   |
| **Lenguaje**                | TypeScript                             | 5.9                       | —                                                                                                    |
| **Framework UI**            | Angular                                | 21.2                      | [ADR-004](adr/ADR-004-arquitectura-components.md), [ADR-005](adr/ADR-005-arquitectura-playground.md) |
| **Change detection**        | Zoneless                               | Angular 21.2 (estable)    | [ADR-005](adr/ADR-005-arquitectura-playground.md)                                                    |
| **Build tokens**            | Style Dictionary                       | 4.3+                      | [ADR-003](adr/ADR-003-arquitectura-design-tokens.md)                                                 |
| **Build libs Angular**      | ng-packagr (APF)                       | 21.x                      | [ADR-004](adr/ADR-004-arquitectura-components.md)                                                    |
| **Build apps Angular**      | @angular/build (esbuild)               | 21.2                      | —                                                                                                    |
| **Testing**                 | Vitest 4 + @analogjs/vitest-angular    | 4.x + 2.5                 | [ADR-004](adr/ADR-004-arquitectura-components.md)                                                    |
| **Visualización**           | Storybook 10                           | 10.4 + @storybook/angular | [ADR-005](adr/ADR-005-arquitectura-playground.md)                                                    |
| **Versionado de packages**  | Changesets                             | 2.x                       | [ADR-002](adr/ADR-002-conventional-commits-changesets.md)                                            |
| **Convenciones de commits** | Conventional Commits + commitlint      | 21.x                      | [ADR-002](adr/ADR-002-conventional-commits-changesets.md)                                            |
| **Pre-commit hooks**        | Husky + lint-staged                    | 9.x + 17.x                | [ADR-002](adr/ADR-002-conventional-commits-changesets.md)                                            |
| **Lint**                    | ESLint flat config + typescript-eslint | 10.x + 8.x                | [ADR-001](adr/ADR-001-monorepo-pnpm-workspaces.md)                                                   |
| **Format**                  | Prettier                               | 3.x                       | —                                                                                                    |
| **Specs y gobernanza**      | OpenSpec                               | 1.3+                      | —                                                                                                    |
| **ADRs**                    | MADR                                   | —                         | [adr/README.md](adr/README.md)                                                                       |

## Principios arquitectónicos

Las decisiones del repo se evalúan contra estos principios, en estricto orden de prioridad:

1. **Aplicar buenas prácticas.** Si una solución funciona pero contradice una práctica establecida en el ecosistema, no se elige sin justificación explícita.
2. **Escalar ordenado.** La estructura debe sostener crecimiento (más libs, más componentes, más colaboradores) sin reescritura.
3. **Mantenibilidad.** Estándares y convenciones explícitos para que cualquier dev (o IA) pueda entender qué hay, dónde está y por qué.

## Estructura del monorepo

```
design-system/
├── packages/                  # Librerías publicables (npm)
│   ├── tokens/                # @romanmartinidev/tokens
│   └── components/            # @romanmartinidev/components
├── apps/
│   └── playground/            # App Angular interna (no publicable)
├── docs/
│   ├── architecture/          # Fuente de verdad arquitectónica
│   │   ├── README.md          # Este archivo
│   │   ├── PLAYBOOK.md        # Cómo replicar la arq en otro repo
│   │   ├── adr/               # ADRs en formato MADR
│   │   └── decisions-log.md   # Índice cronológico de ADRs
│   └── reference/                # Material de investigación (no normativo)
├── openspec/
│   ├── README.md              # Convención de IDs + próximo ID disponible (operativo, no arquitectónico)
│   ├── specs/                 # Contratos testables (sin IDs — identificados por nombre)
│   └── changes/               # Propuestas de cambio (activos sin prefijo, archivados con aaa-NNN-)
├── .changeset/                # Cambios pendientes de release
├── .husky/                    # pre-commit + commit-msg hooks
├── package.json               # Root del monorepo
├── pnpm-workspace.yaml
├── .nvmrc, .npmrc, .editorconfig, .gitignore, .prettierrc, .prettierignore
├── eslint.config.js
├── commitlint.config.js
├── lint-staged.config.js
├── CLAUDE.md                  # Contrato Claude ↔ repo
├── CONTRIBUTING.md            # Flujo de trabajo
├── README.md
└── LICENSE
```

## Reglas de dependencia

- `tokens` no depende de nada del monorepo.
- `components` depende de `tokens` como **peerDependency** (`workspace:*`).
- `playground` depende de `tokens` y `components` como **dependencies** (`workspace:*`).
- Nunca: dependencia de `tokens` o `components` hacia `playground`.
- Nunca: dependencia circular entre packages.

```mermaid
flowchart LR
    tokens -- peerDep --> components
    tokens -- dep --> playground
    components -- dep --> playground
```

**Contrato testable**: requirement _"Grafo de dependencias internas es un DAG"_ en [monorepo-structure](../../openspec/specs/monorepo-structure/spec.md).

## Arquitectura de tokens (`@romanmartinidev/tokens`)

**Decisión formal**: [ADR-003 — Arquitectura de design tokens](adr/ADR-003-arquitectura-design-tokens.md).
**Contrato testable**: [design-tokens-package](../../openspec/specs/design-tokens-package/spec.md).

### Jerarquía (primitives → semantic → component → theme)

```
packages/tokens/src/
├── primitives/    # Valores crudos sin semántica (color.blue.500, dimension.16, shadow.md)
├── semantic/      # Tokens con intención (bg.primary, text.muted, border.default, space.md, shadow.focus)
├── component/     # Tokens específicos por componente (button.bg, modal.shadow)
└── theme/         # Overrides de tokens semantic (dark, brand-a, brand-b)
```

**Reglas de referencia**:

- `semantic` referencia `primitives` (no al revés).
- `component` referencia `semantic` o `primitives` (no `theme`).
- `theme` **solo redefine** tokens existentes en `semantic` (no introduce nuevos).
- Sin referencias circulares.

### Build con Style Dictionary 4

```bash
pnpm -F @romanmartinidev/tokens build
```

Output:

- `dist/tokens.css` — variables CSS en `:root`
- `dist/tokens.js` + `dist/tokens.d.ts` — constantes JS/TS
- `dist/themes/<theme>.css` — un CSS por theme bajo selector `[data-theme="..."]` o `[data-brand="..."]`

### Prefix CSS: `--ds-*`

**Parte del contrato API público**. Cambiarlo es BREAKING y exige ADR que reemplace al ADR-003.

```css
:root {
  --ds-color-blue-500: #3b82f6;
  --ds-semantic-color-bg-primary: var(--ds-color-blue-500);
}
```

### Theming por cascada CSS + atributos HTML

```html
<html data-theme="dark" data-brand="a">
  <!-- toda la cascada usa dark + brand-a, combinables -->
</html>
```

Cada theme se importa opt-in:

```ts
import '@romanmartinidev/tokens/css';
import '@romanmartinidev/tokens/themes/dark';
```

### Surface de exports granular

```jsonc
{
  ".": { "import": "./dist/tokens.js", "types": "./dist/tokens.d.ts" },
  "./css": "./dist/tokens.css",
  "./themes/dark": "./dist/themes/dark.css",
  "./themes/brand-a": "./dist/themes/brand-a.css",
  "./themes/brand-b": "./dist/themes/brand-b.css",
}
```

`sideEffects: ["./dist/*.css", "./dist/themes/*.css"]` permite tree-shaking del JS preservando CSS.

### Jerarquía de z-index

Los tokens `semantic.z-index` (declarados en [`packages/tokens/src/semantic/z-index.json`](../../packages/tokens/src/semantic/z-index.json)) definen 13 niveles que cubren todos los casos de layering visual de una UI moderna. Escala en miles para overlays, estilo Bootstrap, con margen para intercalar capas nuevas sin colisión.

| Token              | Valor    | Uso típico                                              |
| ------------------ | -------- | ------------------------------------------------------- |
| `z-index.hide`     | `-1`     | Elemento oculto detrás del flujo normal                 |
| `z-index.auto`     | `"auto"` | Resetear stacking context al default del browser        |
| `z-index.base`     | `0`      | Capa base del documento                                 |
| `z-index.docked`   | `10`     | Elementos anclados al viewport (header, sidebar)        |
| `z-index.dropdown` | `1000`   | Dropdowns de menús de navegación                        |
| `z-index.sticky`   | `1020`   | Elementos sticky (table headers, sticky footers)        |
| `z-index.banner`   | `1030`   | Banners de notificación (cookie consent, announcements) |
| `z-index.overlay`  | `1040`   | Backdrops/scrims de modales y drawers                   |
| `z-index.modal`    | `1050`   | Modales y diálogos                                      |
| `z-index.popover`  | `1060`   | Popovers contextuales (sobre modales si conviven)       |
| `z-index.skiplink` | `1070`   | Skip-to-content links (a11y, encima de modales)         |
| `z-index.toast`    | `1080`   | Toast notifications                                     |
| `z-index.tooltip`  | `1090`   | Tooltips (capa más alta, deben verse siempre)           |

**Convención obligatoria**: NO hardcodear `z-index` en CSS de componentes. Siempre via `var(--ds-semantic-z-index-<level>)`. El [spec `design-tokens-package`](../../openspec/specs/design-tokens-package/spec.md) formaliza este contrato con scenarios testables (test Vitest en `packages/tokens/test/z-index.spec.ts` valida la jerarquía).

### Tokens auxiliares para overlays

Para componentes con backdrop semitransparente (Modal, Drawer, Toast con scrim), el sistema expone:

- `var(--ds-semantic-color-bg-overlay)` — rgba negro 0.5 alpha (scrim).
- `var(--ds-semantic-effect-blur-overlay)` — 8px (backdrop-filter blur estándar).
- `var(--ds-semantic-motion-transition-overlay-enter)` — 250ms ease-out (entrada compuesta duration + easing).
- `var(--ds-semantic-motion-transition-overlay-exit)` — 150ms ease-in (salida compuesta, ~60% más rápida que la entrada por convención UX).

## Arquitectura de components (`@romanmartinidev/components`)

**Decisión formal**: [ADR-004 — Arquitectura de @romanmartinidev/components](adr/ADR-004-arquitectura-components.md).
**Contrato testable**: [components-package](../../openspec/specs/components-package/spec.md).

### Build con ng-packagr (Angular Package Format)

```bash
pnpm -F @romanmartinidev/components build
```

Sin `angular.json` propio. ng-packagr corre standalone con `ng-package.json`. Produce `dist/fesm2022/*.mjs` + `dist/types/*.d.ts` + `dist/package.json`.

### Estructura interna: flat por componente

```
packages/components/src/
├── public-api.ts          # Barrel — surface pública
└── lib/
    └── <name>/            # Una carpeta por componente
        ├── <name>.ts
        ├── <name>.css
        ├── <name>.spec.ts
        ├── <name>.stories.ts   # Co-ubicada (Storybook desde apps/playground)
        └── index.ts            # Re-export interno
```

### Standalone + signals + new APIs

```ts
@Component({
  selector: 'ds-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button [disabled]="disabled()" (click)="handleClick($event)"><ng-content /></button>`,
  styleUrl: './button.css',
})
export class DsButton {
  variant = input<'primary' | 'secondary' | 'ghost'>('primary');
  disabled = input<boolean>(false);
  clicked = output<MouseEvent>();
}
```

- `input()` / `output()` / `model()` signals (no `@Input()` / `@Output()`).
- Sin `NgModule`s.

### Prefijo unificado `Ds` / `ds-`

**Parte del contrato API público**. Coexiste con `--ds-*` (CSS variables) bajo el mismo prefijo conceptual `Ds` (Design System).

Decisión formal: [ADR-007 — Convención de naming y prefijos](adr/ADR-007-naming-prefijos.md). Supersede parcialmente §4 y §5 de ADR-004.

### Naming convention

| Pieza    | Convención                          | Ejemplo           |
| -------- | ----------------------------------- | ----------------- |
| Carpeta  | kebab-case                          | `button/`         |
| Archivo  | `<name>.ts` (sin sufijo de rol)     | `button.ts`       |
| Class    | `Ds<Name>` (sin sufijo `Component`) | `DsButton`        |
| Selector | `ds-<name>`                         | `ds-button`       |
| Types    | `Ds<Name><TypeName>`                | `DsButtonVariant` |

### Styles: CSS plain + tokens via vars

Archivos `.css` (no SCSS). Consumo exclusivo de tokens via `var(--ds-*)`. Sin valores hardcoded.

### peerDependencies

- `@angular/core@^21`, `@angular/common@^21`
- `@romanmartinidev/tokens: workspace:*` (Changesets lo reescribe a versión semver al publicar)

### Surface

`exports` en root `package.json` apunta a `dist/fesm2022/...` y `dist/types/...` (ng-packagr genera el `dist/package.json` con `exports` propios al buildear).

## Arquitectura del playground (`apps/playground`)

**Decisión formal**: [ADR-005 — Arquitectura del playground](adr/ADR-005-arquitectura-playground.md).
**Contrato testable**: [playground-app](../../openspec/specs/playground-app/spec.md).

### Rol

Laboratorio interno. **No se publica** (`"private": true`). Sirve como:

- Validador end-to-end del consumo de las libs en una app Angular real.
- Host de **Storybook 10** con stories co-ubicadas en `packages/components/`.

### Zoneless

```ts
// apps/playground/src/app/app.config.ts
import { provideZonelessChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideZonelessChangeDetection()],
};
```

Sin `zone.js` en deps ni polyfills. Bundle más chico, change detection puramente reactivo via signals.

### Storybook co-ubicado

- Config en `apps/playground/.storybook/`.
- `main.ts` glob recoge stories desde `packages/components/src/lib/**/*.stories.@(ts|mdx)`.
- Targets `storybook` y `build-storybook` en `angular.json` con builder `@storybook/angular`.
- Tokens CSS inyectados vía `styles: ["src/styles.css"]` del target (no via `preview.ts`).

### Single page sin routing, sin SSR

`AppComponent` standalone, sin `provideRouter`, sin `<router-outlet>`. Foco en demos.

## Convenciones del repo

### Conventional Commits + commitlint

```
<type>(<scope>): <subject>
```

Tipos: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`.
Scopes habituales: `tokens`, `components`, `playground`, `repo`, `ci`, `docs`, `deps`.

Validado en el hook `commit-msg` por commitlint con `@commitlint/config-conventional`.

### Pre-commit con Husky + lint-staged

`pre-commit`: `lint-staged` corre `eslint --fix` + `prettier --write` sobre archivos staged.
`commit-msg`: commitlint valida el formato.

### Versionado con Changesets

- Cada PR que afecta una lib publicable agrega un changeset (`pnpm changeset`).
- Al release: `pnpm version` (actualiza versiones + CHANGELOG) + `pnpm release` (build + publish).
- `workspace:*` se reescribe a semver real al publicar.
- Pre-1.0: política permisiva; al primer release se decide la política definitiva.

### ADRs (formato MADR)

- Toda decisión one-way door o que afecta ≥2 packages genera un ADR en [adr/](adr/).
- Naming: `ADR-NNN-<slug-kebab-case>.md`.
- **Inmutables** una vez aceptados. Para revertir, crear ADR nuevo que referencia al anterior.
- Índice: [decisions-log.md](decisions-log.md).
- Formato detallado: [adr/README.md](adr/README.md).

### Specs y changes con OpenSpec

- Cambios significativos (nueva lib, refactor mayor) arrancan como propuesta en `openspec/changes/<name>/` (sin prefijo de ID).
- Estructura del change: `proposal.md` + `design.md` + `tasks.md` + `specs/<capability>/spec.md`.
- Al cerrar un change, el directorio se renombra a `<id>-<name>` y se mueve a `openspec/changes/archive/`. Los deltas de spec se promueven a la spec base `openspec/specs/<capability>/spec.md`.
- Validación: `openspec validate --all`.

### IDs persistentes (formato `<bloque>-<numero>`, ver [ADR-008](adr/ADR-008-convencion-ids-openspec.md))

- **Changes**: ID `aaa-NNN` (`aaa-001`, `aaa-002`, …). Cuando `aaa-999` se llena, sigue `aab-001`, después `aac-001`, etc. El ID vive en el frontmatter `proposal.md`.
- **Specs**: **sin IDs**. Se identifican por el nombre de su carpeta (`openspec/specs/<name>/`).
- **ADRs**: `ADR-NNN` numéricos (rango único). Inmutables una vez aceptados.
- Convención operativa + próximo ID disponible: [openspec/README.md](../../openspec/README.md).

### Lint + format

- ESLint flat config (`eslint.config.js`) compartido en root.
- `typescript-eslint` con presets recomendados.
- Prettier 3 — config en `.prettierrc`.
- `.prettierignore` excluye scaffolds importados (`.claude/`), material de referencia, dist/, etc.

### Stack pinning

- `.nvmrc` → versión exacta de Node.
- `.npmrc` → `engine-strict=true`, `auto-install-peers=true`, `strict-peer-dependencies=true`, `prefer-workspace-packages=true`.
- `pnpm.overrides.esbuild` en root para evitar mismatch entre vitest y @angular/build.
- `packageManager: "pnpm@..."` en root para corepack.

## Pipeline de releases

**Decisión formal**: [ADR-006 — Estrategia de CI/CD](adr/ADR-006-estrategia-ci-cd.md).
**Contrato testable**: [ci-cd-pipeline](../../openspec/specs/ci-cd-pipeline/spec.md).

Dos workflows GitHub Actions:

- **`pr.yml`** (trigger: `pull_request` a `main`) — corre `format:check` + `lint` + `pnpm -r build` + `pnpm -r test` + `openspec validate --all` + changeset enforcement (PRs que tocan `packages/*` requieren changeset, excepto README/CHANGELOG).
- **`release.yml`** (trigger: `push` a `main`) — usa [`changesets/action@v1`](https://github.com/changesets/action) en modo dual: abre PR `chore(repo): version packages` si hay changesets pendientes; ejecuta `pnpm release` (build + publish) si no hay (post-merge del PR de release).

**Composite action** `.github/actions/setup/` extrae setup pnpm + node (`node-version-file: '.nvmrc'`) + cache + install. Reutilizada en ambos workflows.

**Branch protection** documentada como checklist en [`CONTRIBUTING.md § Branch protection`](../../CONTRIBUTING.md#branch-protection-acci%C3%B3n-del-mantenedor) — se configura manualmente en GitHub UI.

**Out of scope** (follow-ups documentados en ADR-006): Storybook deploy, a11y CI con axe, bundle budget con size-limit, visual regression (Chromatic/Playwright), Sigstore provenance, validación de título del PR.

## Catálogo de ADRs

| ID                                                        | Título                                                | Dominio              | Estado   |
| --------------------------------------------------------- | ----------------------------------------------------- | -------------------- | -------- |
| [ADR-001](adr/ADR-001-monorepo-pnpm-workspaces.md)        | Adoptar pnpm workspaces                               | transversal          | Aceptado |
| [ADR-002](adr/ADR-002-conventional-commits-changesets.md) | Conventional Commits + Changesets                     | transversal          | Aceptado |
| [ADR-003](adr/ADR-003-arquitectura-design-tokens.md)      | Arquitectura de design tokens                         | frontend/tokens      | Aceptado |
| [ADR-004](adr/ADR-004-arquitectura-components.md)         | Arquitectura de components                            | frontend/components  | Aceptado |
| [ADR-005](adr/ADR-005-arquitectura-playground.md)         | Arquitectura del playground                           | frontend/playground  | Aceptado |
| [ADR-006](adr/ADR-006-estrategia-ci-cd.md)                | Estrategia de CI/CD                                   | transversal/ci       | Aceptado |
| [ADR-007](adr/ADR-007-naming-prefijos.md)                 | Convención de naming y prefijos `Ds`/`ds-`/`--ds-*`   | frontend/components  | Aceptado |
| [ADR-008](adr/ADR-008-convencion-ids-openspec.md)         | Convención de IDs de OpenSpec (aaa-NNN, specs sin ID) | transversal/openspec | Aceptado |

Ver índice completo: [decisions-log.md](decisions-log.md).

## Catálogo de Specs

Las specs ya no usan IDs — se identifican por el nombre de su carpeta.

| Spec                                                                        | Capability                                         | Path                                    |
| --------------------------------------------------------------------------- | -------------------------------------------------- | --------------------------------------- |
| [monorepo-structure](../../openspec/specs/monorepo-structure/spec.md)       | Reglas del monorepo (pnpm, workspaces, DAG, hooks) | `openspec/specs/monorepo-structure/`    |
| [design-tokens-package](../../openspec/specs/design-tokens-package/spec.md) | Contrato del package tokens                        | `openspec/specs/design-tokens-package/` |
| [components-package](../../openspec/specs/components-package/spec.md)       | Contrato del package components                    | `openspec/specs/components-package/`    |
| [playground-app](../../openspec/specs/playground-app/spec.md)               | Contrato de la app playground                      | `openspec/specs/playground-app/`        |
| [ci-cd-pipeline](../../openspec/specs/ci-cd-pipeline/spec.md)               | Pipeline de CI/CD y release                        | `openspec/specs/ci-cd-pipeline/`        |

## Catálogo de Changes

| ID                                                                                  | Change                           | Estado   | Fecha      | Specs introducidas / modificadas                    | ADRs generados                           |
| ----------------------------------------------------------------------------------- | -------------------------------- | -------- | ---------- | --------------------------------------------------- | ---------------------------------------- |
| [aaa-001](../../openspec/changes/archive/aaa-001-bootstrap-fase-1-monorepo/)        | bootstrap-fase-1-monorepo        | archived | 2026-05-30 | monorepo-structure                                  | ADR-001, ADR-002                         |
| [aaa-002](../../openspec/changes/archive/aaa-002-bootstrap-fase-2-tokens/)          | bootstrap-fase-2-tokens          | archived | 2026-05-31 | design-tokens-package                               | ADR-003                                  |
| [aaa-003](../../openspec/changes/archive/aaa-003-bootstrap-fase-3-components/)      | bootstrap-fase-3-components      | archived | 2026-05-31 | components-package                                  | ADR-004                                  |
| [aaa-004](../../openspec/changes/archive/aaa-004-bootstrap-fase-4-playground/)      | bootstrap-fase-4-playground      | archived | 2026-06-01 | playground-app                                      | ADR-005                                  |
| [aaa-005](../../openspec/changes/archive/aaa-005-bootstrap-fase-5-ci/)              | bootstrap-fase-5-ci              | archived | 2026-06-01 | ci-cd-pipeline                                      | ADR-006                                  |
| [aaa-006](../../openspec/changes/archive/aaa-006-components-add-checkbox/)          | components-add-checkbox          | archived | 2026-06-01 | modifica components-package                         | —                                        |
| [aaa-007](../../openspec/changes/archive/aaa-007-components-unify-ds-prefix/)       | components-unify-ds-prefix       | archived | 2026-06-04 | modifica components-package                         | ADR-007 (supersede ADR-004 §4+§5)        |
| [aaa-008](../../openspec/changes/archive/aaa-008-components-add-radio/)             | components-add-radio             | archived | 2026-06-08 | modifica components-package                         | —                                        |
| [aaa-009](../../openspec/changes/archive/aaa-009-tokens-add-z-index/)               | tokens-add-z-index               | archived | 2026-06-08 | modifica design-tokens-package                      | —                                        |
| [aaa-010](../../openspec/changes/archive/aaa-010-components-drop-component-suffix/) | components-drop-component-suffix | archived | 2026-07-03 | modifica components-package + playground-app        | ADR-010 (evoluciona ADR-007 file naming) |
| [aaa-011](../../openspec/changes/archive/aaa-011-components-accessible-disabled/)   | components-accessible-disabled   | archived | 2026-07-03 | modifica components-package                         | ADR-011 (disabled accesible)             |
| [aaa-013](../../openspec/changes/archive/aaa-013-components-decide-icon-library/)   | components-decide-icon-library   | archived | 2026-07-03 | modifica components-package                         | ADR-012 (iconografía Lucide)             |
| [aaa-014](../../openspec/changes/archive/aaa-014-components-add-modal/)             | components-add-modal             | archived | 2026-07-10 | modifica components-package + design-tokens-package | ADR-013 (overlays sobre dialog nativo)   |
| [aaa-015](../../openspec/changes/archive/aaa-015-tokens-fix-contrast-aa/)           | tokens-fix-contrast-aa           | archived | 2026-07-11 | modifica design-tokens-package                      | — (ejecuta D-007/D-008)                  |
| [aaa-016](../../openspec/changes/archive/aaa-016-components-add-select/)            | components-add-select            | archived | 2026-07-11 | modifica components-package                         | ADR-014 (overlays anclados Popover API)  |
| [aaa-017](../../openspec/changes/archive/aaa-017-components-add-input/)             | components-add-input             | archived | 2026-07-11 | modifica components-package + design-tokens-package | — (aplica ADR-011/012/014)               |
| [aaa-018](../../openspec/changes/archive/aaa-018-components-add-tabs/)              | components-add-tabs              | archived | 2026-07-14 | modifica components-package + design-tokens-package | — (aplica ADR-011 y patrones del kit)    |
| [aaa-019](../../openspec/changes/archive/aaa-019-components-add-tooltip/)           | components-add-tooltip           | archived | 2026-07-18 | modifica components-package + design-tokens-package | — (primer reuso de ADR-014)              |
| [aaa-020](../../openspec/changes/archive/aaa-020-repo-release-lockstep/)            | repo-release-lockstep            | archived | 2026-07-18 | modifica components-package                         | ADR-015 (versionado lockstep)            |
| [aaa-021](../../openspec/changes/archive/aaa-021-components-add-toast/)             | components-add-toast             | archived | 2026-07-18 | modifica components-package + design-tokens-package | — (primera service del kit)              |
| [aaa-022](../../openspec/changes/archive/aaa-022-playground-showcase/)              | playground-showcase              | archived | 2026-07-19 | modifica playground-app                             | — (showcase con router, EP-006)          |

Convención operativa + próximo ID disponible: [openspec/README.md](../../openspec/README.md).

## Material de referencia (no normativo)

[`docs/reference/`](../reference/) contiene material de investigación traído de otros repos (taxonomías de arquitectura, arquitectura frontend, design systems industry). **No es normativo**: la fuente de verdad son los ADRs y specs.

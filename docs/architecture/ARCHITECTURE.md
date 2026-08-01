# Arquitectura — design-system

**Fuente única de verdad agregada** de la arquitectura del repo. Sintetiza todas las decisiones tomadas en los ADRs y los contratos definidos en specs. Para detalle de cada decisión con opciones evaluadas, ir a los ADRs linkeados.

> Para saber qué artefacto de este directorio responde qué pregunta, ver el [README.md](README.md) del directorio.

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
11. [Decisiones y catálogos](#decisiones-y-catálogos)

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
| **Specs y gobernanza**      | OpenSpec (`@fission-ai/openspec`)      | 1.6.0 (pin exacto)        | —                                                                                                    |
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
│   │   ├── README.md          # Guía del directorio (qué artefacto responde qué)
│   │   ├── ARCHITECTURE.md    # Este archivo — síntesis técnica
│   │   ├── catalog.md         # Catálogo de specs y changes
│   │   ├── adr/               # ADRs en formato MADR
│   │   └── decisions-log.md   # Índice cronológico de decisiones
│   ├── product/               # Épicas (EP-XXX), HUs (HU-XXX), decisiones D-XXX, intake de ideas
│   ├── backlog/               # BACKLOG.md (Now/Next/Later) + reportes de fix del PO
│   ├── design/                # Evidencia fechada: auditorías a11y + research de sistemas externos
│   ├── reviews/               # Reviews integrales del repo (hallazgos + plan de acción)
│   └── reference/             # Material de investigación (no normativo)
├── openspec/
│   ├── README.md              # Convención de IDs + próximo ID disponible (operativo, no arquitectónico)
│   ├── specs/                 # Contratos testables (sin IDs — identificados por nombre)
│   └── changes/               # Propuestas de cambio (activos sin prefijo, archivados con aaa-NNN-)
├── scripts/                   # Utilidades de repo (new-github-repo.ps1)
├── .github/                   # workflows/ (pr.yml, release.yml) + actions/setup/ (composite)
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
**Contrato testable transversal**: [components-package](../../openspec/specs/components-package/spec.md); el comportamiento de cada componente vive en su [`component-<name>`](catalog.md#specs-por-componente-component-name) (ADR-018).

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
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
  ],
};
```

Sin `zone.js` en deps ni polyfills. Bundle más chico, change detection puramente reactivo via signals.

### Storybook co-ubicado

- Config en `apps/playground/.storybook/`.
- `main.ts` glob recoge stories desde `packages/components/src/lib/**/*.stories.@(ts|mdx)`.
- Targets `storybook` y `build-storybook` en `angular.json` con builder `@storybook/angular`.
- Tokens CSS inyectados vía `styles: ["src/styles.css"]` del target (no via `preview.ts`).

### Showcase con router (aaa-022), sin SSR

Desde [aaa-022](../../openspec/changes/archive/aaa-022-playground-showcase/) el playground es un **showcase navegable**, no una single page de demos:

- `provideRouter(routes)` en `app.config.ts` y `<router-outlet />` en `app.html`.
- Las rutas **se generan desde un registro único** (`src/app/showcase/registry.ts`, hoy 24 entradas): una ruta **lazy** por componente vía `loadComponent`, más `''` y `**` redirigiendo a la primera entrada. Agregar un componente al showcase es agregar una entrada al registro — no se tocan las rutas a mano.
- Cada vista vive en `src/app/showcase/<slug>/` y lleva `data: { breadcrumb }`, que alimenta la demo de auto-generación de `ds-breadcrumbs-router` (ADR-017).
- **Sin SSR**: el playground se sirve solo en browser (ver el estado de compatibilidad SSR de la lib en su change correspondiente).

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
- Al release: `changeset version` (actualiza versiones + CHANGELOG) + `changeset publish`, **ambos ejecutados por `release.yml` vía `changesets/action`, nunca a mano**. El script del root se llama `changeset:version` y no `version`, porque el builtin `pnpm version` pisaría al homónimo; no existe script `release` (eliminado para que no haya publish manual de un comando).
- **Lockstep** ([ADR-015](adr/ADR-015-versionado-lockstep.md)): `tokens` y `components` versionan juntos (`fixed` de Changesets, versión única del par). El bump que se elige en el changeset aplica al par, no a un package suelto. El peer de tokens es un rango plano pre-1.0 (`>=0.1.0 <1.0.0`) con `onlyUpdatePeerDependentsWhenOutOfRange`, para evitar la cascada peer→major.
- `workspace:*` se reescribe a semver real al publicar.
- Pre-1.0: política permisiva; al primer release se decide la política definitiva.
- **Veto de publicación vigente** ([D-018](../product/decisiones.md)): los changesets se acumulan a propósito y nada se publica hasta orden explícita del PO.

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

- **`pr.yml`** (trigger: `pull_request` a `main`) — corre `actionlint` + `commitlint` + `format:check` + `lint` + `pnpm -r build` + `pnpm -r test` + `verify:packaging` + `openspec validate --all` + changeset enforcement (PRs que tocan `packages/*` requieren changeset, excepto README/CHANGELOG y el PR autogenerado `changeset-release/main`).
- **`release.yml`** (trigger: `push` a `main`) — usa [`changesets/action`](https://github.com/changesets/action) en **dos jobs**: `version` abre o actualiza el PR `chore(repo): version packages` si hay changesets pendientes; `publish` corre build + `changeset publish` si no quedan (post-merge del PR de release), **detrás del environment `npm-publish` con required reviewer** ([ADR-022](adr/ADR-022-gate-aprobacion-publish-npm.md)).

**Supply chain**: todas las actions externas están pineadas por SHA completo con el tag como comentario, y `.github/dependabot.yml` (npm + github-actions, weekly) trae los bumps como PRs revisables.

**Composite action** `.github/actions/setup/` extrae setup pnpm + node (`node-version-file: '.nvmrc'`) + cache + install. Reutilizada en ambos workflows.

**Branch protection** documentada como checklist en [`CONTRIBUTING.md § Branch protection`](../../CONTRIBUTING.md#branch-protection-acci%C3%B3n-del-mantenedor) — se configura manualmente en GitHub UI.

**Out of scope** (follow-ups documentados en ADR-006): Storybook deploy, a11y CI con axe, bundle budget con size-limit, visual regression (Chromatic/Playwright), Sigstore provenance, validación de título del PR.

## Decisiones y catálogos

Esta síntesis no duplica los índices — cada uno tiene su archivo:

- **Decisiones**: [decisions-log.md](decisions-log.md) es el índice cronológico completo (una fila por decisión, con o sin ADR, con dominio y estado). Los ADRs con sus opciones evaluadas viven en [adr/](adr/).
- **Specs y changes**: el inventario histórico vive en [catalog.md](catalog.md) — el catálogo de specs (transversales y por componente) y el catálogo de changes, que crece una fila por change archivado.

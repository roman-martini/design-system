# PLAYBOOK — Replicar esta arquitectura en otro repo desde cero

Instructable paso a paso para bootstrappar la misma arquitectura del DS (monorepo pnpm + Angular 21 zoneless + tokens con Style Dictionary + Storybook 10 + governance con ADRs + OpenSpec) en un repo nuevo.

> Para entender **qué es** esta arquitectura y **por qué** se decidió cada cosa, ver [README.md](README.md) (síntesis) y los ADRs en [adr/](adr/) (detalle con opciones evaluadas). Este playbook es solo el **cómo**.

---

## Pre-requisitos

- **Node ≥ 22.12 LTS** (ver `.nvmrc`).
- **pnpm ≥ 9** (vía corepack o `npm install -g pnpm`).
- **Git** + cuenta GitHub.
- **Org npm** propia (gratis para packages públicos; alternativa: usar `@<tu-usuario>` directamente).
- **OpenSpec CLI** global: `npm install -g openspec`.
- Editor con soporte TS/Angular (VSCode + extensión Angular Language Service recomendado).

---

## Fase 0 — Gobernanza inicial

### Bootstrap del repo

```bash
mkdir mi-design-system && cd mi-design-system
git init
```

### Archivos de gobernanza mínimos

Crear (copiando estructura de este repo):

- `CLAUDE.md` — convenciones del repo + "Fuentes de verdad" + contrato con Claude.
- `docs/architecture/README.md` — esqueleto vacío (síntesis arquitectónica).
- `docs/architecture/decisions-log.md` — tabla vacía.
- `docs/architecture/adr/README.md` — formato MADR documentado.
- `openspec/README.md` — convención de IDs + próximo ID disponible (operativo).

### Inicializar OpenSpec

```bash
openspec init
# Edita openspec/config.yaml con tu contexto del proyecto y rules
```

**Commit**: `chore(repo): gobernanza inicial — CLAUDE.md + docs/architecture + openspec`

---

## Fase 1 — Estructura base del monorepo

### `package.json` root

```json
{
  "name": "<tu-monorepo>",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@9.0.0",
  "engines": {
    "node": ">=22.12.0",
    "pnpm": ">=9.0.0"
  },
  "scripts": {
    "dev": "pnpm -F playground start",
    "start": "pnpm -F playground start",
    "storybook": "pnpm -F playground storybook",
    "storybook:build": "pnpm -F playground build-storybook",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "prepare": "husky",
    "changeset": "changeset",
    "version": "changeset version",
    "release": "pnpm -r build && changeset publish"
  },
  "pnpm": {
    "overrides": {
      "esbuild": "0.27.7"
    }
  }
}
```

### `pnpm-workspace.yaml`

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

### Dotfiles

**`.nvmrc`**:

```
22
```

**`.npmrc`**:

```
engine-strict=true
auto-install-peers=true
strict-peer-dependencies=true
prefer-workspace-packages=true
```

**`.editorconfig`**:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

**`.gitignore`**:

```gitignore
node_modules/
dist/
build/
out/
.angular/
*.tsbuildinfo
coverage/
*.log
.env*
.DS_Store
storybook-static/
.eslintcache
.prettiercache
NOTAS.md
notas.md
TODO.md
```

### Tooling base (lint + format + commits)

```bash
pnpm add -Dw eslint @eslint/js typescript-eslint prettier eslint-config-prettier
pnpm add -Dw husky @commitlint/cli @commitlint/config-conventional lint-staged
pnpm add -Dw @changesets/cli
```

**`eslint.config.js`**:

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/.angular/**',
      '**/.changeset/**',
      '**/storybook-static/**',
      'pnpm-lock.yaml',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
);
```

**`.prettierrc`**:

```json
{
  "printWidth": 100,
  "singleQuote": true,
  "trailingComma": "all",
  "semi": true,
  "tabWidth": 2,
  "endOfLine": "lf"
}
```

**`.prettierignore`** — excluir scaffolds importados (`.claude/`), material de referencia, `dist/`, packages que se migran después, etc.

**`commitlint.config.js`**:

```js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      0,
      'always',
      ['tokens', 'components', 'playground', 'repo', 'ci', 'docs', 'deps'],
    ],
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
    'subject-full-stop': [2, 'never', '.'],
  },
};
```

**`lint-staged.config.js`**:

```js
export default {
  '*.{ts,tsx,js,jsx,mjs,cjs}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,yaml,yml,css,scss,html}': ['prettier --write'],
};
```

### Inicializar Husky

```bash
pnpm exec husky init
echo 'pnpm exec lint-staged' > .husky/pre-commit
echo 'pnpm exec commitlint --edit $1' > .husky/commit-msg
```

### Inicializar Changesets

```bash
pnpm exec changeset init
```

Editar `.changeset/config.json`:

```json
{
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch"
}
```

### Metadocumentación

- `LICENSE` (MIT).
- `README.md` root — quickstart.
- `CONTRIBUTING.md` — flujo de trabajo.

### Cierre Fase 1

- Generar **ADR-001** (pnpm workspaces) y **ADR-002** (Conventional Commits + Changesets).
- Actualizar `decisions-log.md`.
- Validar: `pnpm install` OK + commit dummy malformado rechazado + commit válido aceptado.

**Commit**: `chore(repo): bootstrap monorepo base — pnpm + lint + hooks + changesets`

---

## Fase 2 — Package de tokens

### Estructura

```bash
mkdir -p packages/tokens/src/{primitives,semantic,component,theme}
```

### `packages/tokens/package.json`

```json
{
  "name": "@<scope>/tokens",
  "version": "0.1.0",
  "type": "module",
  "publishConfig": { "access": "public" },
  "engines": { "node": ">=22.12.0", "pnpm": ">=9.0.0" },
  "files": ["dist", "README.md"],
  "sideEffects": ["./dist/*.css", "./dist/themes/*.css"],
  "exports": {
    ".": { "import": "./dist/tokens.js", "types": "./dist/tokens.d.ts" },
    "./css": "./dist/tokens.css",
    "./themes/dark": "./dist/themes/dark.css",
    "./themes/brand-a": "./dist/themes/brand-a.css",
    "./themes/brand-b": "./dist/themes/brand-b.css"
  },
  "scripts": {
    "build": "node sd.config.mjs",
    "watch": "node --watch sd.config.mjs"
  },
  "devDependencies": {
    "style-dictionary": "^4.3.0"
  }
}
```

### `packages/tokens/sd.config.mjs`

Ver [`packages/tokens/sd.config.mjs`](../../packages/tokens/sd.config.mjs) en este repo como plantilla (config base + theme builds con `prefix: 'ds'`).

### Contenido inicial de tokens

- `src/primitives/color.json`, `dimension.json`, `motion.json`, etc.
- `src/semantic/color.json`, `space.json`, `shadow.json` con referencias a primitives.
- `src/theme/dark.json` con overrides de semantic.

Ver los JSON de este repo como plantilla.

### Cierre Fase 2

- Generar **ADR-003** (arquitectura de tokens).
- Validar build: `pnpm -F @<scope>/tokens build`.
- Verificar tarball: `npm pack --dry-run` solo lista `dist/` + `README.md` + `package.json`.

**Commit**: `feat(tokens): package publicable @<scope>/tokens`

---

## Fase 3 — Package de components (Angular)

### Estructura

```bash
mkdir -p packages/components/src/lib
```

### `packages/components/package.json`

Ver [`packages/components/package.json`](../../packages/components/package.json) en este repo. Lo crítico:

- `peerDependencies` con `@angular/core`, `@angular/common`, `@<scope>/tokens` (todos con `workspace:*` o semver según contexto).
- Sin `dependencies` regulares (`tslib` lo agrega ng-packagr).
- `main` / `module` / `types` / `exports` apuntando a `./dist/fesm2022/...` y `./dist/types/...`.
- `sideEffects: false`.

### `packages/components/ng-package.json`

```json
{
  "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
  "dest": "dist",
  "lib": { "entryFile": "src/public-api.ts" },
  "assets": ["README.md"]
}
```

### tsconfigs

**`tsconfig.lib.json`** — strict, target ES2022, module ESNext, decorators, `angularCompilerOptions.strictTemplates: true`. Excluir `**/*.spec.ts` y `**/*.stories.ts`.

**`tsconfig.spec.json`** — extends de tsconfig.lib + types vitest/globals + node.

### `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
  },
});
```

### `src/test-setup.ts`

```ts
import '@analogjs/vitest-angular/setup-zone';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
```

### `src/public-api.ts`

```ts
export * from './lib/button';
// Sumar exports a medida que se agreguen componentes
```

### Instalar devDeps

```bash
pnpm -F @<scope>/components add -D \
  "ng-packagr@~21.0" \
  "@angular/{core,common,compiler,compiler-cli,platform-browser,build}@^21" \
  "vitest@^4" "@analogjs/vite-plugin-angular@^2.5" "@analogjs/vitest-angular@^2.5" \
  "jsdom@^27" "typescript@~5.9" "zone.js" "rxjs@~7.8" "tslib@^2" \
  "@storybook/angular@^10"
```

### Crear primer componente (ej. Button)

Carpeta `src/lib/button/` con `button.component.ts` (standalone + signals), `button.component.css` (usando `var(--ds-*)`), `button.component.spec.ts` (Vitest), `button.stories.ts` (CSF 3), `index.ts`.

### Cierre Fase 3

- Generar **ADR-004** (arquitectura de components).
- Build: `pnpm -F @<scope>/components build` → produce APF.
- Test: `pnpm -F @<scope>/components exec vitest run` → tests passing.
- Verificar tarball: `npm pack --dry-run` excluye `src/`, configs, stories.

**Commit**: `feat(components): scaffold @<scope>/components con Button demo`

---

## Fase 4 — App playground

### Scaffold con Angular CLI 21

```bash
pnpm dlx @angular/cli@21 new playground \
  --directory=apps/playground \
  --routing=false --style=css --ssr=false \
  --skip-git --skip-install --strict
```

### Limpieza

- Borrar `apps/playground/.prettierrc`, `.editorconfig` (duplicados con root).
- Editar `apps/playground/package.json`:
  - `"private": true`.
  - Quitar `@angular/router` (sin routing).
  - Agregar engines.
  - Cambiar `test` a `vitest`.
  - Agregar deps `@<scope>/tokens` y `@<scope>/components` con `workspace:*`.

### Zoneless

Editar `src/app/app.config.ts`:

```ts
import { provideZonelessChangeDetection, provideBrowserGlobalErrorListeners } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideZonelessChangeDetection()],
};
```

### Tokens en `src/styles.css`

```css
@import '@<scope>/tokens/css';

html,
body {
  background: var(--ds-semantic-color-bg-base);
  color: var(--ds-semantic-color-text-primary);
  font-family: var(--ds-font-family-sans);
}
```

### App demo

`src/app/app.ts` importa el componente Button, `app.html` renderiza demos.

### Vitest

Mismo setup que components: `vitest.config.ts` + `src/test-setup.ts` + spec del AppComponent.

```bash
pnpm -F playground add -D vitest@^4 @analogjs/vitest-angular@latest \
  @analogjs/vite-plugin-angular@latest jsdom@^27 @angular/build@^21
```

### Storybook 10

```bash
pnpm -F playground add -D storybook@^10 @storybook/angular@^10 \
  @storybook/addon-a11y@^10 @storybook/addon-docs@^10
```

Agregar targets en `angular.json`:

```jsonc
{
  "architect": {
    "storybook": {
      "builder": "@storybook/angular:start-storybook",
      "options": {
        "configDir": ".storybook",
        "browserTarget": "playground:build",
        "compodoc": false,
        "port": 6006,
        "styles": ["src/styles.css"],
      },
    },
    "build-storybook": {
      "builder": "@storybook/angular:build-storybook",
      "options": {
        "configDir": ".storybook",
        "browserTarget": "playground:build",
        "compodoc": false,
        "outputDir": "storybook-static",
        "styles": ["src/styles.css"],
      },
    },
  },
}
```

Crear `.storybook/main.ts`, `.storybook/preview.ts`, `.storybook/tsconfig.json` siguiendo la plantilla de este repo. **Clave**: el `stories` glob apunta a `../../../packages/components/src/lib/**/*.stories.@(ts|mdx)` (stories co-ubicadas en el package). NO importar tokens CSS desde `preview.ts` — viajan vía `styles` del target.

### Cierre Fase 4

- Generar **ADR-005** (arquitectura del playground).
- Validar: `pnpm -F playground build`, `pnpm -F playground exec vitest run`, `pnpm -F playground exec ng run playground:build-storybook`.

**Commit**: `feat(playground): apps/playground Angular 21 zoneless + Storybook 10`

---

## Fase 5 — CI y release

> Esta fase aún no está implementada en el repo de referencia. Plan tentativo:

### GitHub Actions

**`.github/workflows/pr.yml`** — corre en cada PR:

```yaml
name: PR
on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: '.nvmrc', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm -r build
      - run: npx openspec validate --all
```

**`.github/workflows/release.yml`** — al merge a `main`:

Usar [`changesets/action`](https://github.com/changesets/action) para abrir PR de release o publicar.

### Storybook deploy

Opciones:

- **Chromatic** (recomendado para visual regression incluido).
- **GH Pages** (gratis, sin VR).

**Commit**: `ci: GitHub Actions PR + release workflows + Storybook deploy`

---

## Convenciones operativas que se mantienen al portar

Al replicar esta arquitectura, **mantener estas convenciones** o documentar explícitamente las alternativas:

- **Prefijos**:
  - `--ds-*` para CSS variables (tokens, agnóstico al framework consumidor).
  - `<system>-` para selectores Angular (ej. `ds-`, `myorg-`). En este repo: `ds-` (Design System, agnóstico). Ver [ADR-007](adr/ADR-007-naming-prefijos.md).
- **Naming components Angular**: `<Name>Component` clase + `<name>.component.ts` archivo + `<org>-<name>` selector.
- **Standalone + signals**: nunca NgModules en libs nuevas.
- **CSS plain con tokens via vars**: sin SCSS, sin CSS-in-JS.
- **Conventional Commits + Changesets**: una sola fuente de versionado.
- **ADRs + Specs + IDs**: ADR-NNN para decisiones arquitectónicas inmutables; specs sin ID (identificadas por nombre de carpeta); changes con ID `<bloque>-NNN` (operativo del tool OpenSpec). Convención + próximo ID en `openspec/README.md`. Catálogo histórico en `docs/architecture/README.md`.

## Anti-patrones a evitar

- ❌ `node_modules/` distribuidos sin workspaces.
- ❌ Naming inconsistente entre carpeta / archivo / class / selector.
- ❌ Valores hardcoded en CSS de componentes (siempre via tokens).
- ❌ `NgModule`s en libs nuevas (standalone + signals).
- ❌ Stories en el playground separadas del componente (co-ubicar).
- ❌ Mezclar specs (qué hace) con ADRs (por qué se decidió).
- ❌ Renombrar paths de specs/changes archivados (rompe referencias en commits).
- ❌ Reusar IDs (CHG/SPC/ADR son permanentes).
- ❌ `Co-Authored-By` en commits de Claude.

## Checklist final de bootstrap

- [ ] `pnpm install` desde root sin errores.
- [ ] Commit malformado rechazado por commitlint.
- [ ] Commit válido aceptado.
- [ ] `pnpm -r build` OK para los 3 workspaces.
- [ ] `pnpm test` (o Vitest por workspace) OK.
- [ ] `pnpm -F playground exec ng run playground:build-storybook` produce `storybook-static/`.
- [ ] `npm pack --dry-run` de cada package publicable lista solo `dist/` + `README.md` + `package.json`.
- [ ] ADRs 001-005 (al menos) creados.
- [ ] Specs base 001-004 promovidas.
- [ ] `openspec validate --all` pasa.
- [ ] `openspec/README.md` con la convención de IDs y el "próximo ID disponible" al día.
- [ ] `docs/architecture/README.md` con la síntesis arquitectónica.
- [ ] CI básico funcionando (lint + test + build en PR).
- [ ] Org npm creada + permisos de publicación verificados.

## Referencias

- [README.md](README.md) — Síntesis arquitectónica (qué + por qué).
- [adr/](adr/) — ADRs detallados con opciones evaluadas.
- [decisions-log.md](decisions-log.md) — Índice cronológico de decisiones.
- [openspec/README.md](../../openspec/README.md) — Convención operativa de OpenSpec (formato IDs + frontmatter + próximo ID disponible).
- Repos de inspiración: [Spartan UI](https://github.com/goetzrobin/spartan), [shadcn/ui](https://ui.shadcn.com/), [Radix Primitives](https://www.radix-ui.com/primitives), [Material UI](https://mui.com/).

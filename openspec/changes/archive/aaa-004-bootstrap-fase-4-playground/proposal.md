---
id: aaa-004
name: bootstrap-fase-4-playground
type: change
status: archived
archived: 2026-06-01
introduces-specs:
  - playground-app
related-adrs:
  - ADR-005
---

## Why

Después de Fase 3 (`@romanmartinidev/components` con Button + ng-packagr APF + tests Vitest passing), el monorepo necesita su laboratorio: **`apps/playground`** — una app Angular 21 que consume las dos libs vía `workspace:*` y aloja el setup de **Storybook 10** con stories co-ubicadas en `packages/components/src/lib/<comp>/<comp>.stories.ts`.

Esta fase es el primer consumidor real de ambas libs. Valida end-to-end:

1. Que `@romanmartinidev/tokens/css` se importa correctamente y las variables `--ds-*` resuelven en el browser.
2. Que `ButtonComponent` se importa, renderiza y reacciona a eventos en una app Angular standalone real (no solo en Vitest).
3. Que Storybook 10 levanta y pinta el Button con todas sus variants/sizes/disabled.

Sin esta fase, las libs están "publicables en teoría" pero nadie las usó nunca en un contexto Angular real. Fase 4 cierra esa brecha y deja un terreno fértil para que cada componente futuro nazca con su demo + story sin retrabajo de infraestructura.

Esta propuesta respalda las tres prioridades del repo:

1. **Buenas prácticas**: Angular 21 con bootstrap standalone, **zoneless change detection** (alineado con la dirección oficial del framework), Storybook como herramienta de documentación visual estándar de la industria, Vitest consistente con `components`.
2. **Escalar ordenado**: stories co-ubicadas con cada componente; sumar un componente nuevo = crear su `<name>.stories.ts` junto a `<name>.component.ts`. Cero tocar el playground ni la config de Storybook.
3. **Mantenibilidad**: arquitectura del playground explícita (ADR-005 lo formaliza); contratos del consumo entre playground y libs documentados en spec testable.

Corresponde a **Fase 4 del bootstrap-plan**.

## What Changes

### Scaffold de la app `apps/playground/`

Vía `ng new playground` con flags `--directory=apps/playground --routing=false --style=css --ssr=false --skip-git --skip-install --strict`. Después se ajusta para:

- Bootstrap **zoneless** vía `provideExperimentalZonelessChangeDetection()` en `app.config.ts`.
- Sin `zone.js` en polyfills (queda fuera del bundle).
- Sin `zone.js` en `dependencies` del playground.
- Importar `@romanmartinidev/tokens/css` en el entry CSS o `main.ts`.
- AppComponent demo con `<rmd-button>` en varias variants/sizes/disabled.
- Sin routing (single page por ahora).

### Storybook 10 en `apps/playground/.storybook/`

- `@storybook/angular@^10` + `storybook@^10` + addons base (`@storybook/addon-essentials`, `@storybook/addon-docs`, `@storybook/addon-a11y`).
- `.storybook/main.ts` recoge stories desde **`../../packages/components/src/lib/**/\*.stories.ts`\*\* (co-ubicadas).
- `.storybook/preview.ts` importa `@romanmartinidev/tokens/css` para que las stories pinten con tokens.
- Storybook scripts en `apps/playground/package.json`: `storybook` (dev) y `build-storybook`.

### Story de Button co-ubicada (en `packages/components/`)

`packages/components/src/lib/button/button.stories.ts` con Storybook CSF 3:

- Story `Default` (primary, md).
- Story `Variants` (grid de primary/secondary/ghost).
- Story `Sizes` (grid de sm/md/lg).
- Story `Disabled` (estado disabled en cada variant).
- Args interactivos para `variant`, `size`, `disabled` (control en panel Storybook).

**Side-effect en `packages/components/`**: actualizar `tsconfig.lib.json` para excluir `**/*.stories.ts` del build de la lib (no queremos que stories entren al tarball). El campo `files: ["dist", "README.md"]` ya protege el tarball; esto es defensa adicional para que ng-packagr no las compile.

### Vitest en `apps/playground/`

Mismo stack que `packages/components/`: `vitest` + `@analogjs/vitest-angular` + `@analogjs/vite-plugin-angular` + `jsdom`. Un spec inicial mínimo del `AppComponent` (creates the component, renders `<rmd-button>`).

### ADR-005

Formaliza la arquitectura del playground: rol como laboratorio (no como app productiva), bootstrap zoneless, single page sin routing, Storybook como visualizador único, stories co-ubicadas, Vitest alineado con components.

### Validación

- `pnpm install` desde root sin errores.
- `pnpm -F playground build` produce app buildable.
- `pnpm -F playground storybook` levanta Storybook con story del Button visible.
- `pnpm -F playground test` corre el spec del AppComponent OK.
- `pnpm -r build` sigue OK para los 3 workspaces (tokens, components, playground).

## Capabilities

### New Capabilities

- `playground-app`: la app Angular 21 en `apps/playground/`. Cubre identidad y propósito (laboratorio), modo zoneless, consumo de `@romanmartinidev/tokens` (CSS) y `@romanmartinidev/components` (Button), setup de Storybook con stories co-ubicadas en `packages/components/`, scope del demo en la app, política de no-routing por ahora, sin SSR.

### Modified Capabilities

Ninguna. `components-package` (cerrada en Fase 3) sigue vigente: los archivos `*.stories.ts` viven en `src/lib/` pero NO entran al tarball publicable (controlado por `files: ["dist", "README.md"]`) y se excluyen del build de la lib (`tsconfig.lib.json` exclude). El contrato existente no cambia — solo se materializa otra forma de uso.

## Impact

### Código

- **Creados**:
  - `apps/playground/` completo (estructura Angular CLI: `angular.json`, `package.json`, `tsconfig*.json`, `src/main.ts`, `src/index.html`, `src/styles.css`, `src/app/{app.component.ts, app.component.css, app.component.html, app.component.spec.ts, app.config.ts}`).
  - `apps/playground/.storybook/{main.ts, preview.ts, tsconfig.json}`.
  - `apps/playground/vitest.config.ts`, `apps/playground/src/test-setup.ts`.
  - `packages/components/src/lib/button/button.stories.ts` (story co-ubicada).
  - `docs/architecture/adr/ADR-005-arquitectura-playground.md`.
- **Modificados**:
  - `packages/components/tsconfig.lib.json` — agregar `"**/*.stories.ts"` a `exclude` para que ng-packagr no compile stories.
  - `docs/architecture/decisions-log.md` (agregar ADR-005).
  - `docs/bootstrap-plan.md` (marcar Fase 4).
- **No tocados**: `packages/tokens/*`, contenido de Button.

### APIs públicas

- Sin cambios en las libs publicables (`tokens`, `components`). La spec `components-package` no se modifica.
- El playground NO se publica a npm (es app interna).

### Dependencias

- Nuevas devDeps en `apps/playground/`:
  - `@angular/*@^21` (core, common, compiler, compiler-cli, build, cli, platform-browser, platform-browser-dynamic).
  - `typescript@~5.9`, `rxjs@~7.8`, `tslib@^2`.
  - **NO** `zone.js` (zoneless).
  - `@storybook/angular@^10`, `storybook@^10`, addons.
  - `vitest@^4`, `@analogjs/vitest-angular@^2`, `@analogjs/vite-plugin-angular@^2`, `jsdom@^27`.
- Nuevas dependencies en `apps/playground/`:
  - `@romanmartinidev/tokens: workspace:*`.
  - `@romanmartinidev/components: workspace:*`.
- Sin cambios en deps root.

### Sistemas / fases siguientes

- **Fase 5 (CI)** ya tiene un consumidor real para validar en cada PR: lint + test + build de los 3 workspaces; deploy del Storybook a Chromatic o GH Pages.
- **Changes de componentes nuevos** (Input, Card, Modal, etc.) podrán incluir su `*.stories.ts` co-ubicado sin tocar la infraestructura del playground.

## Alternativas evaluadas

### Opción A — Sin Storybook (solo app demo)

Solo página simple con `<rmd-button>`. Sin Storybook.

- **Pros**: scope mínimo, una herramienta menos que configurar.
- **Contras**: el playground deja de ser un "lab visual" y se vuelve solo una app. Stories quedan para más adelante (deuda).

### Opción B — Storybook con stories en `apps/playground/src/stories/`

Stories centralizadas en el playground, separadas de los componentes.

- **Pros**: separación clara visualización ↔ implementación.
- **Contras**: refactors en `packages/components/` no necesariamente actualizan stories. Drift garantizado con el tiempo. Documentación de cada componente queda lejos del código.

### Opción C — Storybook con stories co-ubicadas en `packages/components/src/lib/<comp>/<comp>.stories.ts` (esta propuesta)

Stories junto al componente; config Storybook en `apps/playground/.storybook/` apunta al package.

- **Pros**: cuando agregás/modificás un componente, su story está a un click. Cero drift. Patrón estándar en libs modernas (shadcn/ui, Material UI, Radix). Las stories quedan excluidas del tarball por `files` + `tsconfig.lib.json exclude`.
- **Contras**: requiere disciplina (cada nuevo componente debe traer su `.stories.ts`). Mitigado por convención de revisión + futura plantilla de scaffolding.

### Opción D — Storybook en `packages/components/` mismo

Setup de Storybook dentro del package publicable.

- **Pros**: máxima co-ubicación.
- **Contras**: el package publicable necesita devDeps + configs de Storybook que no aportan al consumidor. Acopla el contrato publicable a un setup interno.

### Opción E — Zone.js en lugar de zoneless

Mantener el setup tradicional con `zone.js` como polyfill.

- **Pros**: compatibilidad con cualquier librería externa que asuma `zone.js`. Más conservador.
- **Contras**: ~30 KB de bundle extra, change detection menos eficiente, contradice la dirección oficial Angular 21. Como Button ya usa OnPush + signals, no necesita zone.js.

**Decisión**: Opción C (Storybook en playground + stories co-ubicadas) + zoneless (Roman aprobó ambas en kickoff de la propuesta).

## ADRs y follow-ups

- **Se crea**: ADR-005 Arquitectura del playground.
- **Se proponen follow-ups** (changes futuros, fuera del scope):
  - `playground-add-routing`: si aparece necesidad de routing real entre demos.
  - `playground-storybook-deploy`: deploy del Storybook a Chromatic o GH Pages (probable que sea parte de Fase 5/CI).
  - `playground-add-theme-toggle`: switcher dark/brand-a/brand-b para probar themes interactivamente.
  - `playground-compodoc`: setup de Compodoc si aparece necesidad de docs auto-generadas (deferido).
  - `playground-visual-regression`: Chromatic o Playwright para regression tests sobre las stories (deferido, Fase 5+).

# Tasks — Bootstrap Fase 4 — apps/playground (Angular 21 zoneless + Storybook 10)

Cada tarea es ≤2 h y tiene criterio de aceptación binario. Marcar `[x]` al cerrar.

## 1. Scaffold de la app con Angular CLI

- [ ] 1.1 Ejecutar `pnpm dlx @angular/cli@21 new playground --directory=apps/playground --routing=false --style=css --ssr=false --skip-git --skip-install --strict` desde el root del repo (standalone, inline-style/template son defaults Angular 21; pnpm dlx en lugar de npx por consistencia con el resto del repo)
- [ ] 1.2 Inspeccionar el output: verificar que `apps/playground/` contiene `angular.json`, `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json`, `src/{main.ts, index.html, styles.css, app/}`
- [ ] 1.3 Borrar archivos auto-generados que no aplican: `karma.conf.js` (si existe — usamos Vitest), tests de Karma/Jasmine si vienen
- [ ] 1.4 Editar `apps/playground/package.json`: cambiar `name` a `playground`, asegurar `"private": true`, agregar `engines` alineado con root (Node `>=22.12.0`, pnpm `>=9.0.0`)
- [ ] 1.5 Confirmar `apps/*` ya está en `pnpm-workspace.yaml` (lo está desde Fase 1) — no requiere cambios

**Criterio**: `apps/playground/` existe con estructura Angular CLI 21 + standalone bootstrap; `pnpm install` desde root reconoce el workspace.

## 2. Modo zoneless

- [ ] 2.1 En `apps/playground/src/app/app.config.ts`, agregar zoneless al array `providers`. **Verificar Angular 21 docs ANTES**: si la API ya está estable, usar `provideZonelessChangeDetection()`; si sigue experimental, usar `provideExperimentalZonelessChangeDetection()`. El `app.config.ts` queda con UNA sola opción (no ambas como fallback)
- [ ] 2.2 En `apps/playground/angular.json`, vaciar el array `polyfills` (o quitar la entrada `zone.js`) en el target `build` y `test`
- [ ] 2.3 Quitar `zone.js` de `dependencies`/`devDependencies` del `apps/playground/package.json` (si `ng new` lo agregó)
- [ ] 2.4 Quitar el import `import 'zone.js'` de `main.ts` (si está)

**Criterio**: el bundle no contiene `zone.js` (verificable inspeccionando `dist/` o el listado de modules en el build); `pnpm -F playground build` pasa sin warnings sobre zone.

## 3. Dependencias de las libs internas

- [ ] 3.1 Agregar `@romanmartinidev/tokens` y `@romanmartinidev/components` como `dependencies` con `workspace:*` en `apps/playground/package.json`: `pnpm -F playground add @romanmartinidev/tokens@workspace:* @romanmartinidev/components@workspace:*`
- [ ] 3.2 `pnpm install` resuelve los workspaces correctamente

**Criterio**: `pnpm list --filter playground` muestra ambas libs resueltas como workspace. `node -e` `require.resolve` desde el package funciona.

## 4. Import de tokens CSS

- [ ] 4.1 En `apps/playground/src/styles.css`, agregar como primera línea `@import '@romanmartinidev/tokens/css';`
- [ ] 4.2 Verificar que `angular.json` declara `styles.css` en el target build (lo hace por default de `ng new`)

**Criterio**: tras `pnpm -F playground build`, el CSS bundleado contiene al menos una variable `--ds-*` (ej. `--ds-color-blue-500`).

## 5. AppComponent con demo del Button

- [ ] 5.1 En `apps/playground/src/app/app.component.ts`: importar `ButtonComponent` desde `@romanmartinidev/components`, agregarlo al array `imports` (standalone)
- [ ] 5.2 En `apps/playground/src/app/app.component.html`: renderizar al menos 4 `<rmd-button>` cubriendo primary, secondary, ghost, disabled. Agregar título descriptivo (`<h1>Playground</h1>` o similar) y secciones cortas
- [ ] 5.3 En `apps/playground/src/app/app.component.css`: estilos mínimos del layout (centrar contenido, padding, gap). Consumir tokens (`var(--ds-semantic-space-md)`) sin valores hardcoded

**Criterio**: `pnpm -F playground build` pasa; al inspeccionar el HTML bundleado, hay al menos 4 elementos `<rmd-button>` con variants distintos.

## 6. Test del AppComponent con Vitest

- [ ] 6.1 Borrar el spec auto-generado por Angular CLI (si usa Karma/Jasmine syntax)
- [ ] 6.2 Crear `apps/playground/vitest.config.ts` igual al de components (con `@analogjs/vite-plugin-angular`, jsdom, setupFiles)
- [ ] 6.3 Crear `apps/playground/src/test-setup.ts` con la misma inicialización de TestBed que components
- [ ] 6.4 Editar `apps/playground/src/app/app.component.spec.ts` para usar Vitest + TestBed standalone; cubrir: `creates the AppComponent`, `renders at least one rmd-button`
- [ ] 6.5 Instalar devDeps: `pnpm -F playground add -D vitest@^4 @analogjs/vitest-angular@latest @analogjs/vite-plugin-angular@latest jsdom@^27 @angular/build@^21`
- [ ] 6.6 Actualizar el script `test` del `apps/playground/package.json` a `vitest` (no `ng test`)

**Criterio**: `pnpm -F playground exec vitest run` reporta tests passing (≥2 specs).

## 7. Storybook 10 setup

- [ ] 7.1 Desde `apps/playground/`, ejecutar `pnpm dlx storybook@latest init --type angular --no-dev --skip-install` (o variante equivalente que genere `.storybook/` config sin auto-instalar)
- [ ] 7.2 Instalar devDeps de Storybook: `pnpm -F playground add -D storybook@^10 @storybook/angular@^10 @storybook/addon-essentials@^10 @storybook/addon-docs@^10 @storybook/addon-a11y@^10`
- [ ] 7.3 Editar `apps/playground/.storybook/main.ts`:
  - `framework: '@storybook/angular'`
  - `stories: ['../../../packages/components/src/lib/**/*.stories.@(ts|mdx)']` (path relativo al `.storybook/`)
  - Addons: essentials, docs, a11y
- [ ] 7.4 Editar `apps/playground/.storybook/preview.ts`: importar `'@romanmartinidev/tokens/css'` al inicio; declarar `parameters: { controls: { expanded: true }, viewport: { defaultViewport: 'responsive' }, layout: 'centered' }` en el export default
- [ ] 7.5 Verificar `apps/playground/.storybook/tsconfig.json` extiende del `tsconfig.app.json` o `tsconfig.json` del playground
- [ ] 7.6 Verificar que los scripts `storybook` y `build-storybook` están en `apps/playground/package.json` (Storybook init los agrega)

**Criterio**: `pnpm -F playground exec storybook dev --no-open` arranca el dev server sin errores en localhost:6006. Manualmente: la sidebar muestra "Button" como categoría.

## 8. Story del Button co-ubicada

- [ ] 8.1 Crear `packages/components/src/lib/button/button.stories.ts` con Storybook CSF 3:
  - `default` export: `{ title: 'Components/Button', component: ButtonComponent, tags: ['autodocs'], argTypes: { variant, size, disabled } }`
  - Story `Default`: args primary, md
  - Story `Variants`: render con grid de los 3 variants
  - Story `Sizes`: render con grid de los 3 sizes
  - Story `Disabled`: variant primary disabled
- [ ] 8.2 Verificar que `packages/components/tsconfig.lib.json` excluye `**/*.stories.ts`: si no está, agregar `"**/*.stories.ts"` al campo `exclude`
- [ ] 8.3 Re-buildear components: `pnpm -F @romanmartinidev/components build` — verificar que `dist/` NO contiene compilación de stories
- [ ] 8.4 `npm pack --dry-run` desde `packages/components/` — verificar que `button.stories.ts` NO aparece en el listado

**Criterio**: Storybook muestra las 4 stories del Button correctamente; el tarball publicable de components NO incluye stories.

## 9. ADR-005

- [ ] 9.1 Crear `docs/architecture/adr/ADR-005-arquitectura-playground.md` (MADR) cubriendo:
  - **Contexto**: rol del playground como laboratorio; relación con ADR-003 (tokens), ADR-004 (components)
  - **Opciones evaluadas** (≥2 con pros/contras): scaffold con ng new vs manual; stories co-ubicadas vs centralizadas vs en components; zoneless vs zone.js
  - **Decisión**: 8 sub-decisiones (scaffold con ng new, zoneless, storybook + co-ubicación, builder default, vitest alineado, single page, tokens via styles.css, sin theme switcher)
  - **Consecuencias positivas / negativas**
  - **ADRs relacionados**: ADR-001/002/003/004
- [ ] 9.2 Actualizar `docs/architecture/decisions-log.md` con fila para ADR-005

**Criterio**: ADR sigue formato MADR; decisions-log tiene fila con link funcional.

## 10. README del playground

- [ ] 10.1 Crear o reemplazar `apps/playground/README.md` (Angular CLI genera uno básico) con:
  - Tagline ("laboratorio interno de las libs del DS")
  - Scripts disponibles (start, build, test, storybook, build-storybook)
  - Cómo agregar un demo nuevo de un componente
  - Cómo se recogen las stories (de `packages/components/`)
  - Link a ADR-005

**Criterio**: README cubre las 4 secciones.

## 11. Validación de cierre

- [ ] 11.1 `openspec validate --changes` pasa
- [ ] 11.2 `pnpm lint` pasa
- [ ] 11.3 `pnpm format:check` pasa (formatear archivos del bootstrap si necesario)
- [ ] 11.4 `pnpm -r build` pasa (tokens + components + playground)
- [ ] 11.5 `pnpm -F @romanmartinidev/components exec vitest run` sigue OK (3/3) — verificar que el exclude de stories no rompió tests
- [ ] 11.6 `pnpm -F playground exec vitest run` pasa
- [ ] 11.7 `pnpm -F playground exec storybook dev --no-open --quiet` arranca sin errores (kill después de validar visualmente)
- [ ] 11.8 `pnpm -F playground build` pasa y produce `dist/playground/browser/` (o equivalente) con `index.html` + chunks JS + CSS bundle conteniendo al menos una variable `--ds-*`
- [ ] 11.9 Marcar Fase 4 ✅ en `docs/bootstrap-plan.md`
- [ ] 11.10 Proponer mensaje de commit y esperar OK de Roman (regla: cero commits sin permiso explícito)

**Criterio**: los 10 puntos pasan; Roman aprueba el mensaje del commit antes de ejecutar.

## 12. Archivar este change

> Estas tareas se ejecutan vía flujo manual o `/opsx:archive bootstrap-fase-4-playground`.

- [ ] 12.1 Mover `openspec/changes/bootstrap-fase-4-playground/` → `openspec/changes/archive/YYYY-MM-DD-bootstrap-fase-4-playground/`
- [ ] 12.2 Promover `ADDED Requirements` del delta a `openspec/specs/playground-app/spec.md` (con header `## Purpose` requerido por OpenSpec validate)
- [ ] 12.3 `openspec validate --all` pasa para 4 specs base (monorepo-structure + design-tokens-package + components-package + playground-app)
- [ ] 12.4 Proponer mensaje del commit del archive y esperar OK de Roman

**Criterio**: change archivado, spec base creada y validada, commit del archive aprobado por Roman antes de ejecutar.

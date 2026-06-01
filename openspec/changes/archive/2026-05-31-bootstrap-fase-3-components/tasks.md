# Tasks — Bootstrap Fase 3 — Crear @romanmartinidev/components con Button demo

Cada tarea es ≤2 h y tiene criterio de aceptación binario. Marcar `[x]` al cerrar.

## 1. Scaffold del package

- [x] 1.1 Crear `packages/components/` (directorio)
- [x] 1.2 Crear `packages/components/package.json` con: `@romanmartinidev/components@0.1.0`, metadata análoga a tokens, `engines`, `publishConfig: { access: "public" }`, `type: "module"`, `files: ["dist", "README.md"]`, `sideEffects: false`, `peerDependencies` Angular `^21.0.0` + `@romanmartinidev/tokens: workspace:*` (revisado durante apply: tokens es peer, no dep, por convención ng-packagr), sin `dependencies` regulares, scripts `build`, `test`, `watch`
- [x] 1.3 Crear `packages/components/ng-package.json` con `dest: "dist"`, `entryFile: "src/public-api.ts"`, `assets: ["README.md"]`
- [x] 1.4 Crear `packages/components/tsconfig.lib.json` propio con: `strict: true`, `target: "ES2022"`, `module: "ESNext"`, `moduleResolution: "bundler"`, decorators, `useDefineForClassFields: false`, `lib: ["ES2022", "DOM"]`, `angularCompilerOptions.strictTemplates: true`
- [x] 1.5 Crear `packages/components/tsconfig.spec.json` (extends de tsconfig.lib + types vitest/globals + node)
- [x] 1.6 Crear `packages/components/vitest.config.ts` con `@analogjs/vite-plugin-angular` + jsdom env + setupFiles
- [x] 1.7 Crear `packages/components/src/public-api.ts` (re-exporta `./lib/button`)

**Criterio**: `packages/components/` existe con los 6 archivos de config. `pnpm install` desde root sin errores.

## 2. Instalar devDependencies del package

- [x] 2.1 Instalados devDeps: `ng-packagr@~21.0`, `@angular/{core,common,compiler,compiler-cli,platform-browser}@^21`, `vitest@^4`, `@analogjs/{vitest-angular,vite-plugin-angular}@^2.5.2`, `jsdom@^27`, `typescript@~5.9`, `zone.js`, `rxjs@~7.8`, `tslib@^2`
- [x] 2.2 `pnpm install` corrió en 7s; resolved 719 packages, +190 added

**Criterio**: `pnpm -F @romanmartinidev/components exec ng-packagr --version` retorna una versión 21.x. `pnpm -F @romanmartinidev/components exec vitest --version` retorna una versión 4.x.

## 3. Componente Button

- [x] 3.1 Crear directorio `packages/components/src/lib/button/`
- [x] 3.2 Crear `button.component.ts` con: standalone, OnPush, inputs signal `variant/size/disabled`, output signal `clicked`, método `handleClick` que respeta `disabled()`. Tipos `ButtonVariant` y `ButtonSize` exportados
- [x] 3.3 Crear `button.component.css` con `:host { display: inline-block }`, estilos base + variants (primary/secondary/ghost) + sizes (sm/md/lg) + states (focus-visible, disabled, hover, active) usando `var(--ds-*)` exclusivamente
- [x] 3.4 Crear `index.ts` con `export { ButtonComponent, type ButtonVariant, type ButtonSize }`
- [x] 3.5 `src/public-api.ts` ya re-exporta `./lib/button` (creado en 1.7)

**Criterio**: archivos creados. Linter Angular no marca errores en selector ni en el uso de input/output signals.

## 4. Tests del Button

- [x] 4.1 `button.component.spec.ts` con TestBed standalone + 3 specs (`creates the component`, `emits clicked when enabled`, `does NOT emit clicked when disabled`). **Side-fix**: agregado `@angular/build` como devDep (peer de `@analogjs/vite-plugin-angular`) y `pnpm.overrides.esbuild=0.27.7` en root package.json para resolver mismatch de versiones de esbuild entre vitest y angular/build. **3/3 tests passed en 1.92s**

**Criterio**: `pnpm -F @romanmartinidev/components test --run` ejecuta los 3 specs y reporta `3 passed, 0 failed`.

## 5. Build con ng-packagr

- [x] 5.1 `pnpm -F @romanmartinidev/components build` — exit 0, 847ms
- [x] 5.2 `dist/` contiene `package.json`, `types/romanmartinidev-components.d.ts`, `fesm2022/romanmartinidev-components.mjs` (+ sourcemap) ✓ APF
- [x] 5.3 `dist/package.json` declara `peerDependencies: {@angular/core, @angular/common, @romanmartinidev/tokens: workspace:*}` ✓ (Changesets reescribirá `workspace:*` al publicar); `dependencies: {tslib}` agregada automáticamente por ng-packagr (importHelpers)
- [x] 5.4 `npm pack --dry-run`: 4 archivos (fesm2022 mjs + map, types d.ts, package.json), 3.2 KB packed. README aún no existe (Sección 6); cuando se cree entrará al tarball por `files: ["dist", "README.md"]`

**Criterio**: dist con APF válido. Tarball publica solo dist.

## 6. README del package

- [x] 6.1 Creado `packages/components/README.md` cubriendo: tagline, instalación con peer deps (Angular + tokens), orden de import obligatorio (`@romanmartinidev/tokens/css` antes de componentes), ejemplo Button (TS standalone + template), tabla de componentes disponibles, convenciones (prefix, standalone, signals, CSS plain, ViewEncapsulation, arquitectura), link a ADR-004

**Criterio**: README cubre las 7 secciones; incluye al menos un snippet completo (importar tokens + importar Button + usar en template); linkea al ADR-004.

## 7. ADR-004

- [x] 7.1 Creado `docs/architecture/adr/ADR-004-arquitectura-components.md` (MADR) con 5 opciones evaluadas y **10 sub-decisiones** documentadas (build tool, arquitectura interna, tipo componente, selector prefix, naming, styles, ViewEncapsulation, testing, surface exports, **+ tokens como peerDependency — decisión revisada durante apply**). Referencia explícita a ADR-001, 002, 003. Contexto aclara la coexistencia ortogonal de `--ds-*` (ADR-003) y `rmd-*` (este ADR)
- [x] 7.2 `docs/architecture/decisions-log.md` agregada fila para ADR-004

**Criterio**: ADR-004 sigue MADR; `decisions-log.md` tiene fila con link funcional.

## 8. Validación de cierre

- [x] 8.1 `openspec validate --changes` pasa
- [x] 8.2 `pnpm lint` pasa (sin findings)
- [x] 8.3 `pnpm format:check` pasa (auto-formateados 7 archivos del bootstrap)
- [x] 8.4 `pnpm -r build` pasa (tokens + components buildean OK)
- [x] 8.5 `pnpm -F @romanmartinidev/components exec vitest run` reporta 3/3 tests passing
- [x] 8.6 Marcar Fase 3 ✅ en `docs/bootstrap-plan.md`
- [x] 8.7 Proponer mensaje de commit y esperar OK de Roman → aprobado y commiteado en `c3aaeba`

**Criterio**: todos los puntos pasan; Roman aprueba el mensaje del commit antes de ejecutarlo.

## 9. Archivar este change

> Estas tareas se ejecutan vía flujo manual o `/opsx:archive bootstrap-fase-3-components`.

- [x] 9.1 Movido a `openspec/changes/archive/2026-05-31-bootstrap-fase-3-components/`
- [x] 9.2 Promovidos 12 ADDED Requirements a `openspec/specs/components-package/spec.md` con header `## Purpose`
- [x] 9.3 `openspec validate --all` pasa: ✓ monorepo-structure, ✓ design-tokens-package, ✓ components-package (3/3)
- [x] 9.4 Proponer mensaje del commit del archive y esperar OK de Roman → aprobado y commiteado en `c53e5c5`

**Criterio**: change archivado, spec base creada y validada, commit del archive aprobado por Roman antes de ejecutar.

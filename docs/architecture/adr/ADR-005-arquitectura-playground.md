# ADR-005 — Arquitectura del playground

- **Fecha**: 2026-06-01
- **Estado**: Aceptado
- **Dominio**: frontend / playground
- **ADRs relacionados**: [ADR-001](ADR-001-monorepo-pnpm-workspaces.md), [ADR-002](ADR-002-conventional-commits-changesets.md), [ADR-003](ADR-003-arquitectura-design-tokens.md), [ADR-004](ADR-004-arquitectura-components.md)

## Contexto

`apps/playground/` es el primer consumidor real de las dos libs publicables del monorepo (`@romanmartinidev/tokens` y `@romanmartinidev/components`). Su rol es **laboratorio interno**: validar que las libs funcionan en una app Angular real y servir de hosting para Storybook (visualización de componentes y prototipos exportables).

A diferencia de las libs (que se publican a npm), el playground tiene `"private": true` — nunca se publica. Esto le da libertad de probar dependencias experimentales (zoneless, Storybook 10 versiones tempranas) sin afectar el contrato API público del monorepo.

Las decisiones de esta ADR aplican a Fase 4 del bootstrap-plan y son la referencia para todo trabajo futuro de prototipado en `apps/playground/`.

## Opciones consideradas

### Opción A — Stories co-ubicadas en `packages/components/` + Storybook en `apps/playground/` (Recomendado y adoptado)

Stories junto al componente (`packages/components/src/lib/<comp>/<comp>.stories.ts`), config de Storybook en `apps/playground/.storybook/`.

- **Pros**: refactor del componente + su story en un mismo diff. Cero drift. Patrón estándar libs modernas (Radix, Material UI, shadcn/ui).
- **Contras**: requiere disciplina (cada componente nuevo trae su story). Mitigado por revisión + convención del repo. Stories quedan excluidas del tarball publicable por `tsconfig.lib.json` + `files`.

### Opción B — Stories centralizadas en `apps/playground/src/stories/`

- **Pros**: separación visualización/implementación.
- **Contras**: drift con el tiempo, refactors no actualizan stories.

### Opción C — Storybook dentro de `packages/components/`

- **Pros**: máxima co-ubicación.
- **Contras**: el package publicable carga devDeps de Storybook que no aportan al consumidor. Acopla el contrato a un setup interno.

### Opción D — Modo zoneless vs Zone.js

- **Zoneless adoptado**: `provideZonelessChangeDetection()` (API estable en Angular 21.2). Sin `zone.js` en deps ni polyfills. Change detection puramente reactivo via signals.
- **Zone.js (alternativa rechazada)**: ~30 KB extra de bundle, change detection menos eficiente, contradice la dirección oficial Angular 21.

Button (Fase 3) ya usa OnPush + signals — compatible nativo con zoneless.

### Opción E — Single page vs routing

- **Single page adoptado**: sin `provideRouter()`, sin `<router-outlet>`, sin rutas.
- **Routing rechazado para Fase 4**: scope no lo justifica todavía. Se agrega en change futuro cuando aparezca el primer prototipo que requiera navegación.

### Opción F — Scaffold con `ng new` vs manual

- **`ng new` adoptado**: Angular CLI 21 conoce las defaults modernas, genera estructura coherente.
- **Manual rechazado**: re-implementa lo que CLI ya sabe, mayor costo de mantenimiento.

### Opción G — Vitest vs Karma/Jasmine

- **Vitest adoptado**: alineado con `packages/components/`, ESM-first, watch-mode rápido. Angular 21 lo incluye como devDep default.
- **Karma rechazado**: legacy. Angular CLI 21 ya no lo configura por default.

## Decisión

Se adoptan las siguientes decisiones, formalizadas:

### 1. Scaffold con `ng new` (Angular CLI 21)

```bash
pnpm dlx @angular/cli@21 new playground \
  --directory=apps/playground \
  --routing=false --style=css --ssr=false \
  --skip-git --skip-install --strict
```

Defaults Angular 21 ya cubren: standalone, no `zone.js`, builder `@angular/build:application` (no legacy webpack), prettier integrado, jsdom/vitest pre-configurados.

### 2. Modo zoneless con `provideZonelessChangeDetection()`

API estable en Angular 21.2. Se activa explícitamente en `app.config.ts` aunque sea opt-in (es el default-de-facto en Angular 21+ pero requiere declarar el provider).

### 3. Storybook 10 con stories co-ubicadas

Config en `apps/playground/.storybook/`; el `stories` glob apunta a `../../../packages/components/src/lib/**/*.stories.@(ts|mdx)`.

**Side-effect en `packages/components/`**: `tsconfig.lib.json` excluye `**/*.stories.ts` para que ng-packagr no las compile al `dist/` publicable.

### 4. Storybook 10 con builder default `@storybook/angular`

Storybook 10 + `@storybook/angular@^10` (versión estable disponible). Addons activos: `@storybook/addon-docs`, `@storybook/addon-a11y`. El resto (`controls`, `actions`, `viewport`, etc.) viene incluido en el core de Storybook 10 — no requiere instalar `addon-essentials` separado (no existe en v10).

### 5. Vitest alineado con `packages/components/`

Mismo stack: `vitest@^4`, `@analogjs/vitest-angular`, `@analogjs/vite-plugin-angular`, `jsdom`. El override de esbuild en root (`pnpm.overrides.esbuild=0.27.7`) cubre ambos workspaces.

### 6. Single page sin routing

`App` standalone, sin `provideRouter()`, sin `<router-outlet>`. Cuando aparezca necesidad de routing (varios prototipos exportables), se agrega en change futuro.

### 7. Tokens vía `@import` en `src/styles.css`

`src/styles.css` empieza con `@import '@romanmartinidev/tokens/css';`. Angular CLI procesa el CSS global y los `--ds-*` quedan disponibles para todo el árbol DOM (atraviesan ViewEncapsulation emulada porque son custom properties).

### 8. Sin theme switcher (deferido)

No se agrega UI para alternar dark/brand-a/brand-b en Fase 4. La app default importa solo el CSS base (light + brand default). Si aparece necesidad, change futuro (`playground-add-theme-toggle`) — Storybook puede sumar `@storybook/addon-themes` por separado.

### 9. App usa naming Angular 21 default (sin sufijo `Component`)

Angular CLI 21 genera `App` (no `AppComponent`), archivo `app.ts` (no `app.component.ts`), selector `app-root`. Es la nueva convención oficial Angular 21+ para componentes de aplicación.

**Importante**: esto convive con el naming de `packages/components/` (ADR-004), que SÍ usa sufijo `Component` (`ButtonComponent`, `button.component.ts`). La razón: las libs publicables siguen la convención clásica Angular para no romper expectativas de consumidores externos; las apps internas pueden adoptar las defaults nuevas del CLI sin afectar contratos.

## Consecuencias

### Positivas

- **Validación end-to-end**: las libs publicables (`tokens`, `components`) probadas en una app Angular real consumiendo `workspace:*`.
- **Storybook visual**: cada componente nuevo trae su story al lado del código — refactors se mantienen sincronizados.
- **Zoneless**: ~30 KB menos de bundle, change detection eficiente, alineado con la dirección Angular.
- **Vitest consistente**: mismo runner en components y playground; menos contexto que aprender al saltar entre workspaces.
- **Bundle inicial chico**: 110 KB main + 27.9 KB styles para Button + tokens (medido en Fase 4 con app demo).

### Negativas / trade-offs aceptados

- **Stories en `packages/components/` requieren disciplina**: cada componente nuevo debe traer su `.stories.ts`. Mitigable con plantilla de scaffolding futura.
- **Storybook deps en `apps/playground/`**: peso aceptable, no afecta tarballs publicables.
- **Builder webpack para Storybook + esbuild para app**: dos pipelines coexistiendo. Aceptable hasta que `@storybook/angular` soporte Vite oficialmente.
- **Naming inconsistente entre `packages/components/` (sufijo `Component`) y `apps/playground/` (sin sufijo)**: documentado en decisión #9; las libs siguen contrato Angular clásico para consumidores externos; la app interna adopta defaults Angular 21+.
- **Sin theme switcher**: el playground en Fase 4 no demuestra dark mode end-to-end. Diferido.

### Acciones de seguimiento

- Documentar en README del playground cómo agregar un demo + story de un componente nuevo. ✅ ya cubierto en README del playground.
- Excluir `**/*.stories.ts` en `tsconfig.lib.json` de `packages/components/`. ✅ ya hecho.
- Si aparece necesidad real (routing, theme switcher, deploy Storybook, visual regression), cada uno es su change futuro.
- Reevaluar `@storybook/angular` con Vite cuando oficial.

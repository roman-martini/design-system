## Context

Fase 4 crea el primer consumidor real de las dos libs publicables del monorepo: una app Angular 21 en `apps/playground/`. Sirve como laboratorio (no como app productiva) y como hosting de Storybook 10. A diferencia de las libs (`tokens`, `components`), el playground NO se publica a npm.

Restricciones heredadas del monorepo:

- pnpm workspaces (ADR-001).
- Conventional Commits + Changesets (ADR-002) — el playground se versiona internamente pero no se publica.
- Tokens via CSS variables (ADR-003) con prefix `--ds-*`.
- Components con selector `rmd-*`, standalone + signals, CSS plain, peerDep tokens (ADR-004).

Restricciones del stack heredadas:

- Angular 21 (default standalone, signals, zoneless opcional).
- TypeScript 5.9.
- Vitest 4 + `@analogjs/vitest-angular` ya validado en `packages/components/`.

Decisiones tomadas en kickoff:

1. Storybook en `apps/playground/.storybook/` con stories **co-ubicadas** en `packages/components/src/lib/<comp>/<comp>.stories.ts`.
2. Demos en Fase 4: 1 story del Button (Default, Variants, Sizes, Disabled) + 1 página app simple con `<rmd-button>`.
3. Single page sin routing.
4. **Modo zoneless** (sin zone.js).

## Goals / Non-Goals

**Goals:**

- Dejar `apps/playground/` como app Angular 21 zoneless funcional que importa tokens y consume Button.
- Setup Storybook 10 que recoge stories co-ubicadas del package components.
- Tests Vitest del AppComponent que validen la integración con `<rmd-button>`.
- Formalizar la arquitectura del playground en **ADR-005**.
- Validar end-to-end: tokens CSS resueltos en runtime, Button renderiza, Storybook arranca.

**Non-Goals:**

- NO setear routing (single page por ahora).
- NO setear SSR.
- NO setear Compodoc (deferido a follow-up).
- NO deployar Storybook a internet (queda para Fase 5/CI).
- NO sumar más componentes que Button (Input, Card, etc. son changes futuros).
- NO setear visual regression testing (Chromatic/Playwright) — Fase 5+.
- NO crear theme switcher en la UI del playground (follow-up).
- NO publicar el playground a npm.

## Decisions

### 1. Scaffolding: **`ng new` con Angular CLI**

**Alternativas:**

- **A. `ng new playground --directory=apps/playground` (Recomendado y adoptado).** Angular CLI genera estructura completa coherente con sus convenciones (angular.json, tsconfigs, src/, polyfills, etc.).
- **B. Scaffold manual archivo por archivo.** Más control, menos opaco. Pero re-implementa lo que Angular CLI ya sabe hacer; costo de mantenimiento alto.
- **C. Plantilla de terceros (analog, etc.).** Más opinionada, agrega dependencia adicional.

**Decisión: A.**

**Por qué:**

- Angular CLI 21 ya conoce las defaults modernas (standalone, signals, zoneless opt-in).
- Genera angular.json válido que Vitest puede consumir vía `@analogjs/vite-plugin-angular`.
- Reduce superficie de error al inicio.

**Flags concretos**:

```
npx @angular/cli@21 new playground \
  --directory=apps/playground \
  --routing=false \
  --style=css \
  --ssr=false \
  --skip-git \
  --skip-install \
  --strict \
  --standalone \
  --inline-style=false \
  --inline-template=false
```

### 2. Modo zoneless

**Decisión** (aprobada en kickoff): activar `provideExperimentalZonelessChangeDetection()` (o nombre estable Angular 21) en `app.config.ts`. Sin `zone.js` en `polyfills` ni en `dependencies`.

**Por qué:**

- Angular 21 promueve zoneless como dirección oficial.
- Button (Fase 3) ya usa OnPush + signals — compatible out-of-the-box con zoneless.
- ~30 KB menos de bundle (zone.js fuera).
- Change detection puramente reactivo via signals.

**Trade-off aceptado**: si en el futuro se agrega una lib externa que asume `zone.js`, la app rompe. Hoy no es el caso. Se documenta en ADR-005.

### 3. Storybook 10 — config en `apps/playground/.storybook/`, stories co-ubicadas en `packages/components/`

**Alternativas evaluadas en kickoff:**

- **C (Recomendado y adoptado): stories co-ubicadas** (`packages/components/src/lib/<comp>/<comp>.stories.ts`) + config en playground.
- B: stories centralizadas en playground.
- D: Storybook dentro de `packages/components/`.

**Decisión: C.**

**Por qué:**

- Stories junto al componente: refactors no quedan desfasados, code reviews ven ambos en el mismo diff.
- Patrón estándar en libs modernas (Radix, Material UI, shadcn/ui).
- El package publicable NO carga deps de Storybook (queda en playground).
- Las stories se excluyen del tarball por `files: ["dist", "README.md"]` + `tsconfig.lib.json` exclude `**/*.stories.ts`.

**Side-effect para `packages/components/`**: agregar `"**/*.stories.ts"` al `exclude` de `tsconfig.lib.json`. No afecta el contrato publicado (spec `components-package` sigue válido).

### 4. Storybook 10 con builder default (webpack via @storybook/angular)

**Alternativas:**

- **A. `@storybook/angular@^10` default (Recomendado y adoptado).** Usa Angular CLI builder internamente. Maduro, bien soportado.
- B. Storybook + Vite + plugin manual. Storybook 10 + Vite + Angular no es combinación bien soportada todavía.

**Decisión: A.**

**Trade-off**: dos builders en el repo (webpack para Storybook, esbuild/Vite para app + Vitest). Aceptable porque Storybook y la app del playground tienen vidas distintas. Reevaluar cuando `@storybook/angular` soporte Vite oficialmente.

### 5. Vitest alineado con `packages/components/`

**Decisión**: mismo stack (`vitest@^4`, `@analogjs/vitest-angular`, `@analogjs/vite-plugin-angular`, `jsdom`).

**Por qué**: consistencia. El esbuild override del root (Fase 3) ya cubre ambos workspaces. Sin Karma/Jasmine.

### 6. Single page sin routing

**Decisión** (aprobada en kickoff): sin `provideRouter()`, sin `<router-outlet>`, sin rutas.

**Por qué:**

- Fase 4 demuestra UN consumidor de las libs (Button). No hay navegación entre demos todavía.
- Cuando aparezca necesidad (varios prototipos exportables), se agrega routing en un change futuro (`playground-add-routing`).
- Mantiene Fase 4 chica.

### 7. CSS de tokens importado vía `styles.css` global

**Alternativas:**

- **A. `@import '@romanmartinidev/tokens/css';` en `src/styles.css`** (Recomendado y adoptado). El CSS de tokens entra al bundle global de la app via Angular CLI styles config.
- B. `import '@romanmartinidev/tokens/css';` en `main.ts`. Funciona en algunos setups (Vite) pero Angular CLI no procesa CSS imports desde TS directamente.

**Decisión: A.**

**Por qué**: alineado con el pipeline de Angular CLI. `styles.css` queda como global, accesible desde cualquier componente sin `ViewEncapsulation` interfiriendo (las custom properties cruzan los límites de shadow DOM emulado).

### 8. Sin theme switcher (deferido)

**Decisión**: NO incluir dark/brand-a/brand-b switcher en la UI del playground. La app default importa solo el CSS base (light + brand default).

**Por qué**: scope contenido. Theme switcher justifica su propio change (`playground-add-theme-toggle`) porque introduce decisiones de UX (¿persiste en localStorage? ¿query string? ¿icon en header?).

**Trade-off**: el playground en Fase 4 no demuestra theming. Storybook puede agregar un theming addon en futuro (`@storybook/addon-themes`).

## Risks / Trade-offs

| Riesgo                                                                               | Mitigación                                                                                                                |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| **Zoneless rompe con lib externa que asuma zone.js**                                 | Hoy no usamos libs así. Si aparece (ej. lib de animaciones legacy), evaluar volver a zone.js en change futuro (BREAKING). |
| **Storybook 10 + Angular 21 + webpack: edge cases**                                  | Comunidad activa. Si falla, fallback a Storybook 9 documentado.                                                           |
| **`tsconfig.lib.json` exclude stories debe mantenerse al evolucionar**               | Verificable en spec scenario "stories no entran al tarball". CI futuro lo enforza.                                        |
| **Vitest + Angular CLI builder coexistencia**                                        | Vitest no toca el build de la app (usa su propio Vite). Aislados.                                                         |
| **`ng new` puede traer defaults que no queremos (analytics, package-lock.json npm)** | Usar flags explícitos (`--skip-git`, `--skip-install`, etc.) y revisar el output antes de aceptarlo.                      |
| **Storybook deps pesadas en `apps/playground/`**                                     | Aceptado: playground es interno. No afecta tarballs publicables.                                                          |
| **CSS de tokens entra al bundle global y al de Storybook**                           | Es lo deseado. Tree-shaking no aplica a CSS importado por design.                                                         |

## Migration Plan

### Para el repo (cómo aplicar la fase)

Ver `tasks.md`. Sin downtime — solo afecta `apps/playground/` (nuevo) + `packages/components/tsconfig.lib.json` (exclude minor) + docs.

### Validación post-apply

- `pnpm install` → 0 errores.
- `pnpm -r build` → 3 workspaces OK (tokens, components, playground).
- `pnpm -F playground exec vitest run` → tests OK.
- `pnpm -F playground storybook` → arranca, Button visible con todas las stories.
- `pnpm -F playground start` (o `ng serve` desde playground) → app levanta, renderiza Button con tokens aplicados.

## Open Questions

- **¿Routing cuándo?** Diferido. Cuando aparezca el primer prototipo que necesite navegación.
- **¿Theme switcher cuándo?** Diferido. Considerar para validar dark mode end-to-end.
- **¿Compodoc?** Diferido. Solo si aparece necesidad concreta de docs auto-generadas.
- **¿Storybook deploy?** Diferido a Fase 5 (CI).
- **¿Visual regression testing?** Diferido a post-Fase 5.
- **¿`provideExperimentalZonelessChangeDetection` vs API estable Angular 21?** Verificar al implementar si Angular 21 ya estabilizó la API. Si sí, usar `provideZonelessChangeDetection()` sin `Experimental`.

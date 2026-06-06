## Context

Fase 3 crea el segundo package publicable del monorepo: `@romanmartinidev/components`. A diferencia de `tokens` (que ya tenía source heredado), `components` se crea **desde cero** — toda la arquitectura, naming, surface y tooling se decide acá. Las decisiones afectan a todos los componentes futuros y a cualquier consumidor río abajo (incluido `apps/playground` en Fase 4).

Stack restricciones del monorepo (heredadas):

- pnpm workspaces (ADR-001).
- Angular 21 + TypeScript 5.9.
- Tokens consumidos vía CSS variables `--ds-*` con jerarquía documentada (ADR-003).
- Publicación vía Changesets (ADR-002).
- Conventional Commits (ADR-002).

Stack restricciones de Angular library:

- **Angular Package Format (APF)** es el estándar oficial para libs Angular. Requiere ng-packagr como build tool (no otros bundlers genéricos).
- **Standalone components + signals + new APIs** (`input()`, `output()`, `model()`) son la recomendación oficial Angular ≥17. Angular 21 los hace default en `ng generate`.
- **Vitest + `@analogjs/vitest-angular`** es la combinación moderna para tests de libs Angular. Karma+Jasmine es legacy.

## Goals / Non-Goals

**Goals:**

- Dejar el package `@romanmartinidev/components` con scaffolding completo y validado por un componente real (Button).
- Establecer la arquitectura interna (flat por componente, naming convention, surface) que aplicará a todos los componentes futuros.
- Formalizar la decisión en **ADR-004**.
- Producir contratos testables (spec `components-package`) que `apps/playground` (Fase 4) pueda asumir.

**Non-Goals:**

- NO incluir más componentes que Button (Input, Card, etc. son changes futuros).
- NO setear Storybook (queda para Fase 4 o un change posterior — Storybook se monta naturalmente en `apps/playground`).
- NO configurar Compodoc / generación de docs (queda para change futuro si se decide).
- NO publicar a npm (operación manual posterior).
- NO consumir el package desde una app (Fase 4).
- NO añadir CI workflows (Fase 5).

## Decisions

### 0. Dependencia a tokens: **peerDependency** (no dependency)

**Decisión revisada durante apply** (Roman aprobó el cambio).

`@romanmartinidev/tokens` SHALL declararse como `peerDependency` con `workspace:*`, no como `dependency` regular.

**Por qué:**

- **Convención de ng-packagr**: por default rechaza `dependencies` regulares en libs Angular publicables. Sugiere `peerDependencies` explícitamente.
- **Convención del ecosistema Angular**: `@angular/material` declara `@angular/cdk` como peer, etc.
- **Evita duplicación**: el consumidor tiene una sola copia de tokens en su árbol de deps.
- **Control del consumidor**: el consumidor decide la versión de tokens (importante si quiere fixar a una versión específica).

**Trade-off**: el consumidor debe instalar tokens explícitamente (`npm install @romanmartinidev/tokens` además de components). Documentado en README del package.

### 1. Build tool: **ng-packagr** (sin Angular CLI workspace)

**Alternativas:**

- **A. ng-packagr standalone (sin angular.json).** El package vive solo con `package.json` + `ng-package.json` + `tsconfig.lib.json`. Build = `pnpm exec ng-packagr -p ng-package.json`.
- **B. Angular CLI library generada con `ng generate library`.** Requiere un workspace Angular CLI (angular.json) — eso obliga a meter angular.json en root o en el package, lo que choca con la estructura pnpm-workspace.
- **C. Otros bundlers (tsup, Vite library).** No producen APF — incompatibles con Angular AOT/IVY downstream.

**Decisión: A — ng-packagr standalone.**

**Por qué:**

- pnpm workspace ya orquesta builds vía `pnpm -F`. No necesitamos Angular CLI como orquestador adicional.
- `apps/playground` (Fase 4) sí tendrá su `angular.json` propio (porque `ng new` lo crea), pero las libs no lo necesitan: ng-packagr funciona como CLI independiente.
- Reduce superficie de configuración.

### 2. Arquitectura interna: **flat por componente**

**Alternativas evaluadas en el kickoff:**

- **A. Flat por componente (Recomendado).** `src/lib/<name>/` con todo adentro.
- **B. Atomic design** (atoms/molecules/organisms).
- **C. Categorías funcionales** (forms/, navigation/, etc.).

**Decisión: A.**

**Por qué:**

- Predecible: un componente = una carpeta. Cero debates sobre dónde va.
- Escalable: agregar un componente nuevo no toca componentes existentes ni infraestructura.
- Patrón dominante en libs Angular modernas (Spartan, ng-zorro, Nebular, etc.) y en libs React modernas (Radix Primitives, shadcn/ui).
- Atomic design es útil en design tools (Figma); en código genera discusión recurrente sobre clasificación.
- Categorías funcionales tienen casos ambiguos (¿Dropdown es navigation u overlay?).

### 3. Tipo de componente: **Standalone + signals + new APIs**

**Decisión** (aprobada en kickoff): `standalone: true` (o default en Angular 21), `input()` / `output()` / `model()` signals. Sin NgModules. Sin decorators `@Input()`/`@Output()`.

**Por qué:**

- Recomendación oficial Angular team desde v17, default en `ng new` desde v18-19.
- Signal inputs habilitan reactividad fina y change detection optimizado (zoneless-friendly).
- Standalone elimina boilerplate de NgModules y simplifica la surface de imports para consumidores.

### 4. Selector prefix: **`rmd-`**

**Decisión** (aprobada en kickoff): `rmd-` para todos los componentes.

**Por qué:**

- Coincide con scope npm `@romanmartinidev`.
- Único, evita colisión con otros DS genéricos.
- Angular ESLint `@angular-eslint/component-selector` puede automatizar la verificación.

**Trade-off documentado en spec**: el prefix queda parte del contrato API público. Cambiarlo es BREAKING + ADR nuevo + major bump.

### 5. Naming convention

**Decisión:**

| Pieza                  | Convención                              | Ejemplo                    |
| ---------------------- | --------------------------------------- | -------------------------- |
| Carpeta del componente | kebab-case sin sufijo                   | `button/`                  |
| Archivo del componente | `<name>.component.ts`                   | `button.component.ts`      |
| Archivo de estilos     | `<name>.component.css`                  | `button.component.css`     |
| Archivo de tests       | `<name>.component.spec.ts`              | `button.component.spec.ts` |
| Re-export interno      | `index.ts`                              | `index.ts`                 |
| Class TypeScript       | `<Name>Component` (PascalCase + sufijo) | `ButtonComponent`          |
| Selector HTML          | `rmd-<name>` (kebab-case)               | `rmd-button`               |

**Por qué:**

- Alineado con [Angular Style Guide](https://angular.dev/style-guide) y output default de `ng generate component`.
- Sufijo `Component` distingue de servicios/directivas en imports y en lookup IDE.
- Coincidencia exacta nombre carpeta ↔ archivo ↔ selector reduce carga cognitiva.

### 6. Styles: **CSS plain + tokens via CSS variables**

**Alternativas:**

- **A. CSS plain (Recomendado).** Sin preprocesador. Consumir tokens vía `var(--ds-...)`.
- **B. SCSS.** Útil para mixins, variables, nesting nativo. Pero las CSS variables ya resuelven theming; nesting nativo CSS está en browsers modernos; mixins no son críticos a esta escala.
- **C. CSS-in-JS / utility classes (Tailwind, etc.).** Acopla el package a un build system específico río abajo. No estándar Angular.

**Decisión: A — CSS plain.**

**Por qué:**

- Cero dependencias adicionales (sin sass).
- Los tokens del DS ya son CSS variables — no agregan valor capas de pre-procesamiento.
- Build de ng-packagr maneja `.css` nativamente sin loaders adicionales.
- Más portable: consumidores no necesitan un sass-loader configurado.

**Trade-off aceptado:** sin nesting CSS modular si el browser target no lo soporta (browsers modernos sí, IE no es target).

### 7. ViewEncapsulation: **default (Emulated)**

**Decisión:** mantener el default de Angular (`ViewEncapsulation.Emulated`). Los CSS variables atraviesan los límites del shadow DOM emulado, así que el theming sigue funcionando.

**Por qué Emulated y no None:**

- Emulated (default) aísla estilos: los `.button-class` definidos en `button.component.css` no leak a otros componentes. Una bug class en Button no rompe un Input.
- None requeriría disciplina manual (BEM, namespace) para evitar conflictos.

**Por qué Emulated y no ShadowDom:**

- ShadowDom real complica integración con form controls (focus management, FormGroup), accessibility tree, y testing.
- A esta escala no aporta beneficio operativo.

### 8. Testing: **Vitest + @analogjs/vitest-angular**

**Alternativas:**

- **A. Vitest + @analogjs/vitest-angular (Recomendado).** Moderno, watch-mode rápido, ESM-first. Ya en el stack desde el angular-app original.
- **B. Karma + Jasmine.** Default de Angular CLI legacy. Más lento, basado en browser real.
- **C. Jest + jest-preset-angular.** Maduro pero pre-Vitest era la opción "ESM" antes.

**Decisión: A.**

**Por qué:**

- Stack consistency: el repo ya tenía Vitest 4 en `angular-app/` (Fase 4 lo va a regenerar también con Vitest).
- Performance superior en watch-mode.
- Compatible con Angular 21 vía `@analogjs/vitest-angular`.

### 9. Surface de exports

**Decisión: surface única (`.`) en Fase 3, sub-paths cuando se sumen más componentes.**

- `package.json` exports declarará solo `.` apuntando al barrel principal (que re-exporta Button).
- Cuando se sumen componentes, evaluar si conviene sub-paths para tree-shaking más fino (`@romanmartinidev/components/button`). ng-packagr soporta "secondary entry points" — se decide en su change.

**Por qué empezar con surface única:**

- Tree-shaking moderno (ESM + sideEffects: false) ya elimina componentes no usados aunque vengan del mismo barrel.
- Sub-paths agregan complejidad de configuración (ng-package.json adicional por subentry). Sumar solo cuando aporten valor concreto.

## Risks / Trade-offs

| Riesgo                                                                                    | Mitigación                                                                                                                              |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Decisiones de arquitectura quedan "atadas" para todos los componentes futuros**         | Documentadas en ADR-004 con opciones evaluadas. Cambio futuro = ADR nuevo que reemplace. Spec captura como contrato testable.           |
| **`workspace:*` puede romperse al publicar si Changesets falla en reescribir**            | Validar en pre-release con `pnpm changeset version --dry-run` o equivalente. Es el comportamiento estándar de Changesets, bien probado. |
| **ng-packagr 21 podría tener breaking changes en patches**                                | Pinear a versión mayor estable (`^21.0.0`). Monitorear changelog.                                                                       |
| **Tests de Angular standalone con Vitest tienen edge cases**                              | `@analogjs/vitest-angular` es el adapter oficial. Si aparecen problemas, fallback documentado a Karma.                                  |
| **Selector `rmd-` colisiona con otro DS en consumidor**                                   | Bajo riesgo. Si aparece, BREAKING + ADR nuevo + major bump.                                                                             |
| **Sin sub-paths en exports, consumidor importa todo aunque tree-shaking lo limpie**       | Aceptado en Fase 3 (1 componente). Reevaluar cuando haya 5+ componentes.                                                                |
| **Tokens via `var(--ds-*)` requieren que el consumidor importe el CSS de tokens primero** | Documentado en README + spec scenario. README del package muestra el orden de import correcto.                                          |

## Migration Plan

### Para el repo (cómo aplicar la fase)

Ver `tasks.md`. Sin downtime — solo afecta `packages/components/` (nuevo) y docs/decisions.

### Para consumidores futuros (cuando se publique)

No aplica todavía — primera publicación. Documentar en README de la lib y eventualmente en CHANGELOG cuando salga el primer release.

## Open Questions

- **¿Sub-paths en `exports` cuándo?** Diferido. Reevaluar cuando haya 5+ componentes o cuando aparezca un consumidor con bundle size preocupante.
- **¿Storybook en la lib o en `apps/playground`?** En la lib estaría en `packages/components/.storybook/`. En el playground viviría con la app de prueba. Tentativa: **playground** (alineado con que el playground es el lab visual). Decisión definitiva en Fase 4.
- **¿Compodoc?** Diferido. Se decide cuando aparezca necesidad concreta de docs auto-generadas.
- **¿Política de versionado pre-1.0?** Mismo open question que en tokens — se cierra al primer release.
- **¿Theming a nivel de componente (overrides locales) cómo se expresa?** Aceptamos por ahora que el componente consume tokens semantic. Si aparece necesidad de un componente customizable per-instance vía CSS variables propias (ej. `--rmd-button-bg-override`), se documenta en su propio ADR.

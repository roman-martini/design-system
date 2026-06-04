# ADR-004 — Arquitectura de @romanmartinidev/components

- **Fecha**: 2026-05-31
- **Estado**: Aceptado
- **Dominio**: frontend / components
- **ADRs relacionados**: [ADR-001](ADR-001-monorepo-pnpm-workspaces.md), [ADR-002](ADR-002-conventional-commits-changesets.md), [ADR-003](ADR-003-arquitectura-design-tokens.md)

## Contexto

`@romanmartinidev/components` es el segundo package publicable del monorepo y va a contener todos los componentes Angular del sistema de diseño. A diferencia de `tokens` (que tenía source heredado), `components` se crea desde cero — toda la arquitectura, naming, surface y tooling se decide en Fase 3 del bootstrap. Las decisiones afectarán a cada componente futuro y a cada consumidor río abajo.

Relación con ADR-003 (tokens): el package consume tokens vía CSS custom properties con prefix `--ds-*` (definido en ADR-003). Esta ADR introduce un **segundo prefix ortogonal**: `rmd-` para los selectores Angular de los componentes. Los dos prefixes coexisten sin colisión porque viven en namespaces distintos (CSS custom properties vs HTML element selectors).

Restricciones del stack heredadas:

- pnpm workspaces (ADR-001) — usamos `peerDependency: workspace:*` para tokens.
- Conventional Commits + Changesets (ADR-002) — Changesets reescribe `workspace:*` a versión semver al publicar.
- Tokens vía CSS variables (ADR-003) — los componentes consumen tokens semantic; no acceden a primitives directos.

Esta decisión afecta cada componente publicable del package y es one-way door para varios aspectos (prefix, naming, tipo de API). Cumple los criterios de ADR obligatorio (one-way door + ≥2 packages cuando se consideran consumidores).

## Opciones consideradas

### Opción A — Arquitectura interna: flat por componente (Recomendado y adoptado)

Cada componente vive en su propia carpeta `src/lib/<name>/` con `<name>.component.{ts,css,spec.ts}` + `index.ts`.

- **Pros**:
  - Predictibilidad: un componente = una carpeta. Cero discusión sobre dónde va.
  - Escalabilidad: agregar componentes nuevos sin tocar infraestructura ni los existentes.
  - Patrón dominante en libs Angular modernas (Spartan, ng-zorro, Nebular) y en libs React (Radix Primitives, shadcn/ui).
- **Contras**:
  - No agrupa por uso (forms, navigation, etc.). Para libs muy grandes podría querer una capa adicional, pero a esta escala es prematuro.

### Opción B — Atomic design (atoms/molecules/organisms)

Estructura jerárquica clásica de design tools.

- **Pros**:
  - Convención conocida en el espacio de design tools (Figma).
- **Contras**:
  - Clasificación subjetiva: ¿un Input con label es atom o molecule? Genera debates recurrentes en code reviews.
  - Útil en design tools, menos en código.

### Opción C — Categorías funcionales (forms/, navigation/, overlay/, feedback/, layout/)

Agrupar por uso/intención.

- **Pros**:
  - Lookup por intención ("dónde está el componente de feedback?").
- **Contras**:
  - Casos ambiguos (¿Dropdown es navigation u overlay? ¿Card es layout o feedback?).
  - Mover un componente entre categorías es un cambio destructivo para imports si se usan sub-paths.

### Opción D — Standalone + signals + new APIs vs NgModules clásicos

- **Standalone + signals** (Recomendado y adoptado): `standalone: true` (default Angular 21), `input()`/`output()`/`model()` signals. Sin `@Input()`/`@Output()` con decorators. Sin NgModules.
- **NgModules clásicos**: patrón legacy desde Angular ≤16. Mayor verbosidad, surface más compleja para consumidores.

**Por qué standalone + signals**: recomendación oficial Angular team desde v17, default en `ng new` desde v18-19. Signal inputs habilitan reactividad fina y change detection optimizado (zoneless-friendly).

### Opción E — Build tool: ng-packagr standalone vs Angular CLI workspace vs otros bundlers

- **ng-packagr standalone (adoptado)**: build = `pnpm exec ng-packagr -p ng-package.json`. Sin angular.json. Independiente de Angular CLI.
- **Angular CLI library** (`ng generate library`): requiere `angular.json` en root, choca con la estructura pnpm-workspace.
- **Otros bundlers** (tsup, Vite library mode): no producen Angular Package Format. Incompatibles con AOT/IVY en consumidores Angular.

## Decisión

Se adoptan las siguientes decisiones, formalizadas:

### 1. Build tool: **ng-packagr** (sin Angular CLI workspace)

`pnpm exec ng-packagr -p ng-package.json` produce APF (FESM2022, types, partial Ivy). Sin angular.json. La orquestación de tasks la hace pnpm workspaces.

### 2. Arquitectura interna: **flat por componente**

`src/lib/<name>/` con `<name>.component.ts`, `<name>.component.css`, `<name>.component.spec.ts`, `index.ts`.

### 3. Tipo de componente: **Standalone + signals + new APIs**

`standalone: true` (o default Angular 21), `input()` / `output()` / `model()`. Sin decorators `@Input()`/`@Output()`. Sin NgModules.

### 4. Selector prefix: **`rmd-`**

Todos los componentes usan `selector: 'rmd-<name>'`. **Parte del contrato API público** — cambiarlo es BREAKING + ADR nuevo + major bump.

Coexiste con el prefix CSS `--ds-*` (ADR-003): los namespaces son ortogonales (HTML element selectors vs CSS custom properties).

### 5. Naming convention

| Pieza             | Convención                 | Ejemplo                    |
| ----------------- | -------------------------- | -------------------------- |
| Carpeta           | kebab-case sin sufijo      | `button/`                  |
| Archivo           | `<name>.component.ts`      | `button.component.ts`      |
| Estilos           | `<name>.component.css`     | `button.component.css`     |
| Tests             | `<name>.component.spec.ts` | `button.component.spec.ts` |
| Re-export interno | `index.ts`                 | `index.ts`                 |
| Class TypeScript  | `<Name>Component`          | `ButtonComponent`          |
| Selector HTML     | `rmd-<name>`               | `rmd-button`               |

### 6. Styles: **CSS plain + tokens via CSS variables**

Archivos `.css`. Consumo de tokens vía `var(--ds-...)`. Sin SCSS, sin CSS-in-JS, sin utility classes externas.

### 7. ViewEncapsulation: **default (Emulated)**

Heredar el default Angular. No declarar `encapsulation: None` ni `ShadowDom` salvo justificación documentada en ADR posterior.

### 8. Testing: **Vitest + @analogjs/vitest-angular**

Stack ya presente en el monorepo. `@angular/build` requerido como devDep (peer de `@analogjs/vite-plugin-angular`). `pnpm.overrides.esbuild` en root para evitar mismatch de versiones entre vitest y angular/build.

### 9. Surface de exports: **única (`.`) inicialmente, sub-paths cuando crezca**

`package.json` exports declara solo `.` apuntando al barrel principal (`public-api.ts`). Reevaluar sub-paths (`@romanmartinidev/components/button`) cuando el package crezca a ≥5 componentes o cuando aparezca un consumidor con bundle size preocupante.

### 10. Dependencia a tokens: **peerDependency** (decisión revisada durante apply)

`@romanmartinidev/tokens` se declara como `peerDependency` con `workspace:*` (no como `dependency` regular).

**Por qué peerDependency:**

- ng-packagr rechaza por default `dependencies` regulares en libs Angular publicables.
- Convención del ecosistema Angular libs (`@angular/material` → `@angular/cdk` como peer).
- Evita duplicación de tokens en el árbol de deps del consumidor.
- Control del consumidor sobre la versión de tokens.

**Trade-off**: el consumidor debe instalar tokens explícitamente. Documentado en README.

## Consecuencias

### Positivas

- **Predictibilidad**: estructura de carpetas y naming uniforme para todos los componentes futuros.
- **Escalabilidad**: agregar componente nuevo = nueva carpeta + entry en `public-api.ts`. Sin tocar infraestructura.
- **Alineación con Angular 21**: standalone + signals son el patrón recomendado oficial.
- **Tree-shakeable**: `sideEffects: false` permite eliminar componentes no usados aunque vengan del mismo barrel.
- **Sin lock-in moderno**: Vitest, ng-packagr y CSS plain son intercambiables si aparece motivación; el contrato (selector, API, exports) queda independiente.
- **Contrato testable**: la arquitectura está formalizada en la spec `components-package` (12 requirements, 24 scenarios) con scenarios verificables.

### Negativas / trade-offs aceptados

- **Decisiones one-way door**: cambiar prefix `rmd-`, naming convention o tipo de API (standalone vs NgModule) son BREAKING + nuevo ADR + major bump.
- **Coexistencia de 2 prefixes (`--ds-*` y `rmd-*`)**: requiere documentación clara para que devs nuevos no los confundan. Mitigado en README + este ADR.
- **Sub-paths en `exports` postergados**: consumidor importa "todo" aunque tree-shaking lo elimine. Aceptable mientras el package sea chico.
- **`workspace:*` requiere Changesets para reescribir al publicar**: comportamiento estándar de Changesets, pero deuda implícita si alguna vez se intenta publicar a mano sin Changesets.
- **`@angular/build` agregado como devDep**: necesario para `@analogjs/vite-plugin-angular`. Si aparece una alternativa de testing que no lo requiera, se reevalúa.
- **`pnpm.overrides.esbuild` en root**: parche por mismatch de versiones entre vitest y @angular/build. Soluble cuando ambos converjan en major de esbuild compatible.

### Acciones de seguimiento

- Documentar en README del package cómo agregar un componente nuevo siguiendo el patrón. ✅ ya cubierto parcialmente en README + ADR.
- Pinear `ng-packagr` en `~21.0` (no `^21`) para evitar minors automáticos que podrían romper APF. ✅ ya pinneado.
- Cuando el package crezca a ≥5 componentes, evaluar sub-paths en `exports` en ADR posterior.
- Si aparece motivación (multi-tema simultáneo, theming a nivel componente vía CSS vars locales tipo `--rmd-button-bg-override`), documentar en ADR posterior.
- Política definitiva de versionado pre-1.0 → 1.0: diferida al primer release público (mismo open question que en tokens).

## Nota de supersesión parcial

El **2026-06-01**, las siguientes secciones de este ADR fueron superseded por [ADR-007](ADR-007-naming-prefijos.md):

- **§4 Selector prefix `rmd-`** → reemplazado por `ds-` (ej. `ds-button`).
- **§5 Naming convention**, columna **"Class TypeScript"** → reemplazado por `Ds<Name>` (sin sufijo `Component`).

Las demás decisiones (§1 build tool, §2 arquitectura flat, §3 standalone+signals, §6 CSS plain, §7 ViewEncapsulation, §8 testing, §9 surface de exports, §10 peerDependency a tokens) siguen **Aceptadas** sin cambios. El estado global de este ADR sigue siendo **Aceptado** porque la mayoría de las decisiones continúan vigentes.

Las menciones a `rmd-` y a class names sin prefijo en el cuerpo de este documento se preservan como **contexto histórico**: representan el estado del sistema al momento de ADR-004 y son inmutables. Ver ADR-007 para el estado actual de naming.

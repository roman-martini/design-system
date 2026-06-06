---
id: aaa-003
name: bootstrap-fase-3-components
type: change
status: archived
archived: 2026-05-31
introduces-specs:
  - components-package
related-adrs:
  - ADR-004
---

## Why

Después de Fase 2 (`@romanmartinidev/tokens` publicable y auditado), el repo necesita su segunda librería: **`@romanmartinidev/components`** — un set de componentes Angular que consumen los tokens vía `workspace:*` y se distribuyen siguiendo Angular Package Format con ng-packagr.

Esta fase no produce el set completo de componentes (sería demasiado scope para un bootstrap). Crea el **scaffolding del package** + **un componente demo end-to-end** (Button) que valida toda la cadena: estructura de carpetas, ng-packagr config, peer deps, integración con tokens, tests, build, surface de exports, README. Una vez validada la cadena, sumar componentes nuevos en changes posteriores es operativo.

Esta propuesta respalda las tres prioridades del repo:

1. **Buenas prácticas**: Angular Package Format estándar, standalone + signals (recomendación oficial Angular 21), peer dependencies correctas, selector prefix coherente con `name`, README profesional.
2. **Escalar ordenado**: arquitectura flat-por-componente predecible. Sumar un componente nuevo = nueva carpeta `src/lib/<name>/` siguiendo el patrón establecido. Cero cambios en infraestructura.
3. **Mantenibilidad**: spec testable de cada decisión (selector prefix, standalone, naming convention); ADR-004 formaliza la arquitectura una sola vez para todos los componentes futuros.

Corresponde a **Fase 3 del bootstrap-plan**.

## What Changes

### Scaffold del package `packages/components/`

Estructura nueva:

```
packages/components/
├── package.json                ← @romanmartinidev/components
├── ng-package.json             ← config de ng-packagr (APF)
├── tsconfig.lib.json           ← TS config para el build de la lib
├── tsconfig.spec.json          ← TS config para los tests
├── vitest.config.ts            ← Vitest + @analogjs/vitest-angular
├── README.md                   ← uso, peer deps, ejemplo Button
└── src/
    ├── public-api.ts           ← surface pública (re-exports)
    └── lib/
        └── button/
            ├── button.component.ts
            ├── button.component.css
            ├── button.component.spec.ts
            └── index.ts        ← re-export interno
```

### `package.json` del package

- `name`: `@romanmartinidev/components`
- `version`: `0.1.0` (pre-1.0, igual que tokens)
- Metadata análoga a tokens (description, author, license MIT, keywords, repository.directory, homepage, bugs, engines, publishConfig public, files).
- **`peerDependencies`**:
  - `@angular/core`: `^21.0.0`
  - `@angular/common`: `^21.0.0`
  - `@romanmartinidev/tokens`: `workspace:*` (Changesets lo reescribe a versión real al publicar). Declarado como peer (no dependency) por convención ng-packagr / ecosistema Angular libs: evita duplicación de tokens en el bundle del consumidor.
- **`devDependencies`**:
  - `ng-packagr` (build APF)
  - `vitest`, `@analogjs/vitest-angular`, `jsdom`, `@angular/compiler-cli`
- **`exports`**: surface inicial `.` (root barrel) + sub-paths por componente cuando se sumen más.
- **`sideEffects`: false** — los componentes son tree-shakeable (no inyectan CSS global).

### Componente Button (demo end-to-end)

Standalone + signals + new APIs de Angular 21:

```ts
@Component({
  selector: 'rmd-button',
  standalone: true,
  imports: [],
  template: `<button type="button" [disabled]="disabled()" (click)="handleClick($event)">
    <ng-content />
  </button>`,
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  variant = input<'primary' | 'secondary' | 'ghost'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  disabled = input<boolean>(false);
  clicked = output<MouseEvent>();

  handleClick(e: MouseEvent) {
    if (!this.disabled()) this.clicked.emit(e);
  }
}
```

CSS consume tokens directamente vía CSS custom properties:

```css
:host {
  display: inline-block;
}
button {
  background: var(--ds-semantic-color-bg-primary);
  color: var(--ds-semantic-color-text-inverse);
  padding: var(--ds-semantic-space-sm) var(--ds-semantic-space-md);
  border-radius: var(--ds-semantic-radius-md);
  font: inherit;
  border: 0;
}
button:focus-visible {
  box-shadow: var(--ds-semantic-shadow-focus);
  outline: none;
}
button:disabled {
  opacity: var(--ds-opacity-50);
  cursor: not-allowed;
}
```

### Tests del Button

Spec con Vitest + Angular Testing Library / DI manual:

- Crea el componente sin errores.
- Renderiza un `<button>` con `type="button"`.
- Emite `clicked` al hacer click cuando no está disabled.
- NO emite `clicked` cuando `disabled() === true`.

### Surface de exports (mínimo viable, escalable)

`src/public-api.ts`:

```ts
export * from './lib/button';
```

`package.json` exports:

```jsonc
{
  ".": { "types": "./dist/index.d.ts", "import": "./dist/fesm2022/romanmartinidev-components.mjs" },
}
```

(Las rutas dentro de `dist/` las define ng-packagr — esta es la forma estándar APF.)

### README del package

Cómo instalar (con peer deps), cómo importar tokens CSS antes del primer componente, ejemplo de uso del Button, lista de componentes disponibles (uno: Button), link a ADR-004 para arquitectura, link a docs futuros.

### ADR-004

Documenta la arquitectura del package: flat por componente, selector prefix `rmd-`, standalone + signals + new APIs como contrato, naming convention (`<Name>Component` class, `<name>.component.ts` archivo), estrategia de styles (CSS plain + tokens via vars), surface de exports y política de tree-shaking. Evalúa explícitamente alternativas (atomic design, NgModules, etc.).

### Validación

- `pnpm install` desde root resuelve `@romanmartinidev/tokens` como workspace.
- `pnpm -F @romanmartinidev/components build` produce dist con APF (fesm2022, types).
- `pnpm -F @romanmartinidev/components test` ejecuta los specs del Button con Vitest.
- `npm pack --dry-run` del componente lista solo `dist/`, `package.json`, `README.md`.

## Capabilities

### New Capabilities

- `components-package`: el package `@romanmartinidev/components` como artefacto publicable. Cubre identidad y metadata, peer deps de Angular, dependencia interna a tokens, surface de exports, arquitectura interna (flat por componente), selector prefix, naming convention, estrategia de styles (CSS + tokens via vars), tree-shaking.

### Modified Capabilities

Ninguna. Esta fase introduce un workspace nuevo sin cambiar contratos existentes de `monorepo-structure` ni `design-tokens-package`.

## Impact

### Código

- **Creados**:
  - `packages/components/{package.json, ng-package.json, tsconfig.lib.json, tsconfig.spec.json, vitest.config.ts, README.md}`.
  - `packages/components/src/{public-api.ts, lib/button/{button.component.ts, button.component.css, button.component.spec.ts, index.ts}}`.
  - `docs/architecture/adr/ADR-004-arquitectura-components.md`.
- **Modificados**: `docs/architecture/decisions-log.md`, `docs/bootstrap-plan.md`.
- **No tocados**: `packages/tokens/*` (intocable post-Fase 2), `apps/*` (vacío hasta Fase 4).

### APIs públicas

- Nueva surface: el package `@romanmartinidev/components` con exports `.` (Button) por ahora.
- **Selector prefix `rmd-` queda parte del contrato API público** — cambiarlo es BREAKING (similar a `--ds-*` del package tokens).
- Standalone + signals + new APIs (`input()`, `output()`) quedan como contrato — migrar a decorators sería BREAKING.

### Dependencias

- Nuevas devDeps en `packages/components/`: ng-packagr, vitest, @analogjs/vitest-angular, jsdom, @angular/compiler-cli, @angular/core, @angular/common.
- Nuevas peer deps declaradas: `@angular/core`, `@angular/common` (^21).
- Sin cambios en root devDeps (las de Angular son específicas del workspace).

### Sistemas / fases siguientes

- **Fase 4 (`apps/playground`)** consumirá `@romanmartinidev/components` vía `workspace:*` y armará Storybook para visualizar.
- **Changes futuros** sumarán componentes (Input, Card, Modal, etc.) siguiendo el patrón establecido sin tocar la infraestructura.

## Alternativas evaluadas

### Opción A — Solo scaffold (sin componente demo)

Crear el package vacío y dejar el primer componente para un change posterior.

- **Pros**: scope mínimo.
- **Contras**: no valida la cadena end-to-end (build, tests, integración con tokens, surface de exports). Una fase de "bootstrap" sin componente real es papelería. Mayor probabilidad de descubrir issues solo cuando llega Fase 4.

### Opción B — Scaffold + un componente demo (Button) (esta propuesta)

Crear el package + Button como prueba end-to-end del patrón.

- **Pros**: valida toda la cadena. Establece el patrón para futuros componentes. Permite a `apps/playground` (Fase 4) tener algo real para mostrar. Scope ajustado, alcanzable.
- **Contras**: ninguno significativo. La elección de Button como demo es la natural (es el componente más simple y reusable).

### Opción C — Scaffold + set inicial (Button, Input, Card)

3 componentes que cubren patrones distintos (interactive simple, ControlValueAccessor, layout).

- **Pros**: más cobertura de patrones.
- **Contras**: scope mayor; Input (ControlValueAccessor) tiene complejidad propia (validación, formularios reactivos) que merece su propia decisión. Card no aporta validación que Button no haya hecho. Mejor introducir un componente por vez con decisiones explícitas.

### Opción D — Scaffold + set completo

Los 11 componentes con tokens.

- **Pros**: lib usable de entrada.
- **Contras**: scope demasiado grande para "Fase 3 del bootstrap". Múltiples decisiones específicas por componente (modal vs popover, radio vs toggle group, etc.). Riesgo alto de no cerrarse. Mejor escalonar.

**Decisión**: Opción B (Roman lo aprobó en kickoff de la propuesta).

## ADRs y follow-ups

- **Se crea**: ADR-004 Arquitectura de components.
- **Se proponen follow-ups** (changes futuros, fuera del scope):
  - `components-add-input`: Input + ControlValueAccessor + validación.
  - `components-add-card`: Card como contenedor de layout.
  - `components-add-modal`: Modal + portal/overlay strategy.
  - Y siguientes (alert, badge, checkbox, radio, switch, tabs, avatar) — cada uno como su propio change.
  - `components-storybook`: setup de Storybook (probablemente en playground, Fase 4).
  - `components-versioning-policy`: política definitiva pre-1.0 → 1.0 (agnóstica entre tokens y components).

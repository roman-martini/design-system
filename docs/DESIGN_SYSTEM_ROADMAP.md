# Design System — Roadmap

> Plan de evolución del design system implementado en `code/`. Pensado para retomarse en cualquier sesión sin contexto previo.

---

## Cómo retomar este plan en una sesión nueva

1. Leer `.claude/memory/MEMORY.md` (memoria persistente del repo).
2. Leer este archivo entero.
3. Verificar el estado actual del build:
   ```bash
   cd code/packages/tokens && npm run build
   cd code/angular-app && npx ng build --configuration=development
   cd code/angular-app && npm run storybook    # opcional: levantar Storybook
   ```
4. Identificar la próxima tarea pendiente (marcadas con `[ ]`) según **Orden recomendado de ataque** al final de este doc.
5. Antes de empezar una tarea de Nivel 3 (monorepo) o Nivel 4 (multi-framework), verificar la sección **Decisiones pendientes** y confirmar con el usuario.

**Convención de estado:**
- `[ ]` Pendiente
- `[~]` En curso
- `[x]` Hecho
- `[-]` Descartado (con motivo)

---

## Estado actual (snapshot 2026-05-23)

### Stack
- **Tokens**: Style Dictionary v4 (`code/packages/tokens/sd.config.mjs`)
- **Framework UI**: Angular 21 standalone components con signals (`input()`, `model()`, `output()`)
- **Documentación**: Storybook 10.4.1 + compodoc para JSDoc → JSON
- **Test runner**: Vitest 4 (instalado, sin tests todavía)
- **Build**: Angular CLI / ng build

### Estructura del repo
```
code/
├── packages/
│   └── tokens/
│       ├── src/
│       │   ├── primitives/      (color, dimension, typography, shadow, motion, opacity)
│       │   ├── semantic/        (color, space, typography, shadow, motion)
│       │   ├── component/       (button, input, badge, card, alert, avatar, switch)
│       │   └── theme/           (dark, brand-a, brand-b)
│       ├── dist/                (generado por SD)
│       │   ├── tokens.css       (~401 lines, todos los tokens base)
│       │   └── themes/
│       │       ├── dark.css     (~50 vars, [data-theme="dark"])
│       │       ├── brand-a.css  (9 vars, [data-brand="a"], paleta green)
│       │       └── brand-b.css  (9 vars, [data-brand="b"], paleta purple)
│       └── sd.config.mjs
└── angular-app/
    ├── .storybook/
    │   ├── main.ts              (autodocs + staticDirs tokens)
    │   └── preview.ts           (globalTypes Theme/Brand + compodoc setup)
    ├── src/app/design-system/   (8 componentes standalone)
    │   ├── button/  input/  badge/  card/  alert/  avatar/  switch/
    │   └── index.ts             (barrel export)
    └── package.json
```

### Componentes implementados (11)

| Componente | Variantes | Sizes | Stories | Tests |
|---|---|---|---|---|
| Button | primary, secondary, danger, ghost, link | sm/md/lg | 5 | [ ] |
| Input | (type: text/email/password/number/search/url/tel) | sm/md/lg | 7 | [ ] |
| Badge | default, primary, success, warning, danger, info | sm/md | 3 | [ ] |
| Card | default, outlined, elevated | padding none/sm/md/lg | 6 | [ ] |
| Alert | success, warning, danger, info | — | 4 | [ ] |
| Avatar + AvatarGroup | (status: online/offline/busy/away) | xs/sm/md/lg/xl | 7 | [ ] |
| Switch | — | sm/md | 4 | [ ] |
| **Checkbox** | — | sm/md | 6 | [ ] |
| **Radio + RadioGroup** | — | sm/md | 5 | [ ] |
| **Modal / Dialog** | — | sm/md/lg/xl | 5 | [ ] |

### Sistema de tokens

**3 capas**:
1. **Primitives** → valores crudos (`color.blue.500`, `dimension.16`)
2. **Semantic** → propósito (`color.bg.primary`, `space.md`, `radius.lg`)
3. **Component** → API por componente (`button.primary.bg`, `input.md.height`)

**Cascade de tema** (orthogonal):
- `:root` → base light + paleta blue por defecto
- `[data-theme="dark"]` → overrides solo de tokens neutrals/bg/text/border
- `[data-brand="a|b"]` → overrides solo de tokens `*-primary` (green o purple)
- Convivencia: `<html data-theme="dark" data-brand="b">` aplica ambos sin conflicto

### Convenciones del proyecto

- **Prefijo CSS**: `--ds-` (configurado en `sd.config.mjs`)
- **Naming**: kebab-case en CSS, camelCase en JSON keys de SD
- **Componentes**: standalone, prefix `ds-` (e.g., `<ds-button>`)
- **Inputs**: Angular signals (`input()`, `model()`) — no `@Input`
- **Control flow**: `@if`, `@for`, `@switch` — no `*ngIf`/`*ngFor`
- **Outputs**: `outputReferences: true` en SD → `var(--ds-color-blue-500)` no valor resuelto, habilita runtime theming
- **Sync con playground**: cada componente nuevo se suma también a `app.ts` (imports + signals si tiene state) y a `app.html` (sección visible). La app es showroom integral del DS bajo theme/brand activos — Storybook documenta aislado, `app.html` documenta en contexto.

---

## Nivel 1 — Cerrar deuda obvia

**Objetivo**: que el DS sea utilizable para una app real (no solo landing pages) y tenga base mínima de tests.

### 1.1 Tests unitarios por componente

- [ ] **Setup vitest config para Angular** (si aún no funciona out-of-the-box con Angular 21)
- [ ] `button.spec.ts` — renderiza por variante, emite click, respeta disabled/loading
- [ ] `input.spec.ts` — value two-way, aria-invalid con errorMessage, label/id binding
- [ ] `badge.spec.ts` — renderiza dot, todas las variantes
- [ ] `card.spec.ts` — content projection [cardHeader]/[cardFooter], interactive class
- [ ] `alert.spec.ts` — dismiss emite + oculta, role="alert" presente
- [ ] `avatar.spec.ts` — initials computadas correctamente, fallback en imgError
- [ ] `switch.spec.ts` — model two-way, label asociado por id

**Criterio de done**: `npm test` corre 8 spec files, todos green, cobertura mínima por componente del 80% de líneas.

**Notas técnicas**:
- Vitest necesita `@analogjs/vitest-angular` o setup manual con `jsdom`
- Tests cortos — no rebrowse Angular, foco en API pública del componente

### 1.2 Componentes faltantes (orden de prioridad)

#### 1.2.a Checkbox + Radio (alta, ~0.5 día cada uno)

- [x] `checkbox/` — `checked` model, `indeterminate`, `label`, `disabled`, `size`. Indeterminate sincronizado al input nativo vía `effect()` + `viewChild()`. ARIA: `aria-checked="mixed"`. 6 stories.
- [x] `radio/` + `radio-group/` — RadioGroup standalone con `value` model + `name`. Radio se inyecta el group con `inject(RadioGroupComponent, { optional: true })` → funciona standalone o dentro de grupo. 5 stories.

**Tokens nuevos**: `component/checkbox.json` (similar a switch pero más pequeño), `component/radio.json`.

#### 1.2.b Modal / Dialog (alta, ~1 día)

- [x] `modal/` componente standalone con:
  - `<ng-content>` para body y footer
  - Slots `[modalFooter]`
  - `[(open)]` model
  - Cierre por ESC, click en overlay, botón X
  - Focus trap (atrapar Tab dentro del modal)
  - Body scroll lock cuando está abierto
  - Animación de fade + scale
- [x] Sizes: sm/md/lg/xl
- [ ] Service opcional `ModalService` para abrir dinámicamente desde TS (postergar)

**Tokens**: `component/modal.json` (sizes sm/md/lg/xl, overlay-bg, radius, shadow, padding). ✓ Completo.
**Dependencias**: z-index tokens (✓ cumplido en 1.3.a).

#### 1.2.c Select / Combobox (alta, ~2 días)

- [ ] `select/` con:
  - `[options]` (array de `{ value, label, disabled? }`)
  - `[(value)]` model
  - `placeholder`, `size`, `disabled`
  - Trigger con chevron
  - Listbox flotante con keyboard nav (↑↓ Enter Esc Home End)
  - ARIA: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`
- [ ] Variante con search/filter (combobox)
- [ ] Variante multi-select

**Tokens nuevos**: `component/select.json`.
**Requiere**: positioning floating UI — usar `@floating-ui/dom` (no recomendado reinventar).

#### 1.2.d Tabs (media, ~0.5 día)

- [x] `tabs/` + `tab/` con:
  - Variantes: underline, pills, contained
  - `[(activeIndex)]` model
  - Keyboard nav (← →, Home, End)
  - ARIA: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`

**Tokens nuevos**: `component/tabs.json`. ✓ Completo.

#### 1.2.e Tooltip (media, ~0.5 día)

- [ ] `tooltip/` como directiva: `[dsTooltip]="'text'"` o `[dsTooltip]="templateRef"`
- [ ] Placement: top/bottom/left/right + auto
- [ ] Delay configurable (show + hide)
- [ ] Trigger: hover + focus (accesibilidad teclado)

**Tokens nuevos**: `component/tooltip.json`.
**Requiere**: `@floating-ui/dom` (mismo que Select).

#### 1.2.f Toast / Notification (media, ~1 día)

- [ ] `toast/` componente + `ToastService` para invocación programática
- [ ] Variantes: success/warning/danger/info (reutilizan tokens de Alert si suficientes)
- [ ] Posiciones: top-right (default), top-left, top-center, bottom-* (6 zonas)
- [ ] Auto-dismiss con timeout configurable
- [ ] Stacking (múltiples toasts apilados)
- [ ] Acción opcional (botón dentro del toast)

**Tokens nuevos**: `component/toast.json` (puede heredar mucho de alert).
**Requiere**: z-index alto (ver 1.3).

#### 1.2.g Spinner + Skeleton + Progress (baja, ~0.25 día cada uno)

- [ ] `spinner/` — círculo girando, sizes xs/sm/md/lg
- [ ] `skeleton/` — bloque pulsante, props: `width`, `height`, `radius`, `shape: 'text' | 'rect' | 'circle'`
- [ ] `progress/` — barra de progreso determinada (con value) o indeterminada

**Tokens nuevos**: `component/spinner.json`, `component/skeleton.json`, `component/progress.json`.

#### 1.2.h Componentes opcionales (sumar después)

- [ ] Accordion / Collapsible
- [ ] Breadcrumbs
- [ ] Pagination
- [ ] Stepper
- [ ] Menu / Dropdown (similar a Select pero para acciones, no selección)
- [ ] Slider (range input)
- [ ] DatePicker (complejo — considerar wrapping de librería existente)

### 1.3 Tokens faltantes

#### 1.3.a Z-index — **crítico para Modal/Tooltip/Toast**

- [x] `semantic/z-index.json`:
  ```json
  {
    "z-index": {
      "hide":     { "value": "-1" },
      "auto":     { "value": "auto" },
      "base":     { "value": "0" },
      "docked":   { "value": "10" },
      "dropdown": { "value": "1000" },
      "sticky":   { "value": "1020" },
      "banner":   { "value": "1030" },
      "overlay":  { "value": "1040" },
      "modal":    { "value": "1050" },
      "popover":  { "value": "1060" },
      "skiplink": { "value": "1070" },
      "toast":    { "value": "1080" },
      "tooltip":  { "value": "1090" }
    }
  }
  ```

#### 1.3.b Breakpoints

- [ ] `semantic/breakpoint.json`:
  ```json
  {
    "breakpoint": {
      "sm":  { "value": "640px"  },
      "md":  { "value": "768px"  },
      "lg":  { "value": "1024px" },
      "xl":  { "value": "1280px" },
      "2xl": { "value": "1536px" }
    }
  }
  ```
- [ ] Documentar convención: mobile-first, usar `@media (min-width: var(--ds-breakpoint-md))`

#### 1.3.c Motion adicional

- [ ] Sumar a `primitives/motion.json`:
  - `delay`: 0, 75, 100, 150, 200, 300 (ms)
  - Easings adicionales: `bounce`, `back-in`, `back-out`

#### 1.3.d Density tokens (opcional, postergar)

- [ ] Convención `[data-density="compact"]` con overrides de heights y paddings — solo si aparece la necesidad.

---

## Nivel 2 — Calidad profesional

**Objetivo**: confianza para que el DS pueda ser mantenido por equipo (no solo por su autor).

### 2.1 Visual regression testing

**Decisión a tomar**: ver **Decisiones pendientes**.

#### Opción A — Chromatic (recomendada para empezar)
- [ ] Crear cuenta en chromatic.com (free tier: 5000 snapshots/mes)
- [ ] `npm i -D chromatic`
- [ ] Script: `"chromatic": "chromatic --project-token=$CHROMATIC_TOKEN"`
- [ ] Workflow GitHub Actions corre Chromatic en cada PR
- [ ] Cada diff visual se aprueba/rechaza desde UI de Chromatic

#### Opción B — Playwright snapshots (gratis, más manual)
- [ ] `npm i -D @storybook/test-runner @playwright/test`
- [ ] `test-storybook --ci` con plugin de snapshots
- [ ] Snapshots commiteados en `__snapshots__/`
- [ ] Diff manual reviewable en PR

**Criterio de done**: PR que cambia visualmente un componente falla CI hasta aprobar el diff.

### 2.2 Accessibility en CI

- [ ] `npm i -D @storybook/test-runner axe-playwright`
- [ ] Configurar `test-runner.ts`:
  ```ts
  import { injectAxe, checkA11y } from 'axe-playwright';
  export default {
    async preVisit(page) { await injectAxe(page); },
    async postVisit(page) { await checkA11y(page, '#storybook-root'); },
  };
  ```
- [ ] Script: `"test:a11y": "test-storybook --ci"`
- [ ] Workflow GH Actions corre en cada PR
- [ ] Documentar excepciones (e.g., decisiones de diseño que conscientemente no cumplen — debería ser raro)

**Criterio de done**: violaciones de WCAG AA fallan el build.

### 2.3 Linting para forzar uso de tokens

#### Stylelint con allowlist de tokens

- [ ] `npm i -D stylelint stylelint-config-standard`
- [ ] `.stylelintrc.json`:
  ```json
  {
    "extends": "stylelint-config-standard",
    "rules": {
      "color-no-hex": true,
      "declaration-property-value-allowed-list": {
        "/^color$|^background-color$|^border.*color$|^fill$|^stroke$/": [
          "/^var\\(--ds-/",
          "currentColor",
          "transparent",
          "inherit",
          "initial",
          "unset"
        ]
      }
    },
    "ignoreFiles": ["src/styles.scss", "**/*.stories.ts"]
  }
  ```
- [ ] Script: `"lint:css": "stylelint 'src/**/*.{css,scss}'"`
- [ ] Pre-commit hook con `lint-staged`

#### ESLint custom rule (opcional, más ambicioso)
- [ ] Rule custom que detecta `style="color: ..."` inline con hex literals → error

**Criterio de done**: PR con `color: #fff` hardcodeado falla lint.

### 2.4 Bundle size budget

- [ ] `npm i -D size-limit @size-limit/preset-big-lib`
- [ ] `.size-limit.json`:
  ```json
  [
    { "path": "dist/angular-app/main-*.js",   "limit": "150 KB" },
    { "path": "dist/angular-app/styles-*.css", "limit": "30 KB" }
  ]
  ```
- [ ] Script: `"size": "size-limit"`
- [ ] CI workflow corre en cada PR
- [ ] Cuando se publique como librería (Nivel 3), budget por componente individualmente

**Criterio de done**: PR que aumenta bundle más allá del límite falla CI.

### 2.5 Documentación de tokens (no solo componentes)

- [ ] Story MDX `tokens/Colors.mdx` con grid visual de todas las paletas
- [ ] Story MDX `tokens/Spacing.mdx` con escala de espaciado
- [ ] Story MDX `tokens/Typography.mdx` con tabla de heading 1-6 + body + label
- [ ] Story MDX `tokens/Shadow.mdx`
- [ ] Story MDX `tokens/Motion.mdx` con previews animados

**Criterio de done**: sección "Tokens" en Storybook con 5 páginas navegables.

### 2.6 Pre-commit hooks

- [ ] `npm i -D husky lint-staged`
- [ ] `npx husky init`
- [ ] `lint-staged` corre: stylelint, eslint, vitest related, type-check
- [ ] Pre-push hook: build completo

**Criterio de done**: commit con código que no pasa lint es rechazado localmente.

---

## Nivel 3 — Distribución y consumo

**Objetivo**: que otras apps puedan consumir el DS como dependencia versionada.

### 3.1 Monorepo workspace

**Decisión a tomar**: ver **Decisiones pendientes** (pnpm vs Nx vs Turborepo).

#### Migración recomendada (pnpm workspaces + Turborepo)

- [ ] Inicializar pnpm workspaces:
  ```
  code/
  ├── pnpm-workspace.yaml
  ├── package.json (root con workspaces)
  ├── turbo.json
  ├── packages/
  │   ├── tokens/             (ya existe — solo renombrar a @acme/tokens)
  │   ├── ui-angular/         (nuevo, ex angular-app/src/app/design-system)
  │   └── eslint-config/      (opcional, configs compartidas)
  └── apps/
      ├── docs-storybook/     (Storybook standalone consumiendo @acme/ui-angular)
      └── playground/         (ex angular-app, demo app)
  ```
- [ ] Migrar `angular-app/src/app/design-system/` → `packages/ui-angular/src/lib/`
- [ ] Crear `packages/ui-angular/package.json` con peerDependencies (`@angular/core`, etc.)
- [ ] Actualizar imports en `playground/` para usar `@acme/ui-angular`
- [ ] `turbo.json` con pipeline:
  ```json
  {
    "tasks": {
      "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
      "test":  { "dependsOn": ["^build"] },
      "lint":  {},
      "storybook": { "cache": false, "persistent": true }
    }
  }
  ```

**Criterio de done**: `pnpm build` desde root construye tokens → ui-angular → playground en ese orden, con cache.

### 3.2 Librería publicable con ng-packagr

- [ ] `ng generate library ui-angular` (dentro del workspace)
- [ ] `ng-package.json` config con `outputPath: dist/ui-angular`
- [ ] `public-api.ts` barrel exportando todos los componentes + tipos
- [ ] `package.json` de la lib con:
  - `peerDependencies`: `@angular/core`, `@angular/common`, `@angular/forms`
  - `dependencies`: `@floating-ui/dom` (cuando agreguemos Select/Tooltip)
  - `exports` field para tree-shaking
- [ ] `npm pack` genera tarball válido
- [ ] Test: instalar el tarball en un proyecto Angular limpio y verificar que funciona

**Criterio de done**: `npm publish --dry-run` sale sin errores, tarball pesa < 100KB ungzipped.

### 3.3 Versionado con Changesets

- [ ] `pnpm add -D @changesets/cli -w`
- [ ] `npx changeset init`
- [ ] Configurar `.changeset/config.json`:
  ```json
  {
    "$schema": "https://unpkg.com/@changesets/config/schema.json",
    "changelog": "@changesets/cli/changelog",
    "commit": false,
    "fixed": [],
    "linked": [["@acme/tokens", "@acme/ui-angular"]],
    "access": "public",
    "baseBranch": "main"
  }
  ```
- [ ] Workflow GH Actions `release.yml`:
  - PR con changesets pendientes → abre PR de "Version Packages"
  - Merge de ese PR → publica a npm
- [ ] Documentar convención: cada PR con cambio user-facing debe sumar un `.changeset/*.md` (patch/minor/major)

**Criterio de done**: merge a main de PR con changesets publica versión nueva automáticamente.

### 3.4 Tokens también en TypeScript

- [ ] Agregar platform en `sd.config.mjs`:
  ```js
  js: {
    transformGroup: 'js',
    buildPath: 'dist/',
    files: [
      { destination: 'tokens.js',    format: 'javascript/es6' },
      { destination: 'tokens.d.ts',  format: 'typescript/es6-declarations' }
    ]
  }
  ```
- [ ] Exports tree-shakeable:
  ```ts
  import { colorPrimary500 } from '@acme/tokens';
  ```
- [ ] Documentar casos de uso: canvas, charts, animaciones programáticas en TS

**Criterio de done**: autocomplete en VSCode al importar de `@acme/tokens`.

### 3.5 Documentación de migración / consumo

- [ ] `packages/ui-angular/README.md` con install + uso básico
- [ ] `apps/docs-storybook/` con páginas MDX de:
  - Getting started
  - Theming guide
  - Migration guide (de v0.x a v1.x cuando aplique)
  - Contributing

---

## Nivel 4 — Escalado real (mes+)

**Objetivo**: convertirlo en un DS corporativo (escala Material / Polaris / Carbon).

### 4.1 Multi-framework via Web Components

**Decisión clave**: solo si hay ≥2 frameworks objetivo. Caso contrario, sobre-ingeniería.

#### Stack recomendado: Lit

- [ ] Crear `packages/ui-core/` con componentes en Lit
- [ ] Cada componente como `<ds-button>` web component nativo
- [ ] Tokens (CSS variables) ya son agnósticos — no requieren cambios
- [ ] Adaptadores delgados:
  - `packages/ui-react/` — wrappers React con `@lit/react`
  - `packages/ui-vue/` — wrappers Vue
  - `packages/ui-angular/` — wrappers Angular (CUSTOM_ELEMENTS_SCHEMA + types)

#### Alternativa: Stencil

- Stencil genera adaptadores automáticos para React/Vue/Angular
- Más opinionado, mejor DX para multi-framework
- Cons: build chain más complejo, lock-in

**Criterio de done**: componente único en Lit usable como `<ds-button>` en HTML puro, `<DsButton>` en React, `[ds-button]` en Angular template.

### 4.2 Multi-platform (mobile)

**Decisión clave**: solo si hay apps nativas iOS/Android.

- [ ] Agregar platforms en SD:
  ```js
  ios: {
    transformGroup: 'ios-swift',
    buildPath: 'dist/ios/',
    files: [{ destination: 'Tokens.swift', format: 'ios-swift/class.swift' }]
  },
  android: {
    transformGroup: 'android',
    buildPath: 'dist/android/',
    files: [
      { destination: 'colors.xml',     format: 'android/colors' },
      { destination: 'dimensions.xml', format: 'android/dimens' }
    ]
  }
  ```
- [ ] Workflow GH Actions publica tokens a repos nativos (push a `tokens-ios`, `tokens-android`)

**Criterio de done**: cambio en `primitives/color.json` genera commit en repo iOS/Android.

### 4.3 Sync bidireccional con Figma

- [ ] **Token Studio** (plugin Figma) configurado en el archivo de design
- [ ] Token Studio sync con GitHub:
  - Diseñador edita token en Figma
  - Push genera PR en este repo con cambio en `src/primitives/*.json`
  - CI builda → preview en Chromatic
  - Merge → publica nueva versión
- [ ] Documentar workflow para diseñadores

**Criterio de done**: cambio de color en Figma genera PR automático en GitHub en menos de 1 min.

### 4.4 Theme builder UI (opcional, baja prioridad)

- [ ] Página MDX en Storybook con:
  - Sliders de hue/saturation/lightness para color primario
  - Selector de fuente
  - Selector de radius scale
  - Preview en vivo de componentes
  - Botón "Export theme.json"
- [ ] Generador toma valores → produce JSON compatible con SD `src/theme/`

**Criterio de done**: usuario sin conocer SD puede generar una marca nueva desde UI.

### 4.5 Modos extra: High contrast / Density / RTL

#### High contrast (WCAG AAA)
- [ ] `src/theme/high-contrast.json` — overrides con ratios 7:1 en lugar de 4.5:1
- [ ] Selector `[data-contrast="high"]`
- [ ] Documentar combinaciones soportadas

#### Density modes
- [ ] `src/theme/density-compact.json` — overrides de heights/paddings (-2px en buttons, -4px en inputs, etc.)
- [ ] `src/theme/density-spacious.json` — opcional, +2px/+4px
- [ ] Selector `[data-density="compact|spacious"]`

#### RTL
- [ ] Migrar CSS a logical properties (`padding-inline-start` en lugar de `padding-left`)
- [ ] Soporte `dir="rtl"` en `<html>`
- [ ] Tests visuales en ambas direcciones

**Criterio de done**: app puede correr con `<html data-theme="dark" data-brand="b" data-contrast="high" data-density="compact" dir="rtl">` sin bugs visuales.

### 4.6 Patterns / Templates / Recipes

- [ ] `apps/docs-storybook/patterns/` con composiciones:
  - Login form
  - Settings panel
  - Data table layout
  - Dashboard skeleton
  - Empty state
  - Error states (404, 500, network)
  - Onboarding flow
- [ ] Cada pattern como story compuesta, no como componente nuevo

---

## Orden recomendado de ataque

Optimizado por ROI inmediato y dependencias:

### Fase 1 (semana 1-2): Hacer el DS realmente usable
1. **1.3.a** Z-index tokens (bloquea Modal/Tooltip/Toast)
2. **1.2.a** Checkbox + Radio (alta frecuencia de uso)
3. **1.2.b** Modal/Dialog (requisito de apps reales)
4. **1.2.d** Tabs
5. **1.2.c** Select/Combobox (el más complejo, hacer después de Tabs)
6. **1.1** Tests unitarios de los 8 componentes existentes + nuevos

### Fase 2 (semana 3): Componentes secundarios y calidad
7. **1.2.e** Tooltip (requiere @floating-ui — mismo que Select)
8. **1.2.f** Toast
9. **1.2.g** Spinner + Skeleton + Progress
10. **2.2** A11y en CI (cuando hay base de componentes amplia)
11. **2.5** Docs de tokens en Storybook

### Fase 3 (semana 4): Confianza para el equipo
12. **2.3** Stylelint para forzar tokens
13. **2.6** Pre-commit hooks
14. **2.1** Visual regression (Chromatic free tier)
15. **2.4** Bundle budget

### Fase 4 (semana 5-6): Distribución
16. **3.1** Monorepo (pnpm workspaces + Turborepo)
17. **3.2** ng-packagr para publicar @acme/ui-angular
18. **3.4** Tokens TypeScript
19. **3.3** Changesets + GH Actions release
20. **3.5** Docs de migración

### Fase 5 (mes+): Escalado avanzado
- Lo de Nivel 4 solo cuando hay necesidad concreta — no por completitud.

---

## Anti-patrones a evitar

- **No agregar Web Components todavía**. Stencil/Lit suman complejidad sin valor mientras solo haya un consumidor Angular.
- **No saltar a Nx hasta tener ≥5 packages**. pnpm workspaces es suficiente.
- **No documentar componentes que aún no existen**. Storybook se desactualiza solo si la doc va por detrás.
- **No usar Material Angular como base**. Va contra el ejercicio de aprendizaje y agrega dependencias pesadas.
- **No crear DatePicker propio**. Wrapping de `flatpickr` o `vanilla-calendar` es más realista que construir uno desde cero.
- **No usar `!important` ni override por especificidad**. Si un token no alcanza, sumar uno nuevo en lugar de hackear CSS.
- **No commitear `documentation.json`**. Es generado por compodoc, debe estar en `.gitignore`.

---

## Decisiones pendientes (requieren input antes de avanzar)

### D1. Visual regression: ¿Chromatic o Playwright?

- **Chromatic**: paid (free tier 5000 snapshots/mes), UI excelente, integración nativa con Storybook. Setup en 15 min.
- **Playwright**: gratis, snapshots como archivos en repo, diff manual. Setup en 1-2 hs, más control.

**Recomendación**: arrancar con Chromatic free tier. Migrar a Playwright si se excede el límite.

### D2. Monorepo: ¿pnpm workspaces + Turborepo o Nx?

- **pnpm + Turborepo**: setup mínimo, control directo de build pipeline, fácil de explicar.
- **Nx**: generators, affected, graph visual, plugins. Curva más alta, lock-in mayor.

**Recomendación**: pnpm + Turborepo. Pasar a Nx si el equipo crece y se necesitan generators custom.

### D3. Multi-framework: ¿se va a usar React/Vue alguna vez?

- Si la respuesta es **no claro**: postponer Nivel 4.1 indefinidamente.
- Si **sí en los próximos 6 meses**: empezar a planear Web Components base ya en Nivel 3.

### D4. Naming de paquetes

- **Convención propuesta**: `@acme/tokens`, `@acme/ui-angular`. Definir el scope real (`@acme` es placeholder).
- Si va a npm público: scope debe estar registrado.

### D5. Versionado: ¿lockstep o independiente?

- **Lockstep**: todos los packages bumpean a la misma versión (más simple, menos preciso).
- **Independiente**: cada package versiona solo (más correcto, más complejo).

**Recomendación**: lockstep con `linked` en Changesets. Pasar a independiente si los packages divergen mucho en frecuencia de cambio.

---

## Métricas para validar progreso

Cada vez que termines un nivel, chequear:

| Nivel | Métrica de éxito |
|---|---|
| 1 | App real puede construirse 100% con componentes del DS (sin componentes ad-hoc) |
| 2 | Otro dev hace PR cambiando un componente y el CI lo bloquea/aprueba sin tu intervención |
| 3 | App externa instala `@acme/ui-angular` y la usa sin mirar el código fuente del DS |
| 4 | Cambio de token en Figma llega a producción en < 5 minutos sin código manual |

---

## Recursos de referencia

- **Style Dictionary v4 docs**: https://styledictionary.com/
- **Storybook Angular**: https://storybook.js.org/docs/get-started/install?renderer=angular
- **Changesets**: https://github.com/changesets/changesets
- **ng-packagr**: https://github.com/ng-packagr/ng-packagr
- **Floating UI**: https://floating-ui.com/ (positioning para Select/Tooltip/Popover)
- **Chromatic**: https://www.chromatic.com/
- **Token Studio**: https://tokens.studio/
- **Diseño accesible**: https://www.w3.org/WAI/ARIA/apg/ (WAI-ARIA Authoring Practices)

---

**Última actualización**: 2026-05-23
**Estado del DS**: 12 componentes (Button, Input, Badge, Card, Alert, Avatar, Switch, Checkbox, Radio, Modal, Tabs), 3-layer tokens, dark mode, multi-brand (2 brands), z-index tokens, Storybook con toolbars, 0 tests, 0 distribución, single-app consumer.

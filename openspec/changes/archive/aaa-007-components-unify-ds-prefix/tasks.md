# Tasks — CHG-007 — Unify Ds prefix

Cada tarea es ≤2 h y tiene criterio de aceptación binario.

## 1. Pre-flight: capturar surface

- [x] 1.1 Ejecutar `grep -rln "rmd-\|RmdButton\|ButtonComponent\|CheckboxComponent\|ButtonVariant\|ButtonSize\|CheckboxSize" --include="*.ts" --include="*.html" --include="*.css" --include="*.json" --include="*.md" packages/ apps/ docs/ CLAUDE.md README.md 2>&1 | grep -v "dist/" | grep -v ".angular/cache/" | grep -v "openspec/changes/archive" | grep -v "docs/reference/"` y registrar la lista esperada de archivos a tocar. Sirve como baseline; el mismo grep post-apply debe devolver vacío (salvo ADR-003/004/005 cuyas menciones son históricas e inmutables, y el archivo `decisions-log.md` que mantiene refs históricas)

**Criterio**: lista de archivos baseline capturada en mental model; sin modificar nada todavía.

## 2. Rename Button (class + types + selector)

- [x] 2.1 Editar `packages/components/src/lib/button/button.component.ts`:
  - `export class ButtonComponent` → `export class DsButton`
  - `export type ButtonVariant` → `export type DsButtonVariant`
  - `export type ButtonSize` → `export type DsButtonSize`
  - `selector: 'rmd-button'` → `selector: 'ds-button'`
  - Actualizar typings internos del input (`input<ButtonVariant>` → `input<DsButtonVariant>`, idem `DsButtonSize`)
- [x] 2.2 Editar `packages/components/src/lib/button/index.ts`:
  - `export { ButtonComponent, type ButtonVariant, type ButtonSize } from './button.component';` → `export { DsButton, type DsButtonVariant, type DsButtonSize } from './button.component';`
- [x] 2.3 Editar `packages/components/src/lib/button/button.component.spec.ts`:
  - `import { ButtonComponent }` → `import { DsButton }`
  - `describe('ButtonComponent', ...)` → `describe('DsButton', ...)`
  - `ComponentFixture<ButtonComponent>` → `ComponentFixture<DsButton>`
  - `imports: [ButtonComponent]` → `imports: [DsButton]`
  - `TestBed.createComponent(ButtonComponent)` → `TestBed.createComponent(DsButton)`
- [x] 2.4 Editar `packages/components/src/lib/button/button.stories.ts`:
  - `import { ButtonComponent }` → `import { DsButton }`
  - `Meta<ButtonComponent>` → `Meta<DsButton>`
  - `component: ButtonComponent` → `component: DsButton`
  - `decorators: [moduleMetadata({ imports: [ButtonComponent] })]` → `imports: [DsButton]`
  - `StoryObj<ButtonComponent>` → `StoryObj<DsButton>`
  - Reemplazar todos los `<rmd-button>` por `<ds-button>` en todos los templates de las stories (Default, Variants, Sizes, Disabled)
  - **Mantener** `title: 'Components/Button'` sin prefix (decisión ADR-007: títulos Storybook son etiquetas humanas, no API)

**Criterio**: `grep -rn "ButtonComponent\|ButtonVariant\|ButtonSize\|rmd-button" packages/components/src/lib/button/` devuelve vacío. `grep -rn "DsButton\|ds-button"` muestra solo las nuevas refs.

## 3. Rename Checkbox (class + type + selector)

- [x] 3.1 Editar `packages/components/src/lib/checkbox/checkbox.component.ts`:
  - `export class CheckboxComponent implements ControlValueAccessor` → `export class DsCheckbox implements ControlValueAccessor`
  - `export type CheckboxSize` → `export type DsCheckboxSize`
  - `selector: 'rmd-checkbox'` → `selector: 'ds-checkbox'`
  - Actualizar typing interno del input `size`: `input<CheckboxSize>` → `input<DsCheckboxSize>`
  - Actualizar el `forwardRef(() => CheckboxComponent)` en el provider `NG_VALUE_ACCESSOR` → `forwardRef(() => DsCheckbox)`
- [x] 3.2 Editar `packages/components/src/lib/checkbox/index.ts`:
  - `export { CheckboxComponent, type CheckboxSize } from './checkbox.component';` → `export { DsCheckbox, type DsCheckboxSize } from './checkbox.component';`
- [x] 3.3 Editar `packages/components/src/lib/checkbox/checkbox.component.spec.ts`:
  - `import { CheckboxComponent } from './checkbox.component';` → `import { DsCheckbox } from './checkbox.component';`
  - `describe('CheckboxComponent', ...)` → `describe('DsCheckbox', ...)`
  - Todas las refs a la class type (`ComponentFixture<CheckboxComponent>`, `imports: [CheckboxComponent]`, `TestBed.createComponent(CheckboxComponent)`)
  - Renombrar el host component interno `CheckboxFormHost` → `DsCheckboxFormHost` para consistencia (es interno al spec, sin impacto público)
  - Si el template del host usa `<rmd-checkbox>`, cambiar a `<ds-checkbox>`
  - Si hay `querySelector('rmd-checkbox')` o `querySelector('input[type=checkbox]')`, ajustar los selectores `rmd-checkbox` a `ds-checkbox`
- [x] 3.4 Editar `packages/components/src/lib/checkbox/checkbox.stories.ts`:
  - `import { CheckboxComponent }` → `import { DsCheckbox }`
  - `component: CheckboxComponent` → `component: DsCheckbox`
  - `moduleMetadata({ imports: [CheckboxComponent, ...] })` → `imports: [DsCheckbox, ...]`
  - Reemplazar todos los `<rmd-checkbox>` por `<ds-checkbox>` en todos los templates de las stories (Default, Checked, Indeterminate, Disabled, Sizes, WithRichContent, WithReactiveForm)
  - **Mantener** `title: 'Components/Checkbox'` sin prefix

**Criterio**: `grep -rn "CheckboxComponent\|CheckboxSize\|rmd-checkbox" packages/components/src/lib/checkbox/` devuelve vacío. `grep -rn "DsCheckbox\|ds-checkbox"` muestra solo las nuevas refs.

## 4. Verificar `public-api.ts`

- [x] 4.1 Leer `packages/components/src/public-api.ts` y confirmar que sigue siendo `export * from './lib/button';` + `export * from './lib/checkbox';` (sin cambios — los `export *` re-exportan automáticamente los nuevos nombres desde `index.ts` de cada componente)

**Criterio**: archivo sin cambios; verificación de que el re-export sigue cubriendo todo.

## 5. Actualizar `packages/components/README.md`

- [x] 5.1 Editar `packages/components/README.md`:
  - Sección de ejemplo de uso: `import { ButtonComponent }` → `import { DsButton }`, `imports: [ButtonComponent]` → `imports: [DsButton]`, `<rmd-button ...>` → `<ds-button ...>`
  - Tabla de componentes: `ButtonComponent` → `DsButton`, `rmd-button` → `ds-button` (idem para Checkbox cuando aparezca)
  - Sección "Selector prefix `rmd-`" → reescribir como "Selector prefix `ds-`" y actualizar la justificación apuntando a ADR-007
  - Cualquier otra mención de `rmd-` o `ButtonComponent`/`CheckboxComponent` queda actualizada
  - Mantener referencia a ADR-004 para arquitectura general; sumar referencia a ADR-007 para naming/prefijos

**Criterio**: `grep -n "rmd-\|ButtonComponent\|CheckboxComponent" packages/components/README.md` devuelve vacío.

## 6. Migrar `apps/playground`

- [x] 6.1 Editar `apps/playground/src/app/app.ts`:
  - `import { ButtonComponent } from '@romanmartinidev/components';` → `import { DsButton } from '@romanmartinidev/components';`
  - `import { CheckboxComponent } from '@romanmartinidev/components';` → `import { DsCheckbox } from '@romanmartinidev/components';`
  - Array `imports: [..., ButtonComponent, CheckboxComponent, ...]` → `[..., DsButton, DsCheckbox, ...]`
- [x] 6.2 Editar `apps/playground/src/app/app.html`:
  - Todas las apariciones de `<rmd-button>` → `<ds-button>` (incluyendo cierre `</rmd-button>` → `</ds-button>`)
  - Todas las apariciones de `<rmd-checkbox>` → `<ds-checkbox>`
- [x] 6.3 Editar `apps/playground/src/app/app.spec.ts`:
  - `querySelectorAll('rmd-button')` → `querySelectorAll('ds-button')`
  - `querySelectorAll('rmd-checkbox')` → `querySelectorAll('ds-checkbox')`
  - Actualizar los `expect` strings si mencionan el selector viejo

**Criterio**: `grep -rn "rmd-\|ButtonComponent\|CheckboxComponent" apps/playground/src/` devuelve vacío.

## 7. ADR-007 (nuevo) + nota en ADR-004

- [x] 7.1 Crear `docs/architecture/adr/ADR-007-naming-prefijos.md` en formato MADR con:
  - Frontmatter: ID `ADR-007`, fecha `2026-06-01`, estado `Aceptado`, dominio `frontend / components`, ADRs relacionados `ADR-003, ADR-004`
  - **Contexto**: explicar la disonancia heredada (rmd- selector + --ds-\* CSS + sin prefix en class) y la motivación para unificar
  - **Opciones consideradas** (≥3 con pros/contras): C `Ds` unificado (recomendado), B `rmd-` unificado, D `Ngx<Component>`, E status quo + prefix en class
  - **Decisión**: unificar bajo `Ds` (selector `ds-<name>`, class `Ds<Name>` sin sufijo `Component`, types `Ds<Name><TypeName>`, CSS `--ds-*` sin cambios)
  - **Consecuencias positivas**: agnóstico de marca, un solo prefijo conceptual, convención alineada con Mat/Nz/Tui/Prime, descubrible
  - **Consecuencias negativas**: BREAKING para Button y Checkbox (mitigado: cero consumidores externos), convención divergente del default de `ng generate component`
  - **ADRs relacionados**: supersede §4 (Selector prefix `rmd-`) y §5 (Naming convention, columna Class TypeScript) de ADR-004 en esos puntos específicos. El resto de ADR-004 sigue Aceptado
  - **Open questions registradas**: (1) la convención aplica también a directives/pipes/services públicos futuros — sí, por default; (2) story titles Storybook NO llevan prefix (etiqueta humana)
- [x] 7.2 Editar `docs/architecture/adr/ADR-004-arquitectura-components.md` **agregando al final** (sin modificar el contenido inmutable) una sección `## Nota de supersesión parcial`:
  - Texto: "El 2026-06-01, §4 (Selector prefix `rmd-`) y §5 (columna 'Class TypeScript' de la tabla de naming) fueron superseded por [ADR-007](ADR-007-naming-prefijos.md) en esos puntos específicos. Los demás puntos de este ADR siguen Aceptados."

**Criterio**: ambos archivos existen y la nota en ADR-004 está al final, sin tocar el cuerpo original.

## 8. Actualizar índice + docs vivos

- [x] 8.1 Editar `docs/architecture/decisions-log.md` agregando fila ADR-007:
  - Fecha `2026-06-01`, dominio `frontend`, resumen "Unificación de prefijos bajo `Ds`/`ds-`/`--ds-*`; drop del sufijo `Component` en class TS. Supersede parcial de ADR-004 §4 y §5.", ADR `ADR-007`
- [x] 8.2 Editar `CLAUDE.md`:
  - Buscar cualquier mención del prefix `rmd-` o de `ButtonComponent`/`CheckboxComponent`
  - Actualizar a `ds-` y `DsButton`/`DsCheckbox`
  - Si hay sección "Naming de packages" o similar, sumar referencia a ADR-007 además de ADR-004
- [x] 8.3 Editar `README.md` root: actualizar quickstart / cualquier ref a `rmd-`, `ButtonComponent`, `CheckboxComponent`
- [x] 8.4 Editar `docs/architecture/README.md`: actualizar referencias a prefijo de selectores y a class names
- [x] 8.5 Editar `docs/architecture/FUTURE-WORK.md`: actualizar el header que menciona "realineado al naming y estructura actuales (`rmd-` selectores)" a `ds-`. Revisar el resto del doc por refs a `rmd-`
- [x] 8.6 Editar `docs/architecture/PLAYBOOK.md` si menciona el prefijo o las class names; actualizar
- [x] 8.7 **NO tocar** `docs/architecture/adr/ADR-003-arquitectura-design-tokens.md`, ADR-004 (más allá de la nota final del 7.2), ADR-005, ni `docs/architecture/adr/ADR-006-*` — ADRs aceptados son inmutables; las menciones históricas a `rmd-` se preservan como contexto del momento en que fueron escritos
- [x] 8.8 **NO tocar** archivos en `docs/reference/` — material de investigación no normativo, fuera del scope de este change

**Criterio**: `grep -rn "rmd-\|ButtonComponent\|CheckboxComponent" CLAUDE.md README.md docs/architecture/README.md docs/architecture/FUTURE-WORK.md docs/architecture/PLAYBOOK.md` devuelve vacío.

## 9. Changeset

- [x] 9.1 Crear changeset con `pnpm changeset` (o manualmente si el CLI no está disponible):
  - Bump `@romanmartinidev/components`: `minor` (pre-1.0, convención Changesets permite breaking con minor cuando no se publicó v1.0)
  - Descripción: "BREAKING (pre-1.0): unify prefix under `Ds`. Selectors `rmd-*` → `ds-*`. Class names drop `Component` suffix and add `Ds` prefix (`ButtonComponent` → `DsButton`, `CheckboxComponent` → `DsCheckbox`). Type exports prefixed (`ButtonVariant` → `DsButtonVariant`, etc.). See ADR-007."

**Criterio**: archivo `.changeset/<slug>.md` existe con el bump minor para `@romanmartinidev/components`.

## 10. Validación de cierre

- [x] 10.1 `pnpm openspec validate --changes` pasa para `components-unify-ds-prefix`
- [x] 10.2 `pnpm lint` pasa
- [x] 10.3 `pnpm format` ejecutado + `pnpm format:check` pasa
- [x] 10.4 `pnpm -r build` pasa (tokens + components + playground) sin warnings nuevos
- [x] 10.5 `pnpm -F @romanmartinidev/components exec vitest run` pasa (17/17 tests — 3 Button + 14 Checkbox, todos con los nuevos nombres)
- [x] 10.6 `pnpm -F playground exec vitest run` pasa (3/3 tests con nuevos selectores `ds-*`)
- [x] 10.7 `pnpm -F playground exec ng run playground:build-storybook` pasa; el `storybook-static/index.json` sigue conteniendo `components-button--*` y `components-checkbox--*` (titles no cambian)
- [x] 10.8 `npm pack --dry-run` desde `packages/components/` post-refactor: tarball sigue sin `*.stories.ts` ni `*.spec.ts`; los typings (`dist/types/...`) exponen `DsButton`, `DsCheckbox` y los types `DsButtonVariant`, `DsButtonSize`, `DsCheckboxSize`
- [x] 10.9 `grep -rn "rmd-\|RmdButton\|ButtonComponent\|CheckboxComponent\|ButtonVariant\|ButtonSize\|CheckboxSize" --include="*.ts" --include="*.html" --include="*.css" packages/components/src/ apps/playground/src/` devuelve vacío
- [x] 10.10 `grep -rn "rmd-\|ButtonComponent\|CheckboxComponent" CLAUDE.md README.md docs/architecture/README.md docs/architecture/FUTURE-WORK.md docs/architecture/PLAYBOOK.md packages/components/README.md` devuelve vacío (refs en `docs/architecture/adr/ADR-003/004/005` se mantienen como contexto histórico inmutable)
- [ ] 10.11 Proponer mensaje de commit y esperar OK de Roman (regla: cero commits sin permiso explícito)

**Criterio**: los 10 puntos pasan; Roman aprueba el commit antes de ejecutar.

## 11. Archivar este change

- [ ] 11.1 Mover `openspec/changes/components-unify-ds-prefix/` → `openspec/changes/archive/CHG-007-components-unify-ds-prefix/`
- [ ] 11.2 Sincronizar la spec base `openspec/specs/SPC-003-components-package/spec.md` con los `MODIFIED Requirements` del delta:
  - Requirement "Selector prefix fijo" → versión actualizada con `ds-`
  - Requirement "Naming convention de class y archivo" → versión actualizada con `Ds<Name>` (sin sufijo `Component`) + types con prefix `Ds`
  - Requirement "Componente Checkbox" → scenarios actualizados con `ds-checkbox` y `DsCheckbox`
- [ ] 11.3 Actualizar frontmatter del proposal archivado: `status: archived` + `archived: 2026-06-01`
- [ ] 11.4 Actualizar `openspec/IDS.md`: fila CHG-007 status `archived`, próximo disponible `CHG-008`
- [ ] 11.5 `pnpm openspec validate --all` pasa para 5 specs base
- [ ] 11.6 Proponer mensaje del commit del archive y esperar OK de Roman

**Criterio**: change archivado, requirements sincronizados con SPC-003, openspec valida, commit aprobado.

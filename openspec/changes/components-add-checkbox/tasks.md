# Tasks — CHG-006 — Add Checkbox component

Cada tarea es ≤2 h y tiene criterio de aceptación binario.

## 1. peerDependency @angular/forms

- [ ] 1.1 Agregar `@angular/forms@^21.0.0` a `peerDependencies` en `packages/components/package.json` (alfabéticamente entre `@angular/common` y `@romanmartinidev/tokens`)
- [ ] 1.2 `pnpm install` desde root re-link sin errores

**Criterio**: `cat packages/components/package.json | node -e "const p=JSON.parse(require('fs').readFileSync(0)); console.log(p.peerDependencies)" ` muestra `@angular/forms`.

## 2. CheckboxComponent

- [ ] 2.1 Crear directorio `packages/components/src/lib/checkbox/`
- [ ] 2.2 Crear `checkbox.component.ts` con: standalone, OnPush, `providers: NG_VALUE_ACCESSOR` con forwardRef, signals `checked: model<boolean>(false)`, `disabled: model<boolean>(false)`, `indeterminate: input<boolean>(false)`, `label: input<string>('')`, `size: input<'sm' | 'md' | 'lg'>('md')`, `viewChild.required<ElementRef<HTMLInputElement>>('inputEl')`, `effect()` que sincroniza `indeterminate()` al `nativeElement.indeterminate`, métodos CVA (`writeValue`, `registerOnChange`, `registerOnTouched`, `setDisabledState`), método `handleInput(event)` que actualiza model + llama onChange + onTouched. Tipos `CheckboxSize` exportado
- [ ] 2.3 Crear `checkbox.component.css` con `:host` flex inline, `input[type=checkbox]` con `appearance: none`, sizes via `[data-size]` attribute selector, estados `:checked`, `:indeterminate`, `:focus-visible` (consume `var(--ds-semantic-shadow-focus)`), `:disabled`. Variables `--ds-semantic-*` exclusivamente
- [ ] 2.4 Crear archivo separado `checkbox.component.html` (alineado con `Button` de CHG-003 que también usa `templateUrl`) con `<label>` que envuelve `<input #inputEl>` + `<span class="label"><ng-content>{{ label() }}</ng-content></span>`. Atributos `[checked]`, `[disabled]`, `[attr.aria-checked]`, `[attr.data-size]`, `(change)="handleInput($event)"`. Referenciarlo desde el component con `templateUrl: './checkbox.component.html'`
- [ ] 2.5 Crear `index.ts` con `export { CheckboxComponent, type CheckboxSize } from './checkbox.component';`
- [ ] 2.6 Actualizar `src/public-api.ts` agregando `export * from './lib/checkbox';`

**Criterio**: TypeScript compila (`pnpm -F @romanmartinidev/components build` pasa); CheckboxComponent es importable desde el package.

## 3. Tests Vitest

- [ ] 3.1 Crear `checkbox.component.spec.ts` con TestBed standalone + Vitest. Imports: `ComponentFixture`, `TestBed`, `describe`, `it`, `expect`, `beforeEach`, `vi`, `FormControl`, `ReactiveFormsModule`. **Crítico**: en cada spec, llamar `fixture.detectChanges()` ANTES de acceder al `inputEl` via `fixture.nativeElement.querySelector('input')` o al componente — `viewChild.required` lanza error si se accede antes del primer change detection. Specs:
  - `creates the component`
  - `renders <input type="checkbox">` con type correcto
  - `[(checked)] two-way binding works` — click toggle
  - `writeValue updates checked state`
  - `registerOnChange fires on toggle`
  - `setDisabledState propaga al input`
  - `indeterminate sets aria-checked="mixed"` — verificar `input.indeterminate === true` post `fixture.detectChanges()` (effect corre fuera de zone, puede requerir `await fixture.whenStable()`)
  - `respects disabled — no toggle on click cuando disabled=true`
  - `label string fallback shown when no projected content`
- [ ] 3.2 Ejecutar `pnpm -F @romanmartinidev/components exec vitest run` — debe reportar `4 passed (Button) + 9 passed (Checkbox) = 13/13 passing`

**Criterio**: 13/13 tests passing.

## 4. Storybook story co-ubicada

- [ ] 4.1 Crear `checkbox.stories.ts` con CSF 3. **Nota**: estas stories son **documentación visual**, no contratos testables. Los contratos viven en `spec.md`; las stories ilustran. Contenido:
  - `meta` con `title: 'Components/Checkbox'`, `component: CheckboxComponent`, `tags: ['autodocs']`, `argTypes` para `checked`, `indeterminate`, `disabled`, `size`, `label`, args defaults
  - `Default` story
  - `Checked` story con `args: { checked: true }`
  - `Indeterminate` story con `args: { indeterminate: true }`
  - `Disabled` story con grid de variantes disabled
  - `Sizes` story con grid de sm/md/lg
  - `WithRichContent` story que usa template con `<a>` dentro del slot — demo del label slot
  - `WithReactiveForm` story con `decorators: [moduleMetadata({ imports: [CheckboxComponent, ReactiveFormsModule] })]` + template con `[formControl]="ctrl"` — demo visual del CVA, complementa la cobertura del spec scenario "integración con FormControl reactivo"

**Criterio**: `pnpm -F playground exec ng run playground:build-storybook` pasa; al inspeccionar `storybook-static/index.json` SHALL contener `components-checkbox--default`, `components-checkbox--checked`, etc.

## 5. Demo en playground

- [ ] 5.1 Editar `apps/playground/src/app/app.ts` para sumar `CheckboxComponent` (y `FormsModule`/`ReactiveFormsModule` si la demo usa form) al array `imports`
- [ ] 5.2 Editar `apps/playground/src/app/app.html` agregando una sección `<section class="playground__section">` titulada "Checkbox" con: 3 checkboxes (default unchecked, checked, indeterminate), sección de sizes (3 variantes), un `WithReactiveForm` demo (opcional pero ayuda a validar end-to-end)

**Criterio**: `pnpm -F playground build` pasa; el HTML bundleado contiene al menos 5 `<rmd-checkbox>` (3 estados + 3 sizes).

## 6. Test del playground

> **Nota**: estos tests son verificación **operativa** del consumo end-to-end del Checkbox en una app real, no contratos del sistema (los contratos viven en SPC-003). El spec SPC-004 (playground-app) NO se modifica.

- [ ] 6.1 Editar `apps/playground/src/app/app.spec.ts` para sumar test que verifica que al menos 1 `<rmd-checkbox>` está en el DOM renderizado
- [ ] 6.2 `pnpm -F playground exec vitest run` debe reportar `3/3 passing` (creates + renders button + renders checkbox)

**Criterio**: 3/3 tests playground passing.

## 7. Changeset

- [ ] 7.1 Crear changeset preferentemente con el CLI interactivo: `pnpm changeset` (seleccionar `@romanmartinidev/components` → bump `minor` → descripción del feature). Si por alguna razón el CLI no está disponible, fallback: crear manualmente `.changeset/checkbox-component.md`:

  ```
  ---
  '@romanmartinidev/components': minor
  ---

  feat: add Checkbox component with ControlValueAccessor full support, 3 sizes (sm/md/lg), label slot or string input, ARIA `aria-checked="mixed"` for indeterminate state.
  ```

**Criterio**: archivo `.changeset/<nombre>.md` existe con el bump minor para `@romanmartinidev/components`. CHG-005 `pr.yml` changeset enforcement pasa al simular el PR.

## 8. Cleanup operativo

- [ ] 8.1 Borrar `docs/bootstrap-plan.md` con `git rm docs/bootstrap-plan.md` (su rol terminó al cerrar Fase 5; el propio documento lo dice en su última línea)
- [ ] 8.2 Verificar que NO quedan referencias rotas en docs vivos: `grep -rn "bootstrap-plan" --include="*.md" docs/ CLAUDE.md CONTRIBUTING.md README.md 2>&1` debe devolver vacío (matches en `openspec/changes/archive/` son historia inmutable — OK que mencionen el plan)

**Criterio**: el archivo no existe; el grep en docs vivos devuelve vacío.

## 9. Validación de cierre

- [ ] 9.1 `openspec validate --changes` pasa para `components-add-checkbox`
- [ ] 9.2 `pnpm lint` pasa
- [ ] 9.3 `pnpm format:check` pasa (formatear si necesario)
- [ ] 9.4 `pnpm -r build` pasa (tokens + components + playground)
- [ ] 9.5 `pnpm -F @romanmartinidev/components exec vitest run` pasa (Button 3/3 + Checkbox ≥9 = 12/12 ó más)
- [ ] 9.6 `pnpm -F playground exec vitest run` pasa (al menos 3/3)
- [ ] 9.7 `pnpm -F playground exec ng run playground:build-storybook` pasa; Checkbox stories visibles en `storybook-static/index.json`
- [ ] 9.8 `npm pack --dry-run` desde `packages/components/` post-Checkbox: tarball sigue sin incluir `*.stories.ts` ni `*.spec.ts` (verificación de `files` + `tsconfig.lib.json exclude` siguen aplicando)
- [ ] 9.9 Proponer mensaje de commit y esperar OK de Roman (regla: cero commits sin permiso explícito)

**Criterio**: los 9 puntos pasan; Roman aprueba el commit antes de ejecutar.

## 10. Archivar este change

- [ ] 10.1 Mover `openspec/changes/components-add-checkbox/` → `openspec/changes/archive/CHG-006-components-add-checkbox/`
- [ ] 10.2 Promover los `ADDED Requirements` del delta a la spec base `openspec/specs/SPC-003-components-package/spec.md` (agregar requirement "Componente Checkbox" + "@angular/forms peerDependency" después de los requirements existentes)
- [ ] 10.3 Actualizar frontmatter del proposal archivado: `status: archived` + `archived: 2026-06-XX`
- [ ] 10.4 Actualizar `openspec/IDS.md`: fila CHG-006 status `archived`, próximo disponible `CHG-007`
- [ ] 10.5 `openspec validate --all` pasa para 5 specs base
- [ ] 10.6 Proponer mensaje del commit del archive y esperar OK de Roman

**Criterio**: change archivado, requirements promovidos a SPC-003, openspec valida, commit aprobado.

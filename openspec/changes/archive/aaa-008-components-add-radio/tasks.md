# Tasks — aaa-008 — Add Radio + RadioGroup

Cada tarea es ≤2 h y tiene criterio de aceptación binario.

## 1. Pre-flight

- [ ] 1.1 Verificar que `@angular/forms@^21.0.0` ya está en `peerDependencies` de `packages/components/package.json` (debe estar desde aaa-006). Si no está, sumar.
- [ ] 1.2 Confirmar que no hay carpetas previas `packages/components/src/lib/radio/` ni `radio-group/` (cero conflictos con código existente).

**Criterio**: `cat packages/components/package.json | grep '"@angular/forms"'` muestra `^21.0.0`. `ls packages/components/src/lib/` no contiene `radio` ni `radio-group`.

## 2. DsRadioGroup component

- [ ] 2.1 Crear directorio `packages/components/src/lib/radio-group/`.
- [ ] 2.2 Crear `radio-group.component.ts` con: standalone, OnPush, `providers: NG_VALUE_ACCESSOR` con `forwardRef`, signals `value: model<unknown>(null)`, `disabled: model<boolean>(false)`, `name: input<string>(auto-generado con counter estático)`. Implementa `ControlValueAccessor` (`writeValue`, `registerOnChange`, `registerOnTouched`, `setDisabledState`). Expone método interno para los `DsRadio` hijos: `selectValue(v: unknown)`, getter `isSelected(v: unknown)`, getter `disabledForChild()`, getter `nameForChild()`.
- [ ] 2.3 Crear `radio-group.component.html` con `<div role="radiogroup" [attr.aria-label]="..." [attr.aria-labelledby]="...">` + `<ng-content>` para proyectar los `DsRadio` hijos.
- [ ] 2.4 Crear `radio-group.component.css` con `:host` flex column gap usando `var(--ds-semantic-space-*)`.
- [ ] 2.5 Crear `radio-group.component.ts` con keydown listener en el host (`@HostListener('keydown', ['$event'])`): ArrowRight/ArrowDown → siguiente habilitado + select, ArrowLeft/ArrowUp → anterior, Home → primero, End → último. Saltar deshabilitados.
- [ ] 2.6 Crear `index.ts` con `export { DsRadioGroup } from './radio-group.component';`.
- [ ] 2.7 Actualizar `packages/components/src/public-api.ts` agregando `export * from './lib/radio-group';`.

**Criterio**: TypeScript compila (`pnpm -F @romanmartinidev/components build` pasa). `DsRadioGroup` importable desde el package.

## 3. DsRadio component

- [ ] 3.1 Crear directorio `packages/components/src/lib/radio/`.
- [ ] 3.2 Crear `radio.component.ts` con: standalone, OnPush, `inject(DsRadioGroup, { optional: true })` para inyectar el group ancestro. Signals/inputs: `value: input.required<unknown>()`, `disabled: input<boolean>(false)`, `label: input<string>('')`, `size: input<DsRadioSize>('md')`, output `selected = output<unknown>()`. Exportar `type DsRadioSize = 'sm' | 'md' | 'lg'`. Métodos: `isSelected()` lee del group si existe, `isDisabled()` combina `group.disabledForChild() || this.disabled()`, `nameAttr()` lee del group si existe, `handleClick()` que delega al group si existe sino emite `selected`.
- [ ] 3.3 Crear `radio.component.html` con `<label>` que envuelve `<input #inputEl type="radio" [name]="nameAttr()" [checked]="isSelected()" [disabled]="isDisabled()" [attr.aria-checked]="isSelected()" [attr.data-size]="size()" (change)="handleClick()">` + `<span class="label"><ng-content>{{ label() }}</ng-content></span>`.
- [ ] 3.4 Crear `radio.component.css` con `:host` flex inline, `input[type=radio]` con `appearance: none`, sizes via `[data-size]` attribute selector consumiendo `var(--ds-dimension-{16,20,24})`, estados `:checked`, `:focus-visible` (consume `var(--ds-semantic-shadow-focus)`), `:disabled`. SVG inline para el dot interno cuando checked. Solo `var(--ds-*)`.
- [ ] 3.5 Crear `index.ts` con `export { DsRadio, type DsRadioSize } from './radio.component';`.
- [ ] 3.6 Actualizar `packages/components/src/public-api.ts` agregando `export * from './lib/radio';`.

**Criterio**: TypeScript compila. `DsRadio` y `DsRadioSize` importables. `inject(DsRadioGroup, { optional: true })` no rompe si el radio está standalone.

## 4. Tests Vitest

- [ ] 4.1 Crear `radio-group.component.spec.ts` con TestBed standalone + Vitest. Specs:
  - `creates the component`
  - `renders div with role="radiogroup"`
  - `[(value)] two-way binding works con primitivo string`
  - `[(value)] two-way binding works con object por referencia`
  - `writeValue updates value`
  - `registerOnChange fires on selection change`
  - `setDisabledState propaga `disabled` a los radios hijos`
  - `name auto-generado es único entre instancias`
  - `name explícito sobrescribe el auto-generado`
- [ ] 4.2 Crear `radio.component.spec.ts` con specs:
  - `creates the component`
  - `renders <input type="radio">`
  - `label string fallback shown when no projected content`
  - `<ng-content> tiene precedencia sobre label string`
  - `standalone emite selected on click`
  - `dentro de group NO emite selected (el group maneja)`
  - `respeta disabled propio`
  - `hereda disabled del group`
  - `aria-checked refleja estado`
  - `size attribute aplica data-size en el input`
- [ ] 4.3 Crear `radio-group + radio integration spec` (en `radio-group.component.spec.ts` o separado) con host component que renderiza `<ds-radio-group [(value)]="state">` con 3 `<ds-radio>` hijos. Specs:
  - `click en un radio cambia el value del group`
  - `solo un radio aparece checked a la vez`
  - `keyboard ArrowRight mueve foco al siguiente y selecciona`
  - `keyboard ArrowLeft mueve foco al anterior y selecciona`
  - `keyboard Home/End van al primero/último`
  - `keyboard ArrowRight salta radios deshabilitados`
- [ ] 4.4 Crear integration con FormControl (host con `FormControl<string>`): `setValue` selecciona el radio correcto, `disable()` deshabilita todos los radios, click en radio actualiza `ctrl.value`.
- [ ] 4.5 Ejecutar `pnpm -F @romanmartinidev/components exec vitest run`. Debe reportar **≥35 passing total** (3 Button + 14 Checkbox + ≥18 Radio/RadioGroup).

**Criterio**: todos los specs pasan. Sin tests skipped ni fixmes.

## 5. Storybook stories co-ubicadas

- [ ] 5.1 Crear `radio.stories.ts` con CSF 3:
  - `meta` con `title: 'Components/Radio'`, `component: DsRadio`, `tags: ['autodocs']`, argTypes para `value`, `disabled`, `label`, `size`, args defaults
  - `Default` story standalone
  - `Sizes` con grid sm/md/lg
  - `Disabled` story
  - `WithRichContent` con template usando `<a>` en el slot
- [ ] 5.2 Crear `radio-group.stories.ts` con CSF 3:
  - `meta` con `title: 'Components/RadioGroup'`, `component: DsRadioGroup`, `tags: ['autodocs']`
  - `Default` con 3 radios y `[(value)]`
  - `WithFormControl` con decorator `moduleMetadata({ imports: [DsRadioGroup, DsRadio, ReactiveFormsModule] })` y template usando `[formControl]`
  - `Disabled` con `disabled` en el group
  - `WithDisabledItem` con un radio individual disabled
  - `KeyboardNavDemo` con instrucciones visuales para probar flechas

**Criterio**: `pnpm -F playground exec ng run playground:build-storybook` pasa. Al inspeccionar `storybook-static/index.json` SHALL contener `components-radio--default`, `components-radiogroup--default`, etc.

## 6. Demo en playground

- [ ] 6.1 Editar `apps/playground/src/app/app.ts` para sumar `DsRadio` y `DsRadioGroup` al array `imports`. Sumar signal `selectedFramework = signal('angular')` y FormControl `frameworkCtrl = new FormControl<string>('react', { nonNullable: true })`.
- [ ] 6.2 Editar `apps/playground/src/app/app.html` agregando una sección `<section class="playground__section">` titulada "Radio" con: (a) group con `[(value)]="selectedFramework"` + 3 opciones, (b) group con `[formControl]="frameworkCtrl"`, (c) sizes con `size` distintos en cada radio dentro de un group.

**Criterio**: `pnpm -F playground build` pasa. El HTML bundleado contiene al menos 6 `<ds-radio>` y 3 `<ds-radio-group>`.

## 7. Test del playground

- [ ] 7.1 Editar `apps/playground/src/app/app.spec.ts` para sumar test que verifica que al menos 1 `<ds-radio-group>` está en el DOM renderizado.
- [ ] 7.2 `pnpm -F playground exec vitest run` debe reportar `4/4 passing` (creates + renders button + renders checkbox + renders radio-group).

**Criterio**: 4/4 tests playground passing.

## 8. README del package

- [ ] 8.1 Editar `packages/components/README.md`:
  - Tabla de componentes: sumar fila `DsRadio` con selector `ds-radio` y otra `DsRadioGroup` con selector `ds-radio-group`.
  - Sumar ejemplo de uso de Radio con FormControl (similar al ejemplo de Checkbox).

**Criterio**: el README muestra Radio + RadioGroup en la tabla y ejemplos de código compilan al copy-paste.

## 9. Changeset

- [ ] 9.1 Crear changeset con `pnpm changeset` (interactivo) o manualmente `.changeset/radio-component.md`:

  ```
  ---
  '@romanmartinidev/components': minor
  ---

  feat: add DsRadio + DsRadioGroup components with full ControlValueAccessor support, 3 sizes (sm/md/lg), generic typed value, keyboard navigation (Arrow keys + Home/End following WAI-ARIA APG), context injection pattern (DsRadio inyecta DsRadioGroup ancestor optional).
  ```

**Criterio**: archivo `.changeset/<nombre>.md` existe con el bump minor para `@romanmartinidev/components`.

## 10. Validación de cierre

- [ ] 10.1 `pnpm openspec validate --changes` pasa para `components-add-radio`
- [ ] 10.2 `pnpm lint` pasa
- [ ] 10.3 `pnpm format` ejecutado + `pnpm format:check` pasa
- [ ] 10.4 `pnpm -r build` pasa (tokens + components + playground) sin warnings nuevos
- [ ] 10.5 `pnpm -F @romanmartinidev/components exec vitest run` pasa (Button 3 + Checkbox 14 + Radio/Group ≥18 = ≥35 passing)
- [ ] 10.6 `pnpm -F playground exec vitest run` pasa (4/4)
- [ ] 10.7 `pnpm -F playground exec ng run playground:build-storybook` pasa; stories Radio + RadioGroup visibles en `storybook-static/index.json`
- [ ] 10.8 `npm pack --dry-run` desde `packages/components/` post-Radio: tarball sigue sin `*.stories.ts` ni `*.spec.ts`; typings (`dist/types/...`) exponen `DsRadio`, `DsRadioGroup`, `DsRadioSize`
- [ ] 10.9 `grep -rn "RadioComponent\|RadioGroupComponent" packages/components/src/ apps/playground/src/` devuelve vacío (no usar nombres con sufijo `Component`)
- [ ] 10.10 Proponer mensaje de commit y esperar OK del usuario (regla del repo de cero commits sin permiso explícito)

**Criterio**: los 10 puntos pasan; aprobación explícita antes del commit.

## 11. Archivar el change

- [ ] 11.1 Mover `openspec/changes/components-add-radio/` → `openspec/changes/archive/aaa-008-components-add-radio/`
- [ ] 11.2 Sincronizar la spec base `openspec/specs/components-package/spec.md` con los `ADDED Requirements` del delta:
  - Sumar Requirement "Componente DsRadioGroup" con todos sus scenarios.
  - Sumar Requirement "Componente DsRadio" con todos sus scenarios.
- [ ] 11.3 Actualizar frontmatter del proposal archivado: `status: archived` + `archived: YYYY-MM-DD`
- [ ] 11.4 Actualizar `openspec/IDS.md`: fila aaa-008 con status `archived` y fecha; próximo disponible `aaa-009`
- [ ] 11.5 `pnpm openspec validate --all` pasa para los 5 specs base
- [ ] 11.6 Proponer mensaje del commit del archive y esperar OK del usuario

**Criterio**: change archivado, requirements sincronizados con `components-package`, openspec valida, commit aprobado.

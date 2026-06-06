---
id: aaa-006
name: components-add-checkbox
type: change
status: archived
archived: 2026-06-01
modifies-specs:
  - components-package (agrega Checkbox)
related-adrs:
  - ADR-004
---

## Why

Cierra el primer item del **Nivel 1 — Cerrar deuda obvia** del [FUTURE-WORK](../../docs/architecture/FUTURE-WORK.md): un Design System con un solo componente (Button) no es usable para una app real. Checkbox es alta frecuencia de uso, no requiere librerías externas (a diferencia de Select / Tooltip que necesitan `@floating-ui/dom`), y permite validar el patrón "sumar componente nuevo a la lib" siguiendo [ADR-004](../../docs/architecture/adr/ADR-004-arquitectura-components.md) (flat por componente, standalone + signals, prefix `rmd-`, CSS plain con tokens).

Esta propuesta es el **primer change post-bootstrap** y establece la plantilla de "cómo se suman componentes nuevos" que CHG-007 (Radio), CHG-009 (Modal), etc., van a copiar.

Respalda las tres prioridades del repo:

1. **Buenas prácticas**: ControlValueAccessor completo para integración nativa con Angular Forms (reactivos + template-driven), ARIA correcto (`aria-checked="mixed"` cuando indeterminate), focus management, signals + OnPush.
2. **Escalar ordenado**: sigue exactamente la convención de ADR-004 (carpeta `src/lib/checkbox/`, naming `<Name>Component` + `<name>.component.ts`, selector `rmd-checkbox`). Cualquier dev futuro replica el patrón.
3. **Mantenibilidad**: tests Vitest cubren creación + ControlValueAccessor + indeterminate + ARIA. Story Storybook co-ubicada documenta todas las variantes.

## What Changes

### Componente `ButtonComponent`-style: `CheckboxComponent`

Estructura siguiendo ADR-004 — `packages/components/src/lib/checkbox/`:

- `checkbox.component.ts` — standalone + OnPush + signals + ControlValueAccessor
- `checkbox.component.css` — consume `var(--ds-*)` exclusivamente
- `checkbox.component.spec.ts` — Vitest specs
- `checkbox.stories.ts` — Storybook CSF 3 stories (co-ubicado)
- `index.ts` — re-export interno

### API del componente

```ts
@Component({
  selector: 'rmd-checkbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CheckboxComponent), multi: true },
  ],
  template: `...`,
  styleUrl: './checkbox.component.css',
})
export class CheckboxComponent implements ControlValueAccessor {
  readonly checked = model<boolean>(false); // two-way binding via [(checked)]
  readonly indeterminate = input<boolean>(false);
  readonly disabled = model<boolean>(false); // CVA puede mutarlo via setDisabledState
  readonly label = input<string>(''); // fallback si no hay <ng-content>
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  // ControlValueAccessor
  writeValue(value: boolean): void;
  registerOnChange(fn: (v: boolean) => void): void;
  registerOnTouched(fn: () => void): void;
  setDisabledState(isDisabled: boolean): void;
}
```

**Decisiones API**:

- **`model<boolean>()` para `checked`**: habilita `[(checked)]` two-way binding sin boilerplate.
- **`ControlValueAccessor` completo**: integración nativa con `[formControl]`, `[(ngModel)]`, `[formControlName]`. Patrón estándar Angular.
- **3 sizes alineados con Button**: sm (16px box) / md (20px default) / lg (24px). Consistencia visual con la lib.
- **`label` input + `<ng-content>`**: el componente prefiere el slot si tiene contenido; sino renderiza el input string. Casos simples (`label="texto"`) Y casos rich (links, iconos) cubiertos.
- **`indeterminate` como `input` (no model)**: estado visual controlado por el padre (típicamente un "select all" parent checkbox). Cuando indeterminate=true, ARIA `aria-checked="mixed"`.

### Sincronización indeterminate ↔ input nativo

El atributo `indeterminate` del `<input type="checkbox">` no es bindable por template (HTML spec). Hay que sincronizarlo programáticamente. Patrón:

```ts
private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('input');

constructor() {
  effect(() => {
    const input = this.inputRef().nativeElement;
    input.indeterminate = this.indeterminate();
  });
}
```

### CSS con tokens

```css
:host {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-semantic-space-xs);
  cursor: pointer;
}

input[type='checkbox'] {
  appearance: none;
  width: var(--ds-semantic-space-md); /* 16/20/24 segun size */
  height: var(--ds-semantic-space-md);
  border: 2px solid var(--ds-semantic-color-border-strong);
  border-radius: var(--ds-semantic-radius-sm);
  background: var(--ds-semantic-color-bg-surface);
}

input[type='checkbox']:checked {
  background: var(--ds-semantic-color-bg-primary);
  border-color: var(--ds-semantic-color-border-primary);
  /* checkmark via background-image SVG embebido */
}

input[type='checkbox']:focus-visible {
  box-shadow: var(--ds-semantic-shadow-focus);
  outline: none;
}
```

NO se agrega `packages/tokens/src/component/checkbox.json` en este change — los tokens semantic existentes (space, color.bg.primary, border, shadow.focus) son suficientes. Si en el futuro aparece necesidad de tokens específicos del checkbox (ej. tamaño del check icon), se agrega en otro change.

### Tests Vitest

- `creates the component` — TestBed.createComponent sin error.
- `renders <input type="checkbox">` con atributos correctos.
- `emits checked change via model` — click toggles checked.
- `writeValue updates checked` — ControlValueAccessor desde forms.
- `registerOnChange fires on toggle` — forms reciben cambios.
- `setDisabledState propaga al input` — disabled desde form.
- `indeterminate sets aria-checked="mixed"` — accesibilidad.
- `respects disabled — no toggle on click cuando disabled=true`.

### Story Storybook

`packages/components/src/lib/checkbox/checkbox.stories.ts` con CSF 3:

- `Default` — checked default false.
- `Checked` — checked true.
- `Indeterminate` — indeterminate true.
- `Disabled` — disabled true en varios estados.
- `Sizes` — grid de sm/md/lg.
- `WithRichContent` — uso de `<ng-content>` con link.
- `WithReactiveForm` — story con `FormControl` integrado.

### Side-effect en `packages/components/package.json`

Agregar `@angular/forms` como **peerDependency** (`^21.0.0`). Hoy NO está declarado. Aunque ng-packagr probablemente no se queje (es opt-in solo si lo usa el componente), declararlo es la convención correcta del ecosistema Angular libs.

### Spec deltas en SPC-003

Agregar a [SPC-003 components-package](../../openspec/specs/SPC-003-components-package/spec.md) un requirement nuevo **"Componente Checkbox"** con scenarios específicos del API + ControlValueAccessor + ARIA. Sigue la convención: cada change que suma componente agrega un requirement ADDED al spec base.

### Cleanup operativo

Borrar `docs/bootstrap-plan.md` — su rol terminó al cerrar Fase 5 (el propio documento lo dice en su última línea). La fuente de verdad ya es `docs/architecture/` + ADRs + specs.

### Validación

- `pnpm install` re-link el peer dep de `@angular/forms`.
- `pnpm -F @romanmartinidev/components build` — tarball con Checkbox.
- `pnpm -F @romanmartinidev/components exec vitest run` — 3/3 (Button) + ~8 (Checkbox) passing.
- `pnpm -F playground exec ng run playground:build-storybook` — story Checkbox visible.
- `openspec validate --all` — 5/5 specs OK + change activo.

## Capabilities

### New Capabilities

Ninguna. El package `@romanmartinidev/components` ya existe (SPC-003); este change suma un componente más.

### Modified Capabilities

- **SPC-003 components-package** — añade un requirement ADDED "Componente Checkbox" con scenarios específicos.

## Impact

### Código

- **Creados**:
  - `packages/components/src/lib/checkbox/{checkbox.component.ts, .css, .spec.ts, .stories.ts, index.ts}`.
- **Modificados**:
  - `packages/components/src/public-api.ts` — re-exporta `./lib/checkbox`.
  - `packages/components/package.json` — agrega `@angular/forms` a peerDependencies.
  - `apps/playground/src/app/app.html` — sumar sección demo del Checkbox (opcional pero validador end-to-end).
- **Eliminados**:
  - `docs/bootstrap-plan.md` — su rol terminó.

### APIs públicas

- Nuevo export: `CheckboxComponent`, tipos `CheckboxSize`.
- `@angular/forms` queda declarado como peer (consumidores que usen forms reactivos ya lo tienen instalado; los que no, npm warning explícito).
- **Sin breaking changes** — Button intacto, surface solo crece.

### Dependencias

- Sin nuevas runtime deps.
- Sin nuevas devDeps.
- Peer dep nuevo: `@angular/forms@^21.0.0`.

### Sistemas / fases siguientes

- **Patrón establecido** para `components-add-radio` (CHG-007), que reusará casi todas las decisiones (CVA, sizes, label slot).
- **CI valida** este change como cualquier PR (pr.yml corre lint + build + test + openspec validate + changeset enforcement).
- **Changeset asociado** se agrega en la implementación (bump `@romanmartinidev/components` minor — feature nueva backward-compatible).

## Alternativas evaluadas

### Opción A — Checkbox básico sin ControlValueAccessor

API mínima con `checked` model. Sin integración con `[formControl]` / `[ngModel]`.

- **Pros**: scope menor, menos boilerplate.
- **Contras**: el consumidor no puede usar Checkbox en formularios reactivos (caso de uso #1 de checkboxes en apps Angular reales). Forzaría wrap manual. Mala práctica para una lib publicable.

### Opción B — Checkbox + ControlValueAccessor (esta propuesta)

API completa con CVA + signals + indeterminate + ARIA + 3 sizes + label slot.

- **Pros**: lib usable en cualquier forma Angular sin wrappers. Patrón estándar del ecosistema.
- **Contras**: ~50 líneas extra de boilerplate CVA. Aceptable.

### Opción C — Checkbox + CVA + tokens dedicados (`component/checkbox.json`)

Agregar `packages/tokens/src/component/checkbox.json` con tokens específicos (`checkbox.bg.checked`, `checkbox.border.indeterminate`, etc.).

- **Pros**: control fino por componente.
- **Contras**: los tokens semantic existentes son suficientes. Agregar tokens específicos pre-validación es prematuro. Si aparece necesidad real (ej. queremos un checkbox visual muy distinto de otros componentes), se agrega en change futuro.

**Decisión**: Opción B (Roman lo aprobó en kickoff de la propuesta).

## ADRs y follow-ups

- **NO se crea ADR nuevo** — la arquitectura general ya está en ADR-004. Decisiones específicas de Checkbox van en el `design.md` de este change.
- **Se proponen follow-ups** (changes futuros):
  - `components-add-radio` (CHG-007): Radio + RadioGroup con patrón análogo (CVA, sizes, etc.).
  - `tokens-add-z-index` (CHG-008): tokens de z-index (bloquea Modal/Tooltip/Toast).
  - `components-add-modal` (CHG-009): Modal con focus trap + scroll lock.
  - `playground-add-checkbox-demo`: si se decide agregar página dedicada al Checkbox en el playground (opcional).

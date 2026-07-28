## Context

Primer componente post-bootstrap. Se suma a la lib `@romanmartinidev/components` siguiendo el patrón documentado en ADR-004. Establece la plantilla para futuros componentes (Radio, Modal, Tabs, Select, etc.).

Decisiones tomadas en kickoff:

1. API básico + **ControlValueAccessor completo** (forms reactivos).
2. 3 sizes (sm/md/lg) alineados con Button.
3. Label dual: input string + `<ng-content>` slot (slot prefiere si lleno).
4. Borrado de `docs/bootstrap-plan.md` dentro del commit del CHG-006.

## Goals / Non-Goals

**Goals:**

- `CheckboxComponent` standalone + OnPush + signals + CVA full.
- Tests Vitest que cubren API + CVA + ARIA + indeterminate.
- Story Storybook co-ubicada con todas las variantes (Default, Checked, Indeterminate, Disabled, Sizes, RichContent, ReactiveForm).
- Demo en `apps/playground/src/app/app.html` (sección "Checkbox") para validar consumo end-to-end.

**Non-Goals:**

- NO crear tokens dedicados `component/checkbox.json` — semantic tokens existentes son suficientes.
- NO crear ADR nuevo — ADR-004 ya cubre la arquitectura general.
- NO sumar `CheckboxGroup` (componente padre que agrupa varios checkboxes con un "select all"). Si aparece necesidad, change futuro.
- NO sumar `radio` ni `radio-group` en este change. CHG-007.
- NO publicar el package a npm en este change. Cuando el mantenedor decida.

## Decisions

### 1. ControlValueAccessor con signals

`writeValue`, `registerOnChange`, `registerOnTouched`, `setDisabledState` implementados, pero usando signals internas (no `BehaviorSubject` ni `state private`).

```ts
export class CheckboxComponent implements ControlValueAccessor {
  readonly checked = model<boolean>(false);
  readonly disabled = model<boolean>(false);

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: boolean): void {
    this.checked.set(!!value);
  }
  registerOnChange(fn: (v: boolean) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  handleInput(event: Event): void {
    if (this.disabled()) return;
    const target = event.target as HTMLInputElement;
    this.checked.set(target.checked);
    this.onChange(target.checked);
    this.onTouched();
  }
}
```

**Por qué no usar `model()` directamente para forms**:

- `model()` notifica al binding `[()]` pero no llama al `onChange` del CVA.
- Necesitamos el método `handleInput` que actualice ambos: el `model` (para `[(checked)]`) y el CVA (`onChange()` + `onTouched()`).
- Es boilerplate clásico de CVA. Aceptado.

### 2. Sincronización `indeterminate` con input nativo

`<input type="checkbox" indeterminate>` no es bindable por template (HTML spec). El bind `[indeterminate]` en Angular no funciona porque el atributo es property-only, no attribute.

Patrón con `effect()` + `viewChild()`:

```ts
private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('inputEl');

constructor() {
  effect(() => {
    this.inputRef().nativeElement.indeterminate = this.indeterminate();
  });
}
```

Funciona en zoneless (Angular 21.2): cuando `indeterminate()` signal cambia, el effect corre y actualiza el DOM.

### 3. Label dual: input string + `<ng-content>`

Resolución en template: usar `@if (hasProjectedContent)` o un `<span>` que muestre el label string solo cuando el content slot está vacío.

**Approach**: usar `:empty` CSS pseudo-class o `contentChild(TemplateRef)`. La más simple es renderizar ambos pero ocultar el string si hay slot:

```html
<label class="checkbox" [class.disabled]="disabled()">
  <input
    #inputEl
    type="checkbox"
    [checked]="checked()"
    [disabled]="disabled()"
    [attr.aria-checked]="indeterminate() ? 'mixed' : checked()"
    [attr.data-size]="size()"
    (change)="handleInput($event)"
  />
  <span class="label">
    <ng-content>{{ label() }}</ng-content>
  </span>
</label>
```

**Truco Angular**: `<ng-content>` con contenido fallback dentro mostraría el `{{ label() }}` solo si el slot está vacío. Patrón estándar Angular para "default content".

### 4. Sizes mapping a tokens

| Size | Box size | Token usado                                                                      |
| ---- | -------- | -------------------------------------------------------------------------------- |
| `sm` | 16px     | `var(--ds-semantic-space-md)` (es 16px en el sistema actual)                     |
| `md` | 20px     | `calc(var(--ds-semantic-space-md) + var(--ds-semantic-space-2xs))` (16 + 4 = 20) |
| `lg` | 24px     | `var(--ds-semantic-space-lg)` (es 24px en el sistema actual)                     |

**Trade-off aceptado**: el cálculo de md es híbrido. Si en el futuro queremos 20px directo como token, se agrega un primitive `dimension.20` (ya existe en el sistema!) y se mapea ahí.

Alternativa simpler: usar `var(--ds-dimension-16)`, `var(--ds-dimension-20)`, `var(--ds-dimension-24)` directamente — usa primitives sin pasar por semantic.

### 5. ARIA y accesibilidad

- `<label>` envuelve `<input>` — clicks en el label togglean el input (browser default).
- `aria-checked` se setea explícitamente: `"true"`, `"false"`, o `"mixed"` (cuando indeterminate). El default del browser no maneja "mixed" en input native.
- `focus-visible` con `box-shadow: var(--ds-semantic-shadow-focus)` — WCAG 2.4.7.
- `disabled` aplica al `<input>` directamente (browser bloquea clicks). El host visualmente muestra opacity reducida + cursor not-allowed.

### 6. Tokens semantic vs primitives en CSS

Decisión: usar **semantic primero** (bg.surface, border.strong, etc.). Si un token semantic no alcanza para un caso específico, usar primitive (`dimension.N`, `opacity.50`). NO hardcodear nunca.

### 7. peerDependency `@angular/forms`

Hoy NO está en `peerDependencies`. Agregar `"@angular/forms": "^21.0.0"`.

**Por qué peer y no dep**:

- Misma convención que `@angular/core` y `@angular/common` (ya peer).
- Una sola copia de `@angular/forms` en el árbol del consumidor.
- ng-packagr rechaza dependencias regulares por default.

**Trade-off**: consumidor que NO usa forms reactivos ni Checkbox podría no necesitar `@angular/forms`. Pero como `@angular/forms` es runtime opcional (los componentes que NO lo usan no lo cargan), tener el peer declarado no infla el bundle.

### 8. Storybook story con FormControl

La story `WithReactiveForm` muestra integración con `ReactiveFormsModule`:

```ts
export const WithReactiveForm: Story = {
  decorators: [moduleMetadata({ imports: [CheckboxComponent, ReactiveFormsModule] })],
  render: () => ({
    props: { ctrl: new FormControl(false) },
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem;">
        <rmd-checkbox [formControl]="ctrl">Con FormControl</rmd-checkbox>
        <pre>ctrl.value = {{ ctrl.value | json }}</pre>
      </div>
    `,
  }),
};
```

Valida visualmente que CVA funciona.

## Risks / Trade-offs

| Riesgo                                                                                          | Mitigación                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`effect()` para indeterminate no corre fuera de injection context**                           | Se invoca dentro del `constructor()` que está en injection context. Si en futuro se mueve, fail rápido y obvio.                                                                 |
| **`<ng-content>` con default content podría no funcionar como esperamos en todos los browsers** | Patrón estándar Angular. Tests Vitest cubren ambos casos (con slot vs sin slot).                                                                                                |
| **CVA con `model()` puede generar loops de actualización**                                      | El `handleInput` actualiza el model con el valor del DOM event (que es el cambio real). `writeValue` actualiza el model desde el form. Sin loops si se respeta la unidirección. |
| **`@angular/forms` peer dep rompe consumidores que no usan forms**                              | npm warning, no error. Consumidor lo instala con un `pnpm add @angular/forms` y listo.                                                                                          |
| **Cálculo híbrido de md size (16 + 4) puede ser confuso**                                       | Documentar en CSS. Si confunde, sumar primitive `dimension.20` en cambio futuro.                                                                                                |
| **Stories Storybook con ReactiveFormsModule requieren module metadata custom**                  | Patrón estándar `moduleMetadata` de `@storybook/angular`. Documentado en story.                                                                                                 |

## Migration Plan

No aplica — feature nueva, sin migración.

## Open Questions

- **¿Sumar `CheckboxGroup` para agrupar varios checkboxes?** Diferido. Si aparece necesidad (ej. "select all" + lista de checkboxes), change futuro `components-add-checkbox-group`.
- **¿Agregar primitive `dimension.20` para size md exacto?** Si la fórmula híbrida confunde en review, agregar el primitive. Por ahora diferido.
- **¿Story con `ReactiveFormsModule` muestra suficiente?** O hay que agregar también template-driven (`[(ngModel)]`). Tentativa: solo reactive por simplicidad; si aparece confusión, sumar template-driven story.

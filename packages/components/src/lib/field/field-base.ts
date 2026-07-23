import {
  ChangeDetectorRef,
  DestroyRef,
  Directive,
  inject,
  input,
  model,
  type OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl } from '@angular/forms';

export type DsFieldSize = 'sm' | 'md' | 'lg';

let nextFieldId = 0;

/**
 * Base compartida de form fields (Input, Textarea, …). `@Directive()` sin
 * selector, abstracta: concentra models/inputs/CVA/a11y para que cada control
 * concreto solo aporte su elemento nativo. Angular hereda inputs/models/host
 * de una base **solo si está decorada** (por eso `@Directive()`, no una clase
 * plana). No se exporta en el public-api: es detalle interno del package.
 *
 * Decisión promovida a ADR-020 al archivar aaa-036.
 */
@Directive()
export abstract class DsFieldBase implements ControlValueAccessor, OnInit {
  readonly value = model<string>('');
  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly placeholder = input<string>('');
  // undefined = derivar del NgControl; true/false = override del consumidor.
  readonly invalid = input<boolean | undefined>(undefined);
  readonly disabled = model<boolean>(false);
  readonly size = input<DsFieldSize>('md');
  // Sin label visible, el nombre accesible del consumidor se reenvía al
  // control nativo (el alias consume el atributo del host — lección aaa-016).
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });

  private readonly uid = nextFieldId++;
  protected readonly fieldId = `ds-field-${this.uid}`;
  protected readonly hintId = `ds-field-hint-${this.uid}`;
  protected readonly errorId = `ds-field-error-${this.uid}`;

  // CVA por auto-registración: proveer NG_VALUE_ACCESSOR e inyectar NgControl
  // a la vez es un ciclo de DI. Patrón estándar (design.md §1): inyectar
  // NgControl optional/self y asignarse como valueAccessor. `self` corre en el
  // injector del componente derivado → funciona en Input y Textarea sin duplicar.
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    // `touched`/`invalid` del NgControl no son signals. Con OnPush, si cambian
    // desde afuera (p.ej. `form.markAllAsTouched()` en un submit sin que el
    // usuario haya tocado este campo), la vista quedaría stale: no se pintaría
    // el borde de error ni `aria-invalid`/mensaje hasta el próximo evento local.
    // `AbstractControl.events` (Angular 18+) emite Touched/Pristine/Status/Value
    // change events; forzamos CD ante cualquiera. `control` ya está disponible en
    // ngOnInit para [formControl]/formControlName. (Resuelve el trade-off que
    // aaa-017 había diferido; se promueve a ADR-020.)
    this.ngControl?.control?.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cdr.markForCheck());
  }

  // ControlValueAccessor
  writeValue(value: string | null | undefined): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  // Método (no computed): touched/invalid del NgControl no son signals; con
  // OnPush los eventos del propio control (input/blur) disparan la CD necesaria.
  protected isInvalid(): boolean {
    const override = this.invalid();
    if (override !== undefined) {
      return override;
    }
    const control = this.ngControl?.control;
    return !!control && control.invalid && control.touched;
  }

  protected showError(): boolean {
    return this.isInvalid() && !!this.error();
  }

  protected describedBy(): string | null {
    if (this.showError()) {
      return this.errorId;
    }
    return this.hint() ? this.hintId : null;
  }

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}

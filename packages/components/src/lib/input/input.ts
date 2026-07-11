import { ChangeDetectionStrategy, Component, inject, input, model } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

export type DsInputType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';
export type DsInputSize = 'sm' | 'md' | 'lg';

let nextInputId = 0;

@Component({
  selector: 'ds-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './input.html',
  styleUrl: './input.css',
})
export class DsInput implements ControlValueAccessor {
  readonly value = model<string>('');
  readonly type = input<DsInputType>('text');
  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly placeholder = input<string>('');
  // undefined = derivar del NgControl; true/false = override del consumidor.
  readonly invalid = input<boolean | undefined>(undefined);
  readonly disabled = model<boolean>(false);
  readonly size = input<DsInputSize>('md');
  // Sin label visible, el nombre accesible del consumidor se reenvía al
  // <input> nativo (el alias consume el atributo del host — lección aaa-016).
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });

  private readonly uid = nextInputId++;
  protected readonly inputId = `ds-input-${this.uid}`;
  protected readonly hintId = `ds-input-hint-${this.uid}`;
  protected readonly errorId = `ds-input-error-${this.uid}`;

  // CVA por auto-registración: proveer NG_VALUE_ACCESSOR e inyectar NgControl
  // a la vez es un ciclo de DI. Patrón estándar (design.md §1): inyectar
  // NgControl optional/self y asignarse como valueAccessor.
  private readonly ngControl = inject(NgControl, { optional: true, self: true });

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
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
  // OnPush los eventos del propio input (input/blur) disparan la CD necesaria.
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
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}

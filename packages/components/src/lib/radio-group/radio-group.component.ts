import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  HostListener,
  input,
  model,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Minimal contract that DsRadio fulfills so DsRadioGroup can manage keyboard
 * navigation and disabled propagation without importing DsRadio directly
 * (avoids a circular module dependency).
 */
export interface DsRadioRegistration {
  isDisabled(): boolean;
  hasFocus(): boolean;
  focus(): void;
  valueProp(): unknown;
}

let nextUniqueId = 0;

@Component({
  selector: 'ds-radio-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './radio-group.component.html',
  styleUrl: './radio-group.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DsRadioGroup),
      multi: true,
    },
  ],
  host: {
    role: 'radiogroup',
  },
})
export class DsRadioGroup implements ControlValueAccessor {
  readonly value = model<unknown>(null);
  readonly disabled = model<boolean>(false);
  readonly name = input<string>(`ds-radio-group-${++nextUniqueId}`);

  private readonly radios: DsRadioRegistration[] = [];

  private onChange: (value: unknown) => void = () => {};
  private onTouched: () => void = () => {};

  // ControlValueAccessor
  writeValue(value: unknown): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  // API que los DsRadio hijos consumen
  registerRadio(radio: DsRadioRegistration): void {
    if (!this.radios.includes(radio)) {
      this.radios.push(radio);
    }
  }

  unregisterRadio(radio: DsRadioRegistration): void {
    const index = this.radios.indexOf(radio);
    if (index >= 0) {
      this.radios.splice(index, 1);
    }
  }

  selectValue(value: unknown): void {
    if (this.disabled()) {
      return;
    }
    this.value.set(value);
    this.onChange(value);
    this.onTouched();
  }

  isSelected(value: unknown): boolean {
    return this.value() === value;
  }

  disabledForChild(): boolean {
    return this.disabled();
  }

  nameForChild(): string {
    return this.name();
  }

  // Keyboard navigation (WAI-ARIA APG: radiogroup pattern)
  @HostListener('keydown', ['$event'])
  protected handleKeydown(event: KeyboardEvent): void {
    const navKeys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
    if (!navKeys.includes(event.key)) {
      return;
    }

    const enabled = this.radios.filter((r) => !r.isDisabled());
    if (enabled.length === 0) {
      return;
    }

    event.preventDefault();

    const focusedIndex = enabled.findIndex((r) => r.hasFocus());
    let targetIndex: number;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        targetIndex = focusedIndex < 0 ? 0 : (focusedIndex + 1) % enabled.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        targetIndex = focusedIndex <= 0 ? enabled.length - 1 : focusedIndex - 1;
        break;
      case 'Home':
        targetIndex = 0;
        break;
      case 'End':
        targetIndex = enabled.length - 1;
        break;
      default:
        return;
    }

    const target = enabled[targetIndex];
    target.focus();
    this.selectValue(target.valueProp());
  }
}

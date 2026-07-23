import { ChangeDetectionStrategy, Component, forwardRef, input, model } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type DsSwitchSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ds-switch',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './switch.html',
  styleUrl: './switch.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DsSwitch),
      multi: true,
    },
  ],
})
export class DsSwitch implements ControlValueAccessor {
  readonly checked = model<boolean>(false);
  readonly disabled = model<boolean>(false);
  readonly label = input<string>('');
  readonly size = input<DsSwitchSize>('md');

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: boolean | null | undefined): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected handleInput(event: Event): void {
    if (this.disabled()) {
      return;
    }
    const target = event.target as HTMLInputElement;
    this.checked.set(target.checked);
    this.onChange(target.checked);
    this.onTouched();
  }
}

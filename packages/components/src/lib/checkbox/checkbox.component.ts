import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  forwardRef,
  input,
  model,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type CheckboxSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'rmd-checkbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
})
export class CheckboxComponent implements ControlValueAccessor {
  readonly checked = model<boolean>(false);
  readonly disabled = model<boolean>(false);
  readonly indeterminate = input<boolean>(false);
  readonly label = input<string>('');
  readonly size = input<CheckboxSize>('md');

  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('inputEl');

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      const indeterminate = this.indeterminate();
      const inputEl = this.inputRef().nativeElement;
      inputEl.indeterminate = indeterminate;
    });
  }

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

  protected ariaChecked(): 'true' | 'false' | 'mixed' {
    if (this.indeterminate()) {
      return 'mixed';
    }
    return this.checked() ? 'true' : 'false';
  }
}

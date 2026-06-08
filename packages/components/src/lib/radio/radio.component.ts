import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  viewChild,
} from '@angular/core';

import { DsRadioGroup, type DsRadioRegistration } from '../radio-group/radio-group.component';

export type DsRadioSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ds-radio',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.css',
})
export class DsRadio implements DsRadioRegistration, OnInit, OnDestroy {
  readonly value = input.required<unknown>();
  readonly disabled = input<boolean>(false);
  readonly label = input<string>('');
  readonly size = input<DsRadioSize>('md');
  readonly name = input<string>('');

  readonly selected = output<unknown>();

  private readonly group = inject(DsRadioGroup, { optional: true });
  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('inputEl');

  ngOnInit(): void {
    this.group?.registerRadio(this);
  }

  ngOnDestroy(): void {
    this.group?.unregisterRadio(this);
  }

  // DsRadioRegistration
  valueProp(): unknown {
    return this.value();
  }

  hasFocus(): boolean {
    return document.activeElement === this.inputRef().nativeElement;
  }

  focus(): void {
    this.inputRef().nativeElement.focus();
  }

  isSelected(): boolean {
    return this.group ? this.group.isSelected(this.value()) : false;
  }

  isDisabled(): boolean {
    return (this.group?.disabledForChild() ?? false) || this.disabled();
  }

  nameAttr(): string {
    const ownName = this.name();
    if (ownName) {
      return ownName;
    }
    return this.group?.nameForChild() ?? '';
  }

  protected handleChange(): void {
    if (this.isDisabled()) {
      return;
    }
    if (this.group) {
      this.group.selectValue(this.value());
    } else {
      this.selected.emit(this.value());
    }
  }
}

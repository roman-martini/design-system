import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
} from '@angular/core';

import { DsSelect, type DsOptionRegistration } from './select';

let nextOptionId = 0;

@Component({
  selector: 'ds-option',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './option.html',
  styleUrl: './option.css',
  host: {
    role: 'option',
    '[id]': 'id',
    '[attr.aria-selected]': 'isSelected()',
    '[attr.aria-disabled]': "disabled() ? 'true' : null",
    '[class.ds-option--active]': 'isActive()',
    '[class.ds-option--selected]': 'isSelected()',
    '[class.ds-option--disabled]': 'disabled()',
    '(click)': 'onClick()',
  },
})
export class DsOption implements DsOptionRegistration, OnInit, OnDestroy {
  readonly value = input.required<unknown>();
  readonly disabled = input<boolean>(false);
  readonly label = input<string>('');

  protected readonly id = `ds-option-${nextOptionId++}`;

  private readonly select = inject(DsSelect);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  ngOnInit(): void {
    this.select.registerOption(this);
  }

  ngOnDestroy(): void {
    this.select.unregisterOption(this);
  }

  // DsOptionRegistration
  valueProp(): unknown {
    return this.value();
  }

  isDisabled(): boolean {
    return this.disabled();
  }

  labelText(): string {
    // Lectura (no mutación) del texto proyectado para reflejarlo en el
    // trigger: no hay vía idiomática sin tocar el DOM cuando el contenido es
    // rico (mismo mecanismo que MatOption). Excepción documentada en el
    // design.md de aaa-016.
    const projected = this.elementRef.nativeElement.textContent?.trim();
    return projected || this.label();
  }

  optionId(): string {
    return this.id;
  }

  protected isSelected(): boolean {
    return this.select.isSelectedValue(this.value());
  }

  protected isActive(): boolean {
    return this.select.isActiveOption(this);
  }

  protected onClick(): void {
    this.select.selectFromOption(this);
  }
}

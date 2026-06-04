import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type DsButtonVariant = 'primary' | 'secondary' | 'ghost';
export type DsButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ds-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      [attr.data-variant]="variant()"
      [attr.data-size]="size()"
      [disabled]="disabled()"
      (click)="handleClick($event)"
    >
      <ng-content />
    </button>
  `,
  styleUrl: './button.component.css',
})
export class DsButton {
  readonly variant = input<DsButtonVariant>('primary');
  readonly size = input<DsButtonSize>('md');
  readonly disabled = input<boolean>(false);
  readonly clicked = output<MouseEvent>();

  handleClick(event: MouseEvent): void {
    if (this.disabled()) {
      return;
    }
    this.clicked.emit(event);
  }
}

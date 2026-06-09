import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type DsButtonVariant = 'primary' | 'secondary' | 'ghost';
export type DsButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ds-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class DsButton {
  readonly variant = input<DsButtonVariant>('primary');
  readonly size = input<DsButtonSize>('md');
  readonly disabled = input<boolean>(false);
  readonly clicked = output<MouseEvent>();
}

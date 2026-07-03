import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type DsButtonVariant = 'primary' | 'secondary' | 'ghost';
export type DsButtonSize = 'sm' | 'md' | 'lg';

let nextReasonId = 0;

@Component({
  selector: 'ds-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class DsButton {
  readonly variant = input<DsButtonVariant>('primary');
  readonly size = input<DsButtonSize>('md');
  readonly disabled = input<boolean>(false);
  readonly disabledReason = input<string>('');
  readonly clicked = output<MouseEvent>();

  protected readonly reasonId = `ds-button-reason-${nextReasonId++}`;
  protected readonly describedBy = computed(() =>
    this.disabled() && this.disabledReason() ? this.reasonId : null,
  );

  protected onClick(event: MouseEvent): void {
    // aria-disabled no bloquea el click nativo (a diferencia del disabled nativo);
    // Enter/Space sobre un <button> también disparan un click. La guarda cubre ambos.
    if (this.disabled()) return;
    this.clicked.emit(event);
  }
}

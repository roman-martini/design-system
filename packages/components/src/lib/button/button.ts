import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { DsSpinner } from '../spinner';

export type DsButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'outline'
  | 'danger'
  | 'danger-outline'
  | 'danger-ghost';
export type DsButtonSize = 'sm' | 'md' | 'lg';

let nextReasonId = 0;

@Component({
  selector: 'ds-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DsSpinner],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class DsButton {
  readonly variant = input<DsButtonVariant>('primary');
  readonly size = input<DsButtonSize>('md');
  readonly disabled = input<boolean>(false);
  readonly disabledReason = input<string>('');
  readonly loading = input<boolean>(false);
  readonly loadingText = input<string>();
  readonly clicked = output<MouseEvent>();

  protected readonly reasonId = `ds-button-reason-${nextReasonId++}`;

  // Precedencia loading > disabled: mientras carga, el motivo de disabled no se muestra ni describe.
  protected readonly showReason = computed(
    () => this.disabled() && !!this.disabledReason() && !this.loading(),
  );
  protected readonly describedBy = computed(() => (this.showReason() ? this.reasonId : null));
  protected readonly ariaDisabled = computed(() =>
    this.disabled() && !this.loading() ? 'true' : null,
  );
  protected readonly ariaBusy = computed(() => (this.loading() ? 'true' : null));
  // null = sin carga; 'replace' congela el ancho (default); 'text' muestra spinner + loadingText.
  protected readonly loadingMode = computed(() =>
    this.loading() ? (this.loadingText() ? 'text' : 'replace') : null,
  );

  protected onClick(event: MouseEvent): void {
    // aria-disabled/aria-busy no bloquean el click nativo; Enter/Space sobre un <button>
    // también disparan un click. La guarda cubre disabled y loading (loading tiene precedencia).
    if (this.disabled() || this.loading()) return;
    this.clicked.emit(event);
  }
}

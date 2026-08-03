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
export type DsButtonType = 'button' | 'submit' | 'reset';

let nextReasonId = 0;

@Component({
  selector: 'ds-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DsSpinner],
  templateUrl: './button.html',
  styleUrl: './button.css',
  host: {
    // El rol lo tiene el <button> interno: el nombre accesible se reenvía ahí.
    // Angular no remueve el atributo que un input con alias consume, y sobre el
    // host quedaría inerte además de ser una violación (aria-prohibited-attr).
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
  },
})
export class DsButton {
  readonly variant = input<DsButtonVariant>('primary');
  readonly size = input<DsButtonSize>('md');
  readonly type = input<DsButtonType>('button');
  readonly disabled = input<boolean>(false);
  readonly disabledReason = input<string>('');
  readonly loading = input<boolean>(false);
  readonly loadingText = input<string>();
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });
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
    if (this.disabled() || this.loading()) {
      // Con type="submit" no alcanza con no emitir: el <button> enviaría el
      // formulario igual. ADR-011 ya anticipó esta guarda al elegir
      // aria-disabled sobre el disabled nativo.
      event.preventDefault();
      return;
    }
    this.clicked.emit(event);
  }
}

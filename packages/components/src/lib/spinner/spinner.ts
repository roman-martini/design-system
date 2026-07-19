import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type DsSpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'ds-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './spinner.html',
  styleUrl: './spinner.css',
  host: {
    '[attr.data-size]': 'size()',
    '[attr.role]': 'announced() ? "status" : null',
    '[attr.aria-hidden]': 'announced() ? null : "true"',
  },
})
export class DsSpinner {
  readonly size = input<DsSpinnerSize>('md');
  readonly label = input<string>('Cargando');

  // label="" opta por el modo decorativo: el contexto contenedor es dueño del anuncio.
  protected readonly announced = computed(() => this.label().length > 0);
}

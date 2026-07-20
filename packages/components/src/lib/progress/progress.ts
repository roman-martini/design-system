import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type DsProgressSize = 'sm' | 'md' | 'lg';
export type DsProgressTone = 'primary' | 'success' | 'danger';

@Component({
  selector: 'ds-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './progress.html',
  styleUrl: './progress.css',
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-tone]': 'tone()',
  },
})
export class DsProgress {
  // null = indeterminada (una sola vía, sin flag booleano paralelo).
  readonly value = input<number | null>(null);
  readonly max = input<number>(100);
  readonly size = input<DsProgressSize>('md');
  readonly tone = input<DsProgressTone>('primary');
  // Solo determinada: visualización del porcentaje (el valor accesible existe siempre).
  readonly showValue = input<boolean>(false);
  // label="" opta por el modo decorativo: el contexto contenedor es dueño del
  // anuncio (patrón DsSpinner, aaa-023).
  readonly label = input<string>('Progreso');

  protected readonly indeterminate = computed(() => this.value() === null);

  // Valor efectivo clampeado a [0, max]; max <= 0 degrada a barra vacía.
  protected readonly clampedValue = computed(() => {
    const max = Math.max(this.max(), 0);
    return Math.min(Math.max(this.value() ?? 0, 0), max);
  });

  protected readonly percent = computed(() => {
    const max = this.max();
    if (max <= 0) {
      return 0;
    }
    return (this.clampedValue() / max) * 100;
  });

  protected readonly roundedPercent = computed(() => Math.round(this.percent()));
}

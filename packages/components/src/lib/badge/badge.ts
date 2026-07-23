import { ChangeDetectionStrategy, Component, computed, contentChild, input } from '@angular/core';

import { DsBadgeIcon } from './badge-icon';

export type DsBadgeTone = 'neutral' | 'primary' | 'danger' | 'success' | 'warning' | 'info';
export type DsBadgeAppearance = 'subtle' | 'solid' | 'outline';
export type DsBadgeSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ds-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './badge.html',
  styleUrl: './badge.css',
  host: {
    '[attr.data-tone]': 'tone()',
    '[attr.data-appearance]': 'appearance()',
    '[attr.data-size]': 'size()',
  },
})
export class DsBadge {
  readonly tone = input<DsBadgeTone>('neutral');
  readonly appearance = input<DsBadgeAppearance>('subtle');
  readonly size = input<DsBadgeSize>('md');
  /** Punto de estado leading, del color del tono. Decorativo. */
  readonly dot = input<boolean>(false);

  private readonly projectedIcon = contentChild(DsBadgeIcon);

  /** dot e ícono son mutuamente excluyentes: el ícono (explícito) tiene precedencia. */
  protected readonly dotVisible = computed(() => this.dot() && !this.projectedIcon());
}

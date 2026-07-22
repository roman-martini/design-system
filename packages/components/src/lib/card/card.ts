import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type DsCardVariant = 'outline' | 'elevated' | 'flat';
export type DsCardPadding = 'comfortable' | 'compact';

@Component({
  selector: 'ds-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card.html',
  styleUrl: './card.css',
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-padding]': 'padding()',
  },
})
export class DsCard {
  readonly variant = input<DsCardVariant>('outline');
  readonly padding = input<DsCardPadding>('comfortable');
}

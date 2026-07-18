import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

let nextTooltipId = 0;

/**
 * Superficie visual del tooltip. Interno: NO se exporta desde public-api —
 * la API pública es solo la directiva DsTooltip (design.md §1 de aaa-019).
 * El host es el propio popover (top layer, ADR-014).
 */
@Component({
  selector: 'ds-tooltip-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tooltip-panel.html',
  styleUrl: './tooltip-panel.css',
  host: {
    role: 'tooltip',
    '[id]': 'id',
    popover: 'manual',
  },
})
export class DsTooltipPanel {
  readonly text = signal('');
  readonly id = `ds-tooltip-${nextTooltipId++}`;
}

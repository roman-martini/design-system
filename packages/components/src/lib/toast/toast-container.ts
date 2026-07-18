import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { DS_TOAST_CONFIG, DsToastService } from './toast';
import { DsToastItem } from './toast-item';

/**
 * Stack de toasts. Interno: NO se exporta desde public-api — la API pública es
 * DsToastService (design.md §1 de aaa-021). El host es el propio popover
 * manual (top layer, ADR-014 regla de capa): posición fija por viewport según
 * la config global, sin anclaje.
 */
@Component({
  selector: 'ds-toast-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.css',
  imports: [DsToastItem],
  host: {
    popover: 'manual',
    '[attr.data-position]': 'config.position',
  },
})
export class DsToastContainer {
  protected readonly config = inject(DS_TOAST_CONFIG);
  protected readonly toasts = inject(DsToastService);
}

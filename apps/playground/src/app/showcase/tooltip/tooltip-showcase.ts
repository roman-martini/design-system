import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { DsButton, DsTooltip } from '@romanmartinidev/components';

import { ShowcaseCase } from '../ui/showcase-case';

@Component({
  selector: 'app-tooltip-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tooltip-showcase.html',
  imports: [DsButton, DsTooltip, LucideX, ShowcaseCase],
})
export class TooltipShowcase {
  protected readonly basicSnippet = `<ds-button dsTooltip="Abre con hover (delay 500ms) o foco (inmediato)">
  Hover o Tab
</ds-button>

<!-- El tooltip DESCRIBE (aria-describedby); el aria-label NOMBRA -->
<button type="button" aria-label="Cerrar" dsTooltip="Cierra sin guardar">
  <svg lucideX size="16" strokeWidth="1.5" aria-hidden="true"></svg>
</button>`;
}

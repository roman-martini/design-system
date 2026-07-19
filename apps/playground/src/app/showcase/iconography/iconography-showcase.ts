import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideChevronDown, LucideX } from '@lucide/angular';

import { ShowcaseCase } from '../ui/showcase-case';

@Component({
  selector: 'app-iconography-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './iconography-showcase.html',
  imports: [LucideChevronDown, LucideX, ShowcaseCase],
})
export class IconographyShowcase {
  protected readonly iconsSnippet = `import { LucideX } from '@lucide/angular';

<!-- decorativo junto a texto: aria-hidden -->
<svg lucideX size="16" strokeWidth="1.5" aria-hidden="true"></svg>

<!-- semántico (ícono-only): el control lleva el nombre -->
<button type="button" aria-label="Cerrar">
  <svg lucideX size="16" strokeWidth="1.5" aria-hidden="true"></svg>
</button>`;
}

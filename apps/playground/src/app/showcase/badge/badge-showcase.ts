import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideCheck } from '@lucide/angular';
import { DsBadge, DsBadgeAppearance, DsBadgeIcon, DsBadgeTone } from '@romanmartinidev/components';

import { ShowcaseCase } from '../ui/showcase-case';

@Component({
  selector: 'app-badge-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './badge-showcase.html',
  imports: [DsBadge, DsBadgeIcon, LucideCheck, ShowcaseCase],
})
export class BadgeShowcase {
  protected readonly tones: readonly DsBadgeTone[] = [
    'neutral',
    'primary',
    'danger',
    'success',
    'warning',
    'info',
  ];
  protected readonly appearances: readonly DsBadgeAppearance[] = ['subtle', 'solid', 'outline'];

  protected readonly matrixSnippet = `<!-- Dos ejes: tone (6) × appearance (3). Default: neutral / subtle -->
<ds-badge tone="success" appearance="subtle">Active</ds-badge>
<ds-badge tone="danger" appearance="solid">Error</ds-badge>
<ds-badge tone="primary" appearance="outline">Draft</ds-badge>`;

  protected readonly sizesSnippet = `<ds-badge size="sm">Small</ds-badge>
<ds-badge size="md">Medium</ds-badge>
<ds-badge size="lg">Large</ds-badge>`;

  protected readonly iconDotSnippet = `<!-- ícono proyectado (hereda el color del tono) o punto de estado -->
<ds-badge tone="success">
  <svg lucideCheck dsBadgeIcon size="14" strokeWidth="2.5"></svg>
  Active
</ds-badge>
<ds-badge tone="warning" [dot]="true">Pending</ds-badge>`;
}

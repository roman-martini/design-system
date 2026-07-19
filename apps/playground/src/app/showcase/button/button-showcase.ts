import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsButton } from '@romanmartinidev/components';

import { ShowcaseCase } from '../ui/showcase-case';

@Component({
  selector: 'app-button-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button-showcase.html',
  imports: [DsButton, ShowcaseCase],
})
export class ButtonShowcase {
  protected readonly variantsSnippet = `<ds-button variant="primary" (clicked)="save()">Primary</ds-button>
<ds-button variant="secondary" (clicked)="cancel()">Secondary</ds-button>
<ds-button variant="ghost" (clicked)="dismiss()">Ghost</ds-button>`;

  protected readonly sizesSnippet = `<ds-button size="sm">Small</ds-button>
<ds-button size="md">Medium</ds-button>
<ds-button size="lg">Large</ds-button>`;

  protected readonly disabledSnippet = `<!-- aria-disabled: sigue focuseable y anunciado (ADR-011) -->
<ds-button [disabled]="true">Primary disabled</ds-button>
<ds-button [disabled]="true" disabledReason="Completá los campos requeridos para continuar">
  Enviar
</ds-button>`;

  protected logDemoClick(label: string): void {
    console.log(`[showcase] clicked: ${label}`);
  }
}

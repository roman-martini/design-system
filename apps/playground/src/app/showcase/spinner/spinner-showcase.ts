import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsButton, DsSpinner } from '@romanmartinidev/components';

import { ShowcaseCase } from '../ui/showcase-case';

@Component({
  selector: 'app-spinner-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './spinner-showcase.html',
  imports: [DsButton, DsSpinner, ShowcaseCase],
})
export class SpinnerShowcase {
  protected readonly sizesSnippet = `<ds-spinner size="xs" />
<ds-spinner size="sm" />
<ds-spinner size="md" />
<ds-spinner size="lg" />`;

  protected readonly buttonSnippet = `<!-- Composición: label="" lo vuelve decorativo, el botón ya comunica la carga -->
<ds-button variant="primary" [disabled]="true">
  <ds-spinner size="xs" label="" />
  Guardando…
</ds-button>`;

  protected readonly labelSnippet = `<!-- El label se anuncia como role="status" sin mostrarse -->
<ds-spinner label="Guardando borrador" />

<!-- currentColor: hereda el color del contexto -->
<p style="color: var(--ds-semantic-color-text-success)">
  <ds-spinner size="sm" label="" /> Sincronizando…
</p>`;
}

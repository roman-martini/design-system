import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  DsButton,
  DsCard,
  DsCardContent,
  DsCardDescription,
  DsCardFooter,
  DsCardHeader,
  DsCardTitle,
  DsCheckbox,
} from '@romanmartinidev/components';

import { ShowcaseCase } from '../ui/showcase-case';

@Component({
  selector: 'app-card-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card-showcase.html',
  imports: [
    DsButton,
    DsCard,
    DsCardContent,
    DsCardDescription,
    DsCardFooter,
    DsCardHeader,
    DsCardTitle,
    DsCheckbox,
    ShowcaseCase,
  ],
})
export class CardShowcase {
  protected readonly variantsSnippet = `<ds-card variant="outline">…</ds-card>  <!-- default: borde + sombra sutil -->
<ds-card variant="elevated">…</ds-card> <!-- superficie elevada, sombra mayor -->
<ds-card variant="flat">…</ds-card>     <!-- borde sin sombra -->`;

  protected readonly paddingSnippet = `<ds-card padding="comfortable">…</ds-card> <!-- default -->
<ds-card padding="compact">…</ds-card>     <!-- denso, para listas -->`;

  protected readonly structureSnippet = `<!-- Sub-partes opcionales; dsCardTitle como atributo conserva el heading real -->
<ds-card>
  <ds-card-header>
    <h2 dsCardTitle>Cookie Settings</h2>
    <p dsCardDescription>Manage your cookie settings here.</p>
  </ds-card-header>
  <ds-card-content>…</ds-card-content>
  <ds-card-footer>
    <ds-button variant="secondary">Save preferences</ds-button>
  </ds-card-footer>
</ds-card>`;
}

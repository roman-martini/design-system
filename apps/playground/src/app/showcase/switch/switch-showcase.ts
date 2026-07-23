import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  DsButton,
  DsCard,
  DsCardContent,
  DsCardDescription,
  DsCardFooter,
  DsCardHeader,
  DsCardTitle,
  DsSwitch,
} from '@romanmartinidev/components';

import { ShowcaseCase } from '../ui/showcase-case';

@Component({
  selector: 'app-switch-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './switch-showcase.html',
  imports: [
    DsButton,
    DsCard,
    DsCardContent,
    DsCardDescription,
    DsCardFooter,
    DsCardHeader,
    DsCardTitle,
    DsSwitch,
    ShowcaseCase,
  ],
})
export class SwitchShowcase {
  protected readonly necessary = signal(true);
  protected readonly functional = signal(false);

  protected readonly sizesSnippet = `<ds-switch size="sm" label="Small" />
<ds-switch size="md" label="Medium" />
<ds-switch size="lg" label="Large" />`;

  protected readonly cookieSnippet = `<!-- Switch = acción inmediata (settings). Integra Angular Forms vía CVA. -->
<ds-switch [(checked)]="strictlyNecessary" label="Strictly Necessary" />
<ds-switch [(checked)]="functionalCookies" label="Functional Cookies" />`;
}

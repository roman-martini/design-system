import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsRadio, DsRadioGroup } from '@romanmartinidev/components';

import { ShowcaseCase } from '../ui/showcase-case';

@Component({
  selector: 'app-radio-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './radio-showcase.html',
  imports: [DsRadio, DsRadioGroup, ShowcaseCase],
})
export class RadioShowcase {
  protected readonly sizesSnippet = `<ds-radio-group>
  <ds-radio [value]="'sm'" size="sm" label="Small" />
  <ds-radio [value]="'md'" size="md" label="Medium" />
  <ds-radio [value]="'lg'" size="lg" label="Large" />
</ds-radio-group>`;
}

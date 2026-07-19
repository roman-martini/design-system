import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DsCheckbox } from '@romanmartinidev/components';

import { ShowcaseCase } from '../ui/showcase-case';

@Component({
  selector: 'app-checkbox-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkbox-showcase.html',
  imports: [DsCheckbox, ReactiveFormsModule, ShowcaseCase],
})
export class CheckboxShowcase {
  protected readonly checkboxState = signal(false);
  protected readonly indeterminateState = signal(true);
  protected readonly subscribeCtrl = new FormControl<boolean>(false, { nonNullable: true });

  protected readonly statesSnippet = `<ds-checkbox [(checked)]="accepted" label="Toggle controlled" />
<ds-checkbox [checked]="true" label="Checked default" />
<ds-checkbox [indeterminate]="someSelected()" label="Indeterminate" />
<ds-checkbox [disabled]="true" label="Disabled" />`;

  protected readonly sizesSnippet = `<ds-checkbox size="sm" label="Small" />
<ds-checkbox size="md" label="Medium" />
<ds-checkbox size="lg" label="Large" />`;

  protected readonly formSnippet = `terms = new FormControl(false, { nonNullable: true });

<ds-checkbox [formControl]="terms">
  Acepto los <a href="/tos">términos</a>
</ds-checkbox>`;
}

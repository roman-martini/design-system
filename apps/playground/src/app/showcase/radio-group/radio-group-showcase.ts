import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DsRadio, DsRadioGroup } from '@romanmartinidev/components';

import { ShowcaseCase } from '../ui/showcase-case';

@Component({
  selector: 'app-radio-group-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './radio-group-showcase.html',
  imports: [DsRadio, DsRadioGroup, ReactiveFormsModule, ShowcaseCase],
})
export class RadioGroupShowcase {
  protected readonly selectedFramework = signal<string>('angular');
  protected readonly frameworkCtrl = new FormControl<string>('react', { nonNullable: true });

  protected readonly twoWaySnippet = `framework = signal('angular');

<ds-radio-group [(value)]="framework">
  <ds-radio [value]="'angular'" label="Angular" />
  <ds-radio [value]="'react'" label="React" />
  <ds-radio [value]="'vue'" label="Vue" />
</ds-radio-group>`;

  protected readonly formSnippet = `framework = new FormControl('react', { nonNullable: true });

<ds-radio-group [formControl]="framework">
  <ds-radio [value]="'angular'" label="Angular" />
  <ds-radio [value]="'react'" label="React" />
  <ds-radio [value]="'vue'" label="Vue" />
</ds-radio-group>`;
}

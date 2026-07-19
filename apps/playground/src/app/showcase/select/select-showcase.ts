import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DsOption, DsSelect } from '@romanmartinidev/components';

import { ShowcaseCase } from '../ui/showcase-case';

@Component({
  selector: 'app-select-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-showcase.html',
  imports: [DsOption, DsSelect, ReactiveFormsModule, ShowcaseCase],
})
export class SelectShowcase {
  protected readonly selectedCountry = signal<string | null>(null);
  protected readonly countryCtrl = new FormControl<string>('ar', { nonNullable: true });

  protected readonly twoWaySnippet = `country = signal<string | null>(null);

<ds-select [(value)]="country" placeholder="Elegí un país" aria-label="País">
  <ds-option [value]="'ar'" label="Argentina" />
  <ds-option [value]="'br'" label="Brasil" />
  <ds-option [value]="'uy'" [disabled]="true" label="Uruguay (sin stock)" />
</ds-select>`;

  protected readonly formSnippet = `country = new FormControl('ar', { nonNullable: true });

<ds-select [formControl]="country" size="sm" aria-label="País">
  <ds-option [value]="'ar'" label="Argentina" />
  <ds-option [value]="'br'" label="Brasil" />
</ds-select>`;
}

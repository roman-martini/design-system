import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideChevronDown, LucideX } from '@lucide/angular';
import {
  DsButton,
  DsCheckbox,
  DsInput,
  DsModal,
  DsOption,
  DsRadio,
  DsRadioGroup,
  DsSelect,
  DsTab,
  DsTabs,
  DsTooltip,
} from '@romanmartinidev/components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    DsButton,
    DsCheckbox,
    DsInput,
    DsModal,
    DsOption,
    DsRadio,
    DsRadioGroup,
    DsSelect,
    DsTab,
    DsTabs,
    DsTooltip,
    LucideChevronDown,
    LucideX,
    ReactiveFormsModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly checkboxState = signal(false);
  protected readonly indeterminateState = signal(true);
  protected readonly subscribeCtrl = new FormControl<boolean>(false, { nonNullable: true });

  protected readonly selectedFramework = signal<string>('angular');
  protected readonly frameworkCtrl = new FormControl<string>('react', { nonNullable: true });

  protected readonly modalOpen = signal(false);

  protected readonly selectedCountry = signal<string | null>(null);
  protected readonly countryCtrl = new FormControl<string>('ar', { nonNullable: true });

  protected readonly emailCtrl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });

  protected readonly activeTab = signal<string | null>(null);

  protected handleClick(label: string): void {
    console.log(`[playground] clicked: ${label}`);
  }
}

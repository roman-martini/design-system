import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideChevronDown, LucideX } from '@lucide/angular';
import { DsButton, DsCheckbox, DsModal, DsRadio, DsRadioGroup } from '@romanmartinidev/components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    DsButton,
    DsCheckbox,
    DsModal,
    DsRadio,
    DsRadioGroup,
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

  protected handleClick(label: string): void {
    console.log(`[playground] clicked: ${label}`);
  }
}

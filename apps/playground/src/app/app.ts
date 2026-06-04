import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DsButton, DsCheckbox } from '@romanmartinidev/components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DsButton, DsCheckbox, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly checkboxState = signal(false);
  protected readonly indeterminateState = signal(true);
  protected readonly subscribeCtrl = new FormControl<boolean>(false, { nonNullable: true });

  protected handleClick(label: string): void {
    console.log(`[playground] clicked: ${label}`);
  }
}

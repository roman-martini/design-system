import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent } from '@romanmartinidev/components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected handleClick(label: string): void {
    console.log(`[playground] clicked: ${label}`);
  }
}

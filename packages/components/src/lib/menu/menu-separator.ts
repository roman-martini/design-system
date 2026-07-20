import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ds-menu-separator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  styleUrl: './menu-separator.css',
  host: {
    role: 'separator',
    'aria-orientation': 'horizontal',
  },
})
export class DsMenuSeparator {}

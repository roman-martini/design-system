import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ds-card-content',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card-content.html',
  styleUrl: './card-content.css',
})
export class DsCardContent {}

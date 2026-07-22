import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ds-card-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card-header.html',
  styleUrl: './card-header.css',
})
export class DsCardHeader {}

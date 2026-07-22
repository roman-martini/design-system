import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ds-card-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card-footer.html',
  styleUrl: './card-footer.css',
})
export class DsCardFooter {}

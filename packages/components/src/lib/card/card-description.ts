import { ChangeDetectionStrategy, Component } from '@angular/core';

// Selector híbrido, mismo criterio que DsCardTitle (design §2 de aaa-032).
@Component({
  selector: 'ds-card-description, [dsCardDescription]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card-description.html',
  styleUrl: './card-description.css',
})
export class DsCardDescription {}

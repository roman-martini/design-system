import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DsButton, DsProgress } from '@romanmartinidev/components';

import { ShowcaseCase } from '../ui/showcase-case';

@Component({
  selector: 'app-progress-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './progress-showcase.html',
  imports: [DsButton, DsProgress, ShowcaseCase],
})
export class ProgressShowcase {
  protected readonly demoValue = signal(40);

  protected step(delta: number): void {
    this.demoValue.update((v) => Math.min(Math.max(v + delta, 0), 100));
  }

  protected readonly basicSnippet = `<ds-progress [value]="40" />
<!-- value null (u omitido) = indeterminada -->`;

  protected readonly showValueSnippet = `<ds-progress [value]="progreso()" [showValue]="true" />`;

  protected readonly tonesSnippet = `<ds-progress [value]="100" tone="success" label="Completado" />
<ds-progress [value]="35" tone="danger" label="Con errores" />`;

  protected readonly indeterminateSnippet = `<ds-progress label="Procesando" />`;
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DsButton, DsModal, DsToastService } from '@romanmartinidev/components';

import { ShowcaseCase } from '../ui/showcase-case';

@Component({
  selector: 'app-modal-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './modal-showcase.html',
  imports: [DsButton, DsModal, ShowcaseCase],
})
export class ModalShowcase {
  protected readonly modalOpen = signal(false);
  protected readonly toasts = inject(DsToastService);

  protected readonly basicSnippet = `opened = signal(false);

<ds-button variant="primary" (clicked)="opened.set(true)">Abrir modal</ds-button>
<ds-modal [(open)]="opened" heading="Confirmar acción" size="sm">
  <p>Contenido del modal.</p>
  <div ds-modal-footer>
    <ds-button variant="ghost" (clicked)="opened.set(false)">Cancelar</ds-button>
    <ds-button variant="primary" (clicked)="opened.set(false)">Confirmar</ds-button>
  </div>
</ds-modal>`;
}

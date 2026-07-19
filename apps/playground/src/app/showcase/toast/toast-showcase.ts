import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DsButton, DsToastService } from '@romanmartinidev/components';

import { ShowcaseCase } from '../ui/showcase-case';

@Component({
  selector: 'app-toast-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast-showcase.html',
  imports: [DsButton, ShowcaseCase],
})
export class ToastShowcase {
  protected readonly toasts = inject(DsToastService);

  protected readonly variantsSnippet = `private readonly toasts = inject(DsToastService);

this.toasts.success('Cambios guardados');
this.toasts.info('Sincronizando en segundo plano');
this.toasts.warning('La sesión expira en 5 minutos');
this.toasts.danger('No se pudo guardar'); // persiste hasta cierre manual`;

  protected readonly actionSnippet = `this.toasts.info('Elemento archivado', {
  action: { label: 'Deshacer', callback: () => this.restore() },
});

// posición global (una por app, default bottom-right):
// provideDsToasts({ position: 'top-right' }) en app.config.ts`;

  protected undoableToast(): void {
    this.toasts.info('Elemento archivado', {
      action: { label: 'Deshacer', callback: () => this.toasts.success('Restaurado') },
    });
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  DsButton,
  DsCard,
  DsCardContent,
  DsCardDescription,
  DsCardFooter,
  DsCardHeader,
  DsCardTitle,
  DsCheckbox,
  DsInput,
  DsRadio,
  DsRadioGroup,
  DsTextarea,
  DsToastService,
} from '@romanmartinidev/components';

/**
 * Prototipo del hito H1 ([D-023]): una pantalla real construida **100% con
 * componentes del kit**, replicando la referencia `modern-minimal`
 * (`docs/reference/components/moder-minimal/2.image.png`).
 *
 * No es un showcase: no hay una sección por componente ni snippets de código.
 * Es el formulario que un producto real tendría, y su función es probar que el
 * kit **compone** — un inventario demuestra que las piezas existen; esto
 * demuestra que sirven juntas.
 *
 * Regla del hito: lo que no se pueda construir con el kit es un **hallazgo**,
 * no una excusa para escribir CSS a mano. El CSS de este archivo se limita a
 * layout (grid y gaps por tokens); ningún estilo de componente se replica acá.
 */
@Component({
  selector: 'app-upgrade-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    DsButton,
    DsCard,
    DsCardContent,
    DsCardDescription,
    DsCardFooter,
    DsCardHeader,
    DsCardTitle,
    DsCheckbox,
    DsInput,
    DsRadio,
    DsRadioGroup,
    DsTextarea,
  ],
  templateUrl: './upgrade-form.html',
  styleUrl: './upgrade-form.css',
})
export class UpgradeForm {
  private readonly toasts = inject(DsToastService);

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly cardNumber = signal('');
  protected readonly expiry = signal('');
  protected readonly cvc = signal('');
  protected readonly plan = signal<'starter' | 'pro'>('starter');
  protected readonly notes = signal('');
  protected readonly acceptedTerms = signal(false);
  protected readonly wantsEmails = signal(true);

  protected readonly canSubmit = computed(
    () => this.name().trim() !== '' && this.email().trim() !== '' && this.acceptedTerms(),
  );

  protected readonly submitDisabledReason = computed(() =>
    this.canSubmit() ? '' : 'Completá nombre, email y aceptá los términos',
  );

  protected submit(): void {
    this.toasts.success(`Plan ${this.plan() === 'pro' ? 'Pro' : 'Starter'} activado`);
  }

  protected cancel(): void {
    this.toasts.info('Cambios descartados');
  }
}

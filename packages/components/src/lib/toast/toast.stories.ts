import { Component, inject } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { DsButton } from '../button/button';
import { DsToastService, provideDsToasts } from './toast';

// La API pública es la service: las stories usan un host demo que la inyecta.
@Component({
  selector: 'ds-toast-demo',
  standalone: true,
  imports: [DsButton],
  template: `
    <div style="display: flex; gap: 1rem; flex-wrap: wrap; padding: 2rem;">
      <ds-button variant="secondary" (clicked)="toasts.success('Cambios guardados')"
        >success</ds-button
      >
      <ds-button variant="secondary" (clicked)="toasts.info('Sincronizando en segundo plano')"
        >info</ds-button
      >
      <ds-button variant="secondary" (clicked)="toasts.warning('La sesión expira en 5 minutos')"
        >warning</ds-button
      >
      <ds-button variant="secondary" (clicked)="toasts.danger('No se pudo guardar: sin conexión')">
        danger (persistente)
      </ds-button>
    </div>
  `,
})
class ToastDemo {
  protected readonly toasts = inject(DsToastService);
}

@Component({
  selector: 'ds-toast-demo-extras',
  standalone: true,
  imports: [DsButton],
  template: `
    <div style="display: flex; gap: 1rem; flex-wrap: wrap; padding: 2rem;">
      <ds-button variant="secondary" (clicked)="withAction()">Con acción (Deshacer)</ds-button>
      <ds-button variant="secondary" (clicked)="persistent()">Persistente (duration: 0)</ds-button>
      <ds-button variant="secondary" (clicked)="burst()">Ráfaga de 3 (stack)</ds-button>
    </div>
  `,
})
class ToastDemoExtras {
  protected readonly toasts = inject(DsToastService);

  protected withAction(): void {
    this.toasts.info('Elemento archivado', {
      action: { label: 'Deshacer', callback: () => this.toasts.success('Restaurado') },
    });
  }

  protected persistent(): void {
    this.toasts.info('Me quedo hasta que me cierres', { duration: 0 });
  }

  protected burst(): void {
    this.toasts.success('Primero');
    this.toasts.info('Segundo');
    this.toasts.warning('Tercero');
  }
}

const meta: Meta<ToastDemo> = {
  title: 'Components/Toast',
  component: ToastDemo,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ToastDemo, ToastDemoExtras] })],
};

export default meta;

type Story = StoryObj<ToastDemo>;

// Timer pausable: hover o foco sobre el toast congelan el auto-cierre (WCAG 2.2.1).
// Danger persiste hasta cierre manual — los errores se leen, no se esfuman.
export const Variants: Story = {};

export const ActionAndStack: Story = {
  render: () => ({ template: `<ds-toast-demo-extras />` }),
};

// La posición es GLOBAL por provider (provideDsToasts) — nunca por toast:
// una app notifica siempre desde el mismo lugar (HU-008 §1).
export const TopRightPosition: Story = {
  decorators: [applicationConfig({ providers: [provideDsToasts({ position: 'top-right' })] })],
};

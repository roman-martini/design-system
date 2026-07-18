import { LucideX } from '@lucide/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { DsButton } from '../button/button';
import { DsTooltip } from './tooltip';

const meta: Meta<DsTooltip> = {
  title: 'Components/Tooltip',
  component: DsTooltip,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [DsTooltip, DsButton] })],
};

export default meta;

type Story = StoryObj<DsTooltip>;

export const Default: Story = {
  render: () => ({
    template: `
      <div style="padding: 4rem; display: flex; gap: 1rem;">
        <ds-button variant="secondary" dsTooltip="Guarda los cambios del formulario">Guardar</ds-button>
      </div>
    `,
  }),
};

export const Placements: Story = {
  render: () => ({
    template: `
      <div style="padding: 6rem; display: flex; gap: 1rem; justify-content: center;">
        <ds-button variant="ghost" dsTooltip="Arriba (default)" dsTooltipPlacement="top">top</ds-button>
        <ds-button variant="ghost" dsTooltip="Abajo" dsTooltipPlacement="bottom">bottom</ds-button>
        <ds-button variant="ghost" dsTooltip="Izquierda" dsTooltipPlacement="left">left</ds-button>
        <ds-button variant="ghost" dsTooltip="Derecha" dsTooltipPlacement="right">right</ds-button>
      </div>
    `,
  }),
};

// El tooltip es DESCRIPCIÓN (aria-describedby), no label: un botón ícono-only
// sigue necesitando su aria-label propio. El tooltip complementa, no nombra.
export const OnIconButton: Story = {
  decorators: [moduleMetadata({ imports: [DsTooltip, LucideX] })],
  render: () => ({
    template: `
      <div style="padding: 4rem;">
        <button
          type="button"
          aria-label="Cerrar panel"
          dsTooltip="Cierra el panel sin guardar los cambios"
          style="display:inline-flex; padding: var(--ds-semantic-space-2xs); border: none; background: transparent; cursor: pointer; color: var(--ds-semantic-color-icon-default);"
        >
          <svg lucideX size="16" strokeWidth="1.5" aria-hidden="true"></svg>
        </button>
      </div>
    `,
  }),
};

export const WithDelay: Story = {
  render: () => ({
    template: `
      <div style="padding: 4rem; display: flex; gap: 1rem;">
        <ds-button variant="secondary" dsTooltip="Delay default (token, 500ms)">Default</ds-button>
        <ds-button variant="secondary" dsTooltip="Sin delay" [dsTooltipDelay]="0">Inmediato</ds-button>
        <ds-button variant="secondary" dsTooltip="Delay largo" [dsTooltipDelay]="1500">1.5s</ds-button>
      </div>
    `,
  }),
};

// Limitación conocida (HU-007): los tooltips son hover/focus — en touch la
// información debe estar disponible por otra vía (responsabilidad del consumidor).
export const KeyboardAndEscape: Story = {
  render: () => ({
    template: `
      <div style="padding: 4rem; display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;">
        <p style="font-family: var(--ds-font-family-sans); margin: 0;">
          Navegá con Tab: el tooltip abre inmediato con el foco y ESC lo cierra sin mover el foco (WCAG 1.4.13).
        </p>
        <ds-button variant="secondary" dsTooltip="Abre con foco, sin delay">Enfocame</ds-button>
      </div>
    `,
  }),
};

import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { DsButton } from '../button/button';
import { DsModal } from './modal';

const meta: Meta<DsModal> = {
  title: 'Components/Modal',
  component: DsModal,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [DsModal, DsButton] })],
  argTypes: {
    size: {
      control: { type: 'inline-radio' },
      options: ['sm', 'md', 'lg', 'xl'],
    },
    heading: { control: { type: 'text' } },
    closeLabel: { control: { type: 'text' } },
    closeOnEscape: { control: { type: 'boolean' } },
    closeOnOverlay: { control: { type: 'boolean' } },
  },
  args: {
    size: 'md',
    heading: 'Confirmar acción',
    closeLabel: 'Cerrar',
    closeOnEscape: true,
    closeOnOverlay: true,
  },
};

export default meta;

type Story = StoryObj<DsModal>;

export const Default: Story = {
  render: (args) => ({
    props: { ...args, open: false },
    template: `
      <ds-button variant="primary" (clicked)="open = true">Abrir modal</ds-button>
      <ds-modal
        [(open)]="open"
        [size]="size"
        [heading]="heading"
        [closeLabel]="closeLabel"
        [closeOnEscape]="closeOnEscape"
        [closeOnOverlay]="closeOnOverlay"
      >
        <p>¿Confirmás la acción? Este es el cuerpo del modal, proyectado en el slot default.</p>
        <div ds-modal-footer>
          <ds-button variant="ghost" (clicked)="open = false">Cancelar</ds-button>
          <ds-button variant="primary" (clicked)="open = false">Confirmar</ds-button>
        </div>
      </ds-modal>
    `,
  }),
};

export const Sizes: Story = {
  parameters: {
    controls: { exclude: ['size'] },
  },
  render: (args) => ({
    props: { ...args, openSize: null },
    template: `
      <div style="display:flex; gap:1rem; flex-wrap:wrap;">
        <ds-button variant="secondary" (clicked)="openSize = 'sm'">sm (448px)</ds-button>
        <ds-button variant="secondary" (clicked)="openSize = 'md'">md (640px)</ds-button>
        <ds-button variant="secondary" (clicked)="openSize = 'lg'">lg (896px)</ds-button>
        <ds-button variant="secondary" (clicked)="openSize = 'xl'">xl (1152px)</ds-button>
      </div>
      @for (s of ['sm', 'md', 'lg', 'xl']; track s) {
        <ds-modal [open]="openSize === s" (openChange)="openSize = null" [size]="s" [heading]="'Modal ' + s">
          <p>El ancho deriva de <code>--ds-component-modal-size-{{ s }}</code>.</p>
        </ds-modal>
      }
    `,
  }),
};

export const SinHeading: Story = {
  name: 'Sin heading (a11y a cargo del consumidor)',
  parameters: {
    docs: {
      description: {
        story:
          'Sin `heading`, el modal no genera `aria-labelledby`: el consumidor proyecta su propio título y es responsable del nombre accesible del diálogo.',
      },
    },
  },
  render: (args) => ({
    props: { ...args, open: false },
    template: `
      <ds-button variant="primary" (clicked)="open = true">Abrir</ds-button>
      <ds-modal [(open)]="open" [size]="size">
        <h2>Título proyectado por el consumidor</h2>
        <p>Este modal no usa el input heading.</p>
      </ds-modal>
    `,
  }),
};

export const NoDismissible: Story = {
  name: 'No dismissible (solo botón X)',
  args: {
    closeOnEscape: false,
    closeOnOverlay: false,
    heading: 'Decisión requerida',
  },
  render: (args) => ({
    props: { ...args, open: false },
    template: `
      <ds-button variant="primary" (clicked)="open = true">Abrir</ds-button>
      <ds-modal
        [(open)]="open"
        [heading]="heading"
        [closeOnEscape]="closeOnEscape"
        [closeOnOverlay]="closeOnOverlay"
      >
        <p>ESC y click en el overlay están deshabilitados; la X sigue disponible (siempre hay una vía de cierre).</p>
        <div ds-modal-footer>
          <ds-button variant="primary" (clicked)="open = false">Entendido</ds-button>
        </div>
      </ds-modal>
    `,
  }),
};

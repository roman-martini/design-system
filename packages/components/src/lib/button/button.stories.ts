import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { DsButton } from './button';

const meta: Meta<DsButton> = {
  title: 'Components/Button',
  component: DsButton,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [DsButton] })],
  argTypes: {
    variant: {
      control: { type: 'inline-radio' },
      options: [
        'primary',
        'secondary',
        'ghost',
        'outline',
        'danger',
        'danger-outline',
        'danger-ghost',
      ],
    },
    size: {
      control: { type: 'inline-radio' },
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    disabledReason: {
      control: { type: 'text' },
    },
    loading: {
      control: { type: 'boolean' },
    },
    loadingText: {
      control: { type: 'text' },
    },
  },
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    disabledReason: '',
    loading: false,
    loadingText: '',
  },
};

export default meta;

type Story = StoryObj<DsButton>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<ds-button [variant]="variant" [size]="size" [disabled]="disabled">Click me</ds-button>`,
  }),
};

export const Variants: Story = {
  parameters: {
    controls: { exclude: ['variant'] },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex; gap:1rem; align-items:center; flex-wrap:wrap;">
        <ds-button variant="primary" [size]="size" [disabled]="disabled">Primary</ds-button>
        <ds-button variant="secondary" [size]="size" [disabled]="disabled">Secondary</ds-button>
        <ds-button variant="outline" [size]="size" [disabled]="disabled">Outline</ds-button>
        <ds-button variant="ghost" [size]="size" [disabled]="disabled">Ghost</ds-button>
        <ds-button variant="danger" [size]="size" [disabled]="disabled">Delete</ds-button>
        <ds-button variant="danger-outline" [size]="size" [disabled]="disabled">Delete</ds-button>
        <ds-button variant="danger-ghost" [size]="size" [disabled]="disabled">Delete</ds-button>
      </div>
    `,
  }),
};

export const DangerStates: Story = {
  // Story de estados fijos (disabled/loading en danger): no consume args a propósito.
  parameters: {
    controls: { disable: true },
  },
  render: () => ({
    template: `
      <div style="display:flex; gap:1rem; align-items:center; flex-wrap:wrap;">
        <ds-button variant="danger">Delete</ds-button>
        <ds-button variant="danger" [disabled]="true" disabledReason="Seleccioná al menos un item">
          Delete
        </ds-button>
        <ds-button variant="danger" [loading]="true">Delete</ds-button>
        <ds-button variant="danger-outline" [loading]="true" loadingText="Eliminando…">Delete</ds-button>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  parameters: {
    controls: { exclude: ['size'] },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex; gap:1rem; align-items:center;">
        <ds-button [variant]="variant" size="sm" [disabled]="disabled">Small</ds-button>
        <ds-button [variant]="variant" size="md" [disabled]="disabled">Medium</ds-button>
        <ds-button [variant]="variant" size="lg" [disabled]="disabled">Large</ds-button>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex; gap:1rem; align-items:center;">
        <ds-button variant="primary" [size]="size" [disabled]="disabled">Primary disabled</ds-button>
        <ds-button variant="secondary" [size]="size" [disabled]="disabled">Secondary disabled</ds-button>
        <ds-button variant="ghost" [size]="size" [disabled]="disabled">Ghost disabled</ds-button>
      </div>
    `,
  }),
};

export const DisabledWithReason: Story = {
  args: {
    disabled: true,
    disabledReason: 'Completá los campos requeridos para continuar',
  },
  render: (args) => ({
    props: args,
    template: `<ds-button [variant]="variant" [size]="size" [disabled]="disabled" [disabledReason]="disabledReason">Enviar</ds-button>`,
  }),
};

export const Loading: Story = {
  args: {
    loading: true,
  },
  render: (args) => ({
    props: args,
    template: `<ds-button [variant]="variant" [size]="size" [loading]="loading">Guardar</ds-button>`,
  }),
};

export const LoadingText: Story = {
  args: {
    loading: true,
    loadingText: 'Guardando…',
  },
  render: (args) => ({
    props: args,
    template: `<ds-button [variant]="variant" [size]="size" [loading]="loading" [loadingText]="loadingText">Guardar</ds-button>`,
  }),
};

export const LoadingWhileDisabled: Story = {
  args: {
    loading: true,
    disabled: true,
    disabledReason: 'Completá los campos requeridos',
  },
  render: (args) => ({
    props: args,
    template: `<ds-button [variant]="variant" [size]="size" [loading]="loading" [disabled]="disabled" [disabledReason]="disabledReason">Guardar</ds-button>`,
  }),
};

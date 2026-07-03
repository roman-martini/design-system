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
      options: ['primary', 'secondary', 'ghost'],
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
  },
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    disabledReason: '',
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
      <div style="display:flex; gap:1rem; align-items:center;">
        <ds-button variant="primary" [size]="size" [disabled]="disabled">Primary</ds-button>
        <ds-button variant="secondary" [size]="size" [disabled]="disabled">Secondary</ds-button>
        <ds-button variant="ghost" [size]="size" [disabled]="disabled">Ghost</ds-button>
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

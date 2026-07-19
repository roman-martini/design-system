import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { DsButton } from '../button/button';
import { DsSpinner } from './spinner';

const meta: Meta<DsSpinner> = {
  title: 'Components/Spinner',
  component: DsSpinner,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [DsSpinner, DsButton] })],
  argTypes: {
    size: {
      control: { type: 'inline-radio' },
      options: ['xs', 'sm', 'md', 'lg'],
    },
    label: {
      control: { type: 'text' },
    },
  },
  args: {
    size: 'md',
    label: 'Cargando',
  },
};

export default meta;

type Story = StoryObj<DsSpinner>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<ds-spinner [size]="size" [label]="label" />`,
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
        <ds-spinner size="xs" [label]="label" />
        <ds-spinner size="sm" [label]="label" />
        <ds-spinner size="md" [label]="label" />
        <ds-spinner size="lg" [label]="label" />
      </div>
    `,
  }),
};

export const InsideButton: Story = {
  parameters: {
    controls: { exclude: ['size', 'label'] },
  },
  render: () => ({
    template: `
      <ds-button variant="primary" [disabled]="true" disabledReason="">
        <ds-spinner size="xs" label="" />
        Guardando…
      </ds-button>
    `,
  }),
};

export const CustomLabel: Story = {
  args: {
    label: 'Guardando borrador',
  },
  render: (args) => ({
    props: args,
    template: `<ds-spinner [size]="size" [label]="label" />`,
  }),
};

export const Decorative: Story = {
  parameters: {
    controls: { exclude: ['label'] },
  },
  render: (args) => ({
    props: args,
    template: `
      <div role="status" style="display:flex; gap:0.5rem; align-items:center;">
        <ds-spinner [size]="size" label="" />
        <span>Sincronizando cambios…</span>
      </div>
    `,
  }),
};

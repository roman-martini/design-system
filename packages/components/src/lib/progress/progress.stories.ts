import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { DsProgress } from './progress';

const meta: Meta<DsProgress> = {
  title: 'Components/Progress',
  component: DsProgress,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [DsProgress] })],
  argTypes: {
    size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
    tone: { control: { type: 'select' }, options: ['primary', 'success', 'danger'] },
    value: { control: { type: 'number', min: 0, max: 100 } },
  },
  args: {
    value: 40,
    size: 'md',
    tone: 'primary',
    showValue: false,
  },
};

export default meta;

type Story = StoryObj<DsProgress>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<ds-progress [value]="value" [size]="size" [tone]="tone" [showValue]="showValue" />`,
  }),
};

export const ShowValue: Story = {
  args: { showValue: true, value: 67 },
  render: (args) => ({
    props: args,
    template: `<ds-progress [value]="value" [showValue]="true" />`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem;">
        <ds-progress [value]="30" size="sm" />
        <ds-progress [value]="50" size="md" />
        <ds-progress [value]="70" size="lg" />
      </div>
    `,
  }),
};

export const Tones: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem;">
        <ds-progress [value]="60" tone="primary" label="Progreso" />
        <ds-progress [value]="100" tone="success" label="Completado" />
        <ds-progress [value]="35" tone="danger" label="Con errores" />
      </div>
    `,
  }),
};

export const Indeterminate: Story = {
  render: () => ({
    template: `<ds-progress label="Procesando" />`,
  }),
};

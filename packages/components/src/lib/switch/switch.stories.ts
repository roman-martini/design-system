import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { DsSwitch } from './switch';

const meta: Meta<DsSwitch> = {
  title: 'Components/Switch',
  component: DsSwitch,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [DsSwitch] })],
  argTypes: {
    checked: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    label: { control: { type: 'text' } },
    size: { control: { type: 'inline-radio' }, options: ['sm', 'md', 'lg'] },
  },
  args: { checked: false, disabled: false, label: '', size: 'md' },
};

export default meta;

type Story = StoryObj<DsSwitch>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<ds-switch [checked]="checked" [disabled]="disabled" [label]="label" [size]="size" />`,
  }),
};

export const Sizes: Story = {
  parameters: { controls: { exclude: ['size'] } },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex; gap:1rem; align-items:center;">
        <ds-switch [checked]="checked" size="sm" label="Small" />
        <ds-switch [checked]="checked" size="md" label="Medium" />
        <ds-switch [checked]="checked" size="lg" label="Large" />
      </div>
    `,
  }),
};

export const WithLabel: Story = {
  args: { label: 'Notificaciones por email', checked: true },
  render: (args) => ({
    props: args,
    template: `<ds-switch [checked]="checked" [size]="size" [label]="label" />`,
  }),
};

export const Disabled: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex; gap:1rem; align-items:center;">
        <ds-switch [disabled]="true" label="Off disabled" />
        <ds-switch [disabled]="true" [checked]="true" label="On disabled" />
      </div>
    `,
  }),
};

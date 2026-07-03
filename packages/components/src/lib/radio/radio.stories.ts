import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { DsRadio } from './radio';

const meta: Meta<DsRadio> = {
  title: 'Components/Radio',
  component: DsRadio,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [DsRadio] })],
  argTypes: {
    value: { control: { type: 'text' } },
    disabled: { control: { type: 'boolean' } },
    label: { control: { type: 'text' } },
    size: {
      control: { type: 'inline-radio' },
      options: ['sm', 'md', 'lg'],
    },
  },
  args: {
    value: 'opt-a',
    disabled: false,
    label: 'Opción A',
    size: 'md',
  },
};

export default meta;

type Story = StoryObj<DsRadio>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<ds-radio [value]="value" [disabled]="disabled" [label]="label" [size]="size" />`,
  }),
};

export const Sizes: Story = {
  parameters: { controls: { exclude: ['size'] } },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex; flex-direction:column; gap:0.75rem;">
        <ds-radio value="sm" size="sm" label="Small" />
        <ds-radio value="md" size="md" label="Medium (default)" />
        <ds-radio value="lg" size="lg" label="Large" />
      </div>
    `,
  }),
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithRichContent: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ds-radio [value]="value" [size]="size">
        Acepto los <a href="#" style="color: var(--ds-semantic-color-text-link);">términos y condiciones</a>
      </ds-radio>
    `,
  }),
};

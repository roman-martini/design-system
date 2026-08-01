import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { DsSlider } from './slider';

const meta: Meta<DsSlider> = {
  title: 'Components/Slider',
  component: DsSlider,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [DsSlider] })],
  argTypes: {
    value: { control: { type: 'number' } },
    min: { control: { type: 'number' } },
    max: { control: { type: 'number' } },
    step: { control: { type: 'number' } },
    disabled: { control: { type: 'boolean' } },
    label: { control: { type: 'text' } },
    size: { control: { type: 'inline-radio' }, options: ['sm', 'md', 'lg'] },
    showValue: { control: { type: 'boolean' } },
    valueTooltip: { control: { type: 'boolean' } },
  },
  args: {
    value: 40,
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    label: 'Volumen',
    size: 'md',
    showValue: false,
    valueTooltip: false,
  },
};

export default meta;

type Story = StoryObj<DsSlider>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ds-slider
        [value]="value" [min]="min" [max]="max" [step]="step"
        [disabled]="disabled" [label]="label" [size]="size"
        [showValue]="showValue" [valueTooltip]="valueTooltip"
      />
    `,
  }),
};

export const WithValue: Story = {
  args: { showValue: true },
  render: (args) => ({
    props: { ...args, percent: (v: number) => `${v} %` },
    template: `
      <ds-slider
        [value]="value" [min]="min" [max]="max" [step]="step"
        [label]="label" [showValue]="true" [valueText]="percent"
      />
    `,
  }),
};

export const WithTicks: Story = {
  render: (args) => ({
    props: {
      ...args,
      tickMarks: [
        { value: 0, label: '0' },
        { value: 25 },
        { value: 50, label: '50' },
        { value: 75 },
        { value: 100, label: '100' },
      ],
    },
    template: `
      <ds-slider
        [value]="value" [min]="0" [max]="100" [step]="25"
        [label]="label" [ticks]="tickMarks"
      />
    `,
  }),
};

export const WithTooltip: Story = {
  render: (args) => ({
    props: args,
    template: `
      <p style="margin-bottom:0.5rem; font-size:0.85rem; color:#666;">
        La burbuja aparece al arrastrar o al enfocar con teclado.
      </p>
      <ds-slider [value]="value" [label]="label" [valueTooltip]="true" />
    `,
  }),
};

export const Disabled: Story = {
  render: (args) => ({
    props: args,
    template: `<ds-slider [value]="value" [label]="label" [disabled]="true" [showValue]="true" />`,
  }),
};

export const Sizes: Story = {
  parameters: { controls: { exclude: ['size'] } },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex; flex-direction:column; gap:1.5rem;">
        <ds-slider [value]="value" size="sm" label="Small" />
        <ds-slider [value]="value" size="md" label="Medium" />
        <ds-slider [value]="value" size="lg" label="Large" />
      </div>
    `,
  }),
};

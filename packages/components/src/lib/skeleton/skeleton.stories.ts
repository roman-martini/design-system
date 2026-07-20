import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { DsSkeleton } from './skeleton';

const meta: Meta<DsSkeleton> = {
  title: 'Components/Skeleton',
  component: DsSkeleton,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [DsSkeleton] })],
  argTypes: {
    shape: {
      control: { type: 'inline-radio' },
      options: ['text', 'rect', 'circle'],
    },
    width: { control: { type: 'text' } },
    height: { control: { type: 'text' } },
    radius: { control: { type: 'text' } },
  },
  args: {
    shape: 'text',
    width: '',
    height: '',
    radius: '',
  },
};

export default meta;

type Story = StoryObj<DsSkeleton>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<ds-skeleton [shape]="shape" [width]="width" [height]="height" [radius]="radius" />`,
  }),
};

export const Shapes: Story = {
  parameters: {
    controls: { exclude: ['shape'] },
  },
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; max-width:320px;">
        <ds-skeleton shape="text" />
        <ds-skeleton shape="rect" />
        <ds-skeleton shape="circle" />
      </div>
    `,
  }),
};

export const Paragraph: Story = {
  parameters: {
    controls: { exclude: ['shape', 'width', 'height', 'radius'] },
  },
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:0.5rem; max-width:320px;">
        <ds-skeleton />
        <ds-skeleton />
        <ds-skeleton width="60%" />
      </div>
    `,
  }),
};

export const CardDemo: Story = {
  parameters: {
    controls: { exclude: ['shape', 'width', 'height', 'radius'] },
  },
  render: () => ({
    template: `
      <div style="display:flex; gap:1rem; align-items:flex-start; max-width:320px;">
        <ds-skeleton shape="circle" />
        <div style="display:flex; flex-direction:column; gap:0.5rem; flex:1;">
          <ds-skeleton width="40%" />
          <ds-skeleton />
          <ds-skeleton width="80%" />
        </div>
      </div>
    `,
  }),
};

export const CustomDimensions: Story = {
  args: {
    shape: 'rect',
    width: '12rem',
    height: '6rem',
    radius: '16px',
  },
  render: (args) => ({
    props: args,
    template: `<ds-skeleton [shape]="shape" [width]="width" [height]="height" [radius]="radius" />`,
  }),
};

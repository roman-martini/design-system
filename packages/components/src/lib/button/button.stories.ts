import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Components/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
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
  },
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<ButtonComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<rmd-button [variant]="variant" [size]="size" [disabled]="disabled">Click me</rmd-button>`,
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
        <rmd-button variant="primary" [size]="size" [disabled]="disabled">Primary</rmd-button>
        <rmd-button variant="secondary" [size]="size" [disabled]="disabled">Secondary</rmd-button>
        <rmd-button variant="ghost" [size]="size" [disabled]="disabled">Ghost</rmd-button>
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
        <rmd-button [variant]="variant" size="sm" [disabled]="disabled">Small</rmd-button>
        <rmd-button [variant]="variant" size="md" [disabled]="disabled">Medium</rmd-button>
        <rmd-button [variant]="variant" size="lg" [disabled]="disabled">Large</rmd-button>
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
        <rmd-button variant="primary" [size]="size" [disabled]="disabled">Primary disabled</rmd-button>
        <rmd-button variant="secondary" [size]="size" [disabled]="disabled">Secondary disabled</rmd-button>
        <rmd-button variant="ghost" [size]="size" [disabled]="disabled">Ghost disabled</rmd-button>
      </div>
    `,
  }),
};

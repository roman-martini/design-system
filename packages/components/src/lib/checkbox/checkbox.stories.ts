import { FormControl, ReactiveFormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { CheckboxComponent } from './checkbox.component';

const meta: Meta<CheckboxComponent> = {
  title: 'Components/Checkbox',
  component: CheckboxComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [CheckboxComponent] })],
  argTypes: {
    checked: { control: { type: 'boolean' } },
    indeterminate: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    label: { control: { type: 'text' } },
    size: {
      control: { type: 'inline-radio' },
      options: ['sm', 'md', 'lg'],
    },
  },
  args: {
    checked: false,
    indeterminate: false,
    disabled: false,
    label: 'Acepto los términos',
    size: 'md',
  },
};

export default meta;

type Story = StoryObj<CheckboxComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<rmd-checkbox
      [checked]="checked"
      [indeterminate]="indeterminate"
      [disabled]="disabled"
      [label]="label"
      [size]="size"
    />`,
  }),
};

export const Checked: Story = {
  args: { checked: true },
};

export const Indeterminate: Story = {
  args: { indeterminate: true, label: 'Estado mixto' },
};

export const Disabled: Story = {
  parameters: { controls: { exclude: ['disabled'] } },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex; flex-direction:column; gap:0.75rem;">
        <rmd-checkbox [disabled]="true" [size]="size" label="Disabled unchecked" />
        <rmd-checkbox [disabled]="true" [checked]="true" [size]="size" label="Disabled checked" />
        <rmd-checkbox [disabled]="true" [indeterminate]="true" [size]="size" label="Disabled indeterminate" />
      </div>
    `,
  }),
};

export const Sizes: Story = {
  parameters: { controls: { exclude: ['size'] } },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex; flex-direction:column; gap:0.75rem;">
        <rmd-checkbox size="sm" [checked]="checked" [label]="label || 'Small'" />
        <rmd-checkbox size="md" [checked]="checked" [label]="label || 'Medium (default)'" />
        <rmd-checkbox size="lg" [checked]="checked" [label]="label || 'Large'" />
      </div>
    `,
  }),
};

export const WithRichContent: Story = {
  render: (args) => ({
    props: args,
    template: `
      <rmd-checkbox [checked]="checked" [size]="size">
        Acepto los <a href="#" style="color: var(--ds-semantic-color-text-link);">términos y condiciones</a>
      </rmd-checkbox>
    `,
  }),
};

export const WithReactiveForm: Story = {
  decorators: [moduleMetadata({ imports: [CheckboxComponent, ReactiveFormsModule] })],
  parameters: { controls: { exclude: ['checked'] } },
  render: (args) => {
    const ctrl = new FormControl<boolean>(false, { nonNullable: true });
    return {
      props: { ...args, ctrl },
      template: `
        <div style="display:flex; flex-direction:column; gap:1rem;">
          <rmd-checkbox [formControl]="ctrl" [size]="size">Suscribirse al newsletter</rmd-checkbox>
          <pre style="margin:0; font-family: var(--ds-font-family-mono); font-size: var(--ds-font-size-sm);">ctrl.value = {{ ctrl.value }}</pre>
        </div>
      `,
    };
  },
};

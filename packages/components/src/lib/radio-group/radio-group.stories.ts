import { FormControl, ReactiveFormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { DsRadio } from '../radio/radio';
import { DsRadioGroup } from './radio-group';

const meta: Meta<DsRadioGroup> = {
  title: 'Components/RadioGroup',
  component: DsRadioGroup,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [DsRadioGroup, DsRadio] })],
  argTypes: {
    disabled: { control: { type: 'boolean' } },
  },
  args: {
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<DsRadioGroup>;

export const Default: Story = {
  render: (args) => ({
    props: { ...args, selected: 'angular' },
    template: `
      <ds-radio-group [(value)]="selected" [disabled]="disabled">
        <ds-radio [value]="'angular'" label="Angular" />
        <ds-radio [value]="'react'" label="React" />
        <ds-radio [value]="'vue'" label="Vue" />
      </ds-radio-group>
      <pre style="margin-top:1rem; font-family: var(--ds-font-family-mono);">selected = {{ selected }}</pre>
    `,
  }),
};

export const WithFormControl: Story = {
  decorators: [moduleMetadata({ imports: [DsRadioGroup, DsRadio, ReactiveFormsModule] })],
  parameters: { controls: { exclude: ['disabled'] } },
  render: () => {
    const ctrl = new FormControl<string>('react', { nonNullable: true });
    return {
      props: { ctrl },
      template: `
        <ds-radio-group [formControl]="ctrl">
          <ds-radio [value]="'angular'" label="Angular" />
          <ds-radio [value]="'react'" label="React" />
          <ds-radio [value]="'vue'" label="Vue" />
        </ds-radio-group>
        <pre style="margin-top:1rem; font-family: var(--ds-font-family-mono);">ctrl.value = {{ ctrl.value }}</pre>
      `,
    };
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => ({
    props: { ...args, selected: 'react' },
    template: `
      <ds-radio-group [(value)]="selected" [disabled]="disabled">
        <ds-radio [value]="'angular'" label="Angular" />
        <ds-radio [value]="'react'" label="React" />
        <ds-radio [value]="'vue'" label="Vue" />
      </ds-radio-group>
    `,
  }),
};

export const WithDisabledItem: Story = {
  render: () => ({
    props: { selected: 'angular' },
    template: `
      <ds-radio-group [(value)]="selected">
        <ds-radio [value]="'angular'" label="Angular" />
        <ds-radio [value]="'react'" [disabled]="true" label="React (deprecated)" />
        <ds-radio [value]="'vue'" label="Vue" />
      </ds-radio-group>
    `,
  }),
};

export const KeyboardNavDemo: Story = {
  render: () => ({
    props: { selected: 'a' },
    template: `
      <p style="margin-bottom:1rem; font-family: var(--ds-font-family-sans);">
        Focus el primer radio y probá Arrow Right/Left, Home, End. La selección sigue al foco.
      </p>
      <ds-radio-group [(value)]="selected">
        <ds-radio [value]="'a'" label="A" />
        <ds-radio [value]="'b'" label="B" />
        <ds-radio [value]="'c'" label="C" />
        <ds-radio [value]="'d'" [disabled]="true" label="D (disabled — skipped)" />
        <ds-radio [value]="'e'" label="E" />
      </ds-radio-group>
      <pre style="margin-top:1rem; font-family: var(--ds-font-family-mono);">selected = {{ selected }}</pre>
    `,
  }),
};

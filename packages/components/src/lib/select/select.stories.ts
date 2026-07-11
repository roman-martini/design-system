import { FormControl, ReactiveFormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { DsOption } from './option';
import { DsSelect } from './select';

const meta: Meta<DsSelect> = {
  title: 'Components/Select',
  component: DsSelect,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [DsSelect, DsOption] })],
  argTypes: {
    size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
    placeholder: { control: { type: 'text' } },
  },
  args: {
    size: 'md',
    placeholder: 'Elegí una opción',
  },
};

export default meta;

type Story = StoryObj<DsSelect>;

// Todo select necesita nombre accesible: el consumidor lo provee con
// aria-label o aria-labelledby sobre <ds-select> (pasa directo al trigger
// por el contexto del combobox).
export const Default: Story = {
  render: (args) => ({
    props: { ...args, selected: null },
    template: `
      <ds-select [(value)]="selected" [placeholder]="placeholder" [size]="size" aria-label="Framework preferido">
        <ds-option [value]="'angular'" label="Angular" />
        <ds-option [value]="'react'" label="React" />
        <ds-option [value]="'vue'" label="Vue" />
        <ds-option [value]="'svelte'" [disabled]="true" label="Svelte (no disponible)" />
      </ds-select>
      <pre style="margin-top:1rem; font-family: var(--ds-font-family-mono);">selected = {{ selected }}</pre>
    `,
  }),
};

export const Sizes: Story = {
  parameters: { controls: { exclude: ['size'] } },
  render: () => ({
    props: { a: 'angular', b: 'angular', c: 'angular' },
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; align-items:flex-start;">
        <ds-select [(value)]="a" size="sm" aria-label="Framework (sm)">
          <ds-option [value]="'angular'" label="Angular" />
          <ds-option [value]="'react'" label="React" />
        </ds-select>
        <ds-select [(value)]="b" size="md" aria-label="Framework (md)">
          <ds-option [value]="'angular'" label="Angular" />
          <ds-option [value]="'react'" label="React" />
        </ds-select>
        <ds-select [(value)]="c" size="lg" aria-label="Framework (lg)">
          <ds-option [value]="'angular'" label="Angular" />
          <ds-option [value]="'react'" label="React" />
        </ds-select>
      </div>
    `,
  }),
};

export const WithFormControl: Story = {
  decorators: [moduleMetadata({ imports: [DsSelect, DsOption, ReactiveFormsModule] })],
  parameters: { controls: { exclude: ['size', 'placeholder'] } },
  render: () => {
    const ctrl = new FormControl<string>('react', { nonNullable: true });
    return {
      props: { ctrl },
      template: `
        <ds-select [formControl]="ctrl" aria-label="Framework preferido">
          <ds-option [value]="'angular'" label="Angular" />
          <ds-option [value]="'react'" label="React" />
          <ds-option [value]="'vue'" label="Vue" />
        </ds-select>
        <pre style="margin-top:1rem; font-family: var(--ds-font-family-mono);">ctrl.value = {{ ctrl.value }}</pre>
      `,
    };
  },
};

export const RichOptions: Story = {
  parameters: { controls: { exclude: ['size', 'placeholder'] } },
  render: () => ({
    props: { selected: null },
    template: `
      <ds-select [(value)]="selected" placeholder="Elegí un plan" aria-label="Plan">
        <ds-option [value]="'free'"><strong>Free</strong>&nbsp;— para probar</ds-option>
        <ds-option [value]="'pro'"><strong>Pro</strong>&nbsp;— para equipos</ds-option>
        <ds-option [value]="'enterprise'"><strong>Enterprise</strong>&nbsp;— a medida</ds-option>
      </ds-select>
    `,
  }),
};

export const Disabled: Story = {
  decorators: [moduleMetadata({ imports: [DsSelect, DsOption, ReactiveFormsModule] })],
  parameters: { controls: { exclude: ['size', 'placeholder'] } },
  render: () => {
    const ctrl = new FormControl<string>(
      { value: 'angular', disabled: true },
      { nonNullable: true },
    );
    return {
      props: { ctrl },
      template: `
        <p style="font-family: var(--ds-font-family-sans); margin-bottom: 1rem;">
          Deshabilitado vía forms API: permanece focuseable y anunciado
          (aria-disabled, ADR-011) pero no operable.
        </p>
        <ds-select [formControl]="ctrl" aria-label="Framework preferido">
          <ds-option [value]="'angular'" label="Angular" />
          <ds-option [value]="'react'" label="React" />
        </ds-select>
      `,
    };
  },
};

import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { DsTextarea } from './textarea';

const meta: Meta<DsTextarea> = {
  title: 'Components/Textarea',
  component: DsTextarea,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [DsTextarea] })],
  argTypes: {
    size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
    resize: { control: { type: 'select' }, options: ['vertical', 'none'] },
    rows: { control: { type: 'number' } },
  },
  args: {
    size: 'md',
    resize: 'vertical',
    rows: 3,
  },
};

export default meta;

type Story = StoryObj<DsTextarea>;

export const Default: Story = {
  render: (args) => ({
    props: { ...args, value: '' },
    template: `
      <div style="max-width:420px;">
        <ds-textarea
          [(value)]="value"
          [size]="size"
          [rows]="rows"
          [resize]="resize"
          label="Notas"
          hint="Visible para todo tu equipo"
          placeholder="Escribí una nota…"
        />
      </div>
      <pre style="margin-top:1rem; font-family: var(--ds-font-family-mono);">value = {{ value }}</pre>
    `,
  }),
};

export const Sizes: Story = {
  parameters: { controls: { exclude: ['size', 'resize', 'rows'] } },
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; max-width:420px;">
        <ds-textarea size="sm" label="Small" placeholder="sm" />
        <ds-textarea size="md" label="Medium" placeholder="md" />
        <ds-textarea size="lg" label="Large" placeholder="lg" />
      </div>
    `,
  }),
};

export const WithFormControl: Story = {
  decorators: [moduleMetadata({ imports: [DsTextarea, ReactiveFormsModule] })],
  parameters: { controls: { exclude: ['size', 'resize', 'rows'] } },
  render: () => {
    const ctrl = new FormControl('', { nonNullable: true, validators: [Validators.required] });
    return {
      props: { ctrl },
      template: `
        <div style="max-width:420px;">
          <ds-textarea
            [formControl]="ctrl"
            [rows]="4"
            label="Descripción"
            hint="Tocá afuera vacío para ver el error automático"
            error="La descripción es obligatoria"
            placeholder="Describí el proyecto…"
          />
        </div>
        <pre style="margin-top:1rem; font-family: var(--ds-font-family-mono);">value = {{ ctrl.value }} · invalid = {{ ctrl.invalid }} · touched = {{ ctrl.touched }}</pre>
      `,
    };
  },
};

export const NoResize: Story = {
  parameters: { controls: { exclude: ['size', 'resize', 'rows'] } },
  render: () => ({
    template: `
      <div style="max-width:420px;">
        <ds-textarea resize="none" [rows]="3" label="Sin resize" hint="El usuario no puede cambiar el alto" placeholder="Alto fijo por rows" />
      </div>
    `,
  }),
};

export const Disabled: Story = {
  decorators: [moduleMetadata({ imports: [DsTextarea, ReactiveFormsModule] })],
  parameters: { controls: { exclude: ['size', 'resize', 'rows'] } },
  render: () => {
    const ctrl = new FormControl(
      { value: 'Contenido de solo lectura', disabled: true },
      { nonNullable: true },
    );
    return {
      props: { ctrl },
      template: `
        <div style="max-width:420px;">
          <ds-textarea [formControl]="ctrl" label="Campo deshabilitado" hint="disabled nativo (ADR-011, rama form control)" />
        </div>
      `,
    };
  },
};

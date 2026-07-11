import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideSearch } from '@lucide/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { DsInput } from './input';

const meta: Meta<DsInput> = {
  title: 'Components/Input',
  component: DsInput,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [DsInput] })],
  argTypes: {
    size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'tel', 'url', 'search'],
    },
  },
  args: {
    size: 'md',
    type: 'text',
  },
};

export default meta;

type Story = StoryObj<DsInput>;

export const Default: Story = {
  render: (args) => ({
    props: { ...args, value: '' },
    template: `
      <ds-input
        [(value)]="value"
        [size]="size"
        [type]="type"
        label="Nombre del proyecto"
        hint="Visible para todo tu equipo"
        placeholder="mi-proyecto"
      />
      <pre style="margin-top:1rem; font-family: var(--ds-font-family-mono);">value = {{ value }}</pre>
    `,
  }),
};

export const Sizes: Story = {
  parameters: { controls: { exclude: ['size', 'type'] } },
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; max-width:320px;">
        <ds-input size="sm" label="Small" placeholder="sm" />
        <ds-input size="md" label="Medium" placeholder="md" />
        <ds-input size="lg" label="Large" placeholder="lg" />
      </div>
    `,
  }),
};

export const WithFormControl: Story = {
  decorators: [moduleMetadata({ imports: [DsInput, ReactiveFormsModule] })],
  parameters: { controls: { exclude: ['size', 'type'] } },
  render: () => {
    const ctrl = new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    });
    return {
      props: { ctrl },
      template: `
        <div style="max-width:320px;">
          <ds-input
            [formControl]="ctrl"
            type="email"
            label="Email"
            hint="Tocá afuera con un valor inválido para ver el error automático"
            error="Ingresá un email válido"
            placeholder="vos@ejemplo.com"
          />
        </div>
        <pre style="margin-top:1rem; font-family: var(--ds-font-family-mono);">value = {{ ctrl.value }} · invalid = {{ ctrl.invalid }} · touched = {{ ctrl.touched }}</pre>
      `,
    };
  },
};

// Los slots prefix/suffix son PASIVOS por contrato: contenido decorativo con
// aria-hidden, nunca focuseable. Sufijos interactivos son HU aparte.
export const WithPrefixSuffix: Story = {
  decorators: [moduleMetadata({ imports: [DsInput, LucideSearch] })],
  parameters: { controls: { exclude: ['size', 'type'] } },
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; max-width:320px;">
        <ds-input type="search" label="Buscar" placeholder="Componentes, tokens…" aria-label="Buscar">
          <svg lucideSearch ds-input-prefix size="16" strokeWidth="1.5" aria-hidden="true"></svg>
        </ds-input>
        <ds-input type="url" label="Sitio" placeholder="mi-sitio">
          <span ds-input-prefix aria-hidden="true">https://</span>
          <span ds-input-suffix aria-hidden="true">.com</span>
        </ds-input>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  decorators: [moduleMetadata({ imports: [DsInput, ReactiveFormsModule] })],
  parameters: { controls: { exclude: ['size', 'type'] } },
  render: () => {
    const ctrl = new FormControl({ value: 'solo lectura', disabled: true }, { nonNullable: true });
    return {
      props: { ctrl },
      template: `
        <div style="max-width:320px;">
          <ds-input [formControl]="ctrl" label="Campo deshabilitado" hint="disabled nativo (ADR-011, rama form control)" />
        </div>
      `,
    };
  },
};

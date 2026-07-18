import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { DsInput } from '../input/input';
import { DsTab } from './tab';
import { DsTabs } from './tabs';

const meta: Meta<DsTabs> = {
  title: 'Components/Tabs',
  component: DsTabs,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [DsTabs, DsTab] })],
  argTypes: {
    variant: { control: { type: 'select' }, options: ['underline', 'pills', 'contained'] },
    size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
  },
  args: {
    variant: 'underline',
    size: 'md',
  },
};

export default meta;

type Story = StoryObj<DsTabs>;

// Todo tablist necesita nombre accesible: el consumidor lo provee con
// aria-label o aria-labelledby sobre <ds-tabs> (se reenvía al tablist).
export const Default: Story = {
  render: (args) => ({
    props: { ...args, active: null },
    template: `
      <ds-tabs [(value)]="active" [variant]="variant" [size]="size" aria-label="Secciones del proyecto">
        <ds-tab value="general" label="General">Configuración general del proyecto.</ds-tab>
        <ds-tab value="miembros" label="Miembros">Gestión de miembros y roles.</ds-tab>
        <ds-tab value="facturacion" label="Facturación" [disabled]="true">Plan y pagos.</ds-tab>
        <ds-tab value="avanzado" label="Avanzado">Opciones avanzadas.</ds-tab>
      </ds-tabs>
      <pre style="margin-top:1rem; font-family: var(--ds-font-family-mono);">value = {{ active }}</pre>
    `,
  }),
};

export const Variants: Story = {
  parameters: { controls: { exclude: ['variant', 'size'] } },
  render: () => ({
    props: { a: null, b: null, c: null },
    template: `
      <div style="display:flex; flex-direction:column; gap:2rem;">
        <ds-tabs [(value)]="a" variant="underline" aria-label="Underline">
          <ds-tab value="1" label="Underline">La variante por defecto.</ds-tab>
          <ds-tab value="2" label="Segunda">Panel 2.</ds-tab>
        </ds-tabs>
        <ds-tabs [(value)]="b" variant="pills" aria-label="Pills">
          <ds-tab value="1" label="Pills">Fondo pill en el activo.</ds-tab>
          <ds-tab value="2" label="Segunda">Panel 2.</ds-tab>
        </ds-tabs>
        <ds-tabs [(value)]="c" variant="contained" aria-label="Contained">
          <ds-tab value="1" label="Contained">Grupo contenido con bordes.</ds-tab>
          <ds-tab value="2" label="Segunda">Panel 2.</ds-tab>
        </ds-tabs>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  parameters: { controls: { exclude: ['size'] } },
  render: (args) => ({
    props: { ...args, a: null, b: null, c: null },
    template: `
      <div style="display:flex; flex-direction:column; gap:2rem;">
        <ds-tabs [(value)]="a" [variant]="variant" size="sm" aria-label="Small">
          <ds-tab value="1" label="Small">Panel sm.</ds-tab>
          <ds-tab value="2" label="Otra">Panel 2.</ds-tab>
        </ds-tabs>
        <ds-tabs [(value)]="b" [variant]="variant" size="md" aria-label="Medium">
          <ds-tab value="1" label="Medium">Panel md.</ds-tab>
          <ds-tab value="2" label="Otra">Panel 2.</ds-tab>
        </ds-tabs>
        <ds-tabs [(value)]="c" [variant]="variant" size="lg" aria-label="Large">
          <ds-tab value="1" label="Large">Panel lg.</ds-tab>
          <ds-tab value="2" label="Otra">Panel 2.</ds-tab>
        </ds-tabs>
      </div>
    `,
  }),
};

// Los paneles inactivos quedan en el DOM con hidden: el estado (un form a
// medio completar) se conserva al cambiar de tab y volver.
export const StatefulPanels: Story = {
  decorators: [moduleMetadata({ imports: [DsTabs, DsTab, DsInput] })],
  parameters: { controls: { exclude: ['variant', 'size'] } },
  render: () => ({
    props: { active: null },
    template: `
      <ds-tabs [(value)]="active" aria-label="Demo de estado">
        <ds-tab value="form" label="Formulario">
          <div style="max-width:320px;">
            <ds-input label="Escribí algo y cambiá de tab" placeholder="borrador…" />
          </div>
        </ds-tab>
        <ds-tab value="otro" label="Otro tab">Volvé al primero: tu texto sigue ahí.</ds-tab>
      </ds-tabs>
    `,
  }),
};

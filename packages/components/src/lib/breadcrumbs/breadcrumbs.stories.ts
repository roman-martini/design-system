import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { DsBreadcrumbItem } from './breadcrumb-item';
import { DsBreadcrumbs } from './breadcrumbs';
import { DsBreadcrumbsSeparator } from './breadcrumbs-separator';

const meta: Meta<DsBreadcrumbs> = {
  title: 'Components/Breadcrumbs',
  component: DsBreadcrumbs,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({ imports: [DsBreadcrumbs, DsBreadcrumbItem, DsBreadcrumbsSeparator] }),
  ],
  args: {
    maxItems: null,
  },
};

export default meta;

type Story = StoryObj<DsBreadcrumbs>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ds-breadcrumbs [maxItems]="maxItems">
        <ds-breadcrumb-item><a href="#">Inicio</a></ds-breadcrumb-item>
        <ds-breadcrumb-item><a href="#">Docs</a></ds-breadcrumb-item>
        <ds-breadcrumb-item><a href="#">Componentes</a></ds-breadcrumb-item>
        <ds-breadcrumb-item>Breadcrumbs</ds-breadcrumb-item>
      </ds-breadcrumbs>
    `,
  }),
};

export const CustomSeparator: Story = {
  render: () => ({
    template: `
      <ds-breadcrumbs>
        <ng-template dsBreadcrumbsSeparator><span>/</span></ng-template>
        <ds-breadcrumb-item><a href="#">Inicio</a></ds-breadcrumb-item>
        <ds-breadcrumb-item><a href="#">Docs</a></ds-breadcrumb-item>
        <ds-breadcrumb-item>Separador por template</ds-breadcrumb-item>
      </ds-breadcrumbs>
    `,
  }),
};

export const Truncated: Story = {
  args: { maxItems: 3 },
  render: (args) => ({
    props: args,
    template: `
      <ds-breadcrumbs [maxItems]="maxItems">
        <ds-breadcrumb-item><a href="#">Inicio</a></ds-breadcrumb-item>
        <ds-breadcrumb-item><a href="#">Nivel 1</a></ds-breadcrumb-item>
        <ds-breadcrumb-item><a href="#">Nivel 2</a></ds-breadcrumb-item>
        <ds-breadcrumb-item><a href="#">Nivel 3</a></ds-breadcrumb-item>
        <ds-breadcrumb-item><a href="#">Nivel 4</a></ds-breadcrumb-item>
        <ds-breadcrumb-item>Página actual</ds-breadcrumb-item>
      </ds-breadcrumbs>
    `,
  }),
};

export const CurrentOnly: Story = {
  render: () => ({
    template: `
      <ds-breadcrumbs>
        <ds-breadcrumb-item>Único nivel (aria-current)</ds-breadcrumb-item>
      </ds-breadcrumbs>
    `,
  }),
};

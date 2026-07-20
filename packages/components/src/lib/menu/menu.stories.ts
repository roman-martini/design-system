import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LucideCopy, LucideDownload, LucidePencil, LucideTrash2 } from '@lucide/angular';

import { DsButton } from '../button/button';
import { DsMenu } from './menu';
import { DsMenuItem } from './menu-item';
import { DsMenuSeparator } from './menu-separator';
import { DsMenuTrigger } from './menu-trigger';

const meta: Meta<DsMenu> = {
  title: 'Components/Menu',
  component: DsMenu,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        DsButton,
        DsMenu,
        DsMenuItem,
        DsMenuSeparator,
        DsMenuTrigger,
        LucideCopy,
        LucideDownload,
        LucidePencil,
        LucideTrash2,
      ],
    }),
  ],
};

export default meta;

type Story = StoryObj<DsMenu>;

export const Default: Story = {
  render: () => ({
    template: `
      <ds-button variant="secondary" [dsMenuTriggerFor]="menu">Acciones</ds-button>
      <ds-menu #menu>
        <ds-menu-item>Editar</ds-menu-item>
        <ds-menu-item>Duplicar</ds-menu-item>
        <ds-menu-item>Compartir</ds-menu-item>
      </ds-menu>
    `,
  }),
};

export const WithIcons: Story = {
  render: () => ({
    template: `
      <ds-button variant="secondary" [dsMenuTriggerFor]="menu">Acciones</ds-button>
      <ds-menu #menu>
        <ds-menu-item>
          <svg lucidePencil size="16" strokeWidth="1.5" aria-hidden="true"></svg>
          Editar
        </ds-menu-item>
        <ds-menu-item>
          <svg lucideCopy size="16" strokeWidth="1.5" aria-hidden="true"></svg>
          Duplicar
        </ds-menu-item>
      </ds-menu>
    `,
  }),
};

export const GroupedWithSeparators: Story = {
  render: () => ({
    template: `
      <ds-button variant="secondary" [dsMenuTriggerFor]="menu">Gestionar</ds-button>
      <ds-menu #menu>
        <ds-menu-item>Editar</ds-menu-item>
        <ds-menu-item>Duplicar</ds-menu-item>
        <ds-menu-separator />
        <ds-menu-item>Mover a…</ds-menu-item>
      </ds-menu>
    `,
  }),
};

export const DangerItem: Story = {
  render: () => ({
    template: `
      <ds-button variant="secondary" [dsMenuTriggerFor]="menu">Gestionar</ds-button>
      <ds-menu #menu>
        <ds-menu-item>Editar</ds-menu-item>
        <ds-menu-separator />
        <ds-menu-item [danger]="true">
          <svg lucideTrash2 size="16" strokeWidth="1.5" aria-hidden="true"></svg>
          Eliminar
        </ds-menu-item>
      </ds-menu>
    `,
  }),
};

export const DisabledItems: Story = {
  render: () => ({
    template: `
      <ds-button variant="secondary" [dsMenuTriggerFor]="menu">Acciones</ds-button>
      <ds-menu #menu>
        <ds-menu-item>Editar</ds-menu-item>
        <ds-menu-item [disabled]="true">Archivar</ds-menu-item>
        <ds-menu-item [disabled]="true">Publicar</ds-menu-item>
      </ds-menu>
    `,
  }),
};

export const Submenu: Story = {
  render: () => ({
    template: `
      <ds-button variant="secondary" [dsMenuTriggerFor]="menu">Archivo</ds-button>
      <ds-menu #menu>
        <ds-menu-item>Renombrar</ds-menu-item>
        <ds-menu-item [submenu]="exportar">
          <svg lucideDownload size="16" strokeWidth="1.5" aria-hidden="true"></svg>
          Exportar
        </ds-menu-item>
        <ds-menu #exportar>
          <ds-menu-item>Como PDF</ds-menu-item>
          <ds-menu-item>Como CSV</ds-menu-item>
        </ds-menu>
      </ds-menu>
    `,
  }),
};

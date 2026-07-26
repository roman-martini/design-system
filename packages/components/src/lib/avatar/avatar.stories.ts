import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { DsAvatar } from './avatar';
import { DsAvatarGroup } from './avatar-group';

const meta: Meta<DsAvatar> = {
  title: 'Components/Avatar',
  component: DsAvatar,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [DsAvatar, DsAvatarGroup] })],
  argTypes: {
    size: { control: { type: 'select' }, options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    tone: {
      control: { type: 'select' },
      options: ['auto', 'neutral', 'primary', 'success', 'warning', 'info', 'danger'],
    },
  },
  args: {
    size: 'md',
    tone: 'auto',
  },
};

export default meta;

type Story = StoryObj<DsAvatar>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<ds-avatar name="Sofia Davis" [size]="size" [tone]="tone" />`,
  }),
};

export const HashDeterministico: Story = {
  parameters: { controls: { exclude: ['size', 'tone'] } },
  render: () => ({
    template: `
      <div style="display:flex; gap:1rem; align-items:center;">
        <ds-avatar name="Sofia Davis" />
        <ds-avatar name="Jackson Lee" />
        <ds-avatar name="Isabella Nguyen" />
        <ds-avatar name="Liam Brown" />
        <ds-avatar name="Emma Wilson" />
      </div>
      <p style="margin-top:0.75rem; color: var(--ds-semantic-color-text-secondary);">
        Mismo nombre → mismo tono, siempre. <code>tone</code> lo fija manualmente.
      </p>
    `,
  }),
};

export const ImagenConFallback: Story = {
  parameters: { controls: { exclude: ['size', 'tone'] } },
  render: () => ({
    template: `
      <div style="display:flex; gap:1rem; align-items:center;">
        <ds-avatar name="Sofia Davis" src="https://i.pravatar.cc/80?img=47" />
        <ds-avatar name="Jackson Lee" src="/ruta-rota.png" />
      </div>
      <p style="margin-top:0.75rem; color: var(--ds-semantic-color-text-secondary);">
        La segunda imagen falla su carga → cae a iniciales automáticamente.
      </p>
    `,
  }),
};

export const Sizes: Story = {
  parameters: { controls: { exclude: ['size', 'tone'] } },
  render: () => ({
    template: `
      <div style="display:flex; gap:1rem; align-items:center;">
        <ds-avatar name="Sofia Davis" size="xs" />
        <ds-avatar name="Sofia Davis" size="sm" />
        <ds-avatar name="Sofia Davis" size="md" />
        <ds-avatar name="Sofia Davis" size="lg" />
        <ds-avatar name="Sofia Davis" size="xl" />
      </div>
    `,
  }),
};

export const Grupo: Story = {
  parameters: { controls: { exclude: ['size', 'tone'] } },
  render: () => ({
    template: `
      <ds-avatar-group label="Miembros del equipo" [max]="3">
        <ds-avatar name="Sofia Davis" size="sm" />
        <ds-avatar name="Jackson Lee" size="sm" />
        <ds-avatar name="Isabella Nguyen" size="sm" />
        <ds-avatar name="Liam Brown" size="sm" />
        <ds-avatar name="Emma Wilson" size="sm" />
      </ds-avatar-group>
    `,
  }),
};

import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LucideCheck } from '@lucide/angular';

import { DsBadge } from './badge';
import { DsBadgeIcon } from './badge-icon';

const TONES = ['neutral', 'primary', 'danger', 'success', 'warning', 'info'] as const;
const APPEARANCES = ['subtle', 'solid', 'outline'] as const;

const meta: Meta<DsBadge> = {
  title: 'Components/Badge',
  component: DsBadge,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [DsBadge, DsBadgeIcon, LucideCheck] })],
  argTypes: {
    tone: { control: { type: 'inline-radio' }, options: TONES },
    appearance: { control: { type: 'inline-radio' }, options: APPEARANCES },
    size: { control: { type: 'inline-radio' }, options: ['sm', 'md', 'lg'] },
    dot: { control: { type: 'boolean' } },
  },
  args: { tone: 'neutral', appearance: 'subtle', size: 'md', dot: false },
};

export default meta;

type Story = StoryObj<DsBadge>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<ds-badge [tone]="tone" [appearance]="appearance" [size]="size" [dot]="dot">Badge</ds-badge>`,
  }),
};

export const Matrix: Story = {
  parameters: { controls: { exclude: ['tone', 'appearance'] } },
  render: (args) => ({
    props: { ...args, tones: TONES, appearances: APPEARANCES },
    template: `
      <div style="display:flex; flex-direction:column; gap:.75rem;">
        @for (a of appearances; track a) {
          <div style="display:flex; gap:.5rem; align-items:center; flex-wrap:wrap;">
            <strong style="width:5rem; font-size:.75rem; text-transform:capitalize;">{{ a }}</strong>
            @for (t of tones; track t) {
              <ds-badge [tone]="t" [appearance]="a" [size]="size">{{ t }}</ds-badge>
            }
          </div>
        }
      </div>
    `,
  }),
};

export const Sizes: Story = {
  parameters: { controls: { exclude: ['size'] } },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex; gap:.5rem; align-items:center;">
        <ds-badge [tone]="tone" [appearance]="appearance" size="sm">Small</ds-badge>
        <ds-badge [tone]="tone" [appearance]="appearance" size="md">Medium</ds-badge>
        <ds-badge [tone]="tone" [appearance]="appearance" size="lg">Large</ds-badge>
      </div>
    `,
  }),
};

export const WithIconAndDot: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap:.5rem; align-items:center;">
        <ds-badge tone="success">
          <svg lucideCheck dsBadgeIcon size="14" strokeWidth="2.5"></svg>
          Active
        </ds-badge>
        <ds-badge tone="warning" [dot]="true">Pending</ds-badge>
        <ds-badge tone="danger" appearance="solid" [dot]="true">Down</ds-badge>
      </div>
    `,
  }),
};

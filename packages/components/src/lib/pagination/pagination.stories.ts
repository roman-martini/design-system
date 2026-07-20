import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { DsPagination } from './pagination';

const meta: Meta<DsPagination> = {
  title: 'Components/Pagination',
  component: DsPagination,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [DsPagination] })],
  argTypes: {
    variant: { control: { type: 'select' }, options: ['numbered', 'compact'] },
    siblingCount: { control: { type: 'number', min: 0, max: 3 } },
  },
  args: {
    variant: 'numbered',
    siblingCount: 1,
  },
};

export default meta;

type Story = StoryObj<DsPagination>;

export const Default: Story = {
  render: (args) => ({
    props: { ...args, page: 1 },
    template: `
      <ds-pagination [(page)]="page" [totalPages]="5" [variant]="variant" [siblingCount]="siblingCount" />
      <pre style="margin-top:1rem; font-family: var(--ds-font-family-mono);">page = {{ page }}</pre>
    `,
  }),
};

export const ManyPages: Story = {
  render: (args) => ({
    props: { ...args, page: 10 },
    template: `
      <ds-pagination [(page)]="page" [totalPages]="50" [variant]="variant" [siblingCount]="siblingCount" />
      <pre style="margin-top:1rem; font-family: var(--ds-font-family-mono);">page = {{ page }}</pre>
    `,
  }),
};

export const Compact: Story = {
  args: { variant: 'compact' },
  render: (args) => ({
    props: { ...args, page: 3 },
    template: `
      <ds-pagination [(page)]="page" [totalPages]="20" [variant]="variant" />
    `,
  }),
};

export const Edges: Story = {
  render: () => ({
    props: { first: 1, last: 12 },
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem;">
        <ds-pagination [(page)]="first" [totalPages]="12" />
        <ds-pagination [(page)]="last" [totalPages]="12" />
      </div>
    `,
  }),
};

import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { DsCard } from './card';
import { DsCardHeader } from './card-header';
import { DsCardContent } from './card-content';
import { DsCardFooter } from './card-footer';
import { DsCardTitle } from './card-title';
import { DsCardDescription } from './card-description';
import { DsButton } from '../button';
import { DsCheckbox } from '../checkbox';

const meta: Meta<DsCard> = {
  title: 'Components/Card',
  component: DsCard,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        DsCard,
        DsCardHeader,
        DsCardContent,
        DsCardFooter,
        DsCardTitle,
        DsCardDescription,
        DsButton,
        DsCheckbox,
      ],
    }),
  ],
  argTypes: {
    variant: {
      control: { type: 'inline-radio' },
      options: ['outline', 'elevated', 'flat'],
    },
    padding: {
      control: { type: 'inline-radio' },
      options: ['comfortable', 'compact'],
    },
  },
  args: {
    variant: 'outline',
    padding: 'comfortable',
  },
};

export default meta;

type Story = StoryObj<DsCard>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ds-card [variant]="variant" [padding]="padding" style="max-width: 24rem;">
        <ds-card-header>
          <h2 dsCardTitle>Team Members</h2>
          <p dsCardDescription>Invite your team members to collaborate.</p>
        </ds-card-header>
        <ds-card-content>Contenido de la card.</ds-card-content>
      </ds-card>
    `,
  }),
};

export const Variants: Story = {
  parameters: {
    controls: { exclude: ['variant'] },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex; gap:1.5rem; flex-wrap:wrap;">
        <ds-card variant="outline" [padding]="padding" style="width: 16rem;">
          <h3 dsCardTitle>Outline</h3>
          <p dsCardDescription>Borde + sombra sutil (default).</p>
        </ds-card>
        <ds-card variant="elevated" [padding]="padding" style="width: 16rem;">
          <h3 dsCardTitle>Elevated</h3>
          <p dsCardDescription>Superficie elevada, sombra mayor.</p>
        </ds-card>
        <ds-card variant="flat" [padding]="padding" style="width: 16rem;">
          <h3 dsCardTitle>Flat</h3>
          <p dsCardDescription>Borde sin sombra.</p>
        </ds-card>
      </div>
    `,
  }),
};

export const Paddings: Story = {
  parameters: {
    controls: { exclude: ['padding'] },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex; gap:1.5rem; flex-wrap:wrap;">
        <ds-card [variant]="variant" padding="comfortable" style="width: 16rem;">
          <h3 dsCardTitle>Comfortable</h3>
          <p dsCardDescription>Padding default.</p>
        </ds-card>
        <ds-card [variant]="variant" padding="compact" style="width: 16rem;">
          <h3 dsCardTitle>Compact</h3>
          <p dsCardDescription>Padding denso.</p>
        </ds-card>
      </div>
    `,
  }),
};

export const FullStructure: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ds-card [variant]="variant" [padding]="padding" style="max-width: 26rem;">
        <ds-card-header>
          <h2 dsCardTitle>Upgrade your subscription</h2>
          <p dsCardDescription>You are currently on the free plan.</p>
        </ds-card-header>
        <ds-card-content>Formulario u otro contenido acá.</ds-card-content>
        <ds-card-footer>
          <ds-button variant="ghost">Cancel</ds-button>
          <ds-button>Upgrade Plan</ds-button>
        </ds-card-footer>
      </ds-card>
    `,
  }),
};

export const CookieSettings: Story = {
  name: 'Cookie Settings (referencia)',
  render: (args) => ({
    props: args,
    template: `
      <!-- Reproduce la vista de la referencia moder-minimal; los toggles serán ds-switch (HU-023) -->
      <ds-card [variant]="variant" [padding]="padding" style="max-width: 26rem;">
        <ds-card-header>
          <h2 dsCardTitle>Cookie Settings</h2>
          <p dsCardDescription>Manage your cookie settings here.</p>
        </ds-card-header>
        <ds-card-content style="display:flex; flex-direction:column; gap:1rem;">
          <div style="display:flex; align-items:flex-start; gap:1rem; justify-content:space-between;">
            <div>
              <strong>Strictly Necessary</strong>
              <p dsCardDescription>These cookies are essential to use the website.</p>
            </div>
            <ds-checkbox [checked]="true" />
          </div>
          <div style="display:flex; align-items:flex-start; gap:1rem; justify-content:space-between;">
            <div>
              <strong>Functional Cookies</strong>
              <p dsCardDescription>These cookies provide personalized functionality.</p>
            </div>
            <ds-checkbox />
          </div>
        </ds-card-content>
        <ds-card-footer>
          <ds-button variant="secondary" style="flex:1;">Save preferences</ds-button>
        </ds-card-footer>
      </ds-card>
    `,
  }),
};

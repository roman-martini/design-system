import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  stories: ['../../../packages/components/src/lib/**/*.stories.@(ts|mdx)'],
  addons: [
    {
      name: '@storybook/addon-docs',
      options: {},
    },
    '@storybook/addon-a11y',
  ],
  staticDirs: ['../public'],
};

export default config;

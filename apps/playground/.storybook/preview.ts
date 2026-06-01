// Los tokens CSS se inyectan vía `styles` del target storybook en `angular.json`.
// NO importar tokens/css acá: webpack no procesa CSS importado desde TS en este setup.

import type { Preview } from '@storybook/angular';

const preview: Preview = {
  parameters: {
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      defaultViewport: 'responsive',
    },
    layout: 'centered',
  },
};

export default preview;

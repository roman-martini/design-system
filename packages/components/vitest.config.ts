import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  resolve: {
    alias: {
      // El entry point router importa el core por nombre de package (APF);
      // en tests se resuelve al source del entry principal.
      '@romanmartinidev/components': resolve(__dirname, 'src/public-api.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts', 'router/src/**/*.spec.ts'],
  },
});

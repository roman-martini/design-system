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
    coverage: {
      provider: 'v8',
      // `text` para leer el resultado en consola y en el log de CI; `lcov` como
      // formato máquina, sin atarnos a ninguna herramienta externa hoy.
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts', 'router/src/**/*.ts'],
      exclude: ['**/*.spec.ts', '**/*.stories.ts', 'src/test-setup.ts'],
      // Piso fijado en la cobertura real medida el 2026-07-29 (94.80 / 77.23 /
      // 97.15 / 94.65) menos 1 punto de margen. Es un trinquete: sólo sube.
      // Bajarlo requiere decisión explícita del PO — ver CONTRIBUTING.md.
      thresholds: {
        statements: 93,
        branches: 76,
        functions: 96,
        lines: 93,
      },
    },
  },
});

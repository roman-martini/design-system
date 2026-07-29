import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['**/*.spec.ts', 'src/test-setup.ts', 'src/main.ts'],
      // El playground es un laboratorio interno no publicable (D-001): estos
      // números son un piso de NO-REGRESIÓN, no una vara de calidad. Salen de
      // la cobertura medida el 2026-07-29 (24.29 / 50 / 18.64 / 26.99) menos
      // 1 punto. El showcase es mayormente markup declarativo; cuando la Parte F2
      // sume tests de rutas, el piso sube con ellos.
      thresholds: {
        statements: 23,
        branches: 49,
        functions: 17,
        lines: 25,
      },
    },
  },
});

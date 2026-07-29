import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      // Sin `thresholds` a propósito. Este package no expone módulos TypeScript:
      // su fuente son los JSON de tokens y el build es Style Dictionary, así que
      // no hay código instrumentable y la cobertura mide 0/0. Un umbral acá no
      // podría fallar nunca — sería un gate decorativo.
      //
      // El contrato de calidad de tokens no es cobertura de líneas sino la
      // validez del artefacto emitido, y eso lo cubren los tests de tokens.
      // Si el package incorpora código TypeScript propio, el umbral entra con él.
    },
  },
});

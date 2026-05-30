import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/.angular/**',
      '**/.changeset/**',
      '**/build/**',
      '**/out/**',
      '**/storybook-static/**',
      '**/documentation/**',
      'pnpm-lock.yaml',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Prettier desactiva reglas de formato que entrarían en conflicto.
  // Debe ir al final para sobrescribir lo anterior.
  prettier,
);

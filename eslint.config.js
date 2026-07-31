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
      '**/.claude/**',
      '**/build/**',
      '**/out/**',
      '**/storybook-static/**',
      '**/documentation/**',
      'pnpm-lock.yaml',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Scripts de repo y de package: corren en Node (CLI y steps de CI), no en el browser.
  // El glob cubre `scripts/` del root y el de cualquier workspace — desde aaa-041,
  // `packages/tokens/scripts/` aloja la lógica de contraste que antes vivía sin lintear
  // dentro de `.claude/`, que está en `ignores`.
  {
    files: ['**/scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
  },

  // Prettier desactiva reglas de formato que entrarían en conflicto.
  // Debe ir al final para sobrescribir lo anterior.
  prettier,
);

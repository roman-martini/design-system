/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Permitir scopes habituales del repo. Vacío = cualquier scope válido.
    'scope-enum': [
      0,
      'always',
      ['tokens', 'components', 'playground', 'repo', 'ci', 'docs', 'deps'],
    ],
    // Subject en minúscula, sin punto final.
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
    'subject-full-stop': [2, 'never', '.'],
  },
};

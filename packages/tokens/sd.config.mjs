import StyleDictionary from 'style-dictionary';

// ─── Base build (light, default brand) ───────────────────────────────────────

const sdBase = new StyleDictionary({
  source: [
    'src/primitives/*.json',
    'src/semantic/*.json',
    'src/component/*.json',
  ],
  platforms: {
    css: {
      transformGroup: 'css',
      prefix: 'ds',
      buildPath: 'dist/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: { outputReferences: true, selector: ':root' },
        },
      ],
    },
    js: {
      transformGroup: 'js',
      buildPath: 'dist/',
      files: [
        { destination: 'tokens.js', format: 'javascript/es6' },
        { destination: 'tokens.d.ts', format: 'typescript/es6-declarations' },
      ],
    },
  },
});

// ─── Theme builds ─────────────────────────────────────────────────────────────
//
// Primitives are `include`d for reference resolution but filtered out of output.
// Each theme file only emits its own override tokens → tiny CSS delta files.
//
// Cascade:
//   :root { --ds-color-blue-500: #3b82f6; --ds-semantic-color-bg-primary: var(--ds-color-blue-500); }
//   [data-brand="a"] { --ds-semantic-color-bg-primary: var(--ds-color-green-600); }
//
// Combined theming example in HTML:
//   <html data-theme="dark" data-brand="b">
//   → dark backgrounds + violet primary, zero component code changes.

const themes = [
  { name: 'dark',    source: ['src/theme/dark.json'],    selector: '[data-theme="dark"]' },
  { name: 'brand-a', source: ['src/theme/brand-a.json'], selector: '[data-brand="a"]' },
  { name: 'brand-b', source: ['src/theme/brand-b.json'], selector: '[data-brand="b"]' },
];

const themeBuilds = themes.map(({ name, source, selector }) =>
  new StyleDictionary({
    include: ['src/primitives/*.json'],
    source,
    platforms: {
      css: {
        transformGroup: 'css',
        prefix: 'ds',
        buildPath: 'dist/',
        files: [
          {
            destination: `themes/${name}.css`,
            format: 'css/variables',
            // Only emit tokens that come from src/theme/ — exclude included primitives
            filter: (token) => token.filePath.startsWith('src/theme/'),
            options: { outputReferences: true, selector },
          },
        ],
      },
    },
  }),
);

await sdBase.buildAllPlatforms();
for (const build of themeBuilds) {
  await build.buildAllPlatforms();
}

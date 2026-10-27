import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import { defineConfig, globalIgnores } from 'eslint/config'

// Source modules declare their top-level functions. A typed const (`const rule: Rule = ...`) is fine.
const FUNCTION_DECLARATIONS = [
  'Program > VariableDeclaration > VariableDeclarator:not([id.typeAnnotation]) > :matches(ArrowFunctionExpression, FunctionExpression).init',
  'Program > ExportNamedDeclaration > VariableDeclaration > VariableDeclarator:not([id.typeAnnotation]) > :matches(ArrowFunctionExpression, FunctionExpression).init',
].map((selector) => ({ selector, message: 'Use a function declaration for top-level functions.' }))

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // eslint-plugin-react's version auto-detection calls an API removed in ESLint 10.
    settings: { react: { version: '19.3' } },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      'react/no-danger': 'error',
      'react/jsx-sort-props': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-restricted-exports': [
        'error',
        {
          restrictDefaultExports: {
            direct: true,
            named: true,
            defaultFrom: true,
            namedFrom: true,
            namespaceFrom: true,
          },
        },
      ],
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['../*'], message: 'Import from another folder with `@/`.' }] },
      ],
    },
  },
  {
    files: ['{app,components,lib,scripts,stylelint}/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...FUNCTION_DECLARATIONS,
        {
          selector: "TSQualifiedName[left.name='React']",
          message: "Import the type from 'react' instead of using the `React` namespace.",
        },
      ],
    },
  },
  {
    // Next.js route files and tool configs are loaded by their default export.
    files: [
      'app/**/{page,layout,template,default,error,global-error,not-found,opengraph-image,icon,sitemap,manifest}.{ts,tsx}',
      '*.config.ts',
      'stylelint/**/*.ts',
    ],
    rules: { 'no-restricted-exports': 'off' },
  },
  {
    // Node runs these directly, without the `@/` alias, so they import by relative path.
    files: ['lib/content-build/**/*.ts', 'scripts/**/*.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    // The only places allowed to inject HTML: the no-flash theme script, JSON-LD,
    // and the sanitized post HTML built by scripts/build-content.ts.
    files: ['app/layout.tsx', 'components/json-ld.tsx', 'components/prose.tsx'],
    rules: { 'react/no-danger': 'off' },
  },
  {
    // Client islands: no network access, no server modules.
    files: ['components/islands/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-globals': ['error', 'fetch', 'XMLHttpRequest', 'EventSource', 'WebSocket'],
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/lib/content', '@/lib/content-build/*'],
              allowTypeImports: true,
              message: 'Islands may only import types from server modules.',
            },
          ],
        },
      ],
    },
  },
  {
    // Copying a post's Markdown loads its static `/<slug>.md` file on click.
    files: ['components/islands/copy-markdown.tsx'],
    rules: {
      'no-restricted-globals': ['error', 'XMLHttpRequest', 'EventSource', 'WebSocket'],
    },
  },
  {
    // Test fixtures use plain <img> to stand in for post HTML.
    files: ['tests/**/*.{ts,tsx}'],
    rules: { '@next/next/no-img-element': 'off' },
  },
  {
    // Build scripts print progress.
    files: ['scripts/**/*.ts'],
    rules: { 'no-console': 'off' },
  },
  {
    // The console fallback for anything the logger would send to Datadog.
    files: ['lib/datadog/server.ts'],
    rules: { 'no-console': 'off' },
  },
  globalIgnores([
    '.next/**',
    '.generated/**',
    'out/**',
    'build/**',
    'coverage/**',
    'public/**',
    '.claude/**',
    'next-env.d.ts',
    '**/*.module.css.d.ts',
  ]),
])

export default eslintConfig

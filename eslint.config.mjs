import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

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
      'react/no-danger': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
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
    // Test fixtures use plain <img> to stand in for post HTML.
    files: ['tests/**/*.{ts,tsx}'],
    rules: { '@next/next/no-img-element': 'off' },
  },
  {
    // Build scripts print progress.
    files: ['scripts/**/*.ts'],
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

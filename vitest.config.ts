import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
      // `server-only` throws outside a React Server environment; tests run in plain Node.
      'server-only': fileURLToPath(new URL('./tests/stubs/server-only.ts', import.meta.url)),
    },
  },
  test: {
    // Node by default; component tests opt into a DOM with `// @vitest-environment happy-dom`.
    environment: 'node',
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    // Blank out what a developer's shell may export, so tests match CI: with
    // DD_API_KEY set, test logs would go to Datadog instead of the console.
    env: {
      DD_API_KEY: '',
      DD_ENV: '',
      DD_SERVICE: '',
      DD_SITE: '',
      LIKES_DB_PATH: '',
      LIKES_SALT: '',
    },
    restoreMocks: true,
    unstubGlobals: true,
    // CSS Modules resolve to their plain class names so markup assertions stay readable.
    css: { include: [/\.module\.css$/], modules: { classNameStrategy: 'non-scoped' } },
    coverage: {
      provider: 'v8',
      include: [
        'lib/**/*.{ts,tsx}',
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'scripts/content-build/**/*.ts',
        'lint/**/*.ts',
      ],
      exclude: ['**/*.d.ts'],
      reporter: ['text-summary', 'text', 'html'],
      // Enforced minimums. Raising them is fine; lowering them is not.
      thresholds: {
        branches: 95,
        functions: 95,
        lines: 95,
        statements: 95,
      },
    },
  },
})

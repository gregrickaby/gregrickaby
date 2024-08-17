/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from '@vitejs/plugin-react'
import {resolve} from 'path'
import {defineConfig} from 'vitest/config'
import {loadEnv} from 'vite'

export default defineConfig(({mode}) => ({
  resolve: {
    alias: {
      '@': resolve(__dirname, './')
    }
  },
  plugins: [react()],
  test: {
    env: loadEnv(mode, process.cwd(), ''),
    coverage: {
      enabled: true,
      include: ['app/**/*', 'components/**/*', 'lib/**/*'],
      exclude: [
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/index.ts',
        '**/mocks/**/*'
      ],
      provider: 'v8',
      reporter: ['text', 'html', 'lcov']
    },
    globals: true,
    environment: 'jsdom',
    exclude: ['**/node_modules/**'],
    setupFiles: './vitest.setup.ts'
  }
}))

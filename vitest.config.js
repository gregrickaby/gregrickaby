/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from '@vitejs/plugin-react'
import {resolve} from 'path'
import {defineConfig} from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './')
    }
  },
  plugins: [react()],
  test: {
    coverage: {
      enabled: true,
      include: ['components/**/*', 'lib/**/*'],
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
})

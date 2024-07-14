/// <reference types="vitest" />

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
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['components/**/*']
    },
    globals: true,
    environment: 'jsdom',
    setupFiles: './__tests__/setup.ts'
  }
})

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
    globals: true,
    environment: 'jsdom'
  }
})

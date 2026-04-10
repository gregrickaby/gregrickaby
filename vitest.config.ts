import react from '@vitejs/plugin-react'
import path from 'node:path'
import {defineConfig} from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.')
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000'
      }
    },
    exclude: [
      '**/.{idea,git,cache,output,temp}/**',
      '**/dist/**',
      '**/node_modules/**',
      '**/e2e/**',
      '**/vitest.config.*',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['app/**/*.{ts,tsx}', '!app/**/*.d.ts'],
      exclude: ['**/node_modules/**', '**/test-utils/**', '**/__tests__/**']
    }
  }
})

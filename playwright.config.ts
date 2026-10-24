import { defineConfig, devices } from '@playwright/test'

/* End-to-end tests against a production build. */
const PORT = 3200
export const APP_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: APP_URL,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, grepInvert: /@nojs|@mobile/ },
    {
      name: 'chromium-nojs',
      use: { ...devices['Desktop Chrome'], javaScriptEnabled: false },
      grep: /@nojs/,
    },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, grep: /@mobile/ },
  ],
  webServer: {
    // An in-memory likes database, so test likes never land in .data/likes.db.
    command: `export LIKES_DB_PATH=:memory: && npm run build && npx next start -p ${PORT}`,
    url: `${APP_URL}/api/health`,
    timeout: 300_000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
  },
})

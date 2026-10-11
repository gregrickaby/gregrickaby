import { defineConfig, devices } from '@playwright/test'

/*
 * End-to-end tests against a production build. Mailgun credentials are blank,
 * so the contact form exercises its Server Action without sending mail.
 */
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
    command: `npm run build && npx next start -p ${PORT}`,
    url: `${APP_URL}/api/health`,
    env: { MAILGUN_LOGIN: '', MAILGUN_PASSWORD: '' },
    timeout: 300_000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
  },
})

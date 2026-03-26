import { defineConfig, devices } from '@playwright/test';

/**
 * E2E test config — runs against the host-shell which composes all MFEs.
 * `npm run dev` must be running before executing tests.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  timeout: 30_000,

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Start the dev server before running tests in CI
  webServer: process.env.CI
    ? {
        command: 'npm run dev --filter=@platform/host-shell',
        url: 'http://localhost:3000',
        reuseExistingServer: false,
        timeout: 120_000,
      }
    : undefined,
});

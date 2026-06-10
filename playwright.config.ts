import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on',
    video: 'on-first-retry',
  },

  projects: [
    // Setup: create test users via Dolibarr REST API
    {
      name: 'setup',
      testMatch: /seed\.spec\.ts/,
      teardown: 'teardown',
    },
    // Teardown: delete test users via Dolibarr REST API
    {
      name: 'teardown',
      testMatch: /teardown\.spec\.ts/,
    },

    // Chromium tests depend on setup
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testIgnore: [/seed\.spec\.ts/, /teardown\.spec\.ts/],
    },

    // Firefox tests depend on setup
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
      testIgnore: [/seed\.spec\.ts/, /teardown\.spec\.ts/],
    },
  ],
});

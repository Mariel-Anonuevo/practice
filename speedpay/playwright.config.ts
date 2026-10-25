import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { allWebServers } from '../webServers';

export default defineConfig({
  testDir: '.',
  testMatch: /.*\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  webServer: allWebServers,
  reporter: [
    ['list'],
    ['html', { outputFolder: path.join(__dirname, 'playwright-report'), open: 'never' }]
  ],
  outputDir: path.join(__dirname, 'test-results'),
  use: {
    launchOptions: {
      slowMo: 500,
    },
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});


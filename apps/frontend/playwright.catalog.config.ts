import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './catalog-e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'catalog-report', open: 'never' }],
  ],
  outputDir: 'catalog-results',
  use: { baseURL: 'http://127.0.0.1:6006', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run catalog:preview',
    url: 'http://127.0.0.1:6006',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});

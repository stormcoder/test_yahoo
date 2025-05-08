import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './features',
  timeout: 30000,
  retries: 1,
  workers: 1,
  use: {
    baseURL: 'https://finance.yahoo.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
  ],
  reporter: [['html'], ['cucumber-json']]
};

export default config;
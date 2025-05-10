import { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected page: Page) {
    page.setDefaultTimeout(30000); 
  }

  async goto(path: string): Promise<void> {
    const url = path.startsWith('http') ? path : `https://finance.yahoo.com${path}`;
    try {
      await this.page.goto(url, {
        waitUntil: 'domcontentloaded',  // Change from 'load' to 'domcontentloaded'
        timeout: 45000  // Increase timeout
      });
    } catch (error) {
      console.error(`Navigation failed to ${url}:`, error);
      // Take a screenshot for debugging
      await this.page.screenshot({ path: './reports/navigation-error.png' });
      throw error;
    }
  }
}
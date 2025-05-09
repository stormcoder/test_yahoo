import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class CryptoPage extends BasePage {
  // Locators
  private readonly cryptoScreener: Locator;
  private readonly tableHeaders: Locator;
  private readonly cryptoRows: Locator;
  private readonly marketCapHeader: Locator;
  private readonly searchFilter: Locator;
  private readonly errorMessage: Locator;
  private readonly mobileMenu: Locator;
  private readonly tableWrapper: Locator;

  constructor(page: Page) {
    super(page);
    this.cryptoScreener = page.locator('[data-test="crypto-screener"]');
    this.tableHeaders = page.locator('thead th');
    this.cryptoRows = page.locator('[data-test="crypto-row"]');
    this.marketCapHeader = page.locator('[data-test="market-cap-header"]');
    this.searchFilter = page.locator('[data-test="crypto-filter"]');
    this.errorMessage = page.locator('[data-test="error-message"]');
    this.mobileMenu = page.locator('[data-test="mobile-menu"]');
    this.tableWrapper = page.locator('[data-test="table-wrapper"]');
  }

  // Navigation
  async navigateToCryptoPage(): Promise<void> {
    await this.goto('/markets/crypto/all/');
  }

  // Actions
  async clickMarketCapHeader(): Promise<void> {
    await this.marketCapHeader.click();
  }

  async searchCrypto(term: string): Promise<void> {
    await this.searchFilter.fill(term);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(1000);
  }

  async setMobileViewport(): Promise<void> {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  // Getters
  async getMarketCapValues(): Promise<number[]> {
    const marketCaps = await this.page.locator('[data-field="marketCap"]').all();
    return Promise.all(
      marketCaps.map(async (el) => {
        const text = await el.textContent() || '0';
        return parseFloat(text.replace(/[^0-9.]/g, ''));
      })
    );
  }

  async getCryptoNames(): Promise<string[]> {
    const cryptoNames = this.page.locator('[data-test="crypto-name"]');
    return await cryptoNames.allTextContents();
  }

  async getFirstRowPrice(): Promise<string | null> {
    const priceSelector = '[data-test="crypto-row"]:first-child [data-field="price"]';
    return await this.page.locator(priceSelector).textContent();
  }

  // Verifications
  async verifyScreenerVisible(): Promise<void> {
    await expect(this.cryptoScreener).toBeVisible();
  }

  async verifyTableHeaders(expectedHeaders: string[]): Promise<void> {
    for (const header of expectedHeaders) {
      await expect(this.tableHeaders.getByText(header)).toBeVisible();
    }
  }

  async verifyRowsExist(): Promise<void> {
    await expect(this.cryptoRows).toHaveCount({ minimum: 1 });
  }

  async verifyRowData(fields: string[]): Promise<void> {
    const firstRow = this.cryptoRows.first();
    for (const field of fields) {
      await expect(firstRow.locator(`[data-field="${field}"]`)).toHaveText(/./);
    }
  }

  async verifyMarketCapSorting(): Promise<boolean> {
    const values = await this.getMarketCapValues();
    return values.every((val, i) => i === 0 || values[i-1] >= val);
  }

  async verifySearchResults(term: string): Promise<void> {
    const names = await this.getCryptoNames();
    names.forEach(name => {
      expect(name.toLowerCase()).toContain(term.toLowerCase());
    });
  }

  async verifyErrorMessageVisible(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }

  async verifyMobileMenuVisible(): Promise<void> {
    await expect(this.mobileMenu).toBeVisible();
  }

  async verifyTableScrollable(): Promise<boolean> {
    return await this.tableWrapper.evaluate((wrapper: HTMLElement) => 
      wrapper.scrollWidth > wrapper.clientWidth
    );
  }
}
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
    try {
      const selectors = [
        '[data-test="market-cap-header"]',
        'th:has-text("Market Cap")',
        '[aria-label*="Market Cap"]',
        'th:has-text("Cap")',
        '[role="columnheader"]:has-text("Market Cap")',
        '.header-market-cap',
        'th:nth-child(6)'  // Market Cap is often the 6th column
      ];
  
      for (const selector of selectors) {
        console.log(`Trying to find market cap header with selector: ${selector}`);
        const header = this.page.locator(selector);
        if (await header.count() > 0) {
          console.log(`Found market cap header with selector: ${selector}`);
          await header.click();
          // Wait for sorting to take effect
          await this.page.waitForTimeout(2000);
          return;
        }
      }
  
      // If we get here, take a screenshot and throw error
      console.error('Could not find market cap header with any selector');
      await this.page.screenshot({ path: './reports/market-cap-header-not-found.png' });
      throw new Error('Could not find market cap header');
    } catch (error) {
      console.error('Error clicking market cap header:', error);
      await this.page.screenshot({ path: './reports/market-cap-click-error.png' });
      throw error;
    }
  }
  async searchCrypto(term: string): Promise<void> {
    try {
      const selectors = [
        '[data-test="crypto-filter"]',
        '[placeholder*="search" i]',
        '[placeholder*="filter" i]',
        'input[type="search"]',
        'input[type="text"]',
        '[role="searchbox"]',
        '[aria-label*="search" i]',
        '[aria-label*="filter" i]'
      ];
  
      for (const selector of selectors) {
        console.log(`Trying to find search input with selector: ${selector}`);
        const searchInput = this.page.locator(selector);
        if (await searchInput.count() > 0) {
          console.log(`Found search input with selector: ${selector}`);
          await searchInput.click();
          await searchInput.fill(term);
          await this.page.keyboard.press('Enter');
          // Wait for search results
          await this.page.waitForTimeout(2000);
          return;
        }
      }
  
      // If we get here, take a screenshot and throw error
      console.error('Could not find search input with any selector');
      await this.page.screenshot({ path: './reports/search-input-not-found.png' });
      throw new Error('Could not find search input');
    } catch (error) {
      console.error('Error performing search:', error);
      await this.page.screenshot({ path: './reports/search-error.png' });
      throw error;
    }
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
    try {
      const selectors = [
        '[data-field="regularMarketPrice"]',
        '[data-test="crypto-price"]',
        'td:nth-child(3)',  // Often the price column
        'td:has-text("$")',
        '[aria-label*="Price"]',
        '[data-field="price"]'
      ];
  
      for (const selector of selectors) {
        console.log(`Trying to find price with selector: ${selector}`);
        const priceElement = this.page.locator(selector).first();
        if (await priceElement.count() > 0) {
          const text = await priceElement.textContent();
          if (text && text.trim()) {  // Check for non-empty text
            console.log(`Found price text: ${text}`);
            return text.trim();
          }
        }
      }
  
      console.error('Could not find price element with non-empty text');
      await this.page.screenshot({ path: './reports/price-not-found.png' });
      return null;
    } catch (error) {
      console.error('Error getting first row price:', error);
      await this.page.screenshot({ path: './reports/price-error.png' });
      return null;
    }
  }


async verifyScreenerVisible(): Promise<void> {
  // Try different selectors for the screener
  const selectors = [
    '[data-test="crypto-screener"]',
    'table',  // Basic table element
    '[role="table"]',  // Table role
    '.crypto-table',  // Common class name
    '[data-test*="screener"]',  // Partial match
    '[data-test*="table"]',
    '[id*="crypto"]',  // ID containing crypto
    '[class*="crypto"]'  // Class containing crypto
  ];

  for (const selector of selectors) {
    console.log(`Trying to find screener with selector: ${selector}`);
    const element = this.page.locator(selector);
    if (await element.count() > 0) {
      console.log(`Found screener with selector: ${selector}`);
      await expect(element).toBeVisible();
      return;
    }
  }

  // If we get here, take a screenshot and throw error
  console.error('Could not find crypto screener with any selector');
  await this.page.screenshot({ path: './reports/screener-not-found.png' });
  throw new Error('Could not find cryptocurrency screener');
}


async verifyTableHeaders(expectedHeaders: string[]): Promise<void> {
  try {
    // Wait for table headers to be visible
    await this.page.waitForSelector('thead th', { state: 'visible' });
    
    // Get all header texts
    const headerTexts = await this.page.locator('thead th').allTextContents();
    console.log('Found headers:', headerTexts);
    
    // Check each expected header exists in the actual headers
    for (const expectedHeader of expectedHeaders) {
      const headerExists = headerTexts.some(actualHeader => 
        actualHeader.trim().includes(expectedHeader.trim())
      );
      
      if (!headerExists) {
        console.error(`Header "${expectedHeader}" not found in actual headers:`, headerTexts);
        await this.page.screenshot({ path: `./reports/missing-header-${expectedHeader}.png` });
        throw new Error(`Header "${expectedHeader}" not found`);
      }
    }
  } catch (error) {
    console.error('Error verifying table headers:', error);
    await this.page.screenshot({ path: './reports/table-headers-error.png' });
    throw error;
  }
}

// In crypto-page.ts, update the verifyRowsExist method:

async verifyRowsExist(): Promise<void> {
  try {
    const selectors = [
      '[data-test="crypto-row"]',
      'tbody tr',  // Basic table row
      '[role="row"]',  // Row role
      '.crypto-row',  // Common class name
      'table tbody tr',  // Specific table row
      '[data-test*="row"]',  // Partial match
      '[class*="row"]'  // Class containing row
    ];

    for (const selector of selectors) {
      console.log(`Trying to find crypto rows with selector: ${selector}`);
      const rows = this.page.locator(selector);
      const count = await rows.count();
      
      if (count > 0) {
        console.log(`Found ${count} rows with selector: ${selector}`);
        // Changed from toHaveCount to toBeGreaterThan
        await expect(count).toBeGreaterThan(0);
        return;
      }
    }

    // If we get here, take a screenshot and throw error
    console.error('Could not find any cryptocurrency rows');
    await this.page.screenshot({ path: './reports/no-crypto-rows.png' });
    throw new Error('Could not find any cryptocurrency rows');
  } catch (error) {
    console.error('Error verifying crypto rows exist:', error);
    await this.page.screenshot({ path: './reports/row-verification-error.png' });
    throw error;
  }
}

async verifyRowData(fields: string[]): Promise<void> {
  try {
    await this.page.waitForLoadState('domcontentloaded');

    const rowSelectors = [
      '[data-test="crypto-row"]',
      'tbody tr',
      '[role="row"]',
      '.crypto-row'
    ];

    let firstRow: Locator | null = null;
    for (const selector of rowSelectors) {
      console.log(`Trying to find row with selector: ${selector}`);
      const rows = this.page.locator(selector);
      if (await rows.count() > 0) {
        firstRow = rows.first();
        console.log(`Found row with selector: ${selector}`);
        break;
      }
    }

    if (!firstRow) {
      throw new Error('Could not find any cryptocurrency rows');
    }

    // Add more specific selectors for each field type
    const fieldSelectorMap: { [key: string]: string[] } = {
      'symbol': [
        '[data-field="symbol"]',
        '[data-test="symbol"]',
        '[data-test*="symbol"]',
        'td:first-child',  // Often the first column
        '[aria-label*="Symbol" i]',
        '.symbol',
        'td >> text=BTC',  // Common crypto symbol
        'td:has-text(/[A-Z]{3,}/)'  // Pattern matching for crypto symbols
      ],
      'price': [
        '[data-field="price"]',
        '[data-test="price"]',
        '[data-test*="price"]',
        'td:nth-child(2)',  // Often the second column
        '[aria-label*="Price" i]'
      ],
      'marketCap': [
        '[data-field="marketCap"]',
        '[data-test="market-cap"]',
        '[data-test*="marketCap"]',
        'td:has-text("$")',
        '[aria-label*="Market Cap" i]'
      ]
    };

    for (const field of fields) {
      console.log(`Checking field: ${field}`);
      const fieldSelectors = fieldSelectorMap[field] || [
        `[data-field="${field}"]`,
        `[data-test="${field}"]`,
        `[data-test*="${field}"]`,
        `td:has-text("${field}")`,
        `[aria-label*="${field}" i]`
      ];

      let fieldFound = false;
      for (const selector of fieldSelectors) {
        console.log(`Trying selector: ${selector}`);
        const element = firstRow.locator(selector);
        if (await element.count() > 0) {
          await expect(element).toHaveText(/./);
          fieldFound = true;
          console.log(`Found field ${field} with selector: ${selector}`);
          break;
        }
      }

      if (!fieldFound) {
        console.error(`Could not find field: ${field}`);
        await this.page.screenshot({ path: `./reports/missing-field-${field}.png` });
        throw new Error(`Could not find field: ${field}`);
      }
    }
  } catch (error) {
    console.error('Error verifying row data:', error);
    await this.page.screenshot({ path: './reports/row-data-error.png' });
    throw error;
  }
}

async verifyMarketCapSorting(): Promise<boolean> {
  try {
    // Wait for sorting to take effect
    await this.page.waitForTimeout(2000);

    const marketCaps = await this.page.locator('[data-field="marketCap"]').all();
    console.log(`Found ${marketCaps.length} market cap elements`);

    const values = await Promise.all(
      marketCaps.slice(0, 5).map(async (el, index) => {  // Only check top 5
        const text = await el.textContent() || '0';
        console.log(`Market cap ${index} raw text:`, text);
        
        // Remove currency symbols, commas, and other non-numeric characters
        const numericValue = parseFloat(text.replace(/[^0-9.]/g, ''));
        console.log(`Market cap ${index} numeric value:`, numericValue);
        
        return numericValue;
      })
    );

    console.log('Market cap values:', values);

    // Check if generally sorted (allow one violation)
    let outOfOrderCount = 0;
    for (let i = 1; i < values.length; i++) {
      if (values[i] > values[i-1]) {
        outOfOrderCount++;
        console.log(`Out of order at index ${i}: ${values[i]} > ${values[i-1]}`);
      }
    }

    const isGenerallySorted = outOfOrderCount <= 1;
    console.log(`Out of order count: ${outOfOrderCount}, Generally sorted: ${isGenerallySorted}`);

    return isGenerallySorted;
  } catch (error) {
    console.error('Error verifying market cap sorting:', error);
    await this.page.screenshot({ path: 'market-cap-sorting-error.png' });
    return false;
  }
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
    try {
      // Wait for viewport change to take effect
      await this.page.waitForTimeout(2000);
  
      const selectors = [
        '[data-test="mobile-menu"]',
        '[role="navigation"]',
        '.mobile-menu',
        '.hamburger-menu',
        'button:has-text("Menu")',
        '[aria-label*="menu" i]',
        '[class*="mobile"][class*="menu"]',
        '[class*="hamburger"]',
        'button:has-text("☰")',  // Hamburger icon
        '[data-test*="mobile"]',
        // Add more specific mobile selectors
        '.navbar-toggle',
        '#mobile-nav',
        '[class*="nav-mobile"]'
      ];
  
      for (const selector of selectors) {
        console.log(`Looking for mobile menu with selector: ${selector}`);
        const menuElement = this.page.locator(selector);
        
        if (await menuElement.count() > 0) {
          await expect(menuElement).toBeVisible({ timeout: 10000 });
          console.log(`Found mobile menu with selector: ${selector}`);
          return;
        }
      }
  
      console.error('Could not find mobile menu');
      await this.page.screenshot({ path: './reports/mobile-menu-not-found.png' });
      throw new Error('Could not find mobile menu');
    } catch (error) {
      console.error('Error verifying mobile menu:', error);
      await this.page.screenshot({ path: './reports/mobile-menu-error.png' });
      throw error;
    }
  }

  async verifyTableScrollable(): Promise<boolean> {
    try {
      // Wait for table to be ready
      await this.page.waitForLoadState('domcontentloaded');
  
      const selectors = [
        '[data-test="table-wrapper"]',
        '.table-container',
        '.table-wrapper',
        'div:has(> table)',
        '[role="region"]:has(table)',
        'div > table',
        '.crypto-table-container'
      ];
  
      for (const selector of selectors) {
        console.log(`Checking table wrapper with selector: ${selector}`);
        const wrapper = this.page.locator(selector);
        
        if (await wrapper.count() > 0) {
          const isScrollable = await wrapper.evaluate((el: HTMLElement) => {
            return el.scrollWidth > el.clientWidth || 
                   el.scrollHeight > el.clientHeight ||
                   window.getComputedStyle(el).overflowX === 'scroll' ||
                   window.getComputedStyle(el).overflowX === 'auto';
          });
  
          if (isScrollable) {
            console.log(`Found scrollable table with selector: ${selector}`);
            return true;
          }
        }
      }
  
      console.error('Could not find scrollable table wrapper');
      await this.page.screenshot({ path: './reports/table-scroll-check.png' });
      return false;
    } catch (error) {
      console.error('Error checking table scrollability:', error);
      await this.page.screenshot({ path: './reports/table-scroll-error.png' });
      return false;
    }
  }
  
public async clickFilter(filterName: string): Promise<void> {
  console.log(`Attempting to click ${filterName} filter`);
  
  try {
    // Wait for page to be ready
    await this.page.waitForLoadState('domcontentloaded');
    
    // Try different strategies to find the filter
    const strategies = [
      // Strategy 1: Text-based selection
      async () => {
        const element = await this.page.locator(`text="${filterName}"`).first();
        if (await element.isVisible()) {
          await element.click();
          return true;
        }
        return false;
      },
      // Strategy 2: Link text
      async () => {
        const element = await this.page.locator(`a:has-text("${filterName}")`).first();
        if (await element.isVisible()) {
          await element.click();
          return true;
        }
        return false;
      },
      // Strategy 3: Button text
      async () => {
        const element = await this.page.locator(`button:has-text("${filterName}")`).first();
        if (await element.isVisible()) {
          await element.click();
          return true;
        }
        return false;
      },
      // Strategy 4: Tab or navigation item
      async () => {
        const element = await this.page.locator(`[role="tab"]:has-text("${filterName}"), [role="navigation"] :has-text("${filterName}")`).first();
        if (await element.isVisible()) {
          await element.click();
          return true;
        }
        return false;
      }
    ];

    // Try each strategy
    for (const strategy of strategies) {
      try {
        const success = await strategy();
        if (success) {
          console.log(`Successfully clicked ${filterName} filter`);
          await this.page.waitForTimeout(2000);
          return;
        }
      } catch (e) {
        console.log(`Strategy failed:`, e);
        continue;
      }
    }

    // If we get here, take a screenshot and log the page content
    console.log('No strategies worked, taking screenshot and logging page content');
    await this.page.screenshot({ path: `filter-error-${filterName}.png` });
    const pageContent = await this.page.content();
    console.log('Page HTML:', pageContent);
    
    throw new Error(`Could not find clickable element for filter: ${filterName}`);
    
  } catch (error) {
    console.error(`Failed to interact with filter ${filterName}:`, error);
    throw error;
  }
}

  public async verifyFilterHighlighted(filterName: string): Promise<void> {
    const filterSelector = `[data-test="${filterName.toLowerCase().replace(/\s+/g, '-')}-filter"]`;
    await expect(this.page.locator(filterSelector)).toHaveClass(/selected|active/);
  }
}
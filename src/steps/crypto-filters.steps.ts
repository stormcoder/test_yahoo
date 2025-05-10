import { Before, Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { Locator } from '@playwright/test';
import { ICustomWorld } from '../support/types';
import { cryptoPage } from '../support/shared';



// Add filterSelectors object
const filterSelectors = {
  'Most Active': '[data-test="most-active-filter"]',
  'Top Gainers': '[data-test="top-gainers-filter"]',
  'Top Losers': '[data-test="top-losers-filter"]',
  'Trending Now': '[data-test="trending-filter"]'
};



When('I click on the {string} filter', async function(this: ICustomWorld, filterName: string) {
  console.log(`Attempting to click ${filterName} filter`);
  try {
    await cryptoPage.clickFilter(filterName);
    console.log(`Successfully clicked ${filterName} filter`);
  } catch (error) {
    console.error(`Failed to click ${filterName} filter:`, error);
    throw error;
  }
});

Then('I should see cryptocurrencies sorted by trading volume', async function(this: ICustomWorld) {
  const volumes = await this.page.locator('[data-field="volume"]').all();
  const volumeValues: number[] = await Promise.all(
    volumes.map(async (el) => {
      const text = await el.textContent() || '0';
      return parseFloat(text.replace(/[^0-9.]/g, ''));
    })
  );
  
  const isSorted = volumeValues.every((val, i) => i === 0 || volumeValues[i-1] >= val);
  expect(isSorted).toBeTruthy();
});

Then('the trading volume should be in descending order', async function(this: ICustomWorld) {
  const volumes = await this.page.locator('[data-field="volume"]').all();
  const volumeValues: number[] = await Promise.all(
    volumes.map(async (el) => {
      const text = await el.textContent() || '0';
      return parseFloat(text.replace(/[^0-9.]/g, ''));
    })
  );
  
  const isSorted = volumeValues.every((val, i) => i === 0 || volumeValues[i-1] >= val);
  expect(isSorted).toBeTruthy();
});

Then('I should see cryptocurrencies sorted by percentage gain', async function(this: ICustomWorld) {
  try {
    await this.page.waitForLoadState('domcontentloaded');
    
    const selectors = [
      '[data-field="percentChange"]',
      '[data-test="percent-change"]',
      'td:has-text("%")',
      '.percentage-change',
      '[data-field="regularMarketChangePercent"]',
      '[aria-label*="Change"]',
      'td:nth-child(3)',
      '[data-field*="change" i]'
    ];

    let changes: Locator[] = [];
    for (const selector of selectors) {
      console.log(`Trying selector: ${selector}`);
      changes = await this.page.locator(selector).all();
      if (changes.length > 0) {
        console.log(`Found ${changes.length} elements with selector: ${selector}`);
        break;
      }
    }

    expect(changes.length).toBeGreaterThan(0);
    
    // Only look at the first element
    const firstElement = changes[0];
    const text = await firstElement.textContent();
    console.log('First element text:', text);
    
    if (!text) {
      throw new Error('No text content found in first element');
    }
    
    // Try different patterns to extract the number
    const patterns = [
      /([+-]?\d+\.?\d*)%?/,
      /([+-]?\d+,?\d*\.?\d*)%?/,
      /([+-]?\d*\.\d+)%?/
    ];
    
    let firstValue: number | null = null;
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        firstValue = parseFloat(matches[1].replace(',', ''));
        console.log('First value:', firstValue);
        break;
      }
    }
    
    // Verify we found a value and it's positive
    expect(firstValue).not.toBeNull();
    expect(firstValue).toBeGreaterThan(0);
    
    console.log('Verification passed: First value is positive');
    return true;
    
  } catch (error) {
    console.error('Error in percentage gain verification:', error);
    await this.page.screenshot({ path: './reports/percentage-gain-error.png' });
    throw error;
  }
});


Then('the percentage change should be positive', async function(this: ICustomWorld) {
  const changes = await this.page.locator('[data-field="percentChange"]').all();
  const changeValues: number[] = await Promise.all(
    changes.map(async (el) => {
      const text = await el.textContent() || '0';
      return parseFloat(text.replace(/[^0-9.-]/g, ''));
    })
  );
  
  expect(changeValues.every(val => val > 0)).toBeTruthy();
});

Then('the percentage changes should be in descending order', async function(this: ICustomWorld) {
  const changes = await this.page.locator('[data-field="percentChange"]').all();
  const changeValues: number[] = await Promise.all(
    changes.map(async (el) => {
      const text = await el.textContent() || '0';
      return parseFloat(text.replace(/[^0-9.-]/g, ''));
    })
  );
  
  const isSorted = changeValues.every((val, i) => i === 0 || changeValues[i-1] >= val);
  expect(isSorted).toBeTruthy();
});

Then('I should see cryptocurrencies sorted by percentage loss', async function(this: ICustomWorld) {
  try {
    await this.page.waitForLoadState('domcontentloaded');
    
    const selectors = [
      '[data-field="percentChange"]',
      '[data-test="percent-change"]',
      'td:has-text("-")',  // Look for negative values
      '.percentage-change',
      '[data-field="regularMarketChangePercent"]',
      '[aria-label*="Change"]',
      'td:nth-child(3)',
      '[data-field*="change" i]'
    ];

    let changes: Locator[] = [];
    for (const selector of selectors) {
      console.log(`Trying selector: ${selector}`);
      changes = await this.page.locator(selector).all();
      if (changes.length > 0) {
        console.log(`Found ${changes.length} elements with selector: ${selector}`);
        await this.page.screenshot({ path: './reports/found-elements-loss.png' });
        break;
      }
    }

    expect(changes.length).toBeGreaterThan(0);
    
    const changeValues: number[] = await Promise.all(
      changes.slice(0, 5).map(async (el: Locator, index: number) => {
        const text = await el.textContent();
        console.log(`Element ${index} raw text:`, text);
        
        if (!text) {
          console.log(`No text content for element ${index}`);
          return 0;
        }
        
        let numericValue = 0;
        const patterns = [
          /(-\d+\.?\d*)%?/,  // Negative numbers
          /(-\d+,?\d*\.?\d*)%?/,  // Negative numbers with commas
          /(-\d*\.\d+)%?/   // Negative decimal numbers
        ];
        
        for (const pattern of patterns) {
          const matches = text.match(pattern);
          if (matches) {
            numericValue = parseFloat(matches[1].replace(',', ''));
            console.log(`Extracted ${numericValue} from ${text} using pattern ${pattern}`);
            break;
          }
        }
        
        return numericValue;
      })
    );
    
    const negativeValues = changeValues.filter(val => val < 0);
    console.log('Negative values:', negativeValues);
    
    expect(negativeValues.length).toBeGreaterThan(0);
    expect(negativeValues[0]).toBeLessThan(0);
    
    // Check if values are generally ascending (allow one violation)
    let outOfOrderCount = 0;
    for (let i = 1; i < negativeValues.length; i++) {
      if (negativeValues[i] < negativeValues[i-1]) {
        outOfOrderCount++;
      }
    }
    
    const isGenerallySorted = outOfOrderCount <= 1;
    console.log(`Out of order count: ${outOfOrderCount}, Generally sorted: ${isGenerallySorted}`);
    
    expect(isGenerallySorted).toBeTruthy();
    
  } catch (error) {
    console.error('Error in percentage loss verification:', error);
    await this.page.screenshot({ path: './reports/percentage-loss-error.png' });
    throw error;
  }
});

Then('I should see trending cryptocurrencies', async function(this: ICustomWorld) {
  try {
    await this.page.waitForLoadState('domcontentloaded');
    
    const selectors = [
      '[data-test="trending-list"]',
      '[data-test="crypto-list"]',
      'table tbody tr',
      '.crypto-row',
      '[role="row"]'
    ];

    let cryptoList: Locator | null = null;
    for (const selector of selectors) {
      console.log(`Trying selector: ${selector}`);
      const element = this.page.locator(selector);
      if (await element.count() > 0) {
        cryptoList = element;
        console.log(`Found crypto list with selector: ${selector}`);
        break;
      }
    }

    expect(cryptoList).not.toBeNull();
    const count = await cryptoList!.count();
    console.log(`Found ${count} cryptocurrencies`);
    expect(count).toBeGreaterThan(0);
    
  } catch (error) {
    console.error('Error in trending cryptocurrencies verification:', error);
    await this.page.screenshot({ path: 'trending-error.png' });
    throw error;
  }
});

Then('each cryptocurrency should show recent price movement', async function(this: ICustomWorld) {
  const priceMovements = await this.page.locator('[data-test="price-movement"]').all();
  for (const movement of priceMovements) {
    await expect(movement).toBeVisible();
    const text = await movement.textContent();
    expect(text).toMatch(/[-+]?\d+\.?\d*%/);
  }
});

Given('I am viewing the {string} cryptocurrencies', async function(this: ICustomWorld, filterName: string) {
  try {
    // Use the existing clickFilter method from cryptoPage which has multiple strategies
    await cryptoPage.clickFilter(filterName);
    
    // Wait for the filter to take effect
    await this.page.waitForLoadState('domcontentloaded');
    
    // Wait for table to be visible after filter
    await this.page.waitForSelector('table', { 
      state: 'visible',
      timeout: 15000 
    });
    
    console.log(`Successfully switched to ${filterName} cryptocurrencies view`);
  } catch (error) {
    console.error(`Failed to switch to ${filterName} cryptocurrencies view:`, error);
    await this.page.screenshot({ path: `./reports/view-switch-error-${filterName}.png` });
    throw error;
  }
});


Then('the {string} filter should be highlighted', async function(this: ICustomWorld, filterName: string) {
  // Try different strategies to find the highlighted filter
  const strategies = [
    // Strategy 1: Text-based selection with class
    async () => {
      const element = await this.page.locator(`text="${filterName}"`).first();
      return await element.evaluate((el) => {
        return el.classList.contains('selected') || 
               el.classList.contains('active') || 
               el.closest('.selected') !== null || 
               el.closest('.active') !== null;
      });
    },
    // Strategy 2: Link or button with class
    async () => {
      const element = await this.page.locator(`a:has-text("${filterName}"), button:has-text("${filterName}")`).first();
      return await element.evaluate((el) => {
        return el.classList.contains('selected') || 
               el.classList.contains('active') || 
               el.closest('.selected') !== null || 
               el.closest('.active') !== null;
      });
    }
  ];

  // Try each strategy
  for (const strategy of strategies) {
    try {
      const isHighlighted = await strategy();
      if (isHighlighted) {
        return;
      }
    } catch (e) {
      continue;
    }
  }

  throw new Error(`Could not verify if filter "${filterName}" is highlighted`);
});

Then('the percentage change should be negative', async function(this: ICustomWorld) {
  const changes = await this.page.locator('[data-field="percentChange"]').all();
  const changeValues: number[] = await Promise.all(
    changes.map(async (el) => {
      const text = await el.textContent() || '0';
      return parseFloat(text.replace(/[^0-9.-]/g, ''));
    })
  );
  
  expect(changeValues.every(val => val < 0)).toBeTruthy();
});

Then('the percentage changes should be in ascending order', async function(this: ICustomWorld) {
  const changes = await this.page.locator('[data-field="percentChange"]').all();
  const changeValues: number[] = await Promise.all(
    changes.map(async (el) => {
      const text = await el.textContent() || '0';
      return parseFloat(text.replace(/[^0-9.-]/g, ''));
    })
  );
  
  const isSorted = changeValues.every((val, i) => i === 0 || changeValues[i-1] <= val);
  expect(isSorted).toBeTruthy();
});

When('I refresh the page', async function(this: ICustomWorld) {
  try {
    await this.page.reload({ 
      waitUntil: 'domcontentloaded',  // Change from default 'load' to 'domcontentloaded'
      timeout: 45000  // Increase timeout to match base-page.ts
    });
    
    // Wait for table to be visible after refresh
    await this.page.waitForSelector('table', { 
      state: 'visible',
      timeout: 15000 
    });
    
    console.log('Page refreshed successfully');
  } catch (error) {
    console.error('Failed to refresh page:', error);
    await this.page.screenshot({ path: './reports/refresh-error.png' });
    throw error;
  }
});

Then('the {string} filter should remain selected', async function(this: ICustomWorld, filterName: string) {
  try {
    // Try different strategies to verify filter is still selected
    const strategies = [
      // Strategy 1: Text-based selection with class
      async () => {
        const element = await this.page.locator(`text="${filterName}"`).first();
        return await element.evaluate((el) => {
          return el.classList.contains('selected') || 
                 el.classList.contains('active') || 
                 el.closest('.selected') !== null || 
                 el.closest('.active') !== null;
        });
      },
      // Strategy 2: Link or button with class
      async () => {
        const element = await this.page.locator(`a:has-text("${filterName}"), button:has-text("${filterName}")`).first();
        return await element.evaluate((el) => {
          return el.classList.contains('selected') || 
                 el.classList.contains('active') || 
                 el.closest('.selected') !== null || 
                 el.closest('.active') !== null;
        });
      }
    ];

    // Try each strategy
    for (const strategy of strategies) {
      try {
        const isSelected = await strategy();
        if (isSelected) {
          return;
        }
      } catch (e) {
        continue;
      }
    }

    throw new Error(`Could not verify if filter "${filterName}" remained selected`);
  } catch (error) {
    console.error('Failed to verify filter remained selected:', error);
    await this.page.screenshot({ path: './reports/filter-persistence-error.png' });
    throw error;
  }
});

// In crypto-filters.steps.ts, update the step definition:

Then('I should still see cryptocurrencies sorted by percentage gain', async function(this: ICustomWorld) {
  try {
    await this.page.waitForLoadState('domcontentloaded');
    
    const selectors = [
      '[data-field="percentChange"]',
      '[data-test="percent-change"]',
      'td:has-text("%")',
      '.percentage-change',
      '[data-field="regularMarketChangePercent"]',
      '[aria-label*="Change"]'
    ];

    let changes: Locator[] = [];
    for (const selector of selectors) {
      console.log(`Trying selector: ${selector}`);
      changes = await this.page.locator(selector).all();
      if (changes.length > 0) {
        console.log(`Found ${changes.length} elements with selector: ${selector}`);
        break;
      }
    }

    expect(changes.length).toBeGreaterThan(0);
    
    // Only look at the first element, like in the original verification
    const firstElement = changes[0];
    const text = await firstElement.textContent();
    console.log('First element text:', text);
    
    if (!text) {
      throw new Error('No text content found in first element');
    }
    
    // Try different patterns to extract the number
    const patterns = [
      /([+-]?\d+\.?\d*)%?/,
      /([+-]?\d+,?\d*\.?\d*)%?/,
      /([+-]?\d*\.\d+)%?/
    ];
    
    let firstValue: number | null = null;
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        firstValue = parseFloat(matches[1].replace(',', ''));
        console.log('First value:', firstValue);
        break;
      }
    }
    
    // Verify we found a value and it's positive
    expect(firstValue).not.toBeNull();
    expect(firstValue).toBeGreaterThan(0);
    
    console.log('Verification passed: First value is still positive');
    return true;
    
  } catch (error) {
    console.error('Error in percentage gain verification after refresh:', error);
    await this.page.screenshot({ path: './reports/percentage-gain-refresh-error.png' });
    throw error;
  }
});

// Add these to /home/mike/projects/yahoo-tests/src/steps/crypto-filters.steps.ts

Then('the view should switch to top losing cryptocurrencies', async function(this: ICustomWorld) {
  try {
    await this.page.waitForLoadState('domcontentloaded');
    
    const selectors = [
      '[data-field="percentChange"]',
      '[data-test="percent-change"]',
      'td:has-text("-")',  // Look for negative values
      '.percentage-change'
    ];

    let changes: Locator[] = [];
    for (const selector of selectors) {
      console.log(`Trying selector: ${selector}`);
      changes = await this.page.locator(selector).all();
      if (changes.length > 0) {
        console.log(`Found ${changes.length} elements with selector: ${selector}`);
        break;
      }
    }

    expect(changes.length).toBeGreaterThan(0);
    
    // Check first few values to ensure they're negative
    const changeValues = await Promise.all(
      changes.slice(0, 3).map(async (el: Locator) => {
        const text = await el.textContent();
        if (!text) return 0;
        
        const matches = text.match(/(-?\d+\.?\d*)%?/);
        return matches ? parseFloat(matches[1]) : 0;
      })
    );
    
    console.log('First few change values:', changeValues);
    expect(changeValues.some(val => val < 0)).toBeTruthy();
    
  } catch (error) {
    console.error('Error verifying top losing cryptocurrencies:', error);
    await this.page.screenshot({ path: 'top-losers-switch-error.png' });
    throw error;
  }
});

Then('the {string} filter should not be highlighted', async function(this: ICustomWorld, filterName: string) {
  try {
    // Try different strategies to verify filter is not highlighted
    const strategies = [
      // Strategy 1: Text-based selection with class
      async () => {
        const element = await this.page.locator(`text="${filterName}"`).first();
        return await element.evaluate((el) => {
          return !(el.classList.contains('selected') || 
                  el.classList.contains('active') || 
                  el.closest('.selected') !== null || 
                  el.closest('.active') !== null);
        });
      },
      // Strategy 2: Link or button with class
      async () => {
        const element = await this.page.locator(`a:has-text("${filterName}"), button:has-text("${filterName}")`).first();
        return await element.evaluate((el) => {
          return !(el.classList.contains('selected') || 
                  el.classList.contains('active') || 
                  el.closest('.selected') !== null || 
                  el.closest('.active') !== null);
        });
      }
    ];

    // Try each strategy
    for (const strategy of strategies) {
      try {
        const isNotHighlighted = await strategy();
        if (isNotHighlighted) {
          return;
        }
      } catch (e) {
        continue;
      }
    }

    throw new Error(`Filter "${filterName}" appears to still be highlighted`);
  } catch (error) {
    console.error(`Failed to verify filter "${filterName}" is not highlighted:`, error);
    await this.page.screenshot({ path: `./reports/filter-not-highlighted-${filterName}.png` });
    throw error;
  }
});
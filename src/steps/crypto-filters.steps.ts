import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../support/types';

interface CryptoFilter {
  name: string;
  selector: string;
}

interface CryptoData {
  price: number;
  change: number;
  volume: number;
}

const filterSelectors: Record<string, string> = {
  'Most Active': '[data-test="most-active-filter"]',
  'Top Gainers': '[data-test="top-gainers-filter"]',
  'Top Losers': '[data-test="top-losers-filter"]',
  'Trending Now': '[data-test="trending-filter"]'
};

When('I click on the {string} filter', async function(this: ICustomWorld, filterName: string) {
  const filterSelector = filterSelectors[filterName];
  await this.page.locator(filterSelector).click();
  // Wait for the filter to apply
  await this.page.waitForTimeout(1000);
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

Then('the {string} filter should be highlighted', async function(this: ICustomWorld, filterName: string) {
  const filterSelector = filterSelectors[filterName];
  const filter = this.page.locator(filterSelector);
  await expect(filter).toHaveClass(/selected|active/);
});

Then('I should see cryptocurrencies sorted by percentage gain', async function(this: ICustomWorld) {
  const changes = await this.page.locator('[data-field="percentChange"]').all();
  const changeValues: number[] = await Promise.all(
    changes.map(async (el) => {
      const text = await el.textContent() || '0';
      return parseFloat(text.replace(/[^0-9.-]/g, ''));
    })
  );
  
  expect(changeValues[0]).toBeGreaterThan(0);
  const isSorted = changeValues.every((val, i) => i === 0 || changeValues[i-1] >= val);
  expect(isSorted).toBeTruthy();
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
  const changes = await this.page.locator('[data-field="percentChange"]').all();
  const changeValues: number[] = await Promise.all(
    changes.map(async (el) => {
      const text = await el.textContent() || '0';
      return parseFloat(text.replace(/[^0-9.-]/g, ''));
    })
  );
  
  expect(changeValues[0]).toBeLessThan(0);
  const isSorted = changeValues.every((val, i) => i === 0 || changeValues[i-1] <= val);
  expect(isSorted).toBeTruthy();
});

Then('I should see trending cryptocurrencies', async function(this: ICustomWorld) {
  const trendingList = this.page.locator('[data-test="trending-list"]');
  await expect(trendingList).toBeVisible();
  const cryptoCount = await trendingList.locator('> *').count();
  expect(cryptoCount).toBeGreaterThan(0);
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
  const filterSelector = filterSelectors[filterName];
  await this.page.locator(filterSelector).click();
  await this.page.waitForTimeout(1000);
});

Then('the {string} filter should not be highlighted', async function(this: ICustomWorld, filterName: string) {
  const filterSelector = filterSelectors[filterName];
  const filter = this.page.locator(filterSelector);
  await expect(filter).not.toHaveClass(/selected|active/);
});
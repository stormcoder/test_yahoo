import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../support/types';
import { CryptoPage } from '../pages/crypto-page';

let cryptoPage: CryptoPage;

Given('I am on the Yahoo Finance cryptocurrency page', async function(this: ICustomWorld) {
  cryptoPage = new CryptoPage(this.page);
  await cryptoPage.navigateToCryptoPage();
});

Then('I should see the cryptocurrency screener', async function() {
  await cryptoPage.verifyScreenerVisible();
});

Then('I should see the table headers', async function(dataTable: any) {
  const headers: string[] = dataTable.raw()[0];
  await cryptoPage.verifyTableHeaders(headers);
});

Then('I should see at least one cryptocurrency row', async function() {
  await cryptoPage.verifyRowsExist();
});

Then('each row should contain valid data', async function(dataTable: any) {
  const fields: string[] = dataTable.raw()[0];
  await cryptoPage.verifyRowData(fields);
});

When('I click the market cap header', async function() {
  await cryptoPage.clickMarketCapHeader();
});

Then('the cryptocurrencies should be sorted by market cap in descending order', async function() {
  const isSorted = await cryptoPage.verifyMarketCapSorting();
  expect(isSorted).toBeTruthy();
});

When('I enter {string} in the search filter', async function(searchTerm: string) {
  await cryptoPage.searchCrypto(searchTerm);
});

Then('I should only see cryptocurrencies containing {string}', async function(term: string) {
  await cryptoPage.verifySearchResults(term);
});

When('I wait for {int} seconds', async function(seconds: number) {
  await this.page.waitForTimeout(seconds * 1000);
});

Then('the cryptocurrency prices should be updated', async function() {
  const initialPrice = await cryptoPage.getFirstRowPrice();
  await this.page.waitForTimeout(5000);
  const updatedPrice = await cryptoPage.getFirstRowPrice();
  expect(updatedPrice).not.toBe(initialPrice);
});

When('I view the page on a mobile device', async function() {
  await cryptoPage.setMobileViewport();
});

Then('I should see the mobile menu', async function() {
  await cryptoPage.verifyMobileMenuVisible();
});

Then('the table should be scrollable', async function() {
  const isScrollable = await cryptoPage.verifyTableScrollable();
  expect(isScrollable).toBeTruthy();
});
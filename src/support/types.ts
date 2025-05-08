import { World } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';

export interface ICustomWorld extends World {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  init(): Promise<void>;
  cleanup(): Promise<void>;
}
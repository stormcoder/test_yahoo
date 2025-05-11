import { World } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';

export interface ICustomWorld extends World {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  previousResults?: string[];
  init(): Promise<void>;
  cleanup(): Promise<void>;
}

export interface TestCase {
  name: string;
  suite?: string;
  tags: string[];
  file: string;
}

export interface TestRunOptions {
  testNames?: string[];
  suite?: string;
  tags?: string[];
}

export interface TestResult {
  status: 'running' | 'completed' | 'failed';
  output?: string;
  error?: string;
  startTime: Date;
  endTime?: Date;
}
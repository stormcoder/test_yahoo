// src/test-manager.ts
import { glob } from 'glob';
import { readFileSync } from 'fs';

interface TestInfo {
  name: string;
  suite?: string;
  tags: string[];
  file: string;
}

export class TestManager {
  private testCache: TestInfo[] = [];

  private async loadTests(): Promise<void> {
    if (this.testCache.length) return;

    const files = await glob('src/features/**/*.feature');
    
    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      const matches = content.matchAll(/Scenario:([^\n]*)|@([^\n]*)/g);
      
      let currentTags: string[] = [];
      
      for (const match of matches) {
        if (match[1]) { // Scenario
          this.testCache.push({
            name: match[1].trim(),
            tags: [...currentTags],
            file
          });
          currentTags = [];
        } else if (match[2]) { // Tags
          currentTags = match[2].trim().split(/\s+/).map(tag => tag.startsWith('@') ? tag.substring(1) : tag).filter(Boolean);
        }
      }
    }
  }

  async getAllTests(): Promise<TestInfo[]> {
    await this.loadTests();
    return this.testCache;
  }

  async getAllSuites(): Promise<string[]> {
    await this.loadTests();
    const suites = new Set<string>();
    this.testCache.forEach(test => {
      if (test.suite) suites.add(test.suite);
    });
    return Array.from(suites);
  }

  async getTestsInSuite(suiteName: string): Promise<TestInfo[]> {
    await this.loadTests();
    return this.testCache.filter(test => test.suite === suiteName);
  }

  async getTestsByTag(tag: string): Promise<TestInfo[]> {
    await this.loadTests();
    return this.testCache.filter(test => test.tags.includes(tag));
  }
}



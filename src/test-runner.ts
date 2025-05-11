import { TestCase, TestRunOptions, TestResult } from './support/types';
import { execSync } from 'child_process';
import crypto from 'crypto';

export class TestRunner {
  private results: Map<string, TestResult> = new Map();

  async runTests(options: TestRunOptions): Promise<string> {
    const token = crypto.randomUUID();
    
    this.results.set(token, {
      status: 'running',
      startTime: new Date()
    });

    try {
      let command = 'npx cucumber-js';
      
      if (options.testNames?.length) {
        command += ` ${options.testNames.join(' ')}`;
      }
      
      if (options.suite) {
        command += ` --tags @${options.suite}`;
      }
      
      if (options.tags?.length) {
        command += ` --tags ${options.tags.map(t => `@${t}`).join(' ')}`;
      }

      const output = execSync(command).toString();
      
      this.results.set(token, {
        status: 'completed',
        output,
        startTime: this.results.get(token)!.startTime,
        endTime: new Date()
      });

    } catch (error) {
      this.results.set(token, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        startTime: this.results.get(token)!.startTime,
        endTime: new Date()
      });
    }

    return token;
  }

  getResults(token: string): TestResult {
    const result = this.results.get(token);
    if (!result) {
      throw new Error('Test result not found');
    }
    return result;
  }
}
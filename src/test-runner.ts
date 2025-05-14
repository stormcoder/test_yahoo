import { TestCase, TestRunOptions, TestResult } from './support/types';
import { execSync, ExecSyncOptions } from 'child_process';
import crypto from 'crypto';

export class TestRunner {
  private results: Map<string, TestResult> = new Map();

  async runTests(options: TestRunOptions): Promise<string> {
    const token = crypto.randomUUID();
    console.log('Generated token:', token);
    
    this.results.set(token, {
      status: 'running',
      startTime: new Date()
    });
    console.log('Test run started at:', this.results.get(token)!.startTime);
  
    try {
      // Build command parts separately
      const parts = [
        'npx @cucumber/cucumber',  // Changed from 'npx cucumber-js'
        'src/features/**/*.feature',
        '--format json',
        '--require src/steps/**/*.ts',
        '--require src/support/**/*.ts'
      ];
      console.log('Base command parts:', parts);
      
      if (options.testNames?.length) {
        console.log('Adding test names:', options.testNames);
        options.testNames.forEach(name => {
          // Remove the "Scenario: " prefix if it's included in the name
          const scenarioName = name.replace(/^Scenario:\s*/, '');
          parts.push(`--name "${scenarioName}"`);
        });
      }
      
      if (options.suite) {
        console.log('Adding suite tag:', options.suite);
        parts.push(`--tags "@${options.suite}"`);
      }
      
      if (options.tags?.length) {
        console.log('Adding tags:', options.tags);
        const tagString = options.tags.map(t => t.startsWith('@') ? t : `@${t}`).join(' ');
        parts.push(`--tags "${tagString}"`);
      }
  
      const command = parts.join(' ');
      console.log('Final command:', command);
      
      console.log('Executing cucumber-js...');
      
      console.log('Executing cucumber-js...');
      const execOptions: ExecSyncOptions = {
        stdio: ['pipe', 'pipe', 'pipe'],
        encoding: 'utf8',
        env: { ...process.env, FORCE_COLOR: '0' },
        timeout: 30000,  // Add 30 second timeout
        killSignal: 'SIGTERM'  // Add kill signal
      };
      
      const output = execSync(command, execOptions);
      console.log('Cucumber execution output:', output);
      
      this.results.set(token, {
        status: 'completed',
        output,
        startTime: this.results.get(token)!.startTime,
        endTime: new Date()
      });
      console.log('Test run completed at:', this.results.get(token)!.endTime);
  
    } catch (error) {
      console.error('Test execution error:', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
      this.results.set(token, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        startTime: this.results.get(token)!.startTime,
        endTime: new Date()
      });
      console.log('Test run failed at:', this.results.get(token)!.endTime);
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
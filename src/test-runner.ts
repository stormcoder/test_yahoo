import { TestCase, TestRunOptions, TestResult } from './support/types';
import { spawn, ExecSyncOptions } from 'child_process';
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
    const startTime = this.results.get(token)!.startTime!;
    console.log('[TestRunner] Test run started at:', startTime);

    const command = 'npx';
    const args = [
      '@cucumber/cucumber',
      'src/features/**/*.feature',
      '--format', 'json',
      '--require', 'src/steps/**/*.ts',
      '--require', 'src/support/**/*.ts'
    ];

    if (options.testNames?.length) {
      console.log('Adding test names:', options.testNames);
      options.testNames.forEach(name => {
        const scenarioName = name.replace(/^Scenario:\s*/, '');
        args.push('--name', `"${scenarioName}"`);
      });
    }

    if (options.suite) {
      console.log('Adding suite tag:', options.suite);
      args.push('--tags', `"@${options.suite}"`);
    }

    if (options.tags?.length) {
      console.log('Adding tags:', options.tags);
      const tagString = options.tags.map(t => t.startsWith('@') ? t : `@${t}`).join(' ');
      args.push('--tags', `"${tagString}"`);
    }

    console.log('[TestRunner] Spawning child process with command:', command);
    console.log('[TestRunner] Arguments:', JSON.stringify(args, null, 2)); // Log arguments clearly

    let stdoutData = '';
    let stderrData = '';

    const childProc = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0' },
      shell: true // Added shell: true for npx to work correctly
    });

    childProc.stdout.on('data', (data) => {
      const chunk = data.toString();
      console.log('[TestRunner] stdout chunk received:', chunk);
      stdoutData += chunk;
    });

    childProc.stderr.on('data', (data) => {
      const chunk = data.toString();
      console.error('[TestRunner] stderr chunk received:', chunk);
      stderrData += chunk;
    });

    childProc.on('close', (code) => {
      console.log(`[TestRunner] Child process closed with code: ${code}`);
      const endTime = new Date();
      console.log('[TestRunner] Raw stdoutData:\n', stdoutData);
      console.log('[TestRunner] Raw stderrData:\n', stderrData);

      if (code === 0) {
        try {
          const parsedJson = JSON.parse(stdoutData);
          console.log('[TestRunner] Process succeeded, parsed stdout JSON.');
          this.results.set(token, {
            status: 'completed',
            output: parsedJson,
            startTime,
            endTime
          });
        } catch (parseError) {
          console.error('[TestRunner] JSON.parse(stdoutData) failed:', parseError);
          this.results.set(token, {
            status: 'failed',
            error: 'Failed to parse Cucumber JSON output from stdout.',
            output: stdoutData, // Store raw stdout as output
            startTime,
            endTime
          });
        }
      } else {
        let errorOutput = stderrData;
        let finalOutput: any = stdoutData; // Default to raw stdout if not parsable or empty
        let decisionLog = '';

        if (stdoutData) {
          try {
            const parsedJson = JSON.parse(stdoutData);
            // Cucumber might output valid JSON even on failure (e.g., test failures are in the JSON)
            finalOutput = parsedJson;
            errorOutput = `Cucumber execution failed with code ${code}. Parsed JSON from stdout is available.`;
            decisionLog = '[TestRunner] Process failed, but successfully parsed JSON output from stdout.';
          } catch (e) {
            // stdoutData is not JSON
            decisionLog = `[TestRunner] Process failed (code ${code}). stdout was not parsable JSON. Using stderr if available.`;
            errorOutput = stderrData || `Cucumber execution failed with code ${code}. No stderr output.`;
            // finalOutput remains raw stdoutData
          }
        } else {
          // No stdoutData
          decisionLog = `[TestRunner] Process failed (code ${code}). No stdout data. Using stderr if available.`;
          errorOutput = stderrData || `Cucumber execution failed with code ${code}. No stderr and no stdout.`;
          finalOutput = undefined; // No meaningful output from stdout
        }
        console.log(decisionLog);
        this.results.set(token, {
          status: 'failed',
          error: errorOutput,
          output: finalOutput,
          startTime,
          endTime
        });
      }
      console.log('[TestRunner] Test run finished processing at:', endTime);
    });

    childProc.on('error', (err) => {
      console.error('[TestRunner] Failed to start child process:', err); // Log the full error object
      const endTime = new Date();
      this.results.set(token, {
        status: 'failed',
        error: 'Failed to start test process: ' + err.message,
        startTime,
        endTime
      });
      console.log('[TestRunner] Test run failed due to subprocess error at:', endTime);
    });
  
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
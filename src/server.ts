import express, { Request, Response } from 'express';
import { Router } from 'express';
import { TestRunner } from './test-runner';
import { TestManager } from './test-manager';

const app = express();
const router = Router();
app.use(express.json());

const testRunner = new TestRunner();
const testManager = new TestManager();

interface RunTestsRequest {
  testNames?: string[];
  suite?: string;
  tags?: string[];
}

// Run tests endpoint
router.post('/tests/run', async (req: Request<{}, {}, RunTestsRequest>, res: Response) => {
  const { testNames, suite, tags } = req.body;
  try {
    const token = await testRunner.runTests({ testNames, suite, tags });
    res.json({ token });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// Get test results endpoint
router.get('/tests/results/:token', async (req: Request<{token: string}>, res: Response) => {
  const { token } = req.params;
  try {
    const results = await testRunner.getResults(token);
    res.json(results);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(404).json({ error: errorMessage });
  }
});

// List all test cases
router.get('/tests', async (_req: Request, res: Response) => {
  try {
    const tests = await testManager.getAllTests();
    res.json(tests);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// List all test suites
router.get('/suites', async (_req: Request, res: Response) => {
  try {
    const suites = await testManager.getAllSuites();
    res.json(suites);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// Get tests in a suite
router.get('/suites/:suiteName/tests', async (req: Request<{suiteName: string}>, res: Response) => {
  const { suiteName } = req.params;
  try {
    const tests = await testManager.getTestsInSuite(suiteName);
    res.json(tests);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(404).json({ error: errorMessage });
  }
});

// Get tests by tag
router.get('/tests/tags/:tag', async (req: Request<{tag: string}>, res: Response) => {
  const { tag } = req.params;
  try {
    const tests = await testManager.getTestsByTag(tag);
    res.json(tests);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(404).json({ error: errorMessage });
  }
});

app.use('/api', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});

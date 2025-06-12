import { Given } from '@cucumber/cucumber';

Given('a step that always passes', function () {
  // This step does nothing, so it passes
});

Given('a step that always fails', function () {
  throw new Error('This step is designed to fail');
});

import { runAutomatedTests } from '../src/__tests__/unitTests.ts';

const success = runAutomatedTests();
if (!success) {
  process.exit(1);
} else {
  console.log('All tests passed successfully!');
}

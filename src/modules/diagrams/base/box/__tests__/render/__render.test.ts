import { describe } from 'vitest';
import { execSuite } from '../utils.js';

describe('Render Tests', () => {
  execSuite('horizontal');
  execSuite('vertical');
});

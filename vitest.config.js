import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Helper function to resolve paths relative to project root
const projectPath = (...paths) => resolve(__dirname, ...paths);

export default defineConfig({
  test: {
    typecheck: {
      enabled: true,
      tsconfig: projectPath('tsconfig.test.json')
    },
    alias: {
      '#core': projectPath('src/core/core.ts'),
      '#srcTypes': projectPath('src/types/types.ts')
    },
    coverage: {
      provider: 'v8',
      enabled: true,
      thresholds: {
        100: true,
        perFile: true
      },
      reporter: [],
      exclude: [
        '**/coverage/**',
        '**/dist/**',
        '**/docs/**',
        '**/dev/**',
        '**/node_modules/**',
        '**/__tests__/**',
        '**/[.]**',
        '**/*.d.ts',
        'test?(s)/**',
        'test?(-*).?(c|m)[jt]s?(x)',
        '**/*{.,-}{test,spec,bench,benchmark}?(-d).?(c|m)[jt]s?(x)',
        '**/{vitest,build,eslint,prettier}.config.*',
        '**/.{eslint,mocha,prettier}rc.{?(c|m)js,yml}'
      ]
    }
  }
});

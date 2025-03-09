import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import tsdocPlugin from 'eslint-plugin-tsdoc';
import tseslint from 'typescript-eslint';

const baseRules = {
  'tsdoc/syntax': 'warn',
  '@typescript-eslint/no-unused-vars': 'off',
  '@typescript-eslint/consistent-type-imports': [
    'error',
    { fixStyle: 'inline-type-imports', prefer: 'type-imports' }
  ],
  '@typescript-eslint/consistent-type-exports': [
    'error',
    { fixMixedExportsWithInlineTypeSpecifier: true }
  ],
  '@typescript-eslint/no-import-type-side-effects': 'error',
  '@typescript-eslint/restrict-template-expressions': [
    'error',
    { allowNumber: true, allowBoolean: true, allowNever: true }
  ],
  '@typescript-eslint/no-unnecessary-type-parameters': 'off',
  '@typescript-eslint/no-explicit-any': ['error', { fixToUnknown: true, ignoreRestArgs: true }],
  '@typescript-eslint/consistent-indexed-object-style': ['off'],
  '@typescript-eslint/no-dynamic-delete': 'off',
  '@typescript-eslint/no-redundant-type-constituents': 'off',
  '@typescript-eslint/prefer-reduce-type-parameter': 'off',
  '@typescript-eslint/no-non-null-assertion': 'off'
};
const basePlugins = { '@typescript-eslint': tseslint.plugin, tsdoc: tsdocPlugin };

const baseExtends = [
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  prettierConfig
];

const baseLanguageOptions = { parser: tseslint.parser, sourceType: 'module' };

export default tseslint.config(
  //#region> Src
  {
    name: 'src',
    files: ['src/**/*.ts'],
    ignores: ['dist', '**/*.test.ts'],
    plugins: basePlugins,
    languageOptions: { ...baseLanguageOptions, parserOptions: { project: './tsconfig.json' } },
    extends: baseExtends,
    rules: baseRules
  },
  //#endregion.
  //#region> Tests
  {
    name: 'tests',
    files: ['**/*.test.ts'],
    plugins: basePlugins,
    extends: baseExtends,
    languageOptions: { ...baseLanguageOptions, parserOptions: { project: './tsconfig.test.json' } },
    rules: {
      ...baseRules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-empty-function': 'off'
    }
  }
  //#endregion.
);

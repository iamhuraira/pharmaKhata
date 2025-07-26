import antfu from '@antfu/eslint-config';
import { FlatCompat } from '@eslint/eslintrc';
import nextPlugin from '@next/eslint-plugin-next';
import jestDom from 'eslint-plugin-jest-dom';
import playwright from 'eslint-plugin-playwright';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import testingLibrary from 'eslint-plugin-testing-library';

const compat = new FlatCompat();

export default antfu(
  {
    react: true,
    typescript: true,

    lessOpinionated: true,
    isInEditor: false,

    stylistic: {
      semi: true,
      quotes: 'single',
    },

    formatters: {
      css: true,
    },

    ignores: ['migrations/**/*', 'next-env.d.ts'],
  },
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    files: ['**/*.test.ts?(x)'],
    ...testingLibrary.configs['flat/react'],
    ...jestDom.configs['flat/recommended'],
  },
  {
    files: ['**/*.spec.ts'],
    ...playwright.configs['flat/recommended'],
  },
  {
    rules: {
      'import/order': 'off', // Avoid conflicts with `simple-import-sort` plugin
      'sort-imports': 'off', // Avoid conflicts with `simple-import-sort` plugin
      'style/brace-style': ['error', '1tbs'], // Use the default brace style
      'ts/consistent-type-definitions': ['error', 'type'], // Use `type` instead of `interface`
      'react/prefer-destructuring-assignment': 'off', // Vscode doesn't support automatically destructuring, it's a pain to add a new variable
      'node/prefer-global/process': 'off', // Allow using `process.env`
      'test/index': 'error', // Add padding in test files, remove once https://github.com/vitest-dev/eslint-plugin-vitest/issues/509 is fixed
      'test/prefer-lowercase-title': 'off', // Allow using uppercase titles in test titles
    },
  },
  ...compat.config({
    extends: ['plugin:clsx/recommended'],
    rules: {
      'clsx/prefer-merged-neighboring-elements': ['off'],
      'clsx/forbid-true-inside-object-expressions': ['error', 'always'],
    },
  }),
);

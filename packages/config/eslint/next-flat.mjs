/**
 * Native ESLint flat config for Next.js apps.
 *
 * Usage in eslint.config.mjs:
 *   import { createNextEslintConfig } from '@platform/config/eslint/next-flat.mjs';
 *   export default createNextEslintConfig(import.meta.dirname);
 */
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const nextPlugin = require('@next/eslint-plugin-next');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const importPlugin = require('eslint-plugin-import');
const prettierConfig = require('eslint-config-prettier');

/**
 * @param {string} rootDir  Absolute path to the Next.js app root (pass `import.meta.dirname`)
 * @returns {import('eslint').Linter.Config[]}
 */
export function createNextEslintConfig(rootDir) {
  return [
    // Next.js core-web-vitals rules (includes @next/next plugin)
    {
      ...nextPlugin.flatConfig.coreWebVitals,
      settings: {
        next: { rootDir },
      },
    },

    // TypeScript support
    {
      plugins: {
        '@typescript-eslint': tsPlugin,
      },
      languageOptions: {
        parser: tsParser,
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
          ecmaFeatures: { jsx: true },
        },
      },
      rules: {
        ...tsPlugin.configs['flat/recommended'].reduce(
          (acc, cfg) => ({ ...acc, ...(cfg.rules ?? {}) }),
          {},
        ),
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/consistent-type-imports': 'error',
      },
    },

    // import/order
    {
      plugins: { import: importPlugin },
      rules: {
        'import/order': [
          'error',
          {
            groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
            'newlines-between': 'always',
            alphabetize: { order: 'asc' },
          },
        ],
      },
    },

    // react/display-name off (Next.js pages don't need it)
    {
      rules: {
        'react/display-name': 'off',
      },
    },

    // Prettier (disables formatting rules that conflict)
    prettierConfig,

    // Ignore patterns
    {
      ignores: ['node_modules/**', '.next/**', 'dist/**', 'coverage/**'],
    },
  ];
}

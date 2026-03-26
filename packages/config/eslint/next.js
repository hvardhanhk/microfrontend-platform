/**
 * Shared ESLint config for Next.js apps.
 *
 * Why these specific rules:
 * - consistent-type-imports: forces `import type {}` so bundlers can tree-shake types
 * - import/order: keeps imports deterministic across the team, reduces merge conflicts
 * - jsx-a11y rules come from next/core-web-vitals to enforce WCAG compliance
 */
/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    'next/core-web-vitals',
    'next/typescript',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/consistent-type-imports': 'error',
    'react/display-name': 'off',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc' },
      },
    ],
  },
  ignorePatterns: ['node_modules/', '.next/', 'dist/', 'coverage/'],
};

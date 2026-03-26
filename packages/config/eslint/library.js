/** Shared ESLint config for non-Next.js library packages */
/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/consistent-type-imports': 'error',
  },
  ignorePatterns: ['node_modules/', 'dist/', 'coverage/'],
};

# ESLint & Prettier (Code Quality)

## Overview

**ESLint** enforces code quality rules and **Prettier** handles formatting. Together with **Husky** (pre-commit hooks) and **Commitlint** (commit message format), they ensure consistent code standards across all contributors.

## ESLint Configuration

**File:** `packages/config/eslint/next.js`

```javascript
module.exports = {
  extends: [
    'next/core-web-vitals', // Next.js recommended + a11y rules
    'next/typescript', // TypeScript-specific Next.js rules
    'plugin:@typescript-eslint/recommended',
    'prettier', // Disable rules that conflict with Prettier
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    // Force `import type {}` for tree-shakeable type imports
    '@typescript-eslint/consistent-type-imports': 'error',

    // Allow unused args prefixed with _
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // Warn (not error) on `any` usage
    '@typescript-eslint/no-explicit-any': 'warn',

    // No React display-name requirement (using named exports)
    'react/display-name': 'off',

    // Enforce consistent import ordering
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc' },
      },
    ],
  },
};
```

### Rule Rationale

| Rule                      | Setting | Why                                              |
| ------------------------- | ------- | ------------------------------------------------ |
| `consistent-type-imports` | error   | Bundlers can tree-shake `import type {}` away    |
| `no-unused-vars`          | error   | Dead code detection (ignoring `_`-prefixed args) |
| `no-explicit-any`         | warn    | Encourages proper typing without blocking dev    |
| `import/order`            | error   | Deterministic imports reduce merge conflicts     |
| `next/core-web-vitals`    | extends | Accessibility + performance rules from Next.js   |

## Prettier Configuration

**File:** `.prettierrc`

Prettier handles all formatting: indentation, quotes, semicolons, trailing commas, line width.

**File:** `.prettierignore`

Excludes build artifacts, node_modules, and generated files.

## Pre-commit Hooks (Husky + lint-staged)

**File:** `package.json`

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{js,jsx,json,md,css}": ["prettier --write"]
  }
}
```

### Flow

```
git commit
    │
    ▼
Husky pre-commit hook fires
    │
    ▼
lint-staged runs on staged files only
    │
    ├── .ts/.tsx → eslint --fix → prettier --write
    └── .json/.md/.css → prettier --write
    │
    ▼
commitlint validates commit message
    │
    ▼
Commit succeeds (or fails with errors)
```

## Commit Message Convention

**File:** `commitlint.config.js`

Uses `@commitlint/config-conventional`:

```
<type>(<scope>): <description>

feat(cart): add quantity stepper to product cards
fix(auth): resolve login redirect loop
chore(deps): update tailwindcss to 3.4
docs(readme): add architecture diagram
```

| Type       | Purpose                   |
| ---------- | ------------------------- |
| `feat`     | New feature               |
| `fix`      | Bug fix                   |
| `chore`    | Maintenance / deps        |
| `docs`     | Documentation             |
| `refactor` | Code change (no behavior) |
| `test`     | Test additions            |
| `ci`       | CI/CD changes             |

## Communication with Other Technologies

| Technology     | How Code Quality Tools Interact                              |
| -------------- | ------------------------------------------------------------ |
| TypeScript     | `@typescript-eslint` plugin provides TS-specific rules       |
| Next.js        | `next/core-web-vitals` extends ESLint with a11y + perf rules |
| Husky          | Runs lint-staged on pre-commit hook                          |
| Commitlint     | Validates commit messages match conventional format          |
| GitHub Actions | CI runs `npm run lint` and `npm run format:check`            |
| Turborepo      | `turbo lint` runs ESLint across all packages                 |

## Key Files

| File                             | Purpose                     |
| -------------------------------- | --------------------------- |
| `packages/config/eslint/next.js` | Shared ESLint configuration |
| `.prettierrc`                    | Prettier settings           |
| `.prettierignore`                | Prettier exclusions         |
| `commitlint.config.js`           | Commit message rules        |
| `package.json` (lint-staged)     | Pre-commit hook config      |

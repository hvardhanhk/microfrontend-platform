# Testing Strategy

## Overview

The platform implements a **multi-layer testing strategy**: unit tests with **Jest + SWC**, end-to-end tests with **Playwright**, and visual regression tests with **Storybook + Chromatic**.

## Unit Testing (Jest + SWC)

### Configuration

**File:** `packages/config/jest/base.js`

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'typescript', tsx: true },
          transform: { react: { runtime: 'automatic' } },
        },
      },
    ],
  },
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '^@platform/(.*)$': '<rootDir>/../../packages/$1/src',
  },
  coverageThresholds: {
    global: { branches: 70, functions: 70, lines: 70, statements: 70 },
  },
};
```

### Key Decisions

| Decision                | Rationale                                                  |
| ----------------------- | ---------------------------------------------------------- |
| `@swc/jest` over Babel  | 10-20x faster TypeScript/TSX compilation                   |
| `jsdom` environment     | Simulates browser DOM for component testing                |
| `identity-obj-proxy`    | Mock CSS modules to prevent import errors                  |
| `moduleNameMapper`      | Maps `@platform/*` to source for cross-package testing     |
| 70% coverage thresholds | Enforces minimum test coverage on branches/functions/lines |

### Example Test

```typescript
// packages/ui/src/components/button/__tests__/button.test.tsx
import { render, screen } from "@testing-library/react";
import { Button } from "../button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("shows loading spinner when isLoading", () => {
    render(<Button isLoading>Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  });
});
```

## E2E Testing (Playwright)

### Configuration

**File:** `playwright.config.ts`

```typescript
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  timeout: 30_000,

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],

  webServer: process.env.CI
    ? {
        command: 'npm run dev --filter=@platform/host-shell',
        url: 'http://localhost:3000',
        reuseExistingServer: false,
        timeout: 120_000,
      }
    : undefined,
});
```

### Browser Matrix

| Project       | Device          | Purpose                     |
| ------------- | --------------- | --------------------------- |
| chromium      | Desktop Chrome  | Primary desktop browser     |
| firefox       | Desktop Firefox | Cross-browser compatibility |
| mobile-chrome | Pixel 5         | Mobile responsive testing   |

### E2E Test Suites

**Directory:** `e2e/`

| File               | Tests                                                 |
| ------------------ | ----------------------------------------------------- |
| `auth.spec.ts`     | Login form renders, demo login redirects to dashboard |
| `products.spec.ts` | Product grid renders, filtering, sorting works        |
| `cart.spec.ts`     | Cart UI renders, items display correctly              |
| `home.spec.ts`     | Homepage renders with hero and feature cards          |

### Artifacts

| Setting                         | Value            | Purpose                           |
| ------------------------------- | ---------------- | --------------------------------- |
| `trace: 'on-first-retry'`       | First retry only | Debug flaky tests with full trace |
| `screenshot: 'only-on-failure'` | On failure       | Visual evidence of test failures  |
| `reporter: 'github'`            | CI only          | Inline annotations in PR          |
| `reporter: 'html'`              | Local only       | Interactive HTML report           |

## Visual Regression (Chromatic)

### Flow

```
PR Created
    │
    ▼
CI: Build Storybook static site
    │
    ▼
CI: Push to Chromatic
    │
    ▼
Chromatic: Screenshot every story
    │
    ▼
Chromatic: Diff against baseline
    │
    ▼
PR Status Check: Pass/Fail
```

### CI Integration

```yaml
# .github/workflows/ci.yml
- name: Build Storybook
  run: npx turbo build-storybook --filter=@platform/ui
- name: Chromatic
  run: npx chromatic --project-token=${{ secrets.CHROMATIC_PROJECT_TOKEN }}
```

## Testing Pyramid

```
        /\
       /  \       Visual Regression (Chromatic)
      / 20 \      — all UI component stories
     /stories\
    /──────────\
   /            \   E2E Tests (Playwright)
  /   4 suites   \  — critical user flows
 /   3 browsers   \
/──────────────────\
|                    |  Unit Tests (Jest)
|   Component tests  |  — individual component behavior
|   Utility tests    |  — pure function correctness
|____________________|
```

## Communication with Other Technologies

| Technology     | How Testing Interacts                              |
| -------------- | -------------------------------------------------- |
| Jest + SWC     | Unit tests with fast TypeScript compilation        |
| Playwright     | E2E tests against running Next.js dev server       |
| Storybook      | Component stories serve as visual test cases       |
| Chromatic      | Pixel-level diffs of Storybook stories on every PR |
| GitHub Actions | CI runs all three test layers in sequence          |
| Turborepo      | `turbo test` runs tests across all packages        |

## Key Files

| File                                      | Purpose                   |
| ----------------------------------------- | ------------------------- |
| `packages/config/jest/base.js`            | Shared Jest configuration |
| `playwright.config.ts`                    | Playwright configuration  |
| `e2e/*.spec.ts`                           | E2E test suites           |
| `packages/ui/.storybook/main.ts`          | Storybook config          |
| `packages/ui/src/**/*.stories.tsx`        | Component stories         |
| `packages/ui/src/**/__tests__/*.test.tsx` | Unit tests                |

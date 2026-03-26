import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('login page renders form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('demo login redirects to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('demo@platform.io');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to dashboard after login
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
  });
});

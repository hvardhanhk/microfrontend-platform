import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('displays hero section and navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /welcome to platform/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /browse products/i })).toBeVisible();
  });

  test('navigates to products page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /browse products/i }).click();
    await expect(page).toHaveURL('/products');
    await expect(page.getByRole('heading', { name: /products/i })).toBeVisible();
  });
});

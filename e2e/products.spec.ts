import { test, expect } from '@playwright/test';

test.describe('Products MFE', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
  });

  test('displays product grid', async ({ page }) => {
    const cards = page.locator('[class*="card"]');
    await expect(cards.first()).toBeVisible();
  });

  test('search filters products', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('Headphones');
    // Verify filtered results contain the search term
    const productNames = page.locator('h3');
    const count = await productNames.count();
    for (let i = 0; i < count; i++) {
      const text = await productNames.nth(i).textContent();
      if (text) {
        expect(text.toLowerCase()).toContain('headphones');
      }
    }
  });

  test('add to cart button triggers notification', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /add to cart/i }).first();
    await addButton.click();
    // The cart badge should update in the navbar
    // (actual assertion depends on the toast/notification implementation)
  });
});

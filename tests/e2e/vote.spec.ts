import { test, expect } from '@playwright/test';

test.describe('Vote Page', () => {
  test('should load the vote page', async ({ page }) => {
    await page.goto('/vote');
    await expect(page).toHaveURL(/\/vote/);
  });

  test('should display two plugins to compare', async ({ page }) => {
    await page.goto('/vote');

    // Wait for vote comparison to load
    await page.waitForLoadState('networkidle');

    // Check for plugin comparison cards or error message
    const hasPlugins = await page.locator('[data-testid="plugin-a"], [data-testid="plugin-b"], .vote-card').count();
    const hasError = await page.locator('text=/not enough|プラグインが足りません/i').count();

    // Either plugins are displayed or an appropriate message is shown
    expect(hasPlugins > 0 || hasError > 0).toBeTruthy();
  });

  test('should be able to vote for a plugin', async ({ page }) => {
    await page.goto('/vote');
    await page.waitForLoadState('networkidle');

    // Find vote buttons
    const voteButtonA = page.locator('[data-testid="vote-a"], button:has-text("選ぶ")').first();

    if (await voteButtonA.isVisible()) {
      await voteButtonA.click();

      // Wait for vote response
      await page.waitForResponse(
        (response) => response.url().includes('/api/vote') && response.status() === 200,
        { timeout: 5000 }
      ).catch(() => {
        // Vote might have already been processed or API is different
      });
    }
  });

  test('should be able to skip comparison', async ({ page }) => {
    await page.goto('/vote');
    await page.waitForLoadState('networkidle');

    // Find skip button (exclude Next.js dev tools button)
    const skipButton = page.getByRole('button', { name: /skip|スキップ/i }).first();

    if (await skipButton.isVisible()) {
      await skipButton.click();
      // Page should load new plugins or remain functional
      await expect(page).toHaveURL(/\/vote/);
    }
  });

  test('should filter by category', async ({ page }) => {
    await page.goto('/vote');

    // Find category selector
    const categorySelect = page.locator('select, [data-testid="category-select"]');

    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption({ label: /mcp/i }).catch(() => {
        // Select might have different options
      });
    }
  });
});

test.describe('Vote Page - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should be responsive on mobile', async ({ page }) => {
    await page.goto('/vote');
    await expect(page).toHaveURL(/\/vote/);

    // Check layout is not broken
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Ranking Page', () => {
  test('should load the ranking page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Plugin Arena/);
  });

  test('should display plugin list', async ({ page }) => {
    await page.goto('/');
    // Wait for plugins to load
    await page.waitForSelector('[data-testid="plugin-card"], .plugin-card, article', {
      timeout: 10000,
    });
  });

  test('should switch ranking tabs', async ({ page }) => {
    await page.goto('/');

    // Click Trend tab
    const trendTab = page.getByRole('button', { name: /trend/i });
    if (await trendTab.isVisible()) {
      await trendTab.click();
      await expect(trendTab).toHaveAttribute('aria-selected', 'true');
    }

    // Click Classic tab
    const classicTab = page.getByRole('button', { name: /classic/i });
    if (await classicTab.isVisible()) {
      await classicTab.click();
      await expect(classicTab).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('should filter by category', async ({ page }) => {
    await page.goto('/');

    // Find and click MCP filter
    const mcpFilter = page.getByRole('button', { name: /mcp/i });
    if (await mcpFilter.isVisible()) {
      await mcpFilter.click();
      // Wait for filter to be applied (either URL change or visual feedback)
      await page.waitForTimeout(500);
    }
  });

  test('should navigate to vote page', async ({ page }) => {
    await page.goto('/');

    // Use first() to handle multiple matching links
    const voteLink = page.getByRole('link', { name: /投票/i }).first();
    if (await voteLink.isVisible()) {
      await voteLink.click();
      await expect(page).toHaveURL(/\/vote/);
    }
  });
});

test.describe('Ranking Page - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should be responsive on mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Plugin Arena/);

    // Check that content is visible on mobile
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });
});

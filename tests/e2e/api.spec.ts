import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  test('GET /api/plugins should return plugins list', async ({ request }) => {
    const response = await request.get('/api/plugins');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('plugins');
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('page');
    expect(data).toHaveProperty('perPage');
    expect(Array.isArray(data.plugins)).toBeTruthy();
  });

  test('GET /api/plugins should support pagination', async ({ request }) => {
    const response = await request.get('/api/plugins?page=1&perPage=5');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.page).toBe(1);
    expect(data.perPage).toBe(5);
    expect(data.plugins.length).toBeLessThanOrEqual(5);
  });

  test('GET /api/plugins should support category filter', async ({ request }) => {
    const response = await request.get('/api/plugins?category=mcp');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    // All returned plugins should be MCP category
    for (const plugin of data.plugins) {
      expect(plugin.category).toBe('mcp');
    }
  });

  test('GET /api/plugins should support ranking type', async ({ request }) => {
    const types = ['now', 'trend', 'classic'];

    for (const type of types) {
      const response = await request.get(`/api/plugins?type=${type}`);
      expect(response.ok()).toBeTruthy();
    }
  });

  test('GET /api/vote should return plugin pair or error', async ({ request }) => {
    const response = await request.get('/api/vote');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    // Either returns a pair or an error about not enough plugins
    expect(data.pluginA || data.error).toBeTruthy();
  });

  test('POST /api/vote should require valid data', async ({ request }) => {
    const response = await request.post('/api/vote', {
      data: {
        winnerId: 'invalid-id',
        loserId: 'invalid-id',
      },
    });

    // Should return error for invalid IDs
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('GET /api/cron/collect should require authorization', async ({ request }) => {
    const response = await request.get('/api/cron/collect');
    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  test('GET /api/cron/score should require authorization', async ({ request }) => {
    const response = await request.get('/api/cron/score');
    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });
});

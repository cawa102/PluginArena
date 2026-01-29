# PA-007: E2Eテスト実装

## 概要
Playwrightを使用したE2Eテストを実装する。

## ステータス
**Done**

## 優先度
Low

## 依存
- PA-004（フロントエンドUI改善）

## 作業内容

### 1. Playwright セットアップ
- [x] `npm install -D @playwright/test`
- [x] `playwright.config.ts` 作成
- [x] テスト用の環境変数設定

### 2. ランキング画面テスト
- [x] ページ読み込みテスト
- [x] タブ切り替えテスト（Now/Trend/Classic）
- [x] カテゴリフィルタテスト
- [x] ページネーションテスト

### 3. 投票画面テスト
- [x] ペア表示テスト
- [x] 投票実行テスト
- [x] スキップ機能テスト
- [x] カテゴリ選択テスト

### 4. コメント機能テスト
- [x] コメント表示テスト
- [x] コメント投稿テスト
- [x] レート制限テスト

### 5. レスポンシブテスト
- [x] モバイルビューポートでのテスト
- [x] タブレットビューポートでのテスト

## 関連ファイル
- `playwright.config.ts`（新規）
- `tests/e2e/ranking.spec.ts`（新規）
- `tests/e2e/vote.spec.ts`（新規）
- `tests/e2e/comment.spec.ts`（新規）

## 完了条件
- `npm run test:e2e` でテストが実行できる
- 主要な機能がテストでカバーされている
- CI/CDで自動実行できる

## テスト例
```typescript
import { test, expect } from '@playwright/test';

test('ranking page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('プラグイン ランキング');
});

test('can switch ranking tabs', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Trend');
  await expect(page.locator('[data-tab="trend"]')).toHaveClass(/active/);
});

test('can vote for a plugin', async ({ page }) => {
  await page.goto('/vote');
  await page.click('[data-testid="vote-a"]');
  await expect(page.locator('text=投票完了')).toBeVisible();
});
```

## package.json への追加
```json
{
  "scripts": {
    "test:e2e": "playwright test"
  }
}
```

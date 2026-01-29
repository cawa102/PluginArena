# PA-002: 日次収集バッチ実装

## 概要
GitHub API/awesome-mcp等からプラグインを自動収集するバッチ処理を実装する。

## ステータス
**Done**

## 優先度
High

## 依存
- PA-001（データベースセットアップ）

## 作業内容

### 1. 収集バッチAPIルート作成
- [x] `src/app/api/cron/collect/route.ts` を作成
- [x] GitHub Search APIでの検索ロジック実装
- [x] GitHub Topicsでの検索ロジック実装
- [x] 重複チェック（github_url で判定）

### 2. カテゴリ自動判定
- [x] README/リポジトリ名からカテゴリを推定
- [x] `src/lib/github.ts` の `inferCategory` 関数を活用
- [x] 判定できない場合は `null` でスキップ or フラグ付け

### 3. メタデータ抽出
- [x] キーワード抽出（topics + description解析）
- [x] star数取得
- [x] description取得

### 4. Vercel Cron設定
- [x] `vercel.json` にcron設定を追加
```json
{
  "crons": [
    {
      "path": "/api/cron/collect",
      "schedule": "0 3 * * *"
    }
  ]
}
```

### 5. セキュリティ
- [x] CRONシークレットによる認証
- [x] `CRON_SECRET` 環境変数でエンドポイント保護

## 関連ファイル
- `src/lib/github.ts`（既存）
- `src/app/api/cron/collect/route.ts`（新規）
- `vercel.json`（新規）

## 完了条件
- バッチ実行で新規プラグインがDBに追加される
- 既存プラグインはスキップされる
- カテゴリが自動判定される
- Vercel Cronでスケジュール実行できる

## 参考
```typescript
// 収集クエリ例
const queries = [
  'mcp server claude',
  'topic:mcp-server',
  'claude code skill',
  'topic:claude-code'
];
```

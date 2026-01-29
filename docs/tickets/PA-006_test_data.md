# PA-006: テストデータ投入スクリプト

## 概要
開発・テスト用のサンプルデータを投入するスクリプトを作成する。

## ステータス
**Done**

## 優先度
Medium

## 依存
- PA-001（データベースセットアップ）

## 作業内容

### 1. シードスクリプト作成
- [x] `scripts/seed.ts` を作成
- [x] 実行コマンドを package.json に追加

### 2. サンプルプラグインデータ
以下のような実際に存在するプラグインを登録：
- [x] MCP: `modelcontextprotocol/servers`
- [x] MCP: `anthropics/anthropic-quickstarts`
- [x] その他の人気MCPサーバー
- [x] Claude Code skills/hooks の例

### 3. サンプル投票データ
- [x] ランダムな投票データを生成
- [x] ELOスコアが分散するように調整

### 4. サンプルコメントデータ
- [x] 各プラグインに1-3件のコメント

### 5. GitHub metrics履歴
- [x] 過去60日分のダミー履歴を生成

## 関連ファイル
- `scripts/seed.ts`（新規）
- `package.json`

## 完了条件
- `npm run seed` でテストデータが投入される
- ランキング画面でデータが表示される
- 投票・コメント機能が動作確認できる

## サンプルデータ例
```typescript
const samplePlugins = [
  {
    name: 'mcp-server-filesystem',
    github_url: 'https://github.com/modelcontextprotocol/servers',
    category: 'mcp',
    keywords: ['filesystem', 'file', 'read', 'write'],
    description: 'MCP server for filesystem operations',
    github_stars: 5000,
  },
  {
    name: 'claude-code-review',
    github_url: 'https://github.com/example/claude-code-review',
    category: 'skill',
    keywords: ['code review', 'PR', 'feedback'],
    description: 'Automated code review skill for Claude Code',
    github_stars: 1200,
  },
  // ...
];
```

## package.json への追加
```json
{
  "scripts": {
    "seed": "npx tsx scripts/seed.ts"
  }
}
```

# PA-009: プラグインデータ拡充（公式リポジトリ）

## 概要
Anthropic公式リポジトリ `anthropics/claude-plugins-official` からプラグインデータを収集し、Plugin Arenaのデータベースに追加する。

## ステータス
**Done**

## 優先度
High

## 依存
PA-001（データベースセットアップ）- 完了済み

## 背景

### 公式リポジトリ情報
- **URL**: https://github.com/anthropics/claude-plugins-official
- **Stars**: 3.7k
- **Forks**: 424

### リポジトリ構造
```
claude-plugins-official/
├── plugins/           # 12個の公式内部プラグイン
│   ├── agent-sdk-dev/
│   ├── code-review/
│   ├── commit-commands/
│   ├── explanatory-output-style/
│   ├── feature-dev/
│   ├── frontend-design/
│   ├── hookify/
│   ├── learning-output-style/
│   ├── plugin-dev/
│   ├── pr-review-toolkit/
│   ├── ralph-wiggum/
│   └── security-guidance/
└── external_plugins/  # 17個の外部/MCPプラグイン
    ├── atlassian/
    ├── context7/
    ├── figma/
    ├── firebase/
    ├── github/
    ├── gitlab/
    ├── greptile/
    ├── laravel/
    ├── linear/
    ├── notion/
    ├── playwright/
    ├── sentry/
    ├── serena/
    ├── slack/
    ├── supabase/
    └── vercel/
```

## 作業内容

### 1. src/lib/github.ts 修正
- [x] `fetchOfficialPlugins()` 関数を新規作成
- [x] GitHub Contents API でディレクトリ一覧を取得
- [x] 各プラグインの manifest.json を解析
- [x] カテゴリマッピング実装:
  - `plugins/` → skill（デフォルト）
  - `external_plugins/` → mcp

### 2. src/app/api/cron/collect/route.ts 修正
- [x] `fetchOfficialPlugins()` を既存の収集処理に統合
- [x] 重複チェックは既存ロジック（github_url）を利用

### 3. テスト
- [x] ローカルで `/api/cron/collect` を手動実行
- [x] 管理画面で公式プラグインが追加されていることを確認（39個）
- [x] ビルドエラーがないことを確認

### 4. デプロイ
- [x] Vercel再デプロイ
- [x] 本番環境で動作確認

## 技術詳細

### GitHub Contents API
```typescript
// ディレクトリ一覧取得
GET /repos/anthropics/claude-plugins-official/contents/plugins
GET /repos/anthropics/claude-plugins-official/contents/external_plugins

// manifest.json取得
GET /repos/anthropics/claude-plugins-official/contents/plugins/{name}/manifest.json
```

### manifest.json 構造（想定）
```json
{
  "name": "plugin-name",
  "description": "Plugin description",
  "version": "1.0.0",
  "github": "https://github.com/owner/repo"
}
```

### カテゴリマッピング
| ディレクトリ | カテゴリ | 理由 |
|-------------|---------|------|
| `plugins/` | skill | 公式プラグインは主にskill形式 |
| `external_plugins/` | mcp | 外部プラグインは主にMCPサーバー |

## 関連ファイル
- `src/lib/github.ts` - GitHub API関連関数
- `src/app/api/cron/collect/route.ts` - 収集バッチ
- `src/types/index.ts` - 型定義

## 完了条件
- [ ] 公式リポジトリのプラグインがデータベースに追加されている
- [ ] 収集バッチが正常に動作する
- [ ] 既存プラグインとの重複が発生しない
- [ ] ビルド・デプロイが成功する

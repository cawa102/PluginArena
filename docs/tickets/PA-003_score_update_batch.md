# PA-003: 日次スコア更新バッチ実装

## 概要
GitHub stars の更新と、60日間の増分計算を行うバッチ処理を実装する。

## ステータス
**Done**

## 優先度
High

## 依存
- PA-001（データベースセットアップ）

## 作業内容

### 1. スコア更新バッチAPIルート作成
- [x] `src/app/api/cron/score/route.ts` を作成

### 2. GitHub stars更新
- [x] 全プラグインの現在のstar数を取得
- [x] `plugins.github_stars` を更新
- [x] `github_metrics_history` に記録

### 3. 60日間増分計算
- [x] 60日前の記録を取得
- [x] 増分を計算: `current_stars - stars_60d_ago`
- [x] `plugins.github_stars_60d` を更新

### 4. 古いデータの削除
- [x] 90日以上前の `github_metrics_history` を削除（オプション）

### 5. Vercel Cron設定
- [x] `vercel.json` にcron設定を追加
```json
{
  "crons": [
    {
      "path": "/api/cron/score",
      "schedule": "0 4 * * *"
    }
  ]
}
```

### 6. レート制限対策
- [x] GitHub APIのレート制限を考慮（5000 req/hour with token）
- [x] 必要に応じてバッチを分割（100ms間隔で実行）

## 関連ファイル
- `src/lib/github.ts`
- `src/lib/elo.ts`
- `src/app/api/cron/score/route.ts`（新規）

## 完了条件
- 全プラグインのstar数が更新される
- 60日間の増分が正しく計算される
- github_metrics_historyに履歴が記録される

## 実装例
```typescript
// 60日増分計算
const sixtyDaysAgo = new Date();
sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

const { data: oldMetrics } = await supabase
  .from('github_metrics_history')
  .select('plugin_id, stars')
  .gte('recorded_at', sixtyDaysAgo.toISOString().split('T')[0])
  .order('recorded_at', { ascending: true });
```

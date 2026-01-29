# PA-008: デプロイ設定（Vercel）

## 概要
Vercelへのデプロイ設定を行い、本番環境を構築する。

## ステータス
**Done**

## 優先度
High

## 依存
- PA-001（データベースセットアップ）

## 作業内容

### 1. Vercel プロジェクト作成
- [x] Vercelアカウントでプロジェクト作成
- [ ] GitHubリポジトリと連携（オプション：手動デプロイで運用可能）

### 2. 環境変数設定
- [x] `NEXT_PUBLIC_SUPABASE_URL`
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `GITHUB_TOKEN`（オプション）
- [x] `ADMIN_TOKEN`
- [x] `CRON_SECRET`
- [x] `NEXT_PUBLIC_APP_URL`

### 3. vercel.json 設定
```json
{
  "crons": [
    {
      "path": "/api/cron/collect",
      "schedule": "0 3 * * *"
    },
    {
      "path": "/api/cron/score",
      "schedule": "0 4 * * *"
    }
  ]
}
```
✅ 設定済み

### 4. ビルド設定確認
- [x] ビルドが成功することを確認
- [x] 本番デプロイで動作確認

### 5. ドメイン設定（オプション）
- [ ] カスタムドメイン設定
- [ ] SSL証明書確認

### 6. モニタリング設定
- [ ] Vercel Analyticsの有効化
- [ ] エラー通知設定

## 関連ファイル
- `vercel.json`（新規）
- `.env.local.example`

## 完了条件
- Vercelへのデプロイが成功する
- 本番URLでアプリケーションが動作する
- Cronジョブがスケジュール実行される
- 環境変数が正しく設定されている

## Cronエンドポイントの保護
```typescript
// api/cron/collect/route.ts
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 収集処理...
}
```

## デプロイ後の確認項目
1. [x] ホームページが表示される
2. [x] ランキングが表示される（データがある場合）
3. [ ] 投票が機能する（要手動確認）
4. [ ] コメントが機能する（要手動確認）
5. [ ] 管理画面にログインできる（要手動確認）
6. [ ] Cronが実行される（翌日確認）

## 本番URL
- **サイト**: https://plugin-arena.vercel.app
- **Vercelダッシュボード**: https://vercel.com/cawa102s-projects/plugin-arena

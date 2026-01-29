# PA-001: データベースセットアップ

## 概要
Supabaseプロジェクトを作成し、データベーススキーマを適用する。

## ステータス
**Done**

## 優先度
High

## 依存
なし

## 作業内容

### 1. Supabaseプロジェクト作成
- [x] https://supabase.com でプロジェクト作成
- [x] プロジェクトURL、Anon Key、Service Role Keyを取得
- [x] `.env.local` ファイルを作成して環境変数を設定

### 2. データベーススキーマ適用
- [x] Supabase Dashboard > SQL Editor でマイグレーションを実行
- [x] ファイル: `supabase/migrations/001_initial_schema.sql`

### 3. 環境変数設定
```bash
# .env.local を作成（.env.local.example を参考）
cp .env.local.example .env.local
# 各値を実際の値に置き換え
```

### 4. 接続テスト
- [x] `npm run dev` でローカル起動
- [x] ブラウザで http://localhost:3000 を確認
- [x] コンソールにSupabase接続エラーがないことを確認

## 関連ファイル
- `supabase/migrations/001_initial_schema.sql`
- `.env.local.example`
- `src/lib/supabase.ts`

## 完了条件
- Supabaseプロジェクトが作成されている
- 全テーブル（plugins, votes, comments, github_metrics_history）が作成されている
- ローカル環境からSupabaseに接続できる

# PA-013: 検索機能追加

## ステータス: Done

## 概要

キーワードでプラグインを検索できる機能を追加し、ユーザーの発見体験を向上させる。

## 背景

現状の問題点：
- 特定のプラグインを探すにはスクロールするしかない
- カテゴリフィルタとページネーションのみ
- プラグイン数が増えるにつれて発見が困難に
- 「ファイル操作のMCPサーバー」などの用途ベース検索ができない

## 要件

### 機能要件

1. **キーワード検索**
   - プラグイン名（name）で検索
   - 説明文（description）で検索
   - タグ（tags）で検索（PA-011実装後）

2. **検索UI**
   - ランキングページ上部に検索バーを配置
   - リアルタイム検索（デバウンス付き）またはEnterキーで検索
   - 検索クリアボタン

3. **検索結果**
   - 既存のランキングリストと同じ形式で表示
   - 検索結果件数を表示
   - 該当なしの場合は適切なメッセージ

4. **カテゴリフィルタとの併用**
   - 検索とカテゴリフィルタを組み合わせ可能
   - 例: 「MCP」カテゴリ内で「file」を検索

### UI/UX要件

- 検索バーはカテゴリタブと調和したデザイン
- 検索中のローディング表示
- 国際化対応（日本語/英語）
- キーボードショートカット（`/`または`Cmd+K`で検索フォーカス）

### 非機能要件

- 検索はクライアントサイドで実行（初期実装）
- 将来的にサーバーサイド検索に移行可能な設計
- 日本語検索に対応

## 実装詳細

### 案1: クライアントサイド検索（推奨・初期実装）

全プラグインを一度取得し、フロントエンドでフィルタリング。
プラグイン数が100以下なら十分高速。

**変更ファイル:**
| ファイル | 変更内容 |
|----------|----------|
| `src/components/SearchBar.tsx` | 新規作成 |
| `src/components/RankingList.tsx` | 検索フィルタロジック追加 |
| `src/app/[locale]/page.tsx` | SearchBar配置 |
| `src/i18n/messages/en.json` | 翻訳追加 |
| `src/i18n/messages/ja.json` | 翻訳追加 |

### 案2: サーバーサイド検索（将来実装）

プラグイン数が増えた場合に実装。

**変更ファイル:**
| ファイル | 変更内容 |
|----------|----------|
| `src/app/api/plugins/route.ts` | searchクエリパラメータ対応 |
| `supabase/` | 全文検索インデックス追加 |

### SearchBarコンポーネント設計

```tsx
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  // デバウンス処理
  // キーボードショートカット（/, Cmd+K）
  // クリアボタン
}
```

### 検索ロジック

```typescript
function filterPlugins(plugins: Plugin[], query: string): Plugin[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return plugins;

  return plugins.filter(plugin =>
    plugin.name.toLowerCase().includes(normalizedQuery) ||
    plugin.description?.toLowerCase().includes(normalizedQuery) ||
    plugin.tags?.some(tag => tag.toLowerCase().includes(normalizedQuery))
  );
}
```

### 翻訳キー案

```json
{
  "search": {
    "placeholder": "Search plugins...",
    "noResults": "No plugins found for \"{query}\"",
    "resultsCount": "{count} plugins found",
    "clear": "Clear search"
  }
}
```

### UIデザイン案

```
┌─────────────────────────────────────────────────┐
│  [🔍 Search plugins...                    ✕]    │  ← 検索バー
├─────────────────────────────────────────────────┤
│  [All] [MCP] [Skill] [Hook] [Command]           │  ← 既存カテゴリタブ
├─────────────────────────────────────────────────┤
│  "file" - 12 plugins found                      │  ← 検索結果サマリ
├─────────────────────────────────────────────────┤
│  1. filesystem-mcp                              │
│  2. file-manager-skill                          │
│  ...                                            │
└─────────────────────────────────────────────────┘
```

## テスト項目

- [x] 名前で検索できる
- [x] 説明文で検索できる
- [x] カテゴリフィルタと併用できる
- [x] 検索結果がない場合のメッセージ表示
- [x] 検索クリアが機能する
- [x] キーボードショートカット（`/`）が機能する
- [x] 日本語検索が機能する
- [x] モバイルで表示崩れがない
- [x] デバウンスが適切に動作（300ms）

## 優先度

High - ユーザーの発見体験に直接影響

## 見積もり

実装工数: 中規模

## 依存関係

- PA-011（タグシステム）が実装されればタグ検索も追加

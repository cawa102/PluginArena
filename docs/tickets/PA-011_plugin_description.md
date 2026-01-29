# PA-011: プラグイン説明強化

## ステータス: Done

## 概要

プラグインの「何ができるか」を即座に理解できるようにする機能改善。

## 背景

現状の問題点：
- プラグインカードにはname/descriptionのみ表示
- descriptionは2行（`line-clamp-2`）で切り詰められる
- 初見ユーザーには「このMCPサーバー/Skill/Hook/Commandは何をするのか」が不明確
- 特にMCPサーバーは技術的な名前が多く、用途がわかりにくい

## 要件

### 機能要件

1. **主要機能タグの表示**
   - プラグインに「主要機能」を示すタグを追加
   - 例: `file-management`, `code-analysis`, `web-search`, `database`, `api-integration` など
   - カード上でタグを視覚的に表示

2. **説明文の拡充**
   - GitHubリポジトリのREADME冒頭から自動要約を取得（オプション）
   - または管理者が手動でenhanced_descriptionを設定

3. **詳細プレビュー**
   - カードホバー時またはクリック時に詳細説明をツールチップ/モーダルで表示
   - 全文descriptionを表示

### UI/UX要件

- タグはカテゴリ色と調和したデザイン
- タグは最大3つまで表示（それ以上は「+N」表示）
- モバイルでも読みやすいサイズ

### 非機能要件

- 既存のカードレイアウトを大きく崩さない
- ページロード速度への影響を最小限に

## 実装案

### 案1: タグシステム（推奨）

**データベース変更:**
```sql
ALTER TABLE plugins ADD COLUMN tags TEXT[];
```

**変更ファイル:**
| ファイル | 変更内容 |
|----------|----------|
| `supabase/migrations/` | タグカラム追加 |
| `src/types/index.ts` | Plugin型にtags追加 |
| `src/components/PluginCard.tsx` | タグ表示UI追加 |
| `src/app/admin/page.tsx` | タグ編集UI追加 |

### 案2: 詳細モーダル

**変更ファイル:**
| ファイル | 変更内容 |
|----------|----------|
| `src/components/PluginDetailModal.tsx` | 新規作成 |
| `src/components/PluginCard.tsx` | 詳細ボタン追加 |
| `src/components/RankingList.tsx` | モーダル状態管理 |

## タグ候補

カテゴリ別に推奨タグを定義：

### MCP向け
- `file-system`, `database`, `web-api`, `code-tools`, `search`, `automation`

### Skill向け
- `productivity`, `development`, `analysis`, `generation`, `integration`

### Hook向け
- `validation`, `formatting`, `notification`, `logging`

### Command向け
- `utility`, `workflow`, `deployment`, `testing`

## テスト項目

- [x] タグがカード上に正しく表示される
- [x] 3つ以上のタグがある場合「+N」表示
- [x] 管理画面からタグを編集できる
- [x] モバイルで表示崩れがない
- [x] ダークモードで視認性が保たれる

## 優先度

High - ユーザーの発見体験に直接影響

## 見積もり

実装工数: 中規模

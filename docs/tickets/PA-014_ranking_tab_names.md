# PA-014: ランキングタブ名の改善

## ステータス
Ready

## 概要
「Now, Trend, Classic」という表現を、それぞれが何を意味するか直感的にわかる表現に変更する。

## 背景
現在の「Now, Trend, Classic」という名前だけでは、各ランキングが何を表しているか初見ユーザーにはわかりにくい。

## 変更対象ファイル
- `src/i18n/messages/ja.json` - 日本語翻訳
- `src/i18n/messages/en.json` - 英語翻訳

## 現状
| 内部値 | 日本語タブ名 | 英語タブ名 | 説明文 |
|--------|-------------|-----------|--------|
| now | Now | Now | ELO + Stars で総合評価 |
| trend | Trend | Trend | 60日間の急上昇 |
| classic | Classic | Classic | 累計 Stars 順 |

## 変更案
| 内部値 | 日本語タブ名 | 英語タブ名 | 説明文 |
|--------|-------------|-----------|--------|
| now | 総合 | Best | ELO + Stars で総合評価 |
| trend | 急上昇 | Rising | 60日間の急上昇 |
| classic | 定番 | All-Time | 累計 Stars 順 |

## タスク
- [x] 翻訳ファイル（ja.json, en.json）のタブ名を更新
- [x] ビルド確認
- [ ] 動作確認

## 備考
- 内部値（now, trend, classic）は変更しない（APIやデータ構造への影響を避けるため）
- タブのラベルと説明文のみを変更

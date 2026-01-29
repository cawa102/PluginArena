# PA-010: フォーカス投票モード（チャレンジモード）

## ステータス: Done

## 概要

ランキングページのプラグインカード上の「vote」ボタンをクリックした際、そのプラグインを固定して他のプラグインと連続対戦させる機能。

## 背景

従来の投票画面では、ランダムに2つのプラグインが選ばれていた。ユーザーが特定のプラグインについて評価を行いたい場合、そのプラグインが対戦相手として現れるのを待つ必要があった。

この機能により、ユーザーは任意のプラグインを「チャレンジャー」として固定し、連続して対戦させることができる。これにより、特定のプラグインに対する投票数が増え、ランキングの信頼性が向上する。

## 要件

### 機能要件

1. **フォーカス投票開始**
   - ランキングページのプラグインカードの「vote」ボタンクリックで、そのプラグインを固定した投票画面に遷移
   - URL: `/vote?category=xxx&focusPlugin=<plugin_id>`

2. **対戦相手選択**
   - スマートマッチングアルゴリズムを使用
   - 同程度のELO帯から対戦相手を選択
   - ELO差制限（デフォルト300以内）を適用

3. **連続対戦**
   - 投票後も同じプラグインで新しい対戦相手と対戦
   - 固定プラグインは常に左側に表示

4. **UI表示**
   - 固定プラグインにはロックアイコン + 「Challenge」バッジを表示
   - 「チャレンジモードを終了」ボタンで通常モードに戻れる

### 非機能要件

- 既存の投票フローへの影響を最小限に
- レスポンス時間の維持

## 実装詳細

### 変更ファイル

| ファイル | 変更内容 |
|----------|----------|
| `src/types/index.ts` | VotePair に focusedMode, focusPluginId 追加 |
| `src/lib/matchmaking.ts` | `selectOpponentForPlugin()` 関数追加 |
| `src/app/api/vote/route.ts` | GET に focusPlugin パラメータ対応追加 |
| `src/components/VoteComparison.tsx` | フォーカスモードUI追加 |
| `src/app/[locale]/vote/page.tsx` | focusPlugin パラメータ読み取り |
| `src/app/[locale]/page.tsx` | ナビゲーションに focusPlugin 追加 |
| `src/i18n/messages/en.json` | exitFocusMode 翻訳追加 |
| `src/i18n/messages/ja.json` | exitFocusMode 翻訳追加 |

### API仕様

#### GET /api/vote

**新規パラメータ:**
- `focusPlugin` (optional): 固定するプラグインのID

**レスポンス（フォーカスモード）:**
```json
{
  "pluginA": { ... },  // 固定プラグイン（常に左側）
  "pluginB": { ... },  // 対戦相手
  "matchQuality": { ... },
  "focusedMode": true,
  "focusPluginId": "xxx"
}
```

## テスト項目

- [x] ビルド成功
- [ ] ランキングページからフォーカス投票開始
- [ ] 固定プラグインが左側に表示
- [ ] 投票後に新しい対戦相手が表示
- [ ] 「チャレンジモードを終了」で通常モードに戻る
- [ ] 無効なfocusPluginIdでエラーハンドリング

## 完了日

2024-01-15

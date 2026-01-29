-- Plugin Arena データベーススキーマ
-- 統合マイグレーション（001 + 002 + 003）

-- プラグイン情報テーブル
CREATE TABLE plugins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  github_url TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('mcp', 'skill', 'hook', 'command')),
  keywords TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  github_stars INT DEFAULT 0,
  github_stars_60d INT DEFAULT 0,
  elo_score DECIMAL DEFAULT 1500,
  vote_count INT DEFAULT 0,
  composite_score_now DECIMAL DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 投票履歴テーブル
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  winner_id UUID NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  loser_id UUID NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  voter_fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 同じペアに対する同一ユーザーの投票を防止
  CONSTRAINT unique_vote_per_pair_per_user UNIQUE (winner_id, loser_id, voter_fingerprint)
);

-- コメントテーブル
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id UUID NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 1000),
  commenter_fingerprint TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GitHub指標履歴テーブル（トレンド計算用）
CREATE TABLE github_metrics_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id UUID NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  stars INT NOT NULL,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,

  -- 同じプラグインの同じ日の記録は1つだけ
  CONSTRAINT unique_metrics_per_day UNIQUE (plugin_id, recorded_at)
);

-- インデックス
CREATE INDEX idx_plugins_category ON plugins(category);
CREATE INDEX idx_plugins_elo_score ON plugins(elo_score DESC);
CREATE INDEX idx_plugins_github_stars ON plugins(github_stars DESC);
CREATE INDEX idx_plugins_github_stars_60d ON plugins(github_stars_60d DESC);
CREATE INDEX idx_plugins_composite_score_now ON plugins(composite_score_now DESC);
CREATE INDEX idx_plugins_updated_at ON plugins(updated_at DESC);
CREATE INDEX idx_plugins_is_hidden ON plugins(is_hidden);
CREATE INDEX idx_plugins_tags ON plugins USING GIN (tags);

CREATE INDEX idx_votes_winner_id ON votes(winner_id);
CREATE INDEX idx_votes_loser_id ON votes(loser_id);
CREATE INDEX idx_votes_created_at ON votes(created_at DESC);
CREATE INDEX idx_votes_fingerprint ON votes(voter_fingerprint);

CREATE INDEX idx_comments_plugin_id ON comments(plugin_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX idx_comments_is_hidden ON comments(is_hidden);

CREATE INDEX idx_github_metrics_plugin_id ON github_metrics_history(plugin_id);
CREATE INDEX idx_github_metrics_recorded_at ON github_metrics_history(recorded_at DESC);

-- 更新日時を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_plugins_updated_at
  BEFORE UPDATE ON plugins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) ポリシー
ALTER TABLE plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_metrics_history ENABLE ROW LEVEL SECURITY;

-- 公開読み取りポリシー（非表示以外）
CREATE POLICY "plugins_public_read" ON plugins
  FOR SELECT USING (is_hidden = FALSE);

CREATE POLICY "votes_public_read" ON votes
  FOR SELECT USING (TRUE);

CREATE POLICY "comments_public_read" ON comments
  FOR SELECT USING (is_hidden = FALSE);

CREATE POLICY "github_metrics_public_read" ON github_metrics_history
  FOR SELECT USING (TRUE);

-- 投票の書き込みポリシー（匿名ユーザーも可）
CREATE POLICY "votes_anon_insert" ON votes
  FOR INSERT WITH CHECK (TRUE);

-- コメントの書き込みポリシー（匿名ユーザーも可）
CREATE POLICY "comments_anon_insert" ON comments
  FOR INSERT WITH CHECK (TRUE);

-- サービスロール用ポリシー（全権限）
CREATE POLICY "plugins_service_all" ON plugins
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "votes_service_all" ON votes
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "comments_service_all" ON comments
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "github_metrics_service_all" ON github_metrics_history
  FOR ALL USING (auth.role() = 'service_role');

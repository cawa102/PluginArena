// Plugin Arena 型定義

export type PluginCategory = 'mcp' | 'skill' | 'hook' | 'command';

export interface Plugin {
  id: string;
  name: string;
  github_url: string;
  category: PluginCategory;
  keywords: string[];
  tags: string[];
  description: string | null;
  github_stars: number;
  github_stars_60d: number;
  elo_score: number;
  vote_count: number;
  composite_score_now: number;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: string;
  winner_id: string;
  loser_id: string;
  voter_fingerprint: string;
  created_at: string;
}

export interface Comment {
  id: string;
  plugin_id: string;
  content: string;
  commenter_fingerprint: string;
  is_hidden: boolean;
  created_at: string;
}

export interface GitHubMetricsHistory {
  id: string;
  plugin_id: string;
  stars: number;
  recorded_at: string;
}

// スコアリング関連
export type RankingType = 'now' | 'trend' | 'classic';

export interface RankedPlugin extends Plugin {
  rank: number;
  composite_score: number;
  confidence: 'high' | 'medium' | 'low';
}

// 投票関連
export interface MatchQuality {
  eloDifference: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface VotePair {
  pluginA: Plugin;
  pluginB: Plugin;
  matchQuality?: MatchQuality;
  focusedMode?: boolean;
  focusPluginId?: string;
}

export interface VoteResult {
  winnerId: string;
  loserId: string;
}

// API レスポンス
export interface PluginsResponse {
  plugins: RankedPlugin[];
  total: number;
  page: number;
  perPage: number;
}

export interface VoteResponse {
  success: boolean;
  newEloScores?: {
    winner: number;
    loser: number;
  };
  error?: string;
}

export interface CommentResponse {
  success: boolean;
  comment?: Comment;
  error?: string;
}

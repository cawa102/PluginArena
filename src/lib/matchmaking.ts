/**
 * マッチメイキングアルゴリズム
 * より信頼性の高いランキングを構築するためのスマートペア選択
 */

import type { Plugin } from '@/types';

// マッチング設定
export interface MatchmakingConfig {
  // ティア数（デフォルト: 5）
  tierCount: number;
  // 同ティア/隣接ティア選択率（0-1, デフォルト: 0.8）
  sameTierProbability: number;
  // 上位ティア選択バイアス（1.0 = 均等, 2.0 = 上位2倍優先）
  topTierBias: number;
  // 最大ELO差（これ以上離れたペアは避ける）
  maxEloDifference: number;
  // 低投票数プラグインのブースト閾値
  lowVoteThreshold: number;
  // 低投票数プラグインの選択ブースト倍率
  lowVoteBoost: number;
}

// デフォルト設定
export const DEFAULT_MATCHMAKING_CONFIG: MatchmakingConfig = {
  tierCount: 5,
  sameTierProbability: 0.85,
  topTierBias: 1.5,
  maxEloDifference: 300,
  lowVoteThreshold: 10,
  lowVoteBoost: 2.0,
};

/**
 * 環境変数から設定を読み込み
 */
export function getMatchmakingConfig(): MatchmakingConfig {
  return {
    tierCount: parseInt(process.env.MATCHMAKING_TIER_COUNT || '5', 10),
    sameTierProbability: parseFloat(process.env.MATCHMAKING_SAME_TIER_PROB || '0.85'),
    topTierBias: parseFloat(process.env.MATCHMAKING_TOP_TIER_BIAS || '1.5'),
    maxEloDifference: parseInt(process.env.MATCHMAKING_MAX_ELO_DIFF || '300', 10),
    lowVoteThreshold: parseInt(process.env.MATCHMAKING_LOW_VOTE_THRESHOLD || '10', 10),
    lowVoteBoost: parseFloat(process.env.MATCHMAKING_LOW_VOTE_BOOST || '2.0'),
  };
}

/**
 * プラグインをティアに分類
 */
export function assignTiers(plugins: Plugin[], tierCount: number): Map<number, Plugin[]> {
  if (plugins.length === 0) return new Map();

  // ELOスコアでソート（降順）
  const sorted = [...plugins].sort((a, b) => b.elo_score - a.elo_score);
  const tiers = new Map<number, Plugin[]>();

  // 各ティアのサイズを計算
  const baseSize = Math.floor(plugins.length / tierCount);
  const remainder = plugins.length % tierCount;

  let currentIndex = 0;
  for (let tier = 0; tier < tierCount; tier++) {
    // 上位ティアには余りを分配（より細かく分類）
    const tierSize = baseSize + (tier < remainder ? 1 : 0);
    const tierPlugins = sorted.slice(currentIndex, currentIndex + tierSize);

    if (tierPlugins.length > 0) {
      tiers.set(tier, tierPlugins);
    }
    currentIndex += tierSize;
  }

  return tiers;
}

/**
 * 重み付けランダム選択でティアを選ぶ
 * 上位ティアほど選ばれやすい
 */
export function selectTierWeighted(
  tiers: Map<number, Plugin[]>,
  topTierBias: number
): number {
  const tierNumbers = Array.from(tiers.keys()).sort((a, b) => a - b);
  if (tierNumbers.length === 0) return 0;

  // 重みを計算（ティア0が最上位）
  const weights = tierNumbers.map((tier) => {
    // 上位ティアほど重みが高い
    return Math.pow(topTierBias, tierNumbers.length - tier - 1);
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < tierNumbers.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return tierNumbers[i];
    }
  }

  return tierNumbers[tierNumbers.length - 1];
}

/**
 * 投票数が少ないプラグインにブーストを適用した重み付け選択
 */
function selectPluginWithVoteBoost(
  plugins: Plugin[],
  config: MatchmakingConfig,
  excludeId?: string
): Plugin | null {
  const available = excludeId
    ? plugins.filter(p => p.id !== excludeId)
    : plugins;

  if (available.length === 0) return null;

  // 各プラグインの重みを計算
  const weights = available.map(p => {
    if (p.vote_count < config.lowVoteThreshold) {
      // 投票数が少ないプラグインはブースト
      return config.lowVoteBoost;
    }
    return 1.0;
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < available.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return available[i];
    }
  }

  return available[available.length - 1];
}

/**
 * ELO差制限を満たす候補を抽出
 */
function filterByEloDifference(
  plugins: Plugin[],
  targetElo: number,
  maxDiff: number,
  excludeId: string
): Plugin[] {
  return plugins.filter(p =>
    p.id !== excludeId &&
    Math.abs(p.elo_score - targetElo) <= maxDiff
  );
}

/**
 * スマートマッチングでペアを選択
 */
export function selectMatchingPair(
  plugins: Plugin[],
  config: MatchmakingConfig = DEFAULT_MATCHMAKING_CONFIG
): { pluginA: Plugin; pluginB: Plugin } | null {
  if (plugins.length < 2) return null;

  // 1. ティア分け
  const tiers = assignTiers(plugins, config.tierCount);

  // 2. 第1プラグインのティアを選択（上位優先）
  const selectedTier = selectTierWeighted(tiers, config.topTierBias);
  const tierPlugins = tiers.get(selectedTier) || [];

  if (tierPlugins.length === 0) return null;

  // 3. 第1プラグインを選択（投票数少ないものをブースト）
  const pluginA = selectPluginWithVoteBoost(tierPlugins, config);
  if (!pluginA) return null;

  // 4. 第2プラグインの候補を決定
  let pluginBCandidates: Plugin[];

  if (Math.random() < config.sameTierProbability) {
    // 同ティアまたは隣接ティアから選択
    const adjacentTiers = [selectedTier - 1, selectedTier, selectedTier + 1]
      .filter(t => tiers.has(t));

    pluginBCandidates = adjacentTiers.flatMap(t => tiers.get(t) || []);
  } else {
    // 全体から選択（ただしELO差制限あり）
    pluginBCandidates = plugins;
  }

  // 5. ELO差制限を適用
  pluginBCandidates = filterByEloDifference(
    pluginBCandidates,
    pluginA.elo_score,
    config.maxEloDifference,
    pluginA.id
  );

  // 候補が見つからない場合はフォールバック
  if (pluginBCandidates.length === 0) {
    // ELO差制限を緩和して再試行
    pluginBCandidates = plugins.filter(p => p.id !== pluginA.id);

    if (pluginBCandidates.length === 0) return null;
  }

  // 6. 第2プラグインを選択
  const pluginB = selectPluginWithVoteBoost(pluginBCandidates, config, pluginA.id);
  if (!pluginB) return null;

  // ランダムに順序を入れ替え（表示位置バイアスを防ぐ）
  if (Math.random() < 0.5) {
    return { pluginA, pluginB };
  } else {
    return { pluginA: pluginB, pluginB: pluginA };
  }
}

/**
 * マッチング品質のメトリクスを計算
 */
export function calculateMatchQuality(pluginA: Plugin, pluginB: Plugin): {
  eloDifference: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
} {
  const eloDifference = Math.abs(pluginA.elo_score - pluginB.elo_score);

  let quality: 'excellent' | 'good' | 'fair' | 'poor';
  if (eloDifference <= 50) {
    quality = 'excellent';
  } else if (eloDifference <= 100) {
    quality = 'good';
  } else if (eloDifference <= 200) {
    quality = 'fair';
  } else {
    quality = 'poor';
  }

  return { eloDifference, quality };
}

/**
 * Fisher-Yatesシャッフル（均一なランダム性）
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 固定プラグインに対する対戦相手を選択（フォーカスモード用）
 * スマートマッチングを使用して同程度のELO帯から相手を選ぶ
 */
export function selectOpponentForPlugin(
  focusPlugin: Plugin,
  candidates: Plugin[],
  config: MatchmakingConfig = DEFAULT_MATCHMAKING_CONFIG
): Plugin | null {
  // 固定プラグインを候補から除外
  const availableCandidates = candidates.filter(p => p.id !== focusPlugin.id);

  if (availableCandidates.length === 0) return null;

  // ティア分けして固定プラグインのティアを特定
  const tiers = assignTiers(candidates, config.tierCount);
  let focusTier = 0;

  // 固定プラグインのティアを見つける
  for (const [tier, plugins] of tiers.entries()) {
    if (plugins.some(p => p.id === focusPlugin.id)) {
      focusTier = tier;
      break;
    }
  }

  // 同ティアまたは隣接ティアから候補を抽出
  let opponentCandidates: Plugin[];

  if (Math.random() < config.sameTierProbability) {
    const adjacentTiers = [focusTier - 1, focusTier, focusTier + 1]
      .filter(t => tiers.has(t));

    opponentCandidates = adjacentTiers
      .flatMap(t => tiers.get(t) || [])
      .filter(p => p.id !== focusPlugin.id);
  } else {
    opponentCandidates = availableCandidates;
  }

  // ELO差制限を適用
  opponentCandidates = filterByEloDifference(
    opponentCandidates,
    focusPlugin.elo_score,
    config.maxEloDifference,
    focusPlugin.id
  );

  // 候補が見つからない場合はフォールバック（ELO制限を緩和）
  if (opponentCandidates.length === 0) {
    opponentCandidates = availableCandidates;

    if (opponentCandidates.length === 0) return null;
  }

  // 投票数ブーストを適用して選択
  return selectPluginWithVoteBoost(opponentCandidates, config, focusPlugin.id);
}

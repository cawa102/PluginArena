/**
 * ELO スコアリング
 * ペアワイズ投票結果からELOスコアを計算
 */

// ELO定数
const K_FACTOR = 32; // スコア変動の大きさ
const DEFAULT_ELO = 1500;

/**
 * 期待勝率を計算
 */
export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * 対戦後の新しいELOスコアを計算
 */
export function calculateNewElo(
  winnerElo: number,
  loserElo: number
): { newWinnerElo: number; newLoserElo: number } {
  const expectedWinner = expectedScore(winnerElo, loserElo);
  const expectedLoser = expectedScore(loserElo, winnerElo);

  // 勝者は1点、敗者は0点
  const newWinnerElo = winnerElo + K_FACTOR * (1 - expectedWinner);
  const newLoserElo = loserElo + K_FACTOR * (0 - expectedLoser);

  return {
    newWinnerElo: Math.round(newWinnerElo * 100) / 100,
    newLoserElo: Math.round(newLoserElo * 100) / 100,
  };
}

/**
 * GitHub starsを正規化（対数スケール）
 * 0〜100の範囲に変換
 */
export function normalizeGitHubStars(stars: number, maxStars: number): number {
  if (stars <= 0) return 0;
  if (maxStars <= 0) return 0;

  // 対数スケールで正規化
  const logStars = Math.log10(stars + 1);
  const logMax = Math.log10(maxStars + 1);

  return Math.min(100, (logStars / logMax) * 100);
}

/**
 * 総合スコアを計算
 * ELOスコアとGitHubスコアのハイブリッド
 */
export function calculateCompositeScore(
  eloScore: number,
  githubStars: number,
  maxStars: number,
  voteCount: number,
  eloWeight: number = 0.6,
  githubWeight: number = 0.4
): number {
  // ELOスコアを0-100に正規化（1000-2000を0-100に）
  const normalizedElo = Math.min(100, Math.max(0, (eloScore - 1000) / 10));

  // GitHub starsを正規化
  const normalizedGithub = normalizeGitHubStars(githubStars, maxStars);

  // 投票数が少ない場合はGitHubの重みを増やす
  let adjustedEloWeight = eloWeight;
  let adjustedGithubWeight = githubWeight;

  if (voteCount < 10) {
    // 投票数が10未満の場合、GitHubの重みを増やす
    const confidence = voteCount / 10;
    adjustedEloWeight = eloWeight * confidence;
    adjustedGithubWeight = 1 - adjustedEloWeight;
  }

  return normalizedElo * adjustedEloWeight + normalizedGithub * adjustedGithubWeight;
}

/**
 * 信頼度を計算
 */
export function calculateConfidence(voteCount: number): 'high' | 'medium' | 'low' {
  if (voteCount >= 50) return 'high';
  if (voteCount >= 10) return 'medium';
  return 'low';
}

/**
 * 直近60日のトレンドスコアを計算
 */
export function calculateTrendScore(
  stars60d: number,
  maxStars60d: number,
  eloScore: number,
  voteCount: number
): number {
  // 60日間のstars増分を正規化
  const normalizedGrowth = normalizeGitHubStars(stars60d, maxStars60d);

  // ELOスコアも加味（直近の投票で高評価なら上昇）
  const normalizedElo = Math.min(100, Math.max(0, (eloScore - 1000) / 10));

  // 投票数が少ない場合はGitHub成長を重視
  if (voteCount < 10) {
    return normalizedGrowth * 0.8 + normalizedElo * 0.2;
  }

  return normalizedGrowth * 0.5 + normalizedElo * 0.5;
}

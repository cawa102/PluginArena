import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateCompositeScore, calculateConfidence, calculateTrendScore } from '@/lib/elo';
import type { Plugin, RankedPlugin, RankingType, PluginCategory } from '@/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rankingType = (searchParams.get('ranking') || 'now') as RankingType;
  const category = searchParams.get('category') as PluginCategory | null;
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('perPage') || '20');

  try {
    // 基本クエリ
    let query = supabase
      .from('plugins')
      .select('*', { count: 'exact' })
      .eq('is_hidden', false);

    // カテゴリフィルタ
    if (category) {
      query = query.eq('category', category);
    }

    // ソート順（ランキングタイプに応じて）
    switch (rankingType) {
      case 'trend':
        query = query.order('github_stars_60d', { ascending: false });
        break;
      case 'classic':
        query = query.order('github_stars', { ascending: false });
        break;
      case 'now':
      default:
        // 複合スコア順でソート（ELO 60% + Stars 40%）
        query = query.order('composite_score_now', { ascending: false });
        break;
    }

    // ページネーション
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch plugins' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        plugins: [],
        total: 0,
        page,
        perPage,
      });
    }

    // 最大stars数を取得（正規化用）
    const maxStars = Math.max(...data.map((p: Plugin) => p.github_stars));
    const maxStars60d = Math.max(...data.map((p: Plugin) => p.github_stars_60d));

    // ランク付きプラグインを作成
    const rankedPlugins: RankedPlugin[] = data.map((plugin: Plugin, index: number) => {
      let compositeScore: number;

      switch (rankingType) {
        case 'trend':
          compositeScore = calculateTrendScore(
            plugin.github_stars_60d,
            maxStars60d,
            plugin.elo_score,
            plugin.vote_count
          );
          break;
        case 'classic':
          compositeScore = calculateCompositeScore(
            plugin.elo_score,
            plugin.github_stars,
            maxStars,
            plugin.vote_count,
            0.3, // classic: ELO重み30%
            0.7  // classic: GitHub重み70%
          );
          break;
        case 'now':
        default:
          compositeScore = calculateCompositeScore(
            plugin.elo_score,
            plugin.github_stars,
            maxStars,
            plugin.vote_count
          );
          break;
      }

      return {
        ...plugin,
        rank: from + index + 1,
        composite_score: Math.round(compositeScore * 100) / 100,
        confidence: calculateConfidence(plugin.vote_count),
      };
    });

    return NextResponse.json({
      plugins: rankedPlugins,
      total: count || 0,
      page,
      perPage,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

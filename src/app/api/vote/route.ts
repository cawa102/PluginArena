import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { calculateNewElo } from '@/lib/elo';
import { getVoterHash } from '@/lib/fingerprint';
import { selectMatchingPair, selectOpponentForPlugin, calculateMatchQuality, getMatchmakingConfig } from '@/lib/matchmaking';
import type { PluginCategory, Plugin } from '@/types';

// 投票用のペアを取得
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') as PluginCategory | null;
  const focusPluginId = searchParams.get('focusPlugin');

  try {
    const supabase = createServerSupabaseClient();
    const config = getMatchmakingConfig();

    // フォーカスモード: 特定のプラグインを固定して対戦相手を選択
    if (focusPluginId) {
      // 固定プラグインを取得
      const { data: focusPlugin, error: focusError } = await supabase
        .from('plugins')
        .select('*')
        .eq('id', focusPluginId)
        .eq('is_hidden', false)
        .single();

      if (focusError || !focusPlugin) {
        return NextResponse.json({ error: 'Focused plugin not found' }, { status: 400 });
      }

      // 同カテゴリの候補を取得
      const { data: candidates, error: candidatesError } = await supabase
        .from('plugins')
        .select('*')
        .eq('is_hidden', false)
        .eq('category', focusPlugin.category)
        .neq('id', focusPluginId);

      if (candidatesError) {
        console.error('Supabase error:', candidatesError);
        return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
      }

      if (!candidates || candidates.length === 0) {
        return NextResponse.json({ error: 'No opponents available' }, { status: 400 });
      }

      // 対戦相手を選択
      const opponent = selectOpponentForPlugin(focusPlugin as Plugin, candidates as Plugin[], config);

      if (!opponent) {
        return NextResponse.json({ error: 'Failed to find opponent' }, { status: 500 });
      }

      const matchQuality = calculateMatchQuality(focusPlugin as Plugin, opponent);

      return NextResponse.json({
        pluginA: focusPlugin, // 固定プラグインは常にA（左側）
        pluginB: opponent,
        matchQuality,
        focusedMode: true,
        focusPluginId: focusPluginId,
      });
    }

    // 通常モード: ランダムにペアを選択
    let query = supabase
      .from('plugins')
      .select('*')
      .eq('is_hidden', false);

    if (category) {
      query = query.eq('category', category);
    }

    const { data: plugins, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch plugins' }, { status: 500 });
    }

    if (!plugins || plugins.length < 2) {
      return NextResponse.json({ error: 'Not enough plugins to vote' }, { status: 400 });
    }

    // スマートマッチングでペアを選択
    const matchResult = selectMatchingPair(plugins as Plugin[], config);

    if (!matchResult) {
      return NextResponse.json({ error: 'Failed to find matching pair' }, { status: 500 });
    }

    const { pluginA, pluginB } = matchResult;
    const matchQuality = calculateMatchQuality(pluginA, pluginB);

    return NextResponse.json({
      pluginA,
      pluginB,
      matchQuality,
      focusedMode: false,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 投票を記録
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { winnerId, loserId } = body;

    if (!winnerId || !loserId) {
      return NextResponse.json({ error: 'Missing winnerId or loserId' }, { status: 400 });
    }

    if (winnerId === loserId) {
      return NextResponse.json({ error: 'Cannot vote for the same plugin' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const voterHash = await getVoterHash();

    // 既存の投票をチェック（同じペアに対して）
    const { data: existingVotes } = await supabase
      .from('votes')
      .select('*')
      .or(`and(winner_id.eq.${winnerId},loser_id.eq.${loserId}),and(winner_id.eq.${loserId},loser_id.eq.${winnerId})`)
      .eq('voter_fingerprint', voterHash)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (existingVotes && existingVotes.length > 0) {
      return NextResponse.json(
        { error: 'このペアには24時間以内に投票済みです' },
        { status: 429 }
      );
    }

    // 現在のELOスコアを取得
    const { data: plugins, error: fetchError } = await supabase
      .from('plugins')
      .select('id, elo_score, vote_count')
      .in('id', [winnerId, loserId]);

    if (fetchError || !plugins || plugins.length !== 2) {
      return NextResponse.json({ error: 'Failed to fetch plugins' }, { status: 500 });
    }

    const winner = plugins.find((p) => p.id === winnerId);
    const loser = plugins.find((p) => p.id === loserId);

    if (!winner || !loser) {
      return NextResponse.json({ error: 'Invalid plugin IDs' }, { status: 400 });
    }

    // 新しいELOスコアを計算
    const { newWinnerElo, newLoserElo } = calculateNewElo(winner.elo_score, loser.elo_score);

    // トランザクション的に更新（Supabaseでは厳密なトランザクションは難しいので順次実行）

    // 1. 投票を記録
    const { error: voteError } = await supabase.from('votes').insert({
      winner_id: winnerId,
      loser_id: loserId,
      voter_fingerprint: voterHash,
    });

    if (voteError) {
      console.error('Vote insert error:', voteError);
      return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
    }

    // 2. 勝者のELOスコアと投票数を更新
    const { error: winnerUpdateError } = await supabase
      .from('plugins')
      .update({
        elo_score: newWinnerElo,
        vote_count: winner.vote_count + 1,
      })
      .eq('id', winnerId);

    if (winnerUpdateError) {
      console.error('Winner update error:', winnerUpdateError);
    }

    // 3. 敗者のELOスコアと投票数を更新
    const { error: loserUpdateError } = await supabase
      .from('plugins')
      .update({
        elo_score: newLoserElo,
        vote_count: loser.vote_count + 1,
      })
      .eq('id', loserId);

    if (loserUpdateError) {
      console.error('Loser update error:', loserUpdateError);
    }

    return NextResponse.json({
      success: true,
      newEloScores: {
        winner: newWinnerElo,
        loser: newLoserElo,
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

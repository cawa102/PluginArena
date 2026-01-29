import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { parseGitHubUrl, getRepoStars } from '@/lib/github';
import { calculateCompositeScore } from '@/lib/elo';

interface ScoreUpdateResult {
  total_plugins: number;
  stars_updated: number;
  history_recorded: number;
  sixty_day_calculated: number;
  composite_score_updated: number;
  old_records_deleted: number;
  errors: string[];
}

/**
 * CRON認証チェック
 */
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (process.env.NODE_ENV === 'development' && !cronSecret) {
    return true;
  }

  if (!cronSecret) {
    console.error('CRON_SECRET is not configured');
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

/**
 * レート制限を考慮した遅延
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 日次スコア更新バッチ
 * - 全プラグインのGitHub stars を更新
 * - 履歴を記録
 * - 60日間の増分を計算
 */
export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();
  const result: ScoreUpdateResult = {
    total_plugins: 0,
    stars_updated: 0,
    history_recorded: 0,
    sixty_day_calculated: 0,
    composite_score_updated: 0,
    old_records_deleted: 0,
    errors: [],
  };

  try {
    // 全プラグインを取得
    const { data: plugins, error: fetchError } = await supabase
      .from('plugins')
      .select('id, github_url, github_stars')
      .eq('is_hidden', false);

    if (fetchError) {
      throw new Error(`Failed to fetch plugins: ${fetchError.message}`);
    }

    if (!plugins || plugins.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No plugins to update',
        result,
      });
    }

    result.total_plugins = plugins.length;
    console.log(`Updating stars for ${plugins.length} plugins...`);

    const today = new Date().toISOString().split('T')[0];

    // 各プラグインのstar数を更新
    for (const plugin of plugins) {
      const parsed = parseGitHubUrl(plugin.github_url);
      if (!parsed) {
        result.errors.push(`Invalid GitHub URL: ${plugin.github_url}`);
        continue;
      }

      // GitHub APIでstar数を取得
      const currentStars = await getRepoStars(parsed.owner, parsed.repo);

      // star数が0の場合はスキップ（APIエラーの可能性）
      if (currentStars === 0 && plugin.github_stars > 0) {
        console.log(`Skipping ${parsed.repo}: API returned 0 stars`);
        continue;
      }

      // プラグインのstar数を更新
      const { error: updateError } = await supabase
        .from('plugins')
        .update({ github_stars: currentStars })
        .eq('id', plugin.id);

      if (updateError) {
        result.errors.push(`Failed to update ${parsed.repo}: ${updateError.message}`);
        continue;
      }

      result.stars_updated++;

      // 履歴に記録（upsert - 同日の記録は更新）
      const { error: historyError } = await supabase
        .from('github_metrics_history')
        .upsert(
          {
            plugin_id: plugin.id,
            stars: currentStars,
            recorded_at: today,
          },
          {
            onConflict: 'plugin_id,recorded_at',
          }
        );

      if (historyError) {
        result.errors.push(`Failed to record history for ${parsed.repo}: ${historyError.message}`);
      } else {
        result.history_recorded++;
      }

      // レート制限対策（100ms間隔）
      await delay(100);
    }

    // 60日間の増分を計算
    console.log('Calculating 60-day star growth...');
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const sixtyDaysAgoStr = sixtyDaysAgo.toISOString().split('T')[0];

    // 60日前に最も近い記録を取得
    const { data: oldMetrics, error: metricsError } = await supabase
      .from('github_metrics_history')
      .select('plugin_id, stars, recorded_at')
      .lte('recorded_at', sixtyDaysAgoStr)
      .order('recorded_at', { ascending: false });

    if (metricsError) {
      result.errors.push(`Failed to fetch old metrics: ${metricsError.message}`);
    } else if (oldMetrics && oldMetrics.length > 0) {
      // プラグインごとに最も新しい（60日前に近い）記録を使用
      const oldStarsMap = new Map<string, number>();
      for (const metric of oldMetrics) {
        if (!oldStarsMap.has(metric.plugin_id)) {
          oldStarsMap.set(metric.plugin_id, metric.stars);
        }
      }

      // 60日間増分を更新
      for (const plugin of plugins) {
        const oldStars = oldStarsMap.get(plugin.id);
        if (oldStars !== undefined) {
          // 現在のstar数を再取得
          const { data: currentPlugin } = await supabase
            .from('plugins')
            .select('github_stars')
            .eq('id', plugin.id)
            .single();

          if (currentPlugin) {
            const growth = currentPlugin.github_stars - oldStars;
            const { error: growthError } = await supabase
              .from('plugins')
              .update({ github_stars_60d: Math.max(0, growth) })
              .eq('id', plugin.id);

            if (!growthError) {
              result.sixty_day_calculated++;
            }
          }
        }
      }
    }

    // 90日以上前の古いデータを削除
    console.log('Cleaning up old metrics...');
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split('T')[0];

    const { count: deletedCount, error: deleteError } = await supabase
      .from('github_metrics_history')
      .delete({ count: 'exact' })
      .lt('recorded_at', ninetyDaysAgoStr);

    if (deleteError) {
      result.errors.push(`Failed to delete old records: ${deleteError.message}`);
    } else {
      result.old_records_deleted = deletedCount || 0;
    }

    // 複合スコアを再計算（Nowランキング用）
    console.log('Calculating composite scores...');
    const { data: allPlugins, error: allPluginsError } = await supabase
      .from('plugins')
      .select('id, elo_score, github_stars, vote_count')
      .eq('is_hidden', false);

    if (allPluginsError) {
      result.errors.push(`Failed to fetch plugins for composite score: ${allPluginsError.message}`);
    } else if (allPlugins && allPlugins.length > 0) {
      // 最大スター数を取得
      const maxStars = Math.max(...allPlugins.map((p) => p.github_stars), 1);

      // 各プラグインの複合スコアを計算・更新
      for (const plugin of allPlugins) {
        const compositeScore = calculateCompositeScore(
          plugin.elo_score,
          plugin.github_stars,
          maxStars,
          plugin.vote_count
        );

        const { error: compositeError } = await supabase
          .from('plugins')
          .update({ composite_score_now: compositeScore })
          .eq('id', plugin.id);

        if (compositeError) {
          result.errors.push(`Failed to update composite score for ${plugin.id}: ${compositeError.message}`);
        } else {
          result.composite_score_updated++;
        }
      }
    }

    console.log('Score update completed:', result);

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Score update batch failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        result,
      },
      { status: 500 }
    );
  }
}

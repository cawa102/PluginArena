import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// 管理者認証チェック
function checkAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    console.warn('ADMIN_TOKEN is not set');
    return false;
  }

  return authHeader === `Bearer ${adminToken}`;
}

// 統計情報取得
export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServerSupabaseClient();
    const today = new Date().toISOString().split('T')[0];

    // 並列でデータ取得
    const [
      pluginsResult,
      votesResult,
      todayVotesResult,
      commentsResult,
      recentCommentsResult,
      categoryResult,
    ] = await Promise.all([
      // 総プラグイン数
      supabase.from('plugins').select('*', { count: 'exact', head: true }),
      // 総投票数
      supabase.from('votes').select('*', { count: 'exact', head: true }),
      // 今日の投票数
      supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today),
      // 総コメント数
      supabase.from('comments').select('*', { count: 'exact', head: true }),
      // 最近のコメント（7日以内）
      supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      // カテゴリ別プラグイン数
      supabase.from('plugins').select('category'),
    ]);

    // カテゴリ別集計
    const categoryCount: Record<string, number> = {};
    if (categoryResult.data) {
      categoryResult.data.forEach((plugin) => {
        const cat = plugin.category;
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
    }

    const stats = {
      totalPlugins: pluginsResult.count || 0,
      totalVotes: votesResult.count || 0,
      todayVotes: todayVotesResult.count || 0,
      totalComments: commentsResult.count || 0,
      recentComments: recentCommentsResult.count || 0,
      categoryCount,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Admin stats API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

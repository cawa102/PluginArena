import { NextRequest, NextResponse } from 'next/server';
import { supabase, createServerSupabaseClient } from '@/lib/supabase';
import { getVoterHash } from '@/lib/fingerprint';

// コメントを取得
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pluginId = searchParams.get('pluginId');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');

  if (!pluginId) {
    return NextResponse.json({ error: 'Missing pluginId' }, { status: 400 });
  }

  try {
    const { data, error, count } = await supabase
      .from('comments')
      .select('*', { count: 'exact' })
      .eq('plugin_id', pluginId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    return NextResponse.json({
      comments: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// コメントを投稿
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pluginId, content } = body;

    if (!pluginId || !content) {
      return NextResponse.json({ error: 'Missing pluginId or content' }, { status: 400 });
    }

    // コンテンツの検証
    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      return NextResponse.json({ error: 'コメントが空です' }, { status: 400 });
    }

    if (trimmedContent.length > 1000) {
      return NextResponse.json({ error: 'コメントは1000文字以内で入力してください' }, { status: 400 });
    }

    const supabaseServer = createServerSupabaseClient();
    const commenterHash = await getVoterHash();

    // レート制限：同じユーザーは1分間に1コメントまで
    const { data: recentComments } = await supabaseServer
      .from('comments')
      .select('id')
      .eq('commenter_fingerprint', commenterHash)
      .gte('created_at', new Date(Date.now() - 60 * 1000).toISOString());

    if (recentComments && recentComments.length > 0) {
      return NextResponse.json(
        { error: '連続投稿は1分間に1回までです' },
        { status: 429 }
      );
    }

    // プラグインの存在確認
    const { data: plugin } = await supabaseServer
      .from('plugins')
      .select('id')
      .eq('id', pluginId)
      .single();

    if (!plugin) {
      return NextResponse.json({ error: 'Plugin not found' }, { status: 404 });
    }

    // コメントを挿入
    const { data: comment, error } = await supabaseServer
      .from('comments')
      .insert({
        plugin_id: pluginId,
        content: trimmedContent,
        commenter_fingerprint: commenterHash,
      })
      .select()
      .single();

    if (error) {
      console.error('Comment insert error:', error);
      return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

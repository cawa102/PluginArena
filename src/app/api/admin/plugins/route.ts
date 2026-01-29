import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// 管理者認証チェック（簡易版：環境変数でトークン照合）
function checkAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    console.warn('ADMIN_TOKEN is not set');
    return false;
  }

  return authHeader === `Bearer ${adminToken}`;
}

// プラグイン一覧（非表示含む）
export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('plugins')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plugins: data });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// プラグイン追加
export async function POST(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, github_url, category, keywords, tags, description } = body;

    if (!name || !github_url || !category) {
      return NextResponse.json(
        { error: 'name, github_url, category are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('plugins')
      .insert({
        name,
        github_url,
        category,
        keywords: keywords || [],
        tags: tags || [],
        description: description || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plugin: data });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// プラグイン更新
export async function PATCH(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ids, ...updates } = body;

    const supabase = createServerSupabaseClient();

    // 一括更新
    if (ids && Array.isArray(ids)) {
      const { data, error } = await supabase
        .from('plugins')
        .update(updates)
        .in('id', ids)
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ plugins: data });
    }

    // 単一更新
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('plugins')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plugin: data });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// プラグイン削除
export async function DELETE(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  try {
    const supabase = createServerSupabaseClient();

    // 関連するvotesとcommentsも削除
    await supabase.from('votes').delete().or(`winner_id.eq.${id},loser_id.eq.${id}`);
    await supabase.from('comments').delete().eq('plugin_id', id);

    const { error } = await supabase.from('plugins').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

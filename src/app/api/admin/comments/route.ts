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

// コメント一覧（非表示含む）
export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const pluginId = searchParams.get('pluginId');

  try {
    const supabase = createServerSupabaseClient();
    let query = supabase
      .from('comments')
      .select('*, plugins(name)')
      .order('created_at', { ascending: false });

    if (pluginId) {
      query = query.eq('plugin_id', pluginId);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ comments: data });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// コメント非表示/表示切り替え
export async function PATCH(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, is_hidden } = body;

    if (!id || typeof is_hidden !== 'boolean') {
      return NextResponse.json(
        { error: 'id and is_hidden are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('comments')
      .update({ is_hidden })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ comment: data });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// コメント削除
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
    const { error } = await supabase.from('comments').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

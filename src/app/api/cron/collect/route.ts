import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import {
  searchMCPServers,
  searchClaudeCodePlugins,
  isClaudeCodeRelated,
  inferCategory,
  extractKeywords,
  fetchOfficialPlugins,
} from '@/lib/github';

interface CollectionResult {
  total_found: number;
  new_plugins: number;
  new_official_plugins: number;
  skipped_existing: number;
  skipped_no_category: number;
  skipped_not_related: number;
  errors: string[];
}

/**
 * CRON認証チェック
 */
function verifyCronSecret(request: NextRequest): boolean {
  // Vercel Cronからのリクエストはauthorizationヘッダーを使用
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // 開発環境では認証をスキップ可能
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
 * 日次収集バッチ
 * GitHub APIからClaude Code関連のプラグインを収集してDBに登録
 */
export async function GET(request: NextRequest) {
  // 認証チェック
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();
  const result: CollectionResult = {
    total_found: 0,
    new_plugins: 0,
    new_official_plugins: 0,
    skipped_existing: 0,
    skipped_no_category: 0,
    skipped_not_related: 0,
    errors: [],
  };

  try {
    // 既存のプラグインURL一覧を取得
    const { data: existingPlugins, error: fetchError } = await supabase
      .from('plugins')
      .select('github_url');

    if (fetchError) {
      throw new Error(`Failed to fetch existing plugins: ${fetchError.message}`);
    }

    const existingUrls = new Set(existingPlugins?.map((p) => p.github_url) || []);

    // GitHub APIから検索
    console.log('Searching MCP servers...');
    const mcpRepos = await searchMCPServers();

    console.log('Searching Claude Code plugins...');
    const claudeRepos = await searchClaudeCodePlugins();

    // 全リポジトリを統合（重複除去）
    const allRepos = [...mcpRepos, ...claudeRepos];
    const uniqueRepos = allRepos.reduce((acc, repo) => {
      if (!acc.find((r) => r.full_name === repo.full_name)) {
        acc.push(repo);
      }
      return acc;
    }, [] as typeof allRepos);

    result.total_found = uniqueRepos.length;
    console.log(`Found ${uniqueRepos.length} unique repositories`);

    // 各リポジトリを処理
    for (const repo of uniqueRepos) {
      const githubUrl = repo.html_url;

      // 既存チェック
      if (existingUrls.has(githubUrl)) {
        result.skipped_existing++;
        continue;
      }

      // Claude Code関連かチェック
      if (!isClaudeCodeRelated(repo)) {
        result.skipped_not_related++;
        continue;
      }

      // カテゴリ推定
      const category = inferCategory(repo);
      if (!category) {
        result.skipped_no_category++;
        continue;
      }

      // キーワード抽出
      const keywords = extractKeywords(repo);

      // DBに登録
      const { error: insertError } = await supabase.from('plugins').insert({
        name: repo.name,
        github_url: githubUrl,
        category,
        keywords,
        description: repo.description,
        github_stars: repo.stargazers_count,
        github_stars_60d: 0, // 初回は0
        elo_score: 1500, // 初期値
        vote_count: 0,
      });

      if (insertError) {
        result.errors.push(`Failed to insert ${repo.name}: ${insertError.message}`);
        continue;
      }

      result.new_plugins++;
      console.log(`Added: ${repo.name} (${category})`);
    }

    // Anthropic公式プラグインを取得
    console.log('Fetching official plugins from anthropics/claude-plugins-official...');
    const officialPlugins = await fetchOfficialPlugins();
    console.log(`Found ${officialPlugins.length} official plugins`);

    for (const plugin of officialPlugins) {
      // 既存チェック
      if (existingUrls.has(plugin.github_url)) {
        result.skipped_existing++;
        continue;
      }

      // DBに登録
      const { error: insertError } = await supabase.from('plugins').insert({
        name: plugin.name,
        github_url: plugin.github_url,
        category: plugin.category,
        keywords: plugin.keywords.slice(0, 5),
        description: plugin.description,
        github_stars: plugin.stars,
        github_stars_60d: 0,
        elo_score: 1500,
        vote_count: 0,
      });

      if (insertError) {
        result.errors.push(`Failed to insert official plugin ${plugin.name}: ${insertError.message}`);
        continue;
      }

      result.new_official_plugins++;
      existingUrls.add(plugin.github_url); // 重複防止
      console.log(`Added official: ${plugin.name} (${plugin.category})`);
    }

    console.log('Collection completed:', result);

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Collection batch failed:', error);
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

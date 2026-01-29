/**
 * Plugin Arena - テストデータ投入スクリプト
 *
 * 使用方法: npm run seed
 *
 * 機能:
 * - サンプルプラグインデータの投入
 * - ランダムな投票データの生成（ELOスコア分散）
 * - サンプルコメントの投入
 * - 過去60日分のGitHub metrics履歴生成
 */

import { createClient } from '@supabase/supabase-js';

// 環境変数チェック
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: 環境変数が設定されていません');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('.env.local ファイルを確認してください');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ========== サンプルデータ定義 ==========

interface SamplePlugin {
  name: string;
  github_url: string;
  category: 'mcp' | 'skill' | 'hook' | 'command';
  keywords: string[];
  description: string;
  github_stars: number;
}

const samplePlugins: SamplePlugin[] = [
  // MCP Servers
  {
    name: 'filesystem',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
    category: 'mcp',
    keywords: ['filesystem', 'file', 'read', 'write', 'directory'],
    description: 'MCP server providing file system operations including reading, writing, and directory management',
    github_stars: 12500,
  },
  {
    name: 'postgres',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres',
    category: 'mcp',
    keywords: ['postgres', 'database', 'sql', 'query'],
    description: 'PostgreSQL database integration for Claude with read-only query support',
    github_stars: 12500,
  },
  {
    name: 'github',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
    category: 'mcp',
    keywords: ['github', 'git', 'repository', 'issues', 'pull-requests'],
    description: 'GitHub API integration enabling repository management, issue tracking, and code operations',
    github_stars: 12500,
  },
  {
    name: 'slack',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/slack',
    category: 'mcp',
    keywords: ['slack', 'chat', 'messaging', 'workspace'],
    description: 'Slack workspace integration for reading channels, messages, and user information',
    github_stars: 12500,
  },
  {
    name: 'brave-search',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search',
    category: 'mcp',
    keywords: ['search', 'web', 'brave', 'internet'],
    description: 'Web search capabilities using Brave Search API',
    github_stars: 12500,
  },
  {
    name: 'puppeteer',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer',
    category: 'mcp',
    keywords: ['puppeteer', 'browser', 'web', 'automation', 'scraping'],
    description: 'Browser automation and web scraping using Puppeteer',
    github_stars: 12500,
  },
  {
    name: 'memory',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/memory',
    category: 'mcp',
    keywords: ['memory', 'persistence', 'knowledge', 'graph'],
    description: 'Knowledge graph-based memory system for persistent context across sessions',
    github_stars: 12500,
  },
  {
    name: 'sqlite',
    github_url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite',
    category: 'mcp',
    keywords: ['sqlite', 'database', 'sql', 'local'],
    description: 'SQLite database integration for local data management',
    github_stars: 12500,
  },
  {
    name: 'mcp-server-fetch',
    github_url: 'https://github.com/zcaceres/fetch',
    category: 'mcp',
    keywords: ['fetch', 'http', 'api', 'web'],
    description: 'HTTP request capabilities for fetching web content and APIs',
    github_stars: 850,
  },
  {
    name: 'mcp-notion',
    github_url: 'https://github.com/suekou/mcp-notion-server',
    category: 'mcp',
    keywords: ['notion', 'notes', 'workspace', 'productivity'],
    description: 'Notion integration for reading and managing pages and databases',
    github_stars: 620,
  },
  {
    name: 'mcp-linear',
    github_url: 'https://github.com/jerhadf/linear-mcp-server',
    category: 'mcp',
    keywords: ['linear', 'issues', 'project-management', 'tasks'],
    description: 'Linear issue tracker integration for project management',
    github_stars: 480,
  },
  {
    name: 'mcp-obsidian',
    github_url: 'https://github.com/MarkusPfworst/obsidian-mcp',
    category: 'mcp',
    keywords: ['obsidian', 'notes', 'markdown', 'knowledge-base'],
    description: 'Obsidian vault integration for note-taking and knowledge management',
    github_stars: 720,
  },

  // Skills
  {
    name: 'commit',
    github_url: 'https://github.com/anthropics/claude-code/tree/main/skills/commit',
    category: 'skill',
    keywords: ['git', 'commit', 'version-control'],
    description: 'Built-in skill for creating well-formatted git commits with conventional commit messages',
    github_stars: 8500,
  },
  {
    name: 'pr',
    github_url: 'https://github.com/anthropics/claude-code/tree/main/skills/pr',
    category: 'skill',
    keywords: ['github', 'pull-request', 'code-review'],
    description: 'Create and manage GitHub pull requests with detailed descriptions',
    github_stars: 8500,
  },
  {
    name: 'code-review',
    github_url: 'https://github.com/anthropics/claude-code/tree/main/skills/code-review',
    category: 'skill',
    keywords: ['code-review', 'feedback', 'quality'],
    description: 'Automated code review with actionable feedback and suggestions',
    github_stars: 8500,
  },
  {
    name: 'test-generator',
    github_url: 'https://github.com/example/claude-test-generator',
    category: 'skill',
    keywords: ['testing', 'unit-test', 'automation'],
    description: 'Generate comprehensive unit tests for your codebase',
    github_stars: 1200,
  },
  {
    name: 'docs-generator',
    github_url: 'https://github.com/example/claude-docs-generator',
    category: 'skill',
    keywords: ['documentation', 'readme', 'api-docs'],
    description: 'Automatically generate documentation from code comments and structure',
    github_stars: 980,
  },
  {
    name: 'refactor-assistant',
    github_url: 'https://github.com/example/claude-refactor',
    category: 'skill',
    keywords: ['refactoring', 'clean-code', 'optimization'],
    description: 'Suggest and apply code refactoring improvements',
    github_stars: 750,
  },

  // Hooks
  {
    name: 'pre-commit-lint',
    github_url: 'https://github.com/example/claude-pre-commit-lint',
    category: 'hook',
    keywords: ['lint', 'pre-commit', 'code-quality'],
    description: 'Run linting checks before each commit to ensure code quality',
    github_stars: 420,
  },
  {
    name: 'auto-format',
    github_url: 'https://github.com/example/claude-auto-format',
    category: 'hook',
    keywords: ['formatting', 'prettier', 'auto-fix'],
    description: 'Automatically format code on save using project configuration',
    github_stars: 380,
  },
  {
    name: 'security-scan',
    github_url: 'https://github.com/example/claude-security-hook',
    category: 'hook',
    keywords: ['security', 'vulnerability', 'scan'],
    description: 'Scan for security vulnerabilities before committing sensitive code',
    github_stars: 560,
  },
  {
    name: 'type-check',
    github_url: 'https://github.com/example/claude-type-check',
    category: 'hook',
    keywords: ['typescript', 'type-check', 'validation'],
    description: 'Run TypeScript type checking on modified files',
    github_stars: 290,
  },

  // Commands
  {
    name: '/help',
    github_url: 'https://github.com/anthropics/claude-code/tree/main/commands/help',
    category: 'command',
    keywords: ['help', 'documentation', 'usage'],
    description: 'Display help information and available commands',
    github_stars: 8500,
  },
  {
    name: '/clear',
    github_url: 'https://github.com/anthropics/claude-code/tree/main/commands/clear',
    category: 'command',
    keywords: ['clear', 'reset', 'context'],
    description: 'Clear conversation context and start fresh',
    github_stars: 8500,
  },
  {
    name: '/compact',
    github_url: 'https://github.com/anthropics/claude-code/tree/main/commands/compact',
    category: 'command',
    keywords: ['compact', 'summarize', 'context'],
    description: 'Compact conversation history to reduce context usage',
    github_stars: 8500,
  },
  {
    name: '/init',
    github_url: 'https://github.com/anthropics/claude-code/tree/main/commands/init',
    category: 'command',
    keywords: ['init', 'setup', 'project'],
    description: 'Initialize Claude Code configuration in a project',
    github_stars: 8500,
  },
  {
    name: '/doctor',
    github_url: 'https://github.com/example/claude-doctor',
    category: 'command',
    keywords: ['debug', 'diagnose', 'troubleshoot'],
    description: 'Diagnose and troubleshoot Claude Code configuration issues',
    github_stars: 340,
  },
  {
    name: '/stats',
    github_url: 'https://github.com/example/claude-stats',
    category: 'command',
    keywords: ['statistics', 'usage', 'analytics'],
    description: 'Display usage statistics and session information',
    github_stars: 280,
  },
];

const sampleComments = [
  'This is a must-have for any Claude Code user!',
  'Works great, saved me hours of work.',
  'Easy to set up and very useful.',
  'Could use better documentation, but overall solid.',
  'Exactly what I was looking for.',
  'Game changer for my workflow.',
  'Some rough edges but the core functionality is excellent.',
  'Highly recommended for developers.',
  'A bit slow on large projects but still useful.',
  'Perfect for my use case.',
  'Great integration with existing tools.',
  'Would love to see more features added.',
  'Simple and effective.',
  'Best in its category.',
  'Works as advertised.',
];

// ========== ユーティリティ関数 ==========

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateFingerprint(): string {
  return `seed_${Math.random().toString(36).substring(2, 15)}`;
}

// ELO計算
function calculateElo(
  winnerElo: number,
  loserElo: number,
  k: number = 32
): { newWinnerElo: number; newLoserElo: number } {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

  const newWinnerElo = winnerElo + k * (1 - expectedWinner);
  const newLoserElo = loserElo + k * (0 - expectedLoser);

  return { newWinnerElo, newLoserElo };
}

// ========== シード関数 ==========

async function clearExistingData() {
  console.log('Clearing existing data...');

  // 順序に注意（外部キー制約）
  await supabase.from('github_metrics_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('plugins').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('Existing data cleared.');
}

async function seedPlugins(): Promise<string[]> {
  console.log('Seeding plugins...');

  const pluginsToInsert = samplePlugins.map((p) => ({
    name: p.name,
    github_url: p.github_url,
    category: p.category,
    keywords: p.keywords,
    description: p.description,
    github_stars: p.github_stars,
    github_stars_60d: Math.floor(p.github_stars * (Math.random() * 0.1)), // 0-10%の増加
    elo_score: 1500, // 初期値
    vote_count: 0,
    is_hidden: false,
  }));

  const { data, error } = await supabase.from('plugins').insert(pluginsToInsert).select('id');

  if (error) {
    console.error('Error seeding plugins:', error);
    throw error;
  }

  const pluginIds = data.map((p) => p.id);
  console.log(`Seeded ${pluginIds.length} plugins.`);
  return pluginIds;
}

async function seedVotes(pluginIds: string[]) {
  console.log('Seeding votes...');

  // ELOスコアを管理するマップ
  const eloScores: Map<string, number> = new Map();
  pluginIds.forEach((id) => eloScores.set(id, 1500));

  const votesToInsert: Array<{
    winner_id: string;
    loser_id: string;
    voter_fingerprint: string;
  }> = [];

  // 200〜300件のランダム投票を生成
  const numVotes = randomInt(200, 300);
  const usedPairs = new Set<string>();

  for (let i = 0; i < numVotes; i++) {
    // ランダムに2つのプラグインを選択
    const idx1 = randomInt(0, pluginIds.length - 1);
    let idx2 = randomInt(0, pluginIds.length - 1);
    while (idx2 === idx1) {
      idx2 = randomInt(0, pluginIds.length - 1);
    }

    const plugin1 = pluginIds[idx1];
    const plugin2 = pluginIds[idx2];
    const fingerprint = generateFingerprint();

    // 同じペア・同じfingerprintの重複を避ける
    const pairKey = `${plugin1}-${plugin2}-${fingerprint}`;
    if (usedPairs.has(pairKey)) continue;
    usedPairs.add(pairKey);

    // 70%の確率でELOが高い方が勝つ（リアリスティックな分布）
    const elo1 = eloScores.get(plugin1)!;
    const elo2 = eloScores.get(plugin2)!;
    const expectedWin1 = 1 / (1 + Math.pow(10, (elo2 - elo1) / 400));
    const winner = Math.random() < expectedWin1 ? plugin1 : plugin2;
    const loser = winner === plugin1 ? plugin2 : plugin1;

    // ELOを更新
    const { newWinnerElo, newLoserElo } = calculateElo(
      eloScores.get(winner)!,
      eloScores.get(loser)!
    );
    eloScores.set(winner, newWinnerElo);
    eloScores.set(loser, newLoserElo);

    votesToInsert.push({
      winner_id: winner,
      loser_id: loser,
      voter_fingerprint: fingerprint,
    });
  }

  // バッチでインサート
  if (votesToInsert.length > 0) {
    const { error } = await supabase.from('votes').insert(votesToInsert);
    if (error) {
      console.error('Error seeding votes:', error);
      throw error;
    }
  }

  // プラグインのELOスコアと投票数を更新
  for (const pluginId of Array.from(eloScores.keys())) {
    const elo = eloScores.get(pluginId)!;
    const voteCount = votesToInsert.filter(
      (v) => v.winner_id === pluginId || v.loser_id === pluginId
    ).length;

    await supabase
      .from('plugins')
      .update({ elo_score: elo, vote_count: voteCount })
      .eq('id', pluginId);
  }

  console.log(`Seeded ${votesToInsert.length} votes.`);
}

async function seedComments(pluginIds: string[]) {
  console.log('Seeding comments...');

  const commentsToInsert: Array<{
    plugin_id: string;
    content: string;
    commenter_fingerprint: string;
  }> = [];

  for (const pluginId of pluginIds) {
    // 各プラグインに0〜3件のコメント
    const numComments = randomInt(0, 3);
    for (let i = 0; i < numComments; i++) {
      commentsToInsert.push({
        plugin_id: pluginId,
        content: randomChoice(sampleComments),
        commenter_fingerprint: generateFingerprint(),
      });
    }
  }

  if (commentsToInsert.length > 0) {
    const { error } = await supabase.from('comments').insert(commentsToInsert);
    if (error) {
      console.error('Error seeding comments:', error);
      throw error;
    }
  }

  console.log(`Seeded ${commentsToInsert.length} comments.`);
}

async function seedGitHubMetricsHistory(pluginIds: string[]) {
  console.log('Seeding GitHub metrics history (60 days)...');

  // 各プラグインの現在のスター数を取得
  const { data: plugins } = await supabase
    .from('plugins')
    .select('id, github_stars')
    .in('id', pluginIds);

  if (!plugins) return;

  const metricsToInsert: Array<{
    plugin_id: string;
    stars: number;
    recorded_at: string;
  }> = [];

  const today = new Date();

  for (const plugin of plugins) {
    const currentStars = plugin.github_stars;

    // 過去60日分のデータを生成（徐々に増加するパターン）
    for (let daysAgo = 60; daysAgo >= 0; daysAgo--) {
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      const dateStr = date.toISOString().split('T')[0];

      // 60日前は現在の85-95%、徐々に増加
      const progress = (60 - daysAgo) / 60;
      const minRatio = 0.85 + progress * 0.15;
      const maxRatio = 0.90 + progress * 0.10;
      const ratio = minRatio + Math.random() * (maxRatio - minRatio);
      const stars = Math.floor(currentStars * ratio);

      metricsToInsert.push({
        plugin_id: plugin.id,
        stars,
        recorded_at: dateStr,
      });
    }
  }

  // バッチでインサート（Supabaseの制限を考慮して分割）
  const batchSize = 500;
  for (let i = 0; i < metricsToInsert.length; i += batchSize) {
    const batch = metricsToInsert.slice(i, i + batchSize);
    const { error } = await supabase.from('github_metrics_history').insert(batch);
    if (error) {
      console.error('Error seeding GitHub metrics:', error);
      throw error;
    }
  }

  console.log(`Seeded ${metricsToInsert.length} GitHub metrics records.`);
}

// ========== メイン実行 ==========

async function main() {
  console.log('='.repeat(50));
  console.log('Plugin Arena - Test Data Seeding');
  console.log('='.repeat(50));
  console.log('');

  try {
    // 既存データをクリア
    await clearExistingData();

    // プラグインをシード
    const pluginIds = await seedPlugins();

    // 投票をシード
    await seedVotes(pluginIds);

    // コメントをシード
    await seedComments(pluginIds);

    // GitHub metrics履歴をシード
    await seedGitHubMetricsHistory(pluginIds);

    console.log('');
    console.log('='.repeat(50));
    console.log('Seeding completed successfully!');
    console.log('='.repeat(50));
    console.log('');
    console.log('You can now start the development server:');
    console.log('  npm run dev');
    console.log('');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

main();

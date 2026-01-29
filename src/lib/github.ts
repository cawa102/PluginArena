/**
 * GitHub API連携
 */

interface GitHubRepo {
  full_name: string;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepo[];
}

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * GitHub APIリクエストのヘッダーを生成
 */
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

/**
 * リポジトリのstar数を取得
 */
export async function getRepoStars(owner: string, repo: string): Promise<number> {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status}`);
      return 0;
    }

    const data: GitHubRepo = await response.json();
    return data.stargazers_count;
  } catch (error) {
    console.error('Failed to fetch repo stars:', error);
    return 0;
  }
}

/**
 * GitHub URLからオーナーとリポジトリ名を抽出
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ''),
  };
}

/**
 * MCPサーバーを検索
 */
export async function searchMCPServers(): Promise<GitHubRepo[]> {
  const queries = [
    'mcp server claude',
    'model context protocol',
    'topic:mcp-server',
  ];

  const allRepos: GitHubRepo[] = [];

  for (const query of queries) {
    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=100`,
        { headers: getHeaders() }
      );

      if (response.ok) {
        const data: GitHubSearchResponse = await response.json();
        allRepos.push(...data.items);
      }
    } catch (error) {
      console.error(`Search failed for query "${query}":`, error);
    }
  }

  // 重複を除去
  const uniqueRepos = allRepos.reduce((acc, repo) => {
    if (!acc.find((r) => r.full_name === repo.full_name)) {
      acc.push(repo);
    }
    return acc;
  }, [] as GitHubRepo[]);

  return uniqueRepos;
}

/**
 * Claude Code関連のスキル/フック/コマンドを検索
 */
export async function searchClaudeCodePlugins(): Promise<GitHubRepo[]> {
  const queries = [
    'claude code skill',
    'claude code hook',
    'claude code command',
    'claude-code plugin',
    'topic:claude-code',
  ];

  const allRepos: GitHubRepo[] = [];

  for (const query of queries) {
    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=100`,
        { headers: getHeaders() }
      );

      if (response.ok) {
        const data: GitHubSearchResponse = await response.json();
        allRepos.push(...data.items);
      }
    } catch (error) {
      console.error(`Search failed for query "${query}":`, error);
    }
  }

  // 重複を除去
  const uniqueRepos = allRepos.reduce((acc, repo) => {
    if (!acc.find((r) => r.full_name === repo.full_name)) {
      acc.push(repo);
    }
    return acc;
  }, [] as GitHubRepo[]);

  return uniqueRepos;
}

/**
 * リポジトリがClaude Code関連かどうかを判定
 */
export function isClaudeCodeRelated(repo: GitHubRepo): boolean {
  const claudeKeywords = [
    'claude',
    'anthropic',
    'mcp',
    'model context protocol',
  ];

  const text = `${repo.name} ${repo.description || ''} ${repo.topics.join(' ')}`.toLowerCase();

  return claudeKeywords.some((keyword) => text.includes(keyword));
}

/**
 * リポジトリのカテゴリを推定
 */
export function inferCategory(repo: GitHubRepo): 'mcp' | 'skill' | 'hook' | 'command' | null {
  const text = `${repo.name} ${repo.description || ''} ${repo.topics.join(' ')}`.toLowerCase();

  if (text.includes('mcp') || text.includes('model context protocol')) {
    return 'mcp';
  }

  if (text.includes('skill')) {
    return 'skill';
  }

  if (text.includes('hook')) {
    return 'hook';
  }

  if (text.includes('command') || text.includes('slash')) {
    return 'command';
  }

  return null;
}

/**
 * リポジトリからキーワードを抽出
 */
export function extractKeywords(repo: GitHubRepo): string[] {
  const keywords: string[] = [];

  // トピックからキーワードを抽出
  keywords.push(...repo.topics.filter((t) => !['claude', 'mcp', 'anthropic'].includes(t)));

  // 説明文からキーワードを抽出（簡易版）
  if (repo.description) {
    const commonKeywords = [
      'code review',
      'testing',
      'documentation',
      'refactoring',
      'debugging',
      'automation',
      'context',
      'file',
      'git',
      'database',
      'api',
      'web',
      'search',
    ];

    const descLower = repo.description.toLowerCase();
    commonKeywords.forEach((kw) => {
      if (descLower.includes(kw) && !keywords.includes(kw)) {
        keywords.push(kw);
      }
    });
  }

  return keywords.slice(0, 5); // 最大5つ
}

/**
 * GitHub Releaseを取得
 */
export async function getLatestRelease(
  owner: string,
  repo: string
): Promise<{ tag_name: string; published_at: string } | null> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/releases/latest`,
      { headers: getHeaders() }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      tag_name: data.tag_name,
      published_at: data.published_at,
    };
  } catch {
    return null;
  }
}

/**
 * Anthropic公式リポジトリからプラグイン情報を取得
 */
export interface OfficialPlugin {
  name: string;
  description: string | null;
  github_url: string;
  category: 'mcp' | 'skill' | 'hook' | 'command';
  keywords: string[];
  stars: number;
}

interface GitHubContentsItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url: string | null;
}

interface PluginManifest {
  name?: string;
  description?: string;
  version?: string;
  github?: string;
  keywords?: string[];
  mcp_servers?: Record<string, unknown>;
}

/**
 * 公式リポジトリのディレクトリ一覧を取得
 */
async function fetchDirectoryContents(path: string): Promise<GitHubContentsItem[]> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/anthropics/claude-plugins-official/contents/${path}`,
      { headers: getHeaders() }
    );

    if (!response.ok) {
      console.error(`Failed to fetch ${path}: ${response.status}`);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return [];
  }
}

/**
 * プラグインのmanifest.jsonを取得
 */
async function fetchManifest(pluginPath: string): Promise<PluginManifest | null> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/anthropics/claude-plugins-official/contents/${pluginPath}/manifest.json`,
      { headers: getHeaders() }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Base64エンコードされたコンテンツをデコード
    if (data.content) {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return JSON.parse(content);
    }

    return null;
  } catch (error) {
    console.error(`Error fetching manifest for ${pluginPath}:`, error);
    return null;
  }
}

/**
 * Anthropic公式プラグインを取得
 */
export async function fetchOfficialPlugins(): Promise<OfficialPlugin[]> {
  const plugins: OfficialPlugin[] = [];

  // 公式内部プラグイン（plugins/）
  const internalPlugins = await fetchDirectoryContents('plugins');
  for (const item of internalPlugins) {
    if (item.type !== 'dir') continue;

    const manifest = await fetchManifest(`plugins/${item.name}`);

    // manifest.jsonのmcp_serversからカテゴリを判定
    let category: 'mcp' | 'skill' | 'hook' | 'command' = 'skill';
    if (manifest?.mcp_servers && Object.keys(manifest.mcp_servers).length > 0) {
      category = 'mcp';
    }

    plugins.push({
      name: manifest?.name || item.name,
      description: manifest?.description || null,
      github_url: manifest?.github || `https://github.com/anthropics/claude-plugins-official/tree/main/plugins/${item.name}`,
      category,
      keywords: manifest?.keywords || [],
      stars: 0, // 公式リポジトリ内のプラグインはスター数なし
    });

    // Rate limit対策
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // 外部プラグイン（external_plugins/）
  const externalPlugins = await fetchDirectoryContents('external_plugins');
  for (const item of externalPlugins) {
    if (item.type !== 'dir') continue;

    const manifest = await fetchManifest(`external_plugins/${item.name}`);

    plugins.push({
      name: manifest?.name || item.name,
      description: manifest?.description || null,
      github_url: manifest?.github || `https://github.com/anthropics/claude-plugins-official/tree/main/external_plugins/${item.name}`,
      category: 'mcp', // 外部プラグインは基本的にMCP
      keywords: manifest?.keywords || [],
      stars: 0,
    });

    // Rate limit対策
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return plugins;
}

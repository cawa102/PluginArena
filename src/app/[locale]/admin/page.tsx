'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type { Plugin, Comment } from '@/types';

interface AdminComment extends Comment {
  plugins: { name: string };
}

interface Stats {
  totalPlugins: number;
  totalVotes: number;
  todayVotes: number;
  totalComments: number;
  recentComments: number;
  categoryCount: Record<string, number>;
}

type TabType = 'dashboard' | 'plugins' | 'comments';

export default function AdminPage() {
  const t = useTranslations('admin');
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedPlugins, setSelectedPlugins] = useState<Set<string>>(new Set());
  const [editingPlugin, setEditingPlugin] = useState<Plugin | null>(null);
  const [commentSearch, setCommentSearch] = useState('');
  const [commentPluginFilter, setCommentPluginFilter] = useState('');

  const [newPlugin, setNewPlugin] = useState({
    name: '',
    github_url: '',
    category: 'mcp' as Plugin['category'],
    keywords: '',
    tags: '',
    description: '',
  });

  const headers = useCallback(
    () => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/stats', { headers: headers() });
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data.stats);
    } catch {
      console.error('Failed to fetch stats');
    }
  }, [headers]);

  const fetchPlugins = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/plugins', { headers: headers() });
      if (!response.ok) throw new Error('Unauthorized');
      const data = await response.json();
      setPlugins(data.plugins);
      setIsAuthenticated(true);
      setSelectedPlugins(new Set());
    } catch {
      setError(t('authError'));
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [headers, t]);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/comments', { headers: headers() });
      if (!response.ok) throw new Error('Unauthorized');
      const data = await response.json();
      setComments(data.comments);
    } catch {
      setError(t('comments.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [headers, t]);

  const handleLogin = async () => {
    setError(null);
    await fetchPlugins();
  };

  const handleLogout = () => {
    setToken('');
    setIsAuthenticated(false);
    setPlugins([]);
    setComments([]);
    setStats(null);
    setActiveTab('dashboard');
  };

  const handleAddPlugin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('/api/admin/plugins', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          ...newPlugin,
          keywords: newPlugin.keywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
          tags: newPlugin.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setNewPlugin({ name: '', github_url: '', category: 'mcp', keywords: '', tags: '', description: '' });
      fetchPlugins();
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('plugins.addError'));
    }
  };

  const togglePluginHidden = async (plugin: Plugin) => {
    try {
      const response = await fetch('/api/admin/plugins', {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ id: plugin.id, is_hidden: !plugin.is_hidden }),
      });
      if (!response.ok) throw new Error('Failed to update plugin');
      fetchPlugins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const deletePlugin = async (pluginId: string) => {
    if (!confirm(t('plugins.confirmDelete'))) return;

    try {
      const response = await fetch(`/api/admin/plugins?id=${pluginId}`, {
        method: 'DELETE',
        headers: headers(),
      });
      if (!response.ok) throw new Error('Failed to delete plugin');
      fetchPlugins();
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('plugins.deleteError'));
    }
  };

  const handleSavePlugin = async () => {
    if (!editingPlugin) return;

    try {
      const response = await fetch('/api/admin/plugins', {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({
          id: editingPlugin.id,
          name: editingPlugin.name,
          description: editingPlugin.description,
          category: editingPlugin.category,
          keywords: editingPlugin.keywords,
          tags: editingPlugin.tags,
        }),
      });
      if (!response.ok) throw new Error('Failed to update plugin');
      setEditingPlugin(null);
      fetchPlugins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const bulkToggleHidden = async (hide: boolean) => {
    if (selectedPlugins.size === 0) return;

    try {
      const response = await fetch('/api/admin/plugins', {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ ids: Array.from(selectedPlugins), is_hidden: hide }),
      });
      if (!response.ok) throw new Error('Failed to update plugins');
      fetchPlugins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk update failed');
    }
  };

  const togglePluginSelection = (pluginId: string) => {
    const newSelection = new Set(selectedPlugins);
    if (newSelection.has(pluginId)) {
      newSelection.delete(pluginId);
    } else {
      newSelection.add(pluginId);
    }
    setSelectedPlugins(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedPlugins.size === plugins.length) {
      setSelectedPlugins(new Set());
    } else {
      setSelectedPlugins(new Set(plugins.map((p) => p.id)));
    }
  };

  const toggleCommentHidden = async (comment: AdminComment) => {
    try {
      const response = await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ id: comment.id, is_hidden: !comment.is_hidden }),
      });
      if (!response.ok) throw new Error('Failed to update comment');
      fetchComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm(t('comments.confirmDelete'))) return;

    try {
      const response = await fetch(`/api/admin/comments?id=${commentId}`, {
        method: 'DELETE',
        headers: headers(),
      });
      if (!response.ok) throw new Error('Failed to delete comment');
      fetchComments();
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('comments.deleteError'));
    }
  };

  const triggerCollection = async () => {
    if (!confirm(t('dashboard.confirmCollect'))) return;

    try {
      const response = await fetch('/api/cron/collect', { method: 'GET', headers: headers() });
      if (!response.ok) throw new Error('Collection failed');
      alert(t('dashboard.collectSuccess'));
      fetchPlugins();
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('dashboard.collectError'));
    }
  };

  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
      !commentSearch ||
      comment.content.toLowerCase().includes(commentSearch.toLowerCase()) ||
      comment.plugins?.name.toLowerCase().includes(commentSearch.toLowerCase());
    const matchesPlugin = !commentPluginFilter || comment.plugin_id === commentPluginFilter;
    return matchesSearch && matchesPlugin;
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      if (activeTab === 'comments') fetchComments();
    }
  }, [isAuthenticated, activeTab, fetchStats, fetchComments]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12">
        <h1 className="text-2xl font-bold mb-6 text-center">{t('loginTitle')}</h1>
        <div className="space-y-4">
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={t('tokenPlaceholder')}
            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)]"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={handleLogin} className="w-full btn-primary">
            {t('login')}
          </button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <button
          onClick={handleLogout}
          className="text-sm px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--card-hover)]"
        >
          {t('logout')}
        </button>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)]">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 border-b-2 ${
            activeTab === 'dashboard'
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent'
          }`}
        >
          {t('tabs.dashboard')}
        </button>
        <button
          onClick={() => setActiveTab('plugins')}
          className={`px-4 py-2 border-b-2 ${
            activeTab === 'plugins'
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent'
          }`}
        >
          {t('tabs.plugins')}
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 border-b-2 ${
            activeTab === 'comments'
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent'
          }`}
        >
          {t('tabs.comments')}
        </button>
      </div>

      {/* Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-4">
              <p className="text-[var(--muted)] text-sm">{t('dashboard.totalPlugins')}</p>
              <p className="text-2xl font-bold">{stats?.totalPlugins ?? '-'}</p>
            </div>
            <div className="card p-4">
              <p className="text-[var(--muted)] text-sm">{t('dashboard.totalVotes')}</p>
              <p className="text-2xl font-bold">{stats?.totalVotes ?? '-'}</p>
            </div>
            <div className="card p-4">
              <p className="text-[var(--muted)] text-sm">{t('dashboard.todayVotes')}</p>
              <p className="text-2xl font-bold">{stats?.todayVotes ?? '-'}</p>
            </div>
            <div className="card p-4">
              <p className="text-[var(--muted)] text-sm">{t('dashboard.totalComments')}</p>
              <p className="text-2xl font-bold">{stats?.totalComments ?? '-'}</p>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">{t('dashboard.categoryBreakdown')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['mcp', 'skill', 'hook', 'command'].map((cat) => (
                <div key={cat} className="bg-[var(--secondary)] p-3 rounded-lg">
                  <p className="text-[var(--muted)] text-sm uppercase">{cat}</p>
                  <p className="text-xl font-bold">{stats?.categoryCount?.[cat] ?? 0}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">{t('dashboard.recentActivity')}</h2>
            <p className="text-[var(--muted)]">
              {t('dashboard.recentComments', { count: stats?.recentComments ?? 0 })}
            </p>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">{t('dashboard.manualCollect')}</h2>
            <p className="text-[var(--muted)] text-sm mb-4">{t('dashboard.collectDesc')}</p>
            <button onClick={triggerCollection} className="btn-primary">
              {t('dashboard.runCollect')}
            </button>
          </div>
        </div>
      )}

      {/* Plugins */}
      {activeTab === 'plugins' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">{t('plugins.addTitle')}</h2>
            <form onSubmit={handleAddPlugin} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newPlugin.name}
                  onChange={(e) => setNewPlugin({ ...newPlugin, name: e.target.value })}
                  placeholder={t('plugins.name')}
                  required
                  className="px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)]"
                />
                <input
                  type="url"
                  value={newPlugin.github_url}
                  onChange={(e) => setNewPlugin({ ...newPlugin, github_url: e.target.value })}
                  placeholder={t('plugins.githubUrl')}
                  required
                  className="px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)]"
                />
                <select
                  value={newPlugin.category}
                  onChange={(e) =>
                    setNewPlugin({ ...newPlugin, category: e.target.value as Plugin['category'] })
                  }
                  className="px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)]"
                >
                  <option value="mcp">MCP</option>
                  <option value="skill">Skill</option>
                  <option value="hook">Hook</option>
                  <option value="command">Command</option>
                </select>
                <input
                  type="text"
                  value={newPlugin.keywords}
                  onChange={(e) => setNewPlugin({ ...newPlugin, keywords: e.target.value })}
                  placeholder={t('plugins.keywords')}
                  className="px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)]"
                />
              </div>
              <input
                type="text"
                value={newPlugin.tags}
                onChange={(e) => setNewPlugin({ ...newPlugin, tags: e.target.value })}
                placeholder={t('plugins.tags')}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)]"
              />
              <textarea
                value={newPlugin.description}
                onChange={(e) => setNewPlugin({ ...newPlugin, description: e.target.value })}
                placeholder={t('plugins.description')}
                rows={2}
                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)]"
              />
              <button type="submit" className="btn-primary">
                {t('plugins.add')}
              </button>
            </form>
          </div>

          {selectedPlugins.size > 0 && (
            <div className="card p-4 flex items-center justify-between">
              <span className="text-sm">{t('plugins.selected', { count: selectedPlugins.size })}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => bulkToggleHidden(true)}
                  className="text-sm px-3 py-1 border border-[var(--border)] rounded hover:bg-[var(--card-hover)]"
                >
                  {t('plugins.bulkHide')}
                </button>
                <button
                  onClick={() => bulkToggleHidden(false)}
                  className="text-sm px-3 py-1 border border-[var(--border)] rounded hover:bg-[var(--card-hover)]"
                >
                  {t('plugins.bulkShow')}
                </button>
              </div>
            </div>
          )}

          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {t('plugins.listTitle', { count: plugins.length })}
              </h2>
              <button onClick={toggleSelectAll} className="text-sm text-[var(--primary)] hover:underline">
                {selectedPlugins.size === plugins.length ? t('plugins.deselectAll') : t('plugins.selectAll')}
              </button>
            </div>
            {loading ? (
              <p>{t('plugins.loading')}</p>
            ) : (
              <div className="space-y-2">
                {plugins.map((plugin) => (
                  <div
                    key={plugin.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      plugin.is_hidden ? 'bg-red-50 dark:bg-red-900/20' : 'bg-[var(--secondary)]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlugins.has(plugin.id)}
                      onChange={() => togglePluginSelection(plugin.id)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <span className="font-medium">{plugin.name}</span>
                      <span className="text-[var(--muted)] text-sm ml-2">[{plugin.category}]</span>
                      {plugin.is_hidden && (
                        <span className="text-red-500 text-sm ml-2">{t('plugins.hidden')}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingPlugin(plugin)}
                        className="text-sm px-3 py-1 border border-[var(--border)] rounded hover:bg-[var(--card-hover)]"
                      >
                        {t('plugins.edit')}
                      </button>
                      <button
                        onClick={() => togglePluginHidden(plugin)}
                        className="text-sm px-3 py-1 border border-[var(--border)] rounded hover:bg-[var(--card-hover)]"
                      >
                        {plugin.is_hidden ? t('plugins.show') : t('plugins.hide')}
                      </button>
                      <button
                        onClick={() => deletePlugin(plugin.id)}
                        className="text-sm px-3 py-1 border border-red-300 text-red-500 rounded hover:bg-red-50"
                      >
                        {t('plugins.delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comments */}
      {activeTab === 'comments' && (
        <div className="card p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              value={commentSearch}
              onChange={(e) => setCommentSearch(e.target.value)}
              placeholder={t('comments.searchPlaceholder')}
              className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)]"
            />
            <select
              value={commentPluginFilter}
              onChange={(e) => setCommentPluginFilter(e.target.value)}
              className="px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)]"
            >
              <option value="">{t('comments.allPlugins')}</option>
              {plugins.map((plugin) => (
                <option key={plugin.id} value={plugin.id}>
                  {plugin.name}
                </option>
              ))}
            </select>
          </div>

          <h2 className="text-lg font-semibold mb-4">
            {filteredComments.length !== comments.length
              ? t('comments.filteredTitle', {
                  filtered: filteredComments.length,
                  total: comments.length,
                })
              : t('comments.listTitle', { count: comments.length })}
          </h2>
          {loading ? (
            <p>{t('comments.loading')}</p>
          ) : filteredComments.length === 0 ? (
            <p className="text-[var(--muted)]">{t('comments.empty')}</p>
          ) : (
            <div className="space-y-3">
              {filteredComments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-3 rounded-lg ${
                    comment.is_hidden ? 'bg-red-50 dark:bg-red-900/20' : 'bg-[var(--secondary)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-[var(--muted)] mb-1">
                        {comment.plugins?.name || 'Unknown'} -{' '}
                        {new Date(comment.created_at).toLocaleString()}
                        {comment.is_hidden && (
                          <span className="text-red-500 ml-2">{t('comments.hidden')}</span>
                        )}
                      </p>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleCommentHidden(comment)}
                        className="text-xs px-2 py-1 border border-[var(--border)] rounded hover:bg-[var(--card-hover)]"
                      >
                        {comment.is_hidden ? t('comments.show') : t('comments.hide')}
                      </button>
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="text-xs px-2 py-1 border border-red-300 text-red-500 rounded hover:bg-red-50"
                      >
                        {t('comments.delete')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingPlugin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--background)] rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">{t('editModal.title')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--muted)] mb-1">{t('editModal.name')}</label>
                <input
                  type="text"
                  value={editingPlugin.name}
                  onChange={(e) => setEditingPlugin({ ...editingPlugin, name: e.target.value })}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--muted)] mb-1">
                  {t('editModal.category')}
                </label>
                <select
                  value={editingPlugin.category}
                  onChange={(e) =>
                    setEditingPlugin({
                      ...editingPlugin,
                      category: e.target.value as Plugin['category'],
                    })
                  }
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)]"
                >
                  <option value="mcp">MCP</option>
                  <option value="skill">Skill</option>
                  <option value="hook">Hook</option>
                  <option value="command">Command</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--muted)] mb-1">
                  {t('editModal.description')}
                </label>
                <textarea
                  value={editingPlugin.description || ''}
                  onChange={(e) =>
                    setEditingPlugin({ ...editingPlugin, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--muted)] mb-1">
                  {t('editModal.keywords')}
                </label>
                <input
                  type="text"
                  value={editingPlugin.keywords?.join(', ') || ''}
                  onChange={(e) =>
                    setEditingPlugin({
                      ...editingPlugin,
                      keywords: e.target.value
                        .split(',')
                        .map((k) => k.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--muted)] mb-1">
                  {t('editModal.tags')}
                </label>
                <input
                  type="text"
                  value={editingPlugin.tags?.join(', ') || ''}
                  onChange={(e) =>
                    setEditingPlugin({
                      ...editingPlugin,
                      tags: e.target.value
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="file-system, web-api, automation"
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)]"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setEditingPlugin(null)}
                  className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--card-hover)]"
                >
                  {t('editModal.cancel')}
                </button>
                <button onClick={handleSavePlugin} className="btn-primary">
                  {t('editModal.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

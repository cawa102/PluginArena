'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { RankedPlugin, RankingType, PluginCategory, PluginsResponse } from '@/types';
import PluginCard from './PluginCard';
import RankingTabs from './RankingTabs';
import CategoryFilter from './CategoryFilter';
import SearchBar from './SearchBar';

interface RankingListProps {
  onVoteClick?: (plugin: RankedPlugin) => void;
}

export default function RankingList({ onVoteClick }: RankingListProps) {
  const t = useTranslations('ranking');
  const tSearch = useTranslations('search');
  const [plugins, setPlugins] = useState<RankedPlugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rankingType, setRankingType] = useState<RankingType>('now');
  const [category, setCategory] = useState<PluginCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 20;

  // Filter plugins by search query (client-side)
  const filteredPlugins = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return plugins;

    return plugins.filter((plugin) => {
      const nameMatch = plugin.name.toLowerCase().includes(query);
      const descMatch = plugin.description?.toLowerCase().includes(query);
      const tagMatch = plugin.tags?.some((tag) => tag.toLowerCase().includes(query));
      const keywordMatch = plugin.keywords?.some((kw) => kw.toLowerCase().includes(query));
      return nameMatch || descMatch || tagMatch || keywordMatch;
    });
  }, [plugins, searchQuery]);

  useEffect(() => {
    const fetchPlugins = async () => {
      setLoading(true);
      setError(null);

      try {
        // When searching, fetch all plugins for client-side filtering
        const params = new URLSearchParams({
          ranking: rankingType,
          page: searchQuery ? '1' : page.toString(),
          perPage: searchQuery ? '1000' : perPage.toString(),
        });

        if (category) {
          params.set('category', category);
        }

        const response = await fetch(`/api/plugins?${params}`);

        if (!response.ok) {
          throw new Error('Failed to fetch plugins');
        }

        const data: PluginsResponse = await response.json();
        setPlugins(data.plugins);
        setTotal(data.total);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(t('errorFetch'));
      } finally {
        setLoading(false);
      }
    };

    fetchPlugins();
  }, [rankingType, category, page, searchQuery, t]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <SearchBar
        value={searchQuery}
        onChange={(query) => {
          setSearchQuery(query);
          setPage(1);
        }}
      />

      {/* Tabs and filter */}
      <div className="space-y-4">
        <RankingTabs
          selected={rankingType}
          onChange={(type) => {
            setRankingType(type);
            setPage(1);
          }}
        />
        <CategoryFilter
          selected={category}
          onChange={(cat) => {
            setCategory(cat);
            setPage(1);
          }}
        />
      </div>

      {/* Search results count */}
      {searchQuery && !loading && (
        <div className="text-sm text-[var(--muted)]">
          {filteredPlugins.length > 0
            ? tSearch('resultsCount', { count: filteredPlugins.length })
            : tSearch('noResults', { query: searchQuery })}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12 text-red-500">
          <p>{error}</p>
        </div>
      )}

      {/* Plugin list */}
      {!loading && !error && (
        <>
          {filteredPlugins.length === 0 ? (
            <div className="text-center py-12 text-[var(--muted)]">
              <p>{searchQuery ? tSearch('noResults', { query: searchQuery }) : t('noPlugins')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPlugins.map((plugin) => (
                <PluginCard
                  key={plugin.id}
                  plugin={plugin}
                  onVoteClick={onVoteClick ? () => onVoteClick(plugin) : undefined}
                />
              ))}
            </div>
          )}

          {/* Pagination - hide when searching */}
          {totalPages > 1 && !searchQuery && (
            <div className="flex justify-center gap-2 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-[var(--border)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--secondary)] transition-colors"
              >
                {t('prev')}
              </button>
              <span className="px-4 py-2 text-[var(--muted)]">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-[var(--border)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--secondary)] transition-colors"
              >
                {t('next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

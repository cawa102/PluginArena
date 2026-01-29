'use client';

import { useTranslations } from 'next-intl';
import type { RankedPlugin } from '@/types';

interface PluginCardProps {
  plugin: RankedPlugin;
  onVoteClick?: () => void;
  showComments?: boolean;
}

function formatStars(stars: number): string {
  if (stars >= 1000) {
    return `${(stars / 1000).toFixed(1)}k`;
  }
  return stars.toString();
}

function getCategoryStyle(category: string): { className: string } {
  // Uses CSS classes defined in globals.css for cohesive editorial palette
  switch (category) {
    case 'mcp':
      return { className: 'category-mcp' };
    case 'skill':
      return { className: 'category-skill' };
    case 'hook':
      return { className: 'category-hook' };
    case 'command':
      return { className: 'category-command' };
    default:
      return { className: 'bg-[var(--secondary)] text-[var(--muted)] border-[var(--border)]' };
  }
}

function getRankStyle(rank: number): { className: string } {
  // Soft metallic styling for top 3, defined in globals.css
  if (rank === 1) return { className: 'rank-1' };
  if (rank === 2) return { className: 'rank-2' };
  if (rank === 3) return { className: 'rank-3' };
  return { className: 'bg-[var(--secondary)] text-[var(--foreground)]' };
}

function getConfidenceIcon(confidence: string): { icon: string; color: string; label: string } {
  switch (confidence) {
    case 'high':
      return { icon: '|||', color: 'text-[var(--success)]', label: 'High confidence' };
    case 'medium':
      return { icon: '||', color: 'text-[var(--warning)]', label: 'Medium confidence' };
    default:
      return { icon: '|', color: 'text-[var(--muted-light)]', label: 'Low confidence' };
  }
}

export default function PluginCard({ plugin, onVoteClick }: PluginCardProps) {
  const t = useTranslations('plugin');
  const tTime = useTranslations('time');
  const categoryStyle = getCategoryStyle(plugin.category);
  const rankStyle = getRankStyle(plugin.rank);
  const confidenceInfo = getConfidenceIcon(plugin.confidence);
  const maxScore = 100;
  const scorePercentage = Math.min((plugin.composite_score / maxScore) * 100, 100);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return tTime('today');
    if (days === 1) return tTime('yesterday');
    if (days < 7) return tTime('daysAgoShort', { days });
    if (days < 30) return tTime('weeksAgo', { weeks: Math.floor(days / 7) });
    if (days < 365) return tTime('monthsAgo', { months: Math.floor(days / 30) });
    return tTime('yearsAgo', { years: Math.floor(days / 365) });
  };

  const getConfidenceLevel = (confidence: string): string => {
    switch (confidence) {
      case 'high':
        return t('confidenceHigh');
      case 'medium':
        return t('confidenceMedium');
      default:
        return t('confidenceLow');
    }
  };

  return (
    <article
      className="plugin-card card p-5 md:p-6 group animate-fade-in-up"
      aria-labelledby={`plugin-${plugin.id}-name`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Rank and plugin info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Rank badge */}
          <div
            className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center font-bold text-lg md:text-xl transition-transform duration-200 group-hover:scale-110 ${rankStyle.className}`}
            aria-label={t('rank', { rank: plugin.rank })}
          >
            {plugin.rank <= 3 ? (
              <span className="flex flex-col items-center">
                <span>{plugin.rank}</span>
                {plugin.rank === 1 && <span className="text-[10px] opacity-80">st</span>}
                {plugin.rank === 2 && <span className="text-[10px] opacity-80">nd</span>}
                {plugin.rank === 3 && <span className="text-[10px] opacity-80">rd</span>}
              </span>
            ) : (
              plugin.rank
            )}
          </div>

          {/* Plugin info */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Header row */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                id={`plugin-${plugin.id}-name`}
                className="font-bold text-lg md:text-xl truncate group-hover:text-[var(--primary)] transition-colors"
              >
                {plugin.name}
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${categoryStyle.className}`}
              >
                {plugin.category.toUpperCase()}
              </span>
            </div>

            {/* Description */}
            {plugin.description && (
              <p className="text-[var(--muted)] text-sm line-clamp-2 leading-relaxed">
                {plugin.description}
              </p>
            )}

            {/* Tags - Main functionality tags set by admin */}
            {plugin.tags && plugin.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {plugin.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getCategoryStyle(plugin.category).className}`}
                  >
                    {tag}
                  </span>
                ))}
                {plugin.tags.length > 3 && (
                  <span className="px-2 py-0.5 text-xs text-[var(--muted-light)]">
                    +{plugin.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Keywords */}
            {plugin.keywords && plugin.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {plugin.keywords.slice(0, 4).map((keyword) => (
                  <span
                    key={keyword}
                    className="px-2 py-0.5 bg-[var(--secondary)] hover:bg-[var(--secondary-hover)] rounded-md text-xs text-[var(--muted)] transition-colors"
                  >
                    {keyword}
                  </span>
                ))}
                {plugin.keywords.length > 4 && (
                  <span className="px-2 py-0.5 text-xs text-[var(--muted-light)]">
                    +{plugin.keywords.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* Score bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--muted)] font-medium">{t('score')}</span>
                <span className="font-bold text-[var(--foreground)]">{plugin.composite_score.toFixed(1)}</span>
              </div>
              <div className="score-bar-bg h-2.5 rounded-full overflow-hidden">
                <div
                  className="score-bar h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${scorePercentage}%` }}
                  role="progressbar"
                  aria-valuenow={plugin.composite_score}
                  aria-valuemin={0}
                  aria-valuemax={maxScore}
                />
              </div>
            </div>

            {/* Metrics row */}
            <div className="flex items-center gap-4 pt-2 text-sm flex-wrap">
              {/* Stars */}
              <span className="flex items-center gap-1.5" title="GitHub Stars">
                <svg className="w-4 h-4 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold">{formatStars(plugin.github_stars)}</span>
                {plugin.github_stars_60d > 0 && (
                  <span className="trend-up text-xs font-medium px-1.5 py-0.5 rounded">
                    +{formatStars(plugin.github_stars_60d)}
                  </span>
                )}
              </span>

              {/* Votes */}
              <span className="flex items-center gap-1.5" title={t('votes')}>
                <svg className="w-4 h-4 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[var(--muted)]">{plugin.vote_count}</span>
              </span>

              {/* Confidence */}
              <span
                className={`flex items-center gap-1 ${confidenceInfo.color}`}
                title={t('confidence', { level: getConfidenceLevel(plugin.confidence) })}
              >
                <span className="text-xs font-bold tracking-tight">{confidenceInfo.icon}</span>
              </span>

              {/* Updated */}
              <span className="text-[var(--muted-light)] text-xs">
                {t('updated', { date: formatDate(plugin.updated_at) })}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Action buttons */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <a
            href={plugin.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 text-sm border border-[var(--border)] rounded-xl hover:bg-[var(--secondary)] hover:border-[var(--muted-light)] transition-all duration-200 text-center flex items-center justify-center gap-2 group/btn"
            aria-label={t('openGithub', { name: plugin.name })}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            <span className="hidden sm:inline group-hover/btn:underline">GitHub</span>
          </a>
          {onVoteClick && (
            <button
              onClick={onVoteClick}
              className="btn-primary text-sm flex items-center justify-center gap-1.5"
              aria-label={t('voteFor', { name: plugin.name })}
            >
              <span>{t('voteButton')}</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

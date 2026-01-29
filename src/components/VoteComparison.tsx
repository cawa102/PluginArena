'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type { Plugin, PluginCategory, VotePair } from '@/types';

interface VoteComparisonProps {
  category?: PluginCategory;
  focusPluginId?: string;
  onVoteComplete?: () => void;
  onExitFocusMode?: () => void;
}

function formatStars(stars: number): string {
  if (stars >= 1000) {
    return `${(stars / 1000).toFixed(1)}k`;
  }
  return stars.toString();
}

function getCategoryClassName(category: string): string {
  // Uses CSS classes from globals.css for cohesive editorial palette
  switch (category) {
    case 'mcp':
      return 'category-mcp';
    case 'skill':
      return 'category-skill';
    case 'hook':
      return 'category-hook';
    case 'command':
      return 'category-command';
    default:
      return 'bg-[var(--secondary)] text-[var(--muted)] border-[var(--border)]';
  }
}

type VoteState = 'idle' | 'loading' | 'voting' | 'success' | 'error';

export default function VoteComparison({ category, focusPluginId, onVoteComplete, onExitFocusMode }: VoteComparisonProps) {
  const t = useTranslations('vote');
  const [pair, setPair] = useState<VotePair | null>(null);
  const [state, setState] = useState<VoteState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [selectedWinner, setSelectedWinner] = useState<Plugin | null>(null);
  const [fadeOut, setFadeOut] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [isFocusedMode, setIsFocusedMode] = useState(false);

  const fetchPair = useCallback(async () => {
    setState('loading');
    setError(null);
    setSelectedWinner(null);
    setFadeOut(false);

    try {
      const params = new URLSearchParams();
      if (focusPluginId) {
        params.set('focusPlugin', focusPluginId);
      } else if (category) {
        params.set('category', category);
      }

      const response = await fetch(`/api/vote?${params}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch vote pair');
      }

      const data = await response.json();
      setPair({
        pluginA: data.pluginA,
        pluginB: data.pluginB,
        matchQuality: data.matchQuality,
        focusedMode: data.focusedMode,
        focusPluginId: data.focusPluginId,
      });
      setIsFocusedMode(data.focusedMode || false);
      setState('idle');
      setAnimationKey((k) => k + 1);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : t('errorFetchPair'));
      setState('error');
    }
  }, [category, focusPluginId, t]);

  useEffect(() => {
    fetchPair();
  }, [fetchPair]);

  const handleVote = async (winner: Plugin, loser: Plugin) => {
    setState('voting');
    setSelectedWinner(winner);
    setError(null);

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          winnerId: winner.id,
          loserId: loser.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit vote');
      }

      setState('success');
      onVoteComplete?.();

      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          fetchPair();
        }, 400);
      }, 1400);
    } catch (err) {
      console.error('Vote error:', err);
      setError(err instanceof Error ? err.message : t('errorVote'));
      setState('error');
      setSelectedWinner(null);
    }
  };

  const handleSkip = () => {
    setFadeOut(true);
    setTimeout(() => {
      fetchPair();
    }, 300);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state !== 'idle' || !pair) return;

      if (e.key === '1' || e.key === 'ArrowLeft') {
        handleVote(pair.pluginA, pair.pluginB);
      } else if (e.key === '2' || e.key === 'ArrowRight') {
        handleVote(pair.pluginB, pair.pluginA);
      } else if (e.key === 's' || e.key === 'S') {
        handleSkip();
      } else if (e.key === 'u' || e.key === 'U') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, pair]);

  // Loading state with skeleton
  if (state === 'loading') {
    return (
      <div className="space-y-8">
        {/* Loading header */}
        <div className="text-center space-y-3">
          <div className="skeleton h-8 w-64 mx-auto" />
          <div className="skeleton h-4 w-48 mx-auto" />
        </div>

        {/* Loading cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {[0, 1].map((i) => (
            <div key={i} className="card p-6 md:p-8 space-y-5">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="skeleton h-7 w-3/4" />
                  <div className="skeleton h-5 w-20" />
                </div>
                <div className="skeleton w-10 h-10 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-5/6" />
              </div>
              <div className="flex gap-2">
                <div className="skeleton h-6 w-16" />
                <div className="skeleton h-6 w-16" />
                <div className="skeleton h-6 w-16" />
              </div>
              <div className="skeleton h-10 w-full" />
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        <div className="flex flex-col items-center justify-center py-4 gap-3">
          <div className="vote-loader" aria-label={t('loading')} />
          <p className="text-[var(--muted)] text-sm">{t('preparing')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (state === 'error') {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/10 mb-6 shadow-lg shadow-red-500/10">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2 text-[var(--foreground)]">Something went wrong</h3>
        <p className="text-red-500 mb-6 max-w-md mx-auto">{error}</p>
        <button onClick={fetchPair} className="btn-primary inline-flex items-center gap-2" aria-label={t('retry')}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {t('retry')}
        </button>
      </div>
    );
  }

  // Empty state
  if (!pair) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[var(--secondary)] mb-6">
          <svg className="w-10 h-10 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2 text-[var(--foreground)]">No plugins found</h3>
        <p className="text-[var(--muted)]">{t('noPlugins')}</p>
      </div>
    );
  }

  const renderPluginCard = (plugin: Plugin, otherPlugin: Plugin, side: 'left' | 'right') => {
    const isWinner = selectedWinner?.id === plugin.id;
    const isLoser = selectedWinner && selectedWinner.id !== plugin.id;
    const categoryClassName = getCategoryClassName(plugin.category);
    const isFocusedPlugin = isFocusedMode && side === 'left';
    // フォーカスモードでは左側（固定プラグイン）はアニメーションなし
    const animationClass = isFocusedPlugin ? '' : (side === 'left' ? 'animate-slide-in-left' : 'animate-slide-in-right');

    return (
      <button
        key={`${plugin.id}-${animationKey}`}
        onClick={() => handleVote(plugin, otherPlugin)}
        disabled={state !== 'idle'}
        aria-label={t('voteFor', { name: plugin.name })}
        className={`vote-card card p-6 md:p-8 text-left w-full group
          ${state === 'idle' ? animationClass : ''}
          ${state === 'idle' ? 'hover:border-[var(--primary)] hover:shadow-xl hover:-translate-y-2' : ''}
          ${isWinner ? 'vote-card-winner border-[var(--success)] bg-[var(--success)]/5' : ''}
          ${isLoser ? 'vote-card-loser' : ''}
          ${isFocusedPlugin ? 'ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--background)]' : ''}
          ${fadeOut && !isFocusedPlugin ? 'opacity-0 translate-y-8 scale-95' : ''}
          disabled:cursor-default
          transition-all duration-300 ease-out
        `}
        style={{ transitionDelay: fadeOut ? '0ms' : side === 'left' ? '0ms' : '100ms' }}
      >
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xl md:text-2xl truncate group-hover:text-[var(--primary)] transition-colors">
                  {plugin.name}
                </h3>
                {/* Focused mode lock icon */}
                {isFocusedPlugin && (
                  <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full text-xs font-medium">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="hidden sm:inline">Challenge</span>
                  </span>
                )}
              </div>
              <span
                className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${categoryClassName}`}
              >
                {plugin.category.toUpperCase()}
              </span>
            </div>

            {/* Selection indicator */}
            <div
              className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-300
              ${isWinner ? 'border-[var(--success)] bg-[var(--success)] text-white shadow-lg shadow-[var(--success)]/30 scale-110' : 'border-[var(--border)] group-hover:border-[var(--primary)] group-hover:bg-[var(--primary-light)]'}
            `}
            >
              {isWinner ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-[var(--muted)] group-hover:text-[var(--primary)] font-bold text-lg transition-colors">
                  {side === 'left' ? '1' : '2'}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {plugin.description && (
            <p className="text-[var(--muted)] text-sm md:text-base line-clamp-3 leading-relaxed">
              {plugin.description}
            </p>
          )}

          {/* Keywords */}
          {plugin.keywords && plugin.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {plugin.keywords.slice(0, 4).map((kw) => (
                <span
                  key={kw}
                  className="px-2.5 py-1 bg-[var(--secondary)] hover:bg-[var(--secondary-hover)] rounded-lg text-xs text-[var(--muted)] transition-colors"
                >
                  {kw}
                </span>
              ))}
              {plugin.keywords.length > 4 && (
                <span className="px-2.5 py-1 text-xs text-[var(--muted-light)]">
                  +{plugin.keywords.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Metrics bar */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
            <div className="flex items-center gap-4">
              {/* Stars */}
              <span className="flex items-center gap-1.5 text-sm" title="GitHub Stars">
                <svg className="w-4 h-4 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold">{formatStars(plugin.github_stars)}</span>
              </span>

              {/* GitHub link */}
              <a
                href={plugin.github_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors group/link"
                aria-label={`Open ${plugin.name}'s GitHub`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="hidden sm:inline group-hover/link:underline">GitHub</span>
              </a>
            </div>

            {/* Keyboard hint - visible on desktop only */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-[var(--muted-light)]">
              <kbd className="px-2 py-0.5 bg-[var(--secondary)] rounded-md font-mono text-[10px] border border-[var(--border)]">
                {side === 'left' ? '1' : '2'}
              </kbd>
              <span>or</span>
              <kbd className="px-2 py-0.5 bg-[var(--secondary)] rounded-md font-mono text-[10px] border border-[var(--border)]">
                {side === 'left' ? '<-' : '->'}
              </kbd>
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className={`space-y-8 transition-all duration-400 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Question header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
          {t('whichBetter')}
        </h2>
        <p className="text-[var(--muted)] text-sm md:text-base">
          {t('criteriaHint')}
        </p>
        {state === 'success' && selectedWinner && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--success)]/10 text-[var(--success)] rounded-full animate-bounce-in">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold">{t('selected', { name: selectedWinner.name })}</span>
          </div>
        )}
      </div>

      {/* VS display */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {renderPluginCard(pair.pluginA, pair.pluginB, 'left')}
          {renderPluginCard(pair.pluginB, pair.pluginA, 'right')}
        </div>

        {/* VS badge - desktop only - soft rounded style */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="vs-badge w-16 h-16 rounded-full bg-[var(--card)] border-2 border-[var(--primary)] flex items-center justify-center font-bold text-xl text-[var(--primary)] shadow-lg">
            VS
          </div>
        </div>

        {/* Mobile VS indicator */}
        <div className="md:hidden flex items-center justify-center py-2">
          <span className="px-5 py-2 bg-[var(--primary-light)] text-[var(--foreground)] rounded-full text-sm font-bold border border-[var(--primary)]">
            VS
          </span>
        </div>
      </div>

      {/* Skip and Both Unknown buttons */}
      <div className="text-center space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleSkip}
            disabled={state !== 'idle'}
            className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] text-sm disabled:opacity-50 transition-all duration-200 px-5 py-2.5 rounded-xl hover:bg-[var(--secondary)] group"
            aria-label="Skip this comparison"
          >
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            <span>{t('skip')}</span>
            <kbd className="hidden md:inline px-1.5 py-0.5 bg-[var(--secondary)] group-hover:bg-[var(--background)] rounded text-[10px] font-mono border border-[var(--border)] ml-1">
              S
            </kbd>
          </button>

          <button
            onClick={handleSkip}
            disabled={state !== 'idle'}
            className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] text-sm disabled:opacity-50 transition-all duration-200 px-5 py-2.5 rounded-xl hover:bg-[var(--secondary)] group"
            aria-label="I don't know either plugin"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{t('bothUnknown')}</span>
            <kbd className="hidden md:inline px-1.5 py-0.5 bg-[var(--secondary)] group-hover:bg-[var(--background)] rounded text-[10px] font-mono border border-[var(--border)] ml-1">
              U
            </kbd>
          </button>
        </div>

        {/* Exit focused mode button */}
        {isFocusedMode && onExitFocusMode && (
          <div className="pt-2">
            <button
              onClick={onExitFocusMode}
              className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] text-sm transition-all duration-200 px-4 py-2 rounded-lg hover:bg-[var(--secondary)] border border-[var(--border)]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              <span>{t('exitFocusMode')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

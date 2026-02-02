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
      return 'bg-[#1E293B] text-[#64748B] border-[#334155]';
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

  // Loading state
  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center gap-8">
        {[0, 1].map((i) => (
          <div key={i} className="w-[420px] bg-[#1E293B] rounded-2xl p-7 space-y-6 border-2 border-[#334155]">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="skeleton h-6 w-3/4" />
                <div className="skeleton h-5 w-20" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-5/6" />
            </div>
            <div className="skeleton h-12 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (state === 'error') {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/10 mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="font-pixel text-lg text-white mb-2">Something went wrong</h3>
        <p className="text-red-400 mb-6 font-pixel text-xs">{error}</p>
        <button onClick={fetchPair} className="btn-gaming-cyan px-6 py-3 rounded-lg font-pixel text-xs">
          {t('retry')}
        </button>
      </div>
    );
  }

  // Empty state
  if (!pair) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#1E293B] mb-6">
          <svg className="w-10 h-10 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="font-pixel text-lg text-white mb-2">No plugins found</h3>
        <p className="text-[#64748B] font-pixel text-xs">{t('noPlugins')}</p>
      </div>
    );
  }

  const renderPluginCard = (plugin: Plugin, otherPlugin: Plugin, side: 'left' | 'right') => {
    const isWinner = selectedWinner?.id === plugin.id;
    const isLoser = selectedWinner && selectedWinner.id !== plugin.id;
    const categoryClassName = getCategoryClassName(plugin.category);
    const isFocusedPlugin = isFocusedMode && side === 'left';
    const animationClass = isFocusedPlugin ? '' : (side === 'left' ? 'animate-slide-in-left' : 'animate-slide-in-right');

    // Card theme based on side
    const isCyan = side === 'left';
    const borderColor = isCyan ? 'border-[#22D3EE33]' : 'border-[#8B5CF633]';
    const shadowColor = isCyan ? 'shadow-[0_8px_32px_rgba(34,211,238,0.15)]' : 'shadow-[0_8px_32px_rgba(139,92,246,0.15)]';
    const hoverBorder = isCyan ? 'hover:border-[#22D3EE66]' : 'hover:border-[#8B5CF666]';
    const buttonClass = isCyan ? 'btn-gaming-cyan' : 'btn-gaming-purple';

    return (
      <button
        key={`${plugin.id}-${animationKey}`}
        onClick={() => handleVote(plugin, otherPlugin)}
        disabled={state !== 'idle'}
        aria-label={t('voteFor', { name: plugin.name })}
        className={`relative w-full max-w-[420px] bg-[#1E293B] rounded-2xl p-7 text-left
          border-2 ${borderColor} ${shadowColor} ${hoverBorder}
          ${state === 'idle' ? animationClass : ''}
          ${state === 'idle' ? 'hover:-translate-y-1' : ''}
          ${isWinner ? 'border-[#10B981] bg-[#10B98115] scale-[1.02]' : ''}
          ${isLoser ? 'opacity-40 scale-95' : ''}
          ${isFocusedPlugin ? 'ring-2 ring-[#22D3EE] ring-offset-2 ring-offset-[#0A0F1C]' : ''}
          ${fadeOut && !isFocusedPlugin ? 'opacity-0 translate-y-8 scale-95' : ''}
          disabled:cursor-default
          transition-all duration-300 ease-out
        `}
        style={{ transitionDelay: fadeOut ? '0ms' : side === 'left' ? '0ms' : '100ms' }}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Category badge */}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-pixel font-semibold border ${categoryClassName}`}>
                {plugin.category.toUpperCase()}
              </span>
              {/* Source badge */}
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[8px] font-pixel text-[#64748B] bg-[#0F172A]">
                Open Source
              </span>
            </div>
          </div>

          {/* Plugin Info */}
          <div className="space-y-3">
            <h3 className="font-pixel text-sm text-white truncate">
              {plugin.name}
            </h3>
            {plugin.description && (
              <p className="text-[#94A3B8] text-sm line-clamp-3 leading-relaxed font-arcade">
                {plugin.description}
              </p>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-5">
            {/* Stars */}
            <span className="flex items-center gap-1.5 text-xs">
              <svg className={`w-4 h-4 ${isCyan ? 'text-[#22D3EE]' : 'text-[#8B5CF6]'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold text-white">{formatStars(plugin.github_stars)}</span>
            </span>

            {/* GitHub Link */}
            <a
              href={plugin.github_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-white transition-colors ml-auto"
              aria-label={`Open ${plugin.name}'s GitHub`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>

          {/* Vote Button */}
          <div
            className={`flex items-center justify-center gap-2 py-4 rounded-lg transition-all ${buttonClass}
              ${isWinner ? 'opacity-100' : ''}
            `}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-pixel text-[10px]">Vote for this plugin</span>
          </div>
        </div>

        {/* Winner overlay */}
        {isWinner && (
          <div className="absolute inset-0 bg-[#10B981]/10 rounded-2xl flex items-center justify-center">
            <div className="bg-[#10B981] text-white px-4 py-2 rounded-full font-pixel text-xs animate-bounce-in">
              Selected!
            </div>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className={`space-y-8 transition-all duration-400 font-arcade ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* VS display */}
      <div className="relative flex items-center justify-center gap-8">
        {renderPluginCard(pair.pluginA, pair.pluginB, 'left')}

        {/* VS Circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-[72px] h-[72px] rounded-full bg-[#0F172A] border-2 border-transparent flex items-center justify-center"
               style={{ background: 'linear-gradient(#0F172A, #0F172A) padding-box, linear-gradient(135deg, #22D3EE 0%, #8B5CF6 100%) border-box' }}>
            <span className="font-pixel text-sm text-white">VS</span>
          </div>
        </div>

        {renderPluginCard(pair.pluginB, pair.pluginA, 'right')}
      </div>

      {/* Skip and Both Unknown buttons */}
      <div className="text-center space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleSkip}
            disabled={state !== 'idle'}
            className="inline-flex items-center gap-2 text-[#64748B] hover:text-white text-xs disabled:opacity-50 transition-all duration-200 px-5 py-2.5 rounded-xl hover:bg-[#1E293B] font-pixel"
            aria-label="Skip this comparison"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            <span>{t('skip')}</span>
          </button>

          <button
            onClick={handleSkip}
            disabled={state !== 'idle'}
            className="inline-flex items-center gap-2 text-[#64748B] hover:text-white text-xs disabled:opacity-50 transition-all duration-200 px-5 py-2.5 rounded-xl hover:bg-[#1E293B] font-pixel"
            aria-label="I don't know either plugin"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{t('bothUnknown')}</span>
          </button>
        </div>

        {/* Exit focused mode button */}
        {isFocusedMode && onExitFocusMode && (
          <div className="pt-2">
            <button
              onClick={onExitFocusMode}
              className="inline-flex items-center gap-2 text-[#64748B] hover:text-white text-xs transition-all duration-200 px-4 py-2 rounded-lg hover:bg-[#1E293B] border border-[#334155] font-pixel"
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

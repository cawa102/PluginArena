'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import VoteComparison from '@/components/VoteComparison';
import CategoryFilter from '@/components/CategoryFilter';
import type { PluginCategory } from '@/types';

function VotePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const initialCategory = searchParams.get('category') as PluginCategory | null;
  const focusPluginId = searchParams.get('focusPlugin');

  const [category, setCategory] = useState<PluginCategory | null>(initialCategory);
  const [voteCount, setVoteCount] = useState(0);
  const t = useTranslations('vote');

  const handleVoteComplete = () => {
    setVoteCount((c) => c + 1);
  };

  const handleExitFocusMode = () => {
    // フォーカスモードを終了して通常モードに戻る
    const params = new URLSearchParams();
    if (category) {
      params.set('category', category);
    }
    router.push(`/${locale}/vote${params.toString() ? `?${params}` : ''}`);
  };

  return (
    <div className="space-y-10">
      {/* Hero header section */}
      <section className="relative text-center py-8 md:py-12">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-[var(--accent)]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-[var(--primary-light)] text-[var(--primary)] rounded-full text-sm font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Community-driven rankings</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            <span className="gradient-text-primary">{t('title')}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-[var(--muted)] text-lg max-w-xl mx-auto leading-relaxed">
            {t('description')}
          </p>

          {/* Vote counter - animated appearance */}
          {voteCount > 0 && (
            <div className="mt-6 animate-bounce-in">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-[var(--accent-light)] border border-[var(--accent)]/20 rounded-2xl shadow-lg shadow-[var(--accent)]/10">
                <div className="flex items-center justify-center w-8 h-8 bg-[var(--accent)] text-white rounded-lg">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-[var(--accent)] font-bold text-lg leading-none">
                    {voteCount}
                  </p>
                  <p className="text-[var(--accent)]/70 text-xs mt-0.5">
                    {voteCount === 1 ? 'vote today' : 'votes today'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Category filter section */}
      <section className="flex flex-col items-center gap-3">
        <p className="text-sm text-[var(--muted)] font-medium">Filter by category</p>
        <CategoryFilter selected={category} onChange={setCategory} />
      </section>

      {/* Main vote comparison area */}
      <section className="relative">
        {/* Subtle background card effect */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[var(--secondary)]/30 to-transparent rounded-3xl" />

        <div className="py-4 md:py-8">
          <VoteComparison
            category={category ?? undefined}
            focusPluginId={focusPluginId ?? undefined}
            onVoteComplete={handleVoteComplete}
            onExitFocusMode={focusPluginId ? handleExitFocusMode : undefined}
          />
        </div>
      </section>

      {/* Footer notes */}
      <section className="text-center pb-8 space-y-4">
        <div className="max-w-lg mx-auto p-4 bg-[var(--secondary)]/50 rounded-2xl border border-[var(--border)]">
          <p className="text-[var(--muted)] text-sm leading-relaxed">
            {t('note1')} {t('note2')}
          </p>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="hidden md:flex items-center justify-center gap-6 text-xs text-[var(--muted-light)]">
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-[var(--secondary)] rounded-md font-mono border border-[var(--border)]">1</kbd>
            <span>or</span>
            <kbd className="px-2 py-1 bg-[var(--secondary)] rounded-md font-mono border border-[var(--border)]">&larr;</kbd>
            <span>Left plugin</span>
          </span>
          <span className="w-px h-4 bg-[var(--border)]" />
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-[var(--secondary)] rounded-md font-mono border border-[var(--border)]">2</kbd>
            <span>or</span>
            <kbd className="px-2 py-1 bg-[var(--secondary)] rounded-md font-mono border border-[var(--border)]">&rarr;</kbd>
            <span>Right plugin</span>
          </span>
          <span className="w-px h-4 bg-[var(--border)]" />
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-[var(--secondary)] rounded-md font-mono border border-[var(--border)]">S</kbd>
            <span>Skip</span>
          </span>
        </div>
      </section>
    </div>
  );
}

export default function VotePage() {
  const t = useTranslations('vote');

  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="vote-loader" aria-label={t('loading')} />
          <p className="text-[var(--muted)] text-sm animate-pulse">Loading vote arena...</p>
        </div>
      }
    >
      <VotePageContent />
    </Suspense>
  );
}

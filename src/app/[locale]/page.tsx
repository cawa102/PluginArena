'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import RankingList from '@/components/RankingList';
import type { RankedPlugin } from '@/types';

export default function Home() {
  const router = useRouter();
  const t = useTranslations('home');
  const locale = useLocale();

  const handleVoteClick = (plugin: RankedPlugin) => {
    // フォーカスモード: 特定のプラグインを固定して対戦させる
    router.push(`/${locale}/vote?category=${plugin.category}&focusPlugin=${plugin.id}`);
  };

  return (
    <div className="space-y-12">
      {/* Hero section */}
      <section className="relative text-center py-12 md:py-16 lg:py-20">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[var(--accent)]/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-[var(--primary)]/3 to-transparent rounded-full" />
        </div>

        <div className="relative z-10 space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--primary-light)] border border-[var(--primary)]/20 text-[var(--primary)] rounded-full text-sm font-medium animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]"></span>
            </span>
            <span>Community-powered rankings</span>
          </div>

          {/* Main heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="gradient-text">{t('title')}</span>
            </h1>
            <p className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
              {t('subtitle1')}
              <br className="hidden md:block" />
              {t('subtitle2')}
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/${locale}/vote`}
              className="btn-primary inline-flex items-center gap-3 px-8 py-4 text-base group"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t('cta')}</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            <a
              href="#rankings"
              className="inline-flex items-center gap-2 px-6 py-3 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>View Rankings</span>
            </a>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 md:gap-12 pt-6">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">4</p>
              <p className="text-xs md:text-sm text-[var(--muted)]">Categories</p>
            </div>
            <div className="w-px h-10 bg-[var(--border)]" />
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">ELO</p>
              <p className="text-xs md:text-sm text-[var(--muted)]">Ranking System</p>
            </div>
            <div className="w-px h-10 bg-[var(--border)]" />
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">Live</p>
              <p className="text-xs md:text-sm text-[var(--muted)]">GitHub Stats</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Feature 1 - Voting */}
        <div className="card p-6 text-center space-y-4 group hover:border-[var(--primary)]/40">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[var(--primary-light)] flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-lg">Pairwise Voting</h3>
          <p className="text-sm text-[var(--muted)]">
            Simple A/B comparisons make it easy to contribute to rankings with meaningful votes
          </p>
        </div>

        {/* Feature 2 - Rankings */}
        <div className="card p-6 text-center space-y-4 group hover:border-[var(--accent)]/40">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[var(--accent-light)] flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-lg">ELO Rankings</h3>
          <p className="text-sm text-[var(--muted)]">
            Battle-tested Bradley-Terry scoring combined with GitHub metrics for accurate rankings
          </p>
        </div>

        {/* Feature 3 - Categories */}
        <div className="card p-6 text-center space-y-4 group hover:border-[var(--category-hook)]/40">
          <div className="w-12 h-12 mx-auto rounded-xl category-hook flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-lg">4 Categories</h3>
          <p className="text-sm text-[var(--muted)]">
            MCP servers, Skills, Hooks, and Commands - all the Claude Code extensions in one place
          </p>
        </div>
      </section>

      {/* Rankings section */}
      <section id="rankings" className="scroll-mt-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">Plugin Rankings</h2>
            <p className="text-[var(--muted)] text-sm mt-1">Discover the best Claude Code plugins</p>
          </div>
        </div>
        <RankingList onVoteClick={handleVoteClick} />
      </section>
    </div>
  );
}

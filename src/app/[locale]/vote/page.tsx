'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter, useParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import VoteComparison from '@/components/VoteComparison';
import CategoryFilter from '@/components/CategoryFilter';
import type { PluginCategory } from '@/types';

function VoteSidebar({ locale }: { locale: string }) {
  const pathname = usePathname();
  const t = useTranslations('nav');

  const isActive = (path: string) => {
    if (path === `/${locale}`) {
      return pathname === `/${locale}`;
    }
    return pathname.startsWith(path);
  };

  return (
    <aside className="w-[280px] min-h-screen bg-[#0F172A] border-r border-[#1E293B] p-6 flex flex-col gap-8 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-[10px] bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-pixel text-xs text-white font-bold">Plugin Arena</span>
          <span className="font-pixel text-[8px] text-[#22D3EE] tracking-wider">AI Agent Extensions</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2">
        <span className="font-pixel text-[8px] text-[#64748B] tracking-widest mb-2">NAVIGATION</span>

        <Link
          href={`/${locale}`}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive(`/${locale}`) && !pathname.includes('/vote')
              ? 'bg-gradient-to-r from-[#22D3EE22] to-transparent border-l-2 border-[#22D3EE]'
              : 'hover:bg-[#1E293B]'
          }`}
        >
          <svg className={`w-[18px] h-[18px] ${isActive(`/${locale}`) && !pathname.includes('/vote') ? 'text-[#22D3EE]' : 'text-[#64748B]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className={`font-pixel text-[10px] ${isActive(`/${locale}`) && !pathname.includes('/vote') ? 'text-[#22D3EE]' : 'text-[#94A3B8]'}`}>
            {t('ranking')}
          </span>
        </Link>

        <Link
          href={`/${locale}/vote`}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive(`/${locale}/vote`)
              ? 'bg-gradient-to-r from-[#22D3EE22] to-transparent border-l-2 border-[#22D3EE]'
              : 'hover:bg-[#1E293B]'
          }`}
        >
          <svg className={`w-[18px] h-[18px] ${isActive(`/${locale}/vote`) ? 'text-[#22D3EE]' : 'text-[#64748B]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={`font-pixel text-[10px] ${isActive(`/${locale}/vote`) ? 'text-[#22D3EE]' : 'text-[#94A3B8]'}`}>
            {t('vote')}
          </span>
        </Link>

        <Link
          href={`/${locale}/how-it-works`}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive(`/${locale}/how-it-works`)
              ? 'bg-gradient-to-r from-[#22D3EE22] to-transparent border-l-2 border-[#22D3EE]'
              : 'hover:bg-[#1E293B]'
          }`}
        >
          <svg className={`w-[18px] h-[18px] ${isActive(`/${locale}/how-it-works`) ? 'text-[#22D3EE]' : 'text-[#64748B]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className={`font-pixel text-[10px] ${isActive(`/${locale}/how-it-works`) ? 'text-[#22D3EE]' : 'text-[#94A3B8]'}`}>
            {t('howItWorks')}
          </span>
        </Link>
      </nav>
    </aside>
  );
}

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
    const params = new URLSearchParams();
    if (category) {
      params.set('category', category);
    }
    router.push(`/${locale}/vote${params.toString() ? `?${params}` : ''}`);
  };

  return (
    <div className="flex min-h-screen bg-[#0A0F1C]">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <VoteSidebar locale={locale} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-8 py-12 lg:px-16 flex flex-col items-center gap-10">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="font-pixel text-xl text-white">
              <span className="gradient-text-primary">Which plugin is better?</span>
            </h1>
            <p className="font-pixel text-[10px] text-[#64748B]">
              {t('description')}
            </p>

            {/* Vote Counter */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#1E293B] rounded-full border border-[#22D3EE33]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#22D3EE]" />
              <span className="font-pixel text-[9px] text-[#94A3B8]">
                You&apos;ve cast {voteCount} votes today
              </span>
              <span className="px-2.5 py-1 bg-[#22D3EE] rounded-full font-pixel text-[8px] text-white">
                {voteCount}
              </span>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col items-center gap-3">
            <p className="font-pixel text-[8px] text-[#64748B] tracking-wider">FILTER BY CATEGORY</p>
            <CategoryFilter selected={category} onChange={setCategory} />
          </div>

          {/* Vote Comparison */}
          <div className="w-full max-w-[1000px]">
            <VoteComparison
              category={category ?? undefined}
              focusPluginId={focusPluginId ?? undefined}
              onVoteComplete={handleVoteComplete}
              onExitFocusMode={focusPluginId ? handleExitFocusMode : undefined}
            />
          </div>

          {/* Keyboard Hints */}
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { key: '1', label: 'Vote Left' },
              { key: '2', label: 'Vote Right' },
              { key: 'S', label: 'Skip' },
              { key: '?', label: 'Help' },
            ].map((hint) => (
              <div key={hint.key} className="flex items-center gap-2.5">
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1E293B] border border-[#475569]">
                  <span className="font-pixel text-[10px] text-[#94A3B8]">{hint.key}</span>
                </div>
                <span className="font-pixel text-[9px] text-[#64748B]">{hint.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function VotePage() {
  const t = useTranslations('vote');

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen bg-[#0A0F1C] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="vote-loader" aria-label={t('loading')} />
            <p className="font-pixel text-[10px] text-[#64748B] animate-pulse">Loading vote arena...</p>
          </div>
        </div>
      }
    >
      <VotePageContent />
    </Suspense>
  );
}

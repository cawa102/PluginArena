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
    router.push(`/${locale}/vote?category=${plugin.category}&focusPlugin=${plugin.id}`);
  };

  return (
    <div className="space-y-12">
      {/* Hero section */}
      <section className="relative text-center py-12 md:py-16 lg:py-20">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#22D3EE]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#8B5CF6]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#22D3EE]/10 border border-[#22D3EE]/30 text-[#22D3EE] rounded-full text-sm animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22D3EE] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22D3EE]"></span>
            </span>
            <span className="font-pixel text-[10px]">Community-powered rankings</span>
          </div>

          {/* Main heading */}
          <div className="space-y-4">
            <h1 className="font-pixel text-2xl md:text-3xl lg:text-4xl tracking-tight">
              <span className="gradient-text">{t('title')}</span>
            </h1>
            <p className="text-base md:text-lg text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
              {t('subtitle1')}
              <br className="hidden md:block" />
              {t('subtitle2')}
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/${locale}/vote`}
              className="btn-gaming-cyan inline-flex items-center gap-3 px-8 py-4 rounded-lg group"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-pixel text-xs">{t('cta')}</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            <a
              href="#rankings"
              className="inline-flex items-center gap-2 px-6 py-3 text-[#94A3B8] hover:text-[#22D3EE] transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="font-pixel text-[10px]">View Rankings</span>
            </a>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 md:gap-12 pt-6">
            <div className="text-center">
              <p className="font-pixel text-xl md:text-2xl text-[#22D3EE]">4</p>
              <p className="text-xs text-[#64748B]">Categories</p>
            </div>
            <div className="w-px h-10 bg-[#1E293B]" />
            <div className="text-center">
              <p className="font-pixel text-xl md:text-2xl text-[#8B5CF6]">ELO</p>
              <p className="text-xs text-[#64748B]">Ranking System</p>
            </div>
            <div className="w-px h-10 bg-[#1E293B]" />
            <div className="text-center">
              <p className="font-pixel text-xl md:text-2xl text-[#10B981]">Live</p>
              <p className="text-xs text-[#64748B]">GitHub Stats</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Feature 1 - Voting */}
        <div className="bg-[#1E293B] border border-[#22D3EE]/20 rounded-xl p-6 text-center space-y-4 group hover:border-[#22D3EE]/50 transition-all hover:shadow-lg hover:shadow-[#22D3EE]/10">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#22D3EE]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-[#22D3EE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-pixel text-sm text-white">Pairwise Voting</h3>
          <p className="text-sm text-[#94A3B8]">
            Simple A/B comparisons make it easy to contribute to rankings with meaningful votes
          </p>
        </div>

        {/* Feature 2 - Rankings */}
        <div className="bg-[#1E293B] border border-[#8B5CF6]/20 rounded-xl p-6 text-center space-y-4 group hover:border-[#8B5CF6]/50 transition-all hover:shadow-lg hover:shadow-[#8B5CF6]/10">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="font-pixel text-sm text-white">ELO Rankings</h3>
          <p className="text-sm text-[#94A3B8]">
            Battle-tested Bradley-Terry scoring combined with GitHub metrics for accurate rankings
          </p>
        </div>

        {/* Feature 3 - Categories */}
        <div className="bg-[#1E293B] border border-[#F97316]/20 rounded-xl p-6 text-center space-y-4 group hover:border-[#F97316]/50 transition-all hover:shadow-lg hover:shadow-[#F97316]/10">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#F97316]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-[#F97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <h3 className="font-pixel text-sm text-white">4 Categories</h3>
          <p className="text-sm text-[#94A3B8]">
            MCP servers, Skills, Hooks, and Commands - all the Claude Code extensions in one place
          </p>
        </div>
      </section>

      {/* Rankings section */}
      <section id="rankings" className="scroll-mt-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-pixel text-lg text-white">Plugin Rankings</h2>
            <p className="text-[#64748B] text-sm mt-1">Discover the best Claude Code plugins</p>
          </div>
        </div>
        <RankingList onVoteClick={handleVoteClick} />
      </section>
    </div>
  );
}
